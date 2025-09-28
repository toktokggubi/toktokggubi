from flask import Flask, jsonify, render_template_string, request
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

import numpy as np
import sys
import model_functions.ae_functions as ae
import model_functions.it_functions as it
import logging
import model
import json
from huggingface_hub import InferenceClient
import requests
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def get_all_users():
    """Fetches all registered users from the database."""
    conn = get_db_connection()
    if not conn:
        logger.error("Cannot fetch users because database connection is not available.")
        return []
    
    users = []
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, username FROM users;")
            for user_id, username in cur.fetchall():
                users.append({"user_id": user_id, "username": username})
    except Exception as e:
        logger.error(f"Error fetching all users: {e}", exc_info=True)
    finally:
        if conn:
            conn.close()
    return users

# --- LLM Configuration ---
# Set the provider using the LLM_PROVIDER environment variable.
# Options: 'huggingface-local', 'huggingface-api', 'local' (OpenAI-compatible), 'openai', or 'none'.
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "huggingface-local").lower()
LLM_MODEL_NAME = os.environ.get("LLM_MODEL_NAME", "EleutherAI/polyglot-ko-1.3b")  # Using a smaller model for local use
LLM_ENABLED = True

# Globals for different clients/models
hf_client = None
local_hf_model = None
local_hf_tokenizer = None

if LLM_PROVIDER == "huggingface-local":
    if TRANSFORMERS_AVAILABLE and LLM_MODEL_NAME:
        logger.info(f"Attempting to load local Hugging Face model '{LLM_MODEL_NAME}'. This may take a while...")
        try:
            if sys.platform == "win32":
                device = "cuda" if torch.cuda.is_available() else "cpu"
            elif sys.platform == "darwin":
                device = "mps" if torch.backends.mps.is_available() else "cpu"
            else:
                device = "cuda" if torch.cuda.is_available() else "cpu"

            print(f"Using device: {device}")
            local_hf_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
            # Set pad token if it's not set. This is crucial for models where pad_token is not configured.
            # It helps in batching and avoids warnings when pad_token_id is the same as eos_token_id.
            if local_hf_tokenizer.pad_token is None:
                local_hf_tokenizer.pad_token = local_hf_tokenizer.eos_token
            local_hf_model = AutoModelForCausalLM.from_pretrained(
                LLM_MODEL_NAME,
                dtype=torch.bfloat16,  # Use bfloat16 for better performance on modern GPUs
                device_map="auto",  # `accelerate` will handle device placement
                trust_remote_code=True # Allow custom code for models that require it
            )
            LLM_ENABLED = True
            logger.info(f"Successfully loaded model '{LLM_MODEL_NAME}' on device map '{local_hf_model.hf_device_map}'. LLM features enabled.")
        except Exception as e:
            logger.error(f"Failed to load local Hugging Face model '{LLM_MODEL_NAME}': {e}", exc_info=True)
    else:
        logger.warning("LLM_PROVIDER is 'huggingface-local' but 'transformers' library is not installed or LLM_MODEL_NAME is not set. LLM features disabled.")

elif LLM_PROVIDER == "huggingface-api":
    HF_TOKEN = os.environ.get("HUGGING_FACE_HUB_TOKEN")
    if HF_TOKEN:
        LLM_ENABLED = True
        hf_client = InferenceClient(model=LLM_MODEL_NAME, token=HF_TOKEN)
        logger.info(f"Using Hugging Face Inference API with model '{LLM_MODEL_NAME}'. LLM features enabled.")
    else:
        logger.warning("LLM_PROVIDER is 'huggingface-api' but HUGGING_FACE_HUB_TOKEN is not set. LLM features disabled.")
        logger.info("To use Hugging Face API, please set the HUGGING_FACE_HUB_TOKEN environment variable.")
        logger.info("You can get a token at: https://huggingface.co/settings/tokens")

elif LLM_PROVIDER == "local":
    LOCAL_LLM_URL = os.environ.get("LOCAL_LLM_URL")
    if LOCAL_LLM_URL:
        LLM_ENABLED = True
        LLM_MODEL_NAME = LLM_MODEL_NAME or "local-model"
        logger.info(f"Using local OpenAI-compatible LLM at {LOCAL_LLM_URL} with model '{LLM_MODEL_NAME}'. LLM features enabled.")
    else:
        logger.warning("LLM_PROVIDER is 'local' but LOCAL_LLM_URL is not set. LLM features disabled.")

elif LLM_PROVIDER == "openai":
    OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
    if OPENAI_KEY:
        LLM_ENABLED = True
        openai.api_key = OPENAI_KEY
        LLM_MODEL_NAME = LLM_MODEL_NAME or "gpt-3.5-turbo"
        logger.info(f"Using OpenAI API with model '{LLM_MODEL_NAME}'. LLM features enabled.")
    else:
        logger.warning("LLM_PROVIDER is 'openai' but OPENAI_API_KEY is not set. LLM features disabled.")

else:
    logger.warning("No valid LLM_PROVIDER configured. LLM features will be disabled.")

# Mapping from budget keys (English) to transaction categories (Korean '대분류')
# This is necessary because the budget is received with English keys,
# but the transaction data uses Korean categories.
BUDGET_CATEGORY_MAPPING = {
    "total": "total",
    "food": "식비",
    "cafe": "카페/간식",
    "nightlife": "술/유흥",
    "life": "생활",
    "cosmetics": "뷰티/미용",
    "transportation": "교통",
    "car": "자동차",
    "medical": "의료/건강",
    "entertainment": "문화/여가",
    "shopping": "쇼핑",
    "etc": "기타"
}
KOREAN_TO_ENGLISH_MAPPING = {v: k for k, v in BUDGET_CATEGORY_MAPPING.items()}


# --- Database Configuration ---
# To connect to the database, ensure the following environment variables are set in compose.yml:
# DB_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
try:
    import psycopg2
    from psycopg2 import sql
    PSYCOPG2_AVAILABLE = True
    DB_HOST = os.environ.get("DB_HOST")
    DB_NAME = os.environ.get("POSTGRES_DB")
    DB_USER = os.environ.get("POSTGRES_USER")
    DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
    DB_PORT = os.environ.get("POSTGRES_PORT")
except ImportError:
    PSYCOPG2_AVAILABLE = False
    win_msg = " For Windows, it is recommended to install 'psycopg2-binary' via pip."
    logger.warning(
        f"psycopg2 is not installed.{win_msg if sys.platform == 'win32' else ''} "
        "Database operations will be disabled."
    )

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    if not PSYCOPG2_AVAILABLE:
        logger.error("Cannot connect to database because 'psycopg2' library is not installed.")
        return None
    if not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        logger.error("Database connection details are not fully configured. Please set DB_HOST, POSTGRES_DB, POSTGRES_USER, and POSTGRES_PASSWORD environment variables.")
        return None
    try:
        # Explicitly tell psycopg2 not to look for pgpass.conf to avoid UnicodeDecodeError on Windows
        conn = psycopg2.connect(
            host=DB_HOST,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,  # Explicitly set the port to 5432
            client_encoding='utf8'
        )
        return conn
    except UnicodeDecodeError as e:
        logger.error(f"A Unicode decoding error occurred during database connection: {e}")
        logger.error("This is a common issue on Windows if a PostgreSQL configuration file (e.g., pgpass.conf) is not saved in UTF-8 format.")
        logger.error(r"To fix this, find the file at '%APPDATA%\postgresql\pgpass.conf', open it, and re-save it with 'UTF-8' encoding.")
        return None
    except psycopg2.OperationalError as e:
        logger.error(f"Could not connect to PostgreSQL database: {e}")
        return None

def register_user_if_not_exists(user_id, username):
    """Checks if a user exists by user_id and registers/updates them."""
    conn = get_db_connection()
    if not conn:
        logger.warning("Cannot register user because database connection is not available.")
        return

    try:
        with conn.cursor() as cur:
            # Insert the user if they don't exist. If they do, update their username.
            # This handles both new user registration and username changes for existing users.
            insert_query = sql.SQL("""
                INSERT INTO users (user_id, username) VALUES (%s, %s)
                ON CONFLICT (user_id) DO UPDATE SET username = EXCLUDED.username;
            """)
            cur.execute(insert_query, (user_id, username))
            conn.commit()
            logger.info(f"User '{username}' (ID: {user_id}) registration/update processed.")
    except Exception as e:
        logger.error(f"Error during user registration for user_id '{user_id}': {e}", exc_info=True)
        conn.rollback()
    finally:
        if conn:
            conn.close()

# Configuration for non-expense categories
# These categories will be excluded from expense calculations
NON_EXPENSE_CATEGORIES = [
    '의료/건강',    # Medical/Health
    '주거/통신',    # Housing/Communication
    '금융',         # Financial
    '자동차'        # Car
]

def generate_llm_response(prompt, max_tokens=1024, is_json=False):
    """
    Generates a response from the configured LLM.
    """
    if not LLM_ENABLED:
        logger.warning("LLM is disabled. Skipping API call.")
        return None

    system_message = """
    당신은 이제 **소비 분석 전문가**입니다. 당신의 목표는 사용자의 소비 내역을 분석하고, 비정상적인 지출(이상치)을 파악하며, 합리적인 소비 습관을 위한 개선 제안을 하는 것입니다. 당신은 데이터에 기반한 객관적인 분석가이며, 동시에 사용자가 이해하기 쉽고 실행 가능한 조언을 제공하는 친절한 컨설턴트입니다. 주어진 숫자를 기반으로 틀리지 않게 적으세요. 절대 자신의 감정을 말하지 마세요. 반드시 데이터에 기반해서 이야기 해야합니다. 반드시 근거가 없는 설명은 하지 마세요.
    ---
    ### **분석 대상 및 입력 정보 (Input Data)**

    사용자는 당신에게 다음과 같은 형식의 소비 데이터를 제공할 것입니다.

    * **기간:** 분석할 소비 데이터의 기간 (예: 2024년 5월)
    * **소비 내역:**
        * **날짜:** 지출이 발생한 날짜
        * **카테고리:** 소비 항목의 분류 (예: 식비, 교통비, 생활용품, 문화생활, 통신비 등)
        * **금액:** 지출된 금액 (단위: 원)
        * **내용:** 지출에 대한 간단한 설명 (예: 점심 식사, 버스 요금, 마트 장보기)

    ---

    ### **분석 및 응답 구성 (Analysis and Response Structure)**

    당신의 답변은 다음의 4단계로 구성되어야 합니다.

    1.  **전반적인 소비 요약 및 평가:**
        * 총 소비 금액을 계산하고, 이전에 분석했던 기간이나 일반적인 소비 트렌드와 비교하여 전반적인 평가를 제시하세요.
        * 가장 큰 비중을 차지하는 소비 카테고리 3가지를 파악하고 비중(%)을 함께 명시하세요.

    2.  **이상치(비정상 지출) 분석:**
        * 평균적인 지출 규모와 비교했을 때, 특정 카테고리에서 비정상적으로 높거나 반복적으로 발생한 지출 내역을 찾아내세요.
        * 이상치로 판단된 항목을 구체적으로 제시하고, 왜 이 지출이 비정상적인지 그 이유를 추론하여 설명하세요. (예: "식비 카테고리에서 10만원 이상 결제된 '고급 레스토랑' 지출은 평소 지출 패턴과 비교해 이상치로 보입니다.")

    3.  **개선 제안:**
        * 이상치 분석 결과를 바탕으로, 사용자의 소비 습관을 개선할 수 있는 구체적이고 실용적인 방안을 제안하세요.
        * 전체 소비 구조의 불균형을 해소할 수 있는 현실적인 조언을 카테고리별로 나누어 제안하세요. (예: "배달 음식 지출이 많아 보입니다. 주 2회로 제한하거나, 밀키트를 활용해 보세요.")

    4.  **긍정적 피드백 및 격려:**
        * 사용자의 소비 내역에서 긍정적인 부분을 찾아 칭찬하고 격려하는 메시지로 답변을 마무리하세요. 이는 사용자가 동기 부여를 얻고 지속적으로 소비 습관을 개선할 수 있도록 돕습니다. (예: "교통비 지출이 매우 효율적으로 관리되고 있습니다. 훌륭합니다.")

    ---

    ### **추가 지시사항 (Additional Instructions)**

    * **톤 앤 매너:** 뒤에 반드시 어미에 "입니다, 꺼비!"를 추가하세요. 예를 들면, "....입니다, 꺼비!" 식으로 답변을 마무리하세요.
    * **구체성:** 막연한 조언 대신, **구체적인 금액이나 횟수**를 포함하는 제안을 하세요.
    * **데이터 활용:** 제공된 데이터 외에, 일반적인 경제 상식이나 소비 트렌드를 참고하여 답변의 풍부함을 더할 수 있습니다. 하지만 이는 보조적인 역할이며, 핵심은 사용자가 제공한 데이터 분석에 집중해야 합니다.
    * **응답 길이:** 각 섹션이 너무 길지 않게, 핵심 내용을 명확하게 전달하세요.
    """
    if is_json:
        system_message += " You must respond only with the requested JSON object, without any additional text or explanations."

    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt}
    ]

    llm_response_content = None

    try:
        if LLM_PROVIDER == "huggingface-local":
            # Tokenize the chat messages. `apply_chat_template` handles the formatting.
            inputs = local_hf_tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=True,
                return_tensors="pt"
            ).to(local_hf_model.device)

            outputs = local_hf_model.generate(
                inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.4, # Increased temperature for more diverse output
                top_p=0.9,
                repetition_penalty=1.2, # Added repetition penalty to prevent repeating words/phrases
                eos_token_id=[local_hf_tokenizer.eos_token_id, local_hf_tokenizer.convert_tokens_to_ids("<|eot_id|>")],
                pad_token_id=local_hf_tokenizer.pad_token_id,
            )
            # Decode only the newly generated tokens
            response = local_hf_tokenizer.decode(outputs[0][inputs.shape[-1]:], skip_special_tokens=True)

            # Post-process to remove conversational artifacts if the model continues generating.
            # The model sometimes outputs 'assistant' or other markers for the next turn.
            if "assistant" in response:
                response = response.split("assistant")[0]
            llm_response_content = response.strip()

        elif LLM_PROVIDER == "huggingface-api":
            response = hf_client.chat_completion(
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.5,
            )
            llm_response_content = response.choices[0].message.content.strip()

        elif LLM_PROVIDER in ["local", "openai"]:
            response = openai.chat.completions.create(
                model=LLM_MODEL_NAME,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.5,
            )
            llm_response_content = response.choices[0].message.content.strip()
        
        else:
            logger.error("LLM is enabled but no provider is recognized.")
            return None
        
        logger.info(f"LLM Raw Response:\n---\n{llm_response_content}\n---")
        return llm_response_content

    except Exception as e:
        logger.error(f"Error calling {LLM_PROVIDER} LLM API: {e}")
        return None

@app.route("/ai/")
def hello_world():
    return "<p>Autoencoder Anomaly Detection API</p>"

@app.route("/ai/encoder")
def autoencoder():
    try:
        # Load and preprocess data
        data_path = os.path.join('data', 'payment_kwonjaheun.csv')
        if not os.path.exists(data_path):
            return jsonify({"error": f"Data file not found at {data_path}"}), 404
        
        # Get anomalies using the autoencoder
        results = ae.run(data_path)

        anomalies_table = results['anomalies_df'].to_html(index=False)
        
        return render_template_string(
            HTML_TEMPLATE,
            anomalies_table=anomalies_table,
            error=None,
            stats=results['stats'],
            timestamps=results['plot_data']['timestamps'],
            amounts=results['plot_data']['amounts'],
            colors=results['plot_data']['colors'],
            error_indices=results['plot_data']['error_indices'],
            reconstruction_errors=results['plot_data']['reconstruction_errors']
        )
    except Exception as e:
        logger.error(f"Error during autoencoder processing: {e}")
        return render_template_string(HTML_TEMPLATE, error=str(e), anomalies_table="", stats={})

@app.route("/ai/isolationforest")
def isolation_forest():
    try:
        logger.info("Starting Isolation Forest anomaly detection")
        
        # Load and preprocess data
        data_path = os.path.join('data', 'payment_yang.csv')
        if not os.path.exists(data_path):
            error_msg = f"Data file not found at {data_path}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 404
        
        logger.info(f"Processing data from {data_path}")
        
        # Get anomalies using the isolation forest
        results = it.run(data_path)
        
        # Get total number of transactions for percentage calculation
        total_transactions = len(pd.read_csv(data_path))
        anomaly_count = len(results)
        
        if results.empty:
            logger.info("No anomalies detected")
            return render_template_string(
                HTML_TEMPLATE, 
                anomalies_table="<p>No anomalies detected.</p>", 
                error=None, 
                stats={
                    "anomaly_count": 0,
                    "anomaly_percentage": 0.0,
                    "total_transactions": total_transactions,
                    "total_amount": 0,
                    "anomaly_categories": {}
                },
                timestamps=[],
                amounts=[],
                colors=[],
                error_indices=[],
                reconstruction_errors=[]
            )
        
        # Convert results to HTML table
        anomalies_table = results[['날짜', '시간', '대분류', '내용', '금액']].to_html(index=False)
        stats = {
            "anomaly_count": anomaly_count,
            "anomaly_percentage": anomaly_count / total_transactions if total_transactions > 0 else 0,
            "total_transactions": total_transactions,
            "total_amount": results['금액'].sum(),
            "anomaly_categories": results['대분류'].value_counts().to_dict()
        }
        
        logger.info(f"Detected {len(results)} anomalies with total amount {stats['total_amount']}")
        
        return render_template_string(
            HTML_TEMPLATE, 
            anomalies_table=anomalies_table, 
            error=None, 
            stats=stats,
            timestamps=results['날짜'].astype(str).tolist() if not results.empty else [],
            amounts=results['금액'].tolist() if not results.empty else [],
            colors=['red' if anomaly else 'blue' for anomaly in (results['anomaly'] == -1)] if 'anomaly' in results.columns else [],
            error_indices=results.index.tolist() if not results.empty else [],
            reconstruction_errors=[1.0] * len(results) if not results.empty else []  # Dummy values as these are required by template
        )
        
    except Exception as e:
        error_msg = f"Error during isolation forest processing: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return render_template_string(
            HTML_TEMPLATE, 
            error=error_msg, 
            anomalies_table="", 
            stats={"error": True}
        )


@app.route("/ai/combined")
def combined_anomaly_detection():
    try:
        logger.info("Starting combined anomaly detection")
        
        # Load and preprocess data
        data_path = os.path.join('data', 'payment_lhy.csv')
        if not os.path.exists(data_path):
            error_msg = f"Data file not found at {data_path}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 404
        
        # Get results from both models
        logger.info("Running autoencoder model")
        ae_results = ae.run(data_path)
        
        logger.info("Running isolation forest model")
        if_results = it.run(data_path)
        
        # Convert both results to DataFrames if they're not already
        if not isinstance(ae_results, pd.DataFrame):
            ae_df = ae_results.get('anomalies_df', pd.DataFrame())
        else:
            ae_df = ae_results
            
        if not isinstance(if_results, pd.DataFrame):
            if_df = if_results.get('anomalies_df', pd.DataFrame())
        else:
            if_df = if_results
        
        # Add source column to each DataFrame
        if not ae_df.empty:
            ae_df['detection_method'] = 'autoencoder'
        if not if_df.empty:
            if_df['detection_method'] = 'isolation_forest'
        
        # Combine results
        combined_df = pd.concat([ae_df, if_df], ignore_index=True)

        # Handle duplicates (detected by both methods)
        if not combined_df.empty and all(col in combined_df.columns for col in ['날짜', '시간', '내용', '금액']):
            # Create a temporary column with absolute amount for comparison
            combined_df['abs_amount'] = combined_df['금액'].abs()
            
            # Find duplicates based on date, time, content, and absolute amount
            duplicates_mask = combined_df.duplicated(subset=['날짜', '시간', '내용', 'abs_amount'], keep=False)
            
            # Mark duplicates with 'both' in detection_method
            if duplicates_mask.any():
                # Get indices of all duplicates
                duplicate_indices = combined_df[duplicates_mask].index
                # Group by the duplicate criteria and get first index of each group
                first_occurrence = combined_df.loc[duplicate_indices].drop_duplicates(
                    subset=['날짜', '시간', '내용', 'abs_amount'], keep='first').index
                # Update detection_method to 'both' for first occurrence of each duplicate
                combined_df.loc[first_occurrence, 'detection_method'] = 'both'
                # Remove the other duplicates
                combined_df = combined_df.drop_duplicates(subset=['날짜', '시간', '내용', 'abs_amount'])
            
            # Remove the temporary column
            combined_df = combined_df.drop(columns=['abs_amount'])
        
        # Filter out non-expense categories from the combined results
        if not combined_df.empty and '대분류' in combined_df.columns:
            filtered_df = combined_df[~combined_df['대분류'].isin(NON_EXPENSE_CATEGORIES)]
        else:
            filtered_df = combined_df

        # Calculate statistics
        total_transactions = len(pd.read_csv(data_path))
        anomaly_count = len(filtered_df)

        # Save as a CSV file
        # if not combined_df.empty:
        #     combined_df.sort_values(['날짜', '시간']).to_csv('anomalies.csv', index=False)
        #     logger.info(f"Saved {len(combined_df)} anomalies to anomalies.csv")

        if filtered_df.empty:
            logger.info("No expense anomalies detected after filtering.")
            summary = "분석된 거래 내역에서 이상 소비 패턴이 발견되지 않았습니다. 계속해서 좋은 소비 습관을 유지하세요."
            return jsonify({
                "overall_summary": summary,
                "anomalies": [],
                "adjustment": {
                    "recommendation": "현재 이상 소비가 없어 예산 조정이 필요하지 않습니다.",
                    "budget_change_impact": "현재 소비 패턴이 안정적이므로 예산 조정은 필요하지 않습니다.",
                    "predicted_savings": 0
                }
            })

        # --- Generate JSON Response ---

        anomaly_categories = filtered_df['대분류'].value_counts().to_dict()
        anomaly_amount_by_cat = filtered_df.groupby('대분류')['금액'].sum().sort_values(ascending=False)
        logger.info(data_path)
        
        # 1. Generate `overall_summary` using LLM
        summary_prompt = (
            f"사용자의 소비 데이터를 분석한 결과입니다. 이 정보를 바탕으로 사용자에게 현재 소비 상태에 대한 전반적인 요약(overall_summary)을 한국어로 생성해주세요.\n\n"
            f"- 총 거래 건수: {total_transactions}건\n"
            f"- 발견된 이상 소비 건수: {anomaly_count}건\n"
            f"- 이상 소비가 가장 많은 상위 카테고리:\n"
        )
        for category, count in list(anomaly_categories.items())[:3]:
            summary_prompt += f"  - {category}: {count}건\n"
        summary_prompt += "\n요약은 2-3문장으로, 사용자가 예산 상태를 쉽게 파악할 수 있도록 친근한 어조로 작성해주세요. 어떤 분야에 주의해야 하는지 언급해주세요."

        overall_summary = generate_llm_response(summary_prompt)
        
        # Fallback for summary
        if not overall_summary:
            logger.warning("LLM summary generation failed. Using template-based summary.")
            top_bad_category = max(anomaly_categories, key=anomaly_categories.get)
            overall_summary = (
                f"총 {total_transactions}건의 거래 중 {anomaly_count}건의 이상 소비가 발견되었습니다. "
                f"특히 '{top_bad_category}' 분야에서 지출이 많은 것으로 보입니다. "
                f"해당 분야의 지출 내역을 검토해보시는 것을 추천합니다."
            )

        # 2. Format `anomalies` list
        anomalies_list_df = filtered_df[['날짜', '시간', '금액', '대분류', '내용']].copy()
        anomalies_list_df.rename(columns={'시간': '시각'}, inplace=True)
        anomalies_list_df['금액'] = anomalies_list_df['금액'].astype(int)

        # Sort by date and time (most recent first)
        anomalies_list_df['datetime'] = pd.to_datetime(anomalies_list_df['날짜'] + ' ' + anomalies_list_df['시각'])
        anomalies_list_df = anomalies_list_df.sort_values('datetime', ascending=False).drop(columns=['datetime'])

        # 3. Generate `adjustment` using LLM
        recommend_category = anomaly_amount_by_cat.index[0]
        savings = int(anomaly_amount_by_cat.iloc[0])
        anomaly_count_in_cat = anomaly_categories[recommend_category]

        adjustment_prompt = (
            f"사용자의 이상 소비 분석 결과, '{recommend_category}' 카테고리에서 가장 많은 이상 지출이 발생했습니다. 이 정보를 바탕으로 예산 조정(adjustment) 제안을 JSON 형식으로 생성해주세요.\n\n"
            f"- 조정 추천 카테고리: '{recommend_category}'\n"
            f"- 해당 카테고리 내 이상 소비 건수: {anomaly_count_in_cat}건\n"
            f"- 해당 카테고리 내 이상 소비 총액: {savings}원\n\n"
            "JSON 형식은 다음과 같아야 합니다:\n"
            "{\n"
            "  \"recommendation\": \"'{category}' 분야의 지출을 줄이는 것을 추천하는 문장\",\n"
            "  \"budget_change_impact\": \"지출을 줄였을 때의 긍정적 효과에 대한 설명, 금액으로 표현할 수 있다면 좋음\",\n"
            "  \"predicted_savings\": {amount_integer}\n"
            "}\n\n"
            "predicted_savings 값은 주어진 이상 소비 총액({savings})을 그대로 사용해주세요. 모든 텍스트는 한국어로 작성해주세요. 응답은 JSON 객체만 포함해야 합니다."
        )

        llm_adjustment_str = generate_llm_response(adjustment_prompt, is_json=True)
        adjustment = None

        if llm_adjustment_str:
            # Robustly extract JSON from LLM response, stripping markdown code block delimiters
            llm_adjustment_str = llm_adjustment_str.strip()
            if llm_adjustment_str.startswith('```json') and llm_adjustment_str.endswith('```'):
                llm_adjustment_str = llm_adjustment_str[len('```json'):-len('```')].strip()
            elif llm_adjustment_str.startswith('```') and llm_adjustment_str.endswith('```'):
                llm_adjustment_str = llm_adjustment_str[len('```'):-len('```')].strip()

            try:
                # The model sometimes returns extra text after the JSON object.
                # We use raw_decode to parse only the first valid JSON object from the string.
                json_decoder = json.JSONDecoder()
                start_index = llm_adjustment_str.find('{')
                if start_index == -1:
                    raise json.JSONDecodeError("No JSON object found in response", llm_adjustment_str, 0)
                
                adjustment, _ = json_decoder.raw_decode(llm_adjustment_str[start_index:])

                if 'predicted_savings' in adjustment:
                    adjustment['predicted_savings'] = int(adjustment['predicted_savings'])
                else: # Ensure the key exists
                    adjustment['predicted_savings'] = savings
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to parse LLM adjustment response: {e}. Response was: {llm_adjustment_str}")
                adjustment = None

        # Fallback for adjustment
        if not adjustment:
            logger.warning("LLM adjustment generation failed. Using template-based adjustment.")
            adjustment = {
                "recommendation": f"'{recommend_category}' 분야의 지출을 줄이는 것을 고려해보세요. 이 분야에서 {anomaly_count_in_cat}건의 이상 소비가 감지되었습니다.",
                "budget_change_impact": f"'{recommend_category}' 관련 지출을 줄이면, 해당 예산을 다른 필수적인 곳에 사용하거나 저축을 늘릴 수 있습니다.",
                "predicted_savings": savings
            }

        # Final JSON response
        response_data = {
            "overall_summary": overall_summary,
            "anomalies": anomalies_list_df.to_dict('records'),
            "adjustment": adjustment
        }

        logger.info(f"Combined detection found {anomaly_count} anomalies. Returning JSON response.")
        return jsonify(response_data)

    except Exception as e:
        error_msg = f"Error during combined anomaly detection: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return jsonify({"error": error_msg}), 500

def get_user_transactions(user_id: str, user_name: str, start_date: datetime, end_date: datetime):
    """
    Fetches user transaction data from the backend API, processes it into a DataFrame,
    and filters it by the specified date range.
    """
    logger.info(f"Fetching data for user '{user_name}' from {start_date.date()} to {end_date.date()}")

    try:
        # Fetch data from the API
        api_url = f"https://j13b207.p.ssafy.io/api/ai/transaction?userId={user_id}"
        response = requests.get(api_url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        api_data = response.json()
        items = api_data.get('items', [])

        if not items:
            logger.info(f"No transactions found for user '{user_name}' (ID: {user_id}) from the API.")
            return pd.DataFrame()

        # Process the transaction data into the required format
        processed_transactions = []
        for item in items:
            if item.get('cardStatus') == 'APPROVED':
                dt = pd.to_datetime(item['dateTime'])
                processed_transactions.append({
                    '날짜': dt.date(),  # Store as date object for filtering
                    '시간': dt.strftime('%H:%M:%S'),
                    '타입': '지출',  # Assuming all are expenses
                    '대분류': item['categoryName'],
                    '내용': item['merchantName'],
                    '금액': item['amount']
                })
        
        df = pd.DataFrame(processed_transactions)
        df['날짜'] = pd.to_datetime(df['날짜']) # Convert date objects to datetime for comparison

        # Filter data within the specified date range
        mask = (df['날짜'] >= start_date) & (df['날짜'] <= end_date)
        return df.loc[mask].copy()

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch transaction data for user '{user_id}' from API: {e}")
        return pd.DataFrame()

def _generate_report_json(user_id, username, year, month, budget, analysis_df, filtered_anomalies_df):
    """Helper function to generate the final JSON report from analysis results."""
    
    # --- Basic Stats ---
    expense_df = analysis_df[analysis_df['타입'] == '지출'].copy()
    total_transactions_in_period = len(expense_df)
    anomaly_count = len(filtered_anomalies_df)
    total_spending_this_month = int(expense_df['금액'].sum())

    # --- Generate Overall Summary with LLM ---
    summary_prompt = f"'{username}'님의 {year}년 {month}월 소비 데이터를 분석한 결과입니다. 아래 정보를 바탕으로 사용자에게 친근한 어조로 전반적인 소비 상태를 요약하고 평가해주세요.\n\n"
    summary_prompt += f"- 총 지출 거래 건수: {total_transactions_in_period}건\n"
    summary_prompt += f"- 발견된 이상 소비 건수: {anomaly_count}건\n"

    spending_by_cat = expense_df.groupby('대분류')['금액'].sum().to_dict()
    sorted_spending = sorted(spending_by_cat.items(), key=lambda item: item[1], reverse=True)

    if anomaly_count > 0:
        anomaly_categories = filtered_anomalies_df['대분류'].value_counts().to_dict()
        summary_prompt += f"- 이상 소비가 가장 많은 상위 카테고리: {list(anomaly_categories.keys())[:3]}\n"

    if budget:
        budget_total = budget.get('total', 0)
        summary_prompt += f"\n사용자의 예산 및 실제 지출 현황은 다음과 같습니다:\n"
        summary_prompt += f"- 총 예산: {budget_total:,}원\n"
        summary_prompt += "\n카테고리별 예산 대비 지출 현황 (상위 5개 지출 카테고리):\n"
        for i, (category_kr, actual_spending) in enumerate(sorted_spending):
            if i >= 5: break
            category_en = KOREAN_TO_ENGLISH_MAPPING.get(category_kr)
            budget_amount = budget.get(category_en) if category_en else None
            budget_amount_str = '미설정'
            if budget_amount is not None:
                if budget_amount == -1:
                    budget_amount_str = '미설정'
                else:
                    budget_amount_str = f"{int(budget_amount):,}"
            summary_prompt += f"  - {category_kr}: 예산 {budget_amount_str}원 / 지출 {int(actual_spending):,}원\n"

    summary_prompt += "\n위 정보를 바탕으로, 요약은 2-3문장으로, 사용자가 예산 상태를 쉽게 파악할 수 있도록 친근한 어조로 작성해주세요. 예산 초과 여부와 어떤 분야에 주의해야 하는지 언급해주세요."
    llm_generated_summary = generate_llm_response(summary_prompt) or "이상 소비 내역이 발견되었습니다. 지출 내역을 검토하여 예산을 관리하는 것을 추천합니다."
    overall_summary = (
        f"'{username}'님의 {year}년 {month}월 총 지출은 {total_spending_this_month}원 입니다. "
        f"{llm_generated_summary}"
    )

    # --- User Info ---
    user_info = {
        "userId": int(user_id),
        "username": username,
        "year": int(year),
        "month": int(month)
    }

    # --- Monthly Spending Summary ---
    budget_total = budget.get('total', 0)
    budget_usage_percentage = round((total_spending_this_month / budget_total) * 100) if budget_total > 0 else 0
    income_usage_percentage = 0  # Placeholder

    monthly_spending_summary = {
        "month": f"{month}월",
        "totalSpending": total_spending_this_month,
        "budgetUsagePercentage": budget_usage_percentage,
        "incomeUsagePercentage": income_usage_percentage
    }

    # --- Spending by Category ---
    spending_by_category_list = []
    for category_kr, amount in sorted_spending:
        category_en = KOREAN_TO_ENGLISH_MAPPING.get(category_kr)
        budget_amount = budget.get(category_en, 0) if category_en else 0
        percentage = round((amount / total_spending_this_month) * 100, 1) if total_spending_this_month > 0 else 0
        spending_by_category_list.append({
            "category": category_kr,
            "percentage": percentage,
            "amount": int(amount),
            "budget": int(budget_amount)
        })

    # --- Abnormal Spending ---
    total_abnormal_spending = int(filtered_anomalies_df['금액'].sum())
    abnormal_spending_transactions = []
    if not filtered_anomalies_df.empty:
        anomalies_list_df = filtered_anomalies_df[['날짜', '시간', '금액', '대분류', '내용']].copy()
        anomalies_list_df['datetime'] = pd.to_datetime(anomalies_list_df['날짜'] + ' ' + anomalies_list_df['시간'])
        anomalies_list_df = anomalies_list_df.sort_values('datetime', ascending=False).drop(columns=['datetime'])
        for _, row in anomalies_list_df.iterrows():
            abnormal_spending_transactions.append({
                "amount": int(row['금액']),
                "location": row['내용'],
                "date": row['날짜']
            })

    abnormal_spending = {
        "totalAbnormalSpending": total_abnormal_spending,
        "transactions": abnormal_spending_transactions
    }

    # --- Budget Adjustment ---
    adjustment = None
    if anomaly_count > 0:
        anomaly_amount_by_cat = filtered_anomalies_df.groupby('대분류')['금액'].sum().sort_values(ascending=False)
        recommend_category_kr = anomaly_amount_by_cat.index[0]
        savings = int(anomaly_amount_by_cat.iloc[0])
        current_spending_for_category = int(spending_by_cat.get(recommend_category_kr, 0))
        
        recommend_category_en = KOREAN_TO_ENGLISH_MAPPING.get(recommend_category_kr)
        budget_for_category = budget.get(recommend_category_en) if budget and recommend_category_en else None

        budget_for_category_str = '미설정'
        if budget_for_category is not None:
            if budget_for_category == -1:
                budget_for_category_str = '미설정'
            else:
                budget_for_category_str = f"{int(budget_for_category):,}"

        adjustment_prompt = (
            f"'{username}'님의 이상 소비 분석 결과, '{recommend_category_kr}' 카테고리에서 가장 많은 이상 지출이 발생했습니다. 이 정보를 바탕으로 예산 조정(adjustment) 제안을 JSON 형식으로 생성해주세요.\n\n"
            f"- 조정 추천 카테고리: '{recommend_category_kr}'\n"
            f"- 해당 카테고리 내 이상 소비 총액: {savings}원\n"
            f"- 해당 카테고리 현재 지출: {current_spending_for_category}원\n"
            f"- 해당 카테고리 예산: {budget_for_category_str}원\n\n"
            "JSON 형식은 다음과 같아야 합니다:\n"
            "{\n"
            "  \"category\": \"{category}\",\n"
            "  \"currentSpending\": {amount_integer},\n"
            "  \"budget\": {amount_integer},\n"
            "  \"recommendation\": \"{category} 분야의 지출을 줄이는 것을 추천하는 문장. 예산과 실제 지출을 비교하여 언급해주세요.\"\n"
            "}\n\n"
            "모든 텍스트는 한국어로 작성해주세요. 응답은 JSON 객체만 포함해야 합니다."
        )
        llm_adjustment_str = generate_llm_response(adjustment_prompt, is_json=True)
        if llm_adjustment_str:
            try:
                json_decoder = json.JSONDecoder()
                start_index = llm_adjustment_str.find('{')
                if start_index == -1: raise json.JSONDecodeError("No JSON object found", llm_adjustment_str, 0)
                adjustment, _ = json_decoder.raw_decode(llm_adjustment_str[start_index:])
                if 'currentSpending' in adjustment: adjustment['currentSpending'] = int(adjustment['currentSpending'])
                if 'budget' in adjustment: adjustment['budget'] = int(adjustment['budget'])
            except (json.JSONDecodeError, TypeError) as e:
                logger.error(f"Failed to parse LLM adjustment response: {e}. Response: {llm_adjustment_str}")
                adjustment = None

    if not adjustment: # Fallback for both no-anomaly case and LLM failure
        recommend_category_kr = "기타" if anomaly_count == 0 else filtered_anomalies_df.groupby('대분류')['금액'].sum().idxmax()
        current_spending_for_category = int(spending_by_cat.get(recommend_category_kr, 0))
        recommend_category_en = KOREAN_TO_ENGLISH_MAPPING.get(recommend_category_kr)
        budget_for_category = budget.get(recommend_category_en) if budget and recommend_category_en else None
        
        budget_for_category_val = 0
        if budget_for_category is not None and budget_for_category != -1:
            budget_for_category_val = int(budget_for_category)

        recommendation_text = "현재 이상 소비가 없어 예산 조정이 필요하지 않습니다."
        if anomaly_count > 0:
            recommendation_text = f"'{recommend_category_kr}' 분야의 지출을 줄이는 것을 고려해보세요."

        adjustment = {
            "category": "" if anomaly_count == 0 else recommend_category_kr,
            "currentSpending": 0 if anomaly_count == 0 else current_spending_for_category,
            "budget": budget_for_category_val,
            "recommendation": recommendation_text
        }

    budget_adjustment = adjustment

    # --- Summary Report ---
    summary_report = {
        "overallSummary": str(overall_summary),
        "monthlySpendingSummary": monthly_spending_summary,
        "spendingByCategory": spending_by_category_list,
        "abnormalSpending": abnormal_spending,
        "budgetAdjustment": budget_adjustment
    }

    # --- Spending Details ---
    total_transactions_count = len(analysis_df)
    
    # Daily Transaction Counts
    daily_transaction_counts = analysis_df.groupby(analysis_df['날짜'])['금액'].count().to_dict()
    start_of_month_dt = datetime(int(year), int(month), 1)
    end_of_month_dt = (start_of_month_dt + relativedelta(months=1)) - timedelta(days=1)
    
    full_month_dates = pd.date_range(start=start_of_month_dt, end=end_of_month_dt)
    daily_transaction_counts_formatted = {
        date.strftime('%Y-%m-%d'): daily_transaction_counts.get(pd.Timestamp(date.date()), 0)
        for date in full_month_dates
    }

    # Max Daily Transactions
    max_daily_transactions = max(daily_transaction_counts.values()) if daily_transaction_counts else 0

    # Spending Per Day
    spending_per_day_list = []
    for date, daily_transactions_df in analysis_df.groupby('날짜'):
        transactions_for_day = []
        for _, transaction_row in daily_transactions_df.iterrows():
            transactions_for_day.append({
                "merchant": transaction_row['내용'],
                "category": transaction_row['대분류'],
                "paymentMethod": "미정",
                "amount": int(transaction_row['금액'])
            })
        spending_per_day_list.append({
            "date": date.strftime('%#m월 %#d일') if sys.platform == 'win32' else date.strftime('%-m월 %-d일'),
            "transactions": transactions_for_day
        })
    spending_per_day_list = sorted(spending_per_day_list, key=lambda x: datetime.strptime(x['date'], '%m월 %d일'))

    # Top Spending Merchants
    top_spending_merchants_df = analysis_df['내용'].value_counts().reset_index()
    top_spending_merchants_df.columns = ['merchant', 'transactionsCount']
    top_spending_merchants = []
    for rank, (_, row) in enumerate(top_spending_merchants_df.head(5).iterrows()):
        top_spending_merchants.append({
            "rank": rank + 1,
            "merchant": row['merchant'],
            "transactionsCount": int(row['transactionsCount'])
        })

    spending_details = {
        "totalTransactions": total_transactions_count,
        "maxDailyTransactions": max_daily_transactions,
        "dailyTransactionCounts": daily_transaction_counts_formatted,
        "spendingPerDay": spending_per_day_list,
        "topSpendingMerchants": top_spending_merchants
    }

    return {
        "userInfo": user_info,
        "summaryReport": summary_report,
        "spendingDetails": spending_details
    }

@app.route("/ai/analyze", methods=['POST'])
def analyze_user_data():
    """
    Main endpoint for dynamic anomaly detection.
    - If models for the user don't exist, it trains them on 1 year of data and analyzes the current month.
    - If models exist, it analyzes the previous month's data and retrains the models.
    """
    try:
        req_data = request.get_json()
        if not req_data or 'user_id' not in req_data or 'username' not in req_data or 'budget' not in req_data or 'year' not in req_data or 'month' not in req_data:
            return jsonify({"error": "Request body must be JSON and contain 'user_id', 'username', 'budget', 'year', and 'month'"}), 400

        user_id = req_data['user_id']
        username = req_data['username']
        budget = req_data['budget']
        year = req_data['year']
        month = req_data['month']

        # Register user in the database if they don't exist
        register_user_if_not_exists(user_id, username)

        ae_model_path = os.path.join("./model", user_id, "_autoencoder_model.keras")
        models_exist = os.path.exists(ae_model_path)

        analysis_df = pd.DataFrame()
        response_json = {}

        if not models_exist:
            # --- SCENARIO 1: New User -> Train models and analyze current month ---
            logger.info(f"Models for user '{user_id}' not found. Starting initial training.")
            
            end_date = datetime.now()
            start_date = end_date - relativedelta(years=1)
            train_df = get_user_transactions(user_id, username, start_date, end_date)

            if train_df.empty or len(train_df) < 50:
                return jsonify({"message": "Not enough historical data to create an analysis model. At least 1 year of data with 50+ transactions is recommended."}), 400

            logger.info(f"Training models on {len(train_df)} transactions...")
            ae_model, ae_scaler, ae_cols = ae.train_ae(train_df.copy())
            if_model, if_encoder = it.train_if(train_df.copy())

            model.save_autoencoder_model(ae_model, user_id)
            model.save_isolation_forest_model(if_model, user_id)
            model.save_preprocessor(ae_scaler, user_id, "ae_scaler")
            model.save_preprocessor(ae_cols, user_id, "ae_train_cols")
            model.save_preprocessor(if_encoder, user_id, "if_encoder")

            logger.info("Analyzing current month's data with newly trained models.")
            start_of_month = end_date.replace(day=1, hour=0, minute=0, second=0)
            analysis_df = get_user_transactions(user_id, username, start_of_month, end_date)
            
            if analysis_df.empty:
                return jsonify({"message": "No transactions found for the current month to analyze."})

            ae_anomalies = ae.predict_ae(analysis_df.copy(), ae_model, ae_scaler, ae_cols)
            if_anomalies = it.predict_if(analysis_df.copy(), if_model, if_encoder)

        else:
            # --- SCENARIO 2: Existing User -> Analyze previous month and retrain ---
            logger.info(f"Models for user '{user_id}' found. Analyzing previous month's data.")

            ae_model = model.find_autoencoder_model(user_id)
            if_model = model.find_isolation_forest_model(user_id)
            ae_scaler = model.find_preprocessor(user_id, "ae_scaler")
            ae_cols = model.find_preprocessor(user_id, "ae_train_cols")
            if_encoder = model.find_preprocessor(user_id, "if_encoder")

            if not all([ae_model, if_model, ae_scaler, ae_cols, if_encoder]):
                return jsonify({"error": f"Model files for user '{user_id}' are incomplete or corrupt. A full retrain is required. You may need to delete the './model/{user_id}' directory."}), 500

            today = datetime.now()
            end_of_last_month = today.replace(day=1) - timedelta(days=1)
            start_of_last_month = end_of_last_month.replace(day=1)
            analysis_df = get_user_transactions(user_id=user_id, user_name=username, start_date=start_of_last_month, end_date=end_of_last_month)

            if analysis_df.empty:
                return jsonify({"message": "No transactions found for the previous month to analyze."})

            logger.info(f"Predicting anomalies on {len(analysis_df)} transactions from last month.")
            ae_anomalies = ae.predict_ae(analysis_df.copy(), ae_model, ae_scaler, ae_cols)
            if_anomalies = it.predict_if(analysis_df.copy(), if_model, if_encoder)

            # Retrain models with the previous month's data and save them
            logger.info(f"Retraining models for user '{user_id}' with last month's data.")
            new_ae_model, new_ae_scaler, new_ae_cols = ae.train_ae(analysis_df.copy())
            new_if_model, new_if_encoder = it.train_if(analysis_df.copy())
            
            model.save_autoencoder_model(new_ae_model, user_id)
            model.save_isolation_forest_model(new_if_model, user_id)
            model.save_preprocessor(new_ae_scaler, user_id, "ae_scaler")
            model.save_preprocessor(new_ae_cols, user_id, "ae_train_cols")
            model.save_preprocessor(new_if_encoder, user_id, "if_encoder")
            logger.info(f"Models for user '{user_id}' have been updated.")

        # --- Combine, Filter, and Generate LLM Response (common for both scenarios) ---
        
        if not ae_anomalies.empty:
            ae_anomalies['detection_method'] = 'autoencoder'
        if not if_anomalies.empty:
            if_anomalies['detection_method'] = 'isolation_forest'

        combined_df = pd.concat([ae_anomalies, if_anomalies], ignore_index=True)

        if not combined_df.empty:
            # De-duplicate anomalies found by both models
            combined_df['abs_amount'] = combined_df['금액'].abs()
            combined_df = combined_df.drop_duplicates(subset=['날짜', '시간', '내용', 'abs_amount'], keep='first').drop(columns=['abs_amount'])

            # Filter out non-expense categories
            filtered_df = combined_df[~combined_df['대분류'].isin(NON_EXPENSE_CATEGORIES)]
        else:
            filtered_df = pd.DataFrame()

        # --- Generate JSON Response using the helper function ---
        response_data = _generate_report_json(user_id, username, year, month, budget, analysis_df, filtered_df)

        logger.info(f"Analysis for user '{user_id}' complete. Found {len(filtered_df)} anomalies.")
        return jsonify(response_data)

    except Exception as e:
        error_msg = f"Error during analysis for user '{user_id}': {str(e)}"
        logger.error(error_msg, exc_info=True)
        return jsonify({"error": error_msg}), 500


@app.route("/ai/model", methods=['GET'])
def make_model(): 
    '''
    새로운 유저가 등록되었을 떄, 사용되는 API
    Input : user_id, username
    Output : None
    - user_id로 결제내역 API 호출
    - 결제내역을 바탕으로 AutoEncoder와 IsolationForest 모델을 학습
    - 학습된 모델을 저장
    '''
    try:
        req_data = request.get_json()
        if not req_data or 'user_id' not in req_data or 'username' not in req_data:
            return jsonify({"error": "Request body must be JSON and contain 'user_id', 'username'"}), 400

        user_id = req_data['user_id']
        username = req_data['username']

        # Register user in the database if they don't exist
        register_user_if_not_exists(user_id, username)

        ae_model_path = os.path.join("./model", user_id, "_autoencoder_model.keras")
        models_exist = os.path.exists(ae_model_path)

        if not models_exist:
            logger.info(f"Models for user '{user_id}' not found. Starting initial training.")
            
            response = requests.get("https://j13b207.p.ssafy.io/api/ai/transaction?userId=" + user_id)
            response.raise_for_status()

            api_data = response.json()
            items = api_data.get('items', [])

            processed_transactions = []
            for item in items:
                if item.get('cardStatus') == 'APPROVED':
                    dt = pd.to_datetime(item['dateTime'])
                    processed_transactions.append({
                        '날짜': dt.strftime('%Y-%m-%d'),
                        '시간': dt.strftime('%H:%M:%S'),
                        '타입': '지출',
                        '대분류': item['categoryName'],
                        '내용': item['merchantName'],
                        '금액': item['amount']
                    })
            
            train_df = pd.DataFrame(processed_transactions)

            if train_df.empty:
                return jsonify({"message": "No transactions found for user."}), 400

            logger.info(f"Training models on {len(train_df)} transactions...")
            ae_model, ae_scaler, ae_cols = ae.train_ae(train_df.copy())
            if_model, if_encoder = it.train_if(train_df.copy())
            model.save_autoencoder_model(ae_model, user_id)
            model.save_isolation_forest_model(if_model, user_id)
            model.save_preprocessor(ae_scaler, user_id, "ae_scaler")
            model.save_preprocessor(ae_cols, user_id, "ae_train_cols")
            model.save_preprocessor(if_encoder, user_id, "if_encoder")
        else:
            logger.info(f"Models for user '{user_id}' already exist. Skipping training.")
            return jsonify({"message": "Models already exist for user"}), 200

    except Exception as e:
        logger.error(f"Failed to create models for user '{user_id}': {str(e)}")
        return jsonify({"error": "Failed to create models for user"}), 500
    
    return jsonify({"message": "Models created successfully"}), 200

    
@app.route('/ai/transaction/anomaly', methods=['POST'])
def transaction_anomaly():
    """
    각각의 결제내역에 대해 Anomaly Detection을 수행하는 API
    Input : user_id, username, transaction
    Output : is_expense : bool = True/False
    """

    data = request.get_json()
    if not data:
        logger.error('[transaction_anomaly] Request body is empty')
        return jsonify({'error': 'Request body is empty'}), 400

    user_id = data.get('user_id')
    username = data.get('username')
    transaction = data.get('transaction')

    transaction_date = transaction.get('date')
    transaction_time = transaction.get('time')
    transaction_amount = transaction.get('amount')
    transaction_category = transaction.get('category')
    transaction_content = transaction.get('content')

    if not transaction:
        logger.error('[transaction_anomaly] Transaction is missing')
        return jsonify({'error': 'Transaction is missing'}), 400

    ae_model = model.find_autoencoder_model(user_id)
    if_model = model.find_isolation_forest_model(user_id)
    ae_scaler = model.find_preprocessor(user_id, "ae_scaler")
    ae_cols = model.find_preprocessor(user_id, "ae_train_cols")
    if_encoder = model.find_preprocessor(user_id, "if_encoder")

    
    # Check if the transaction is anomaly using the autoencoder model
    if ae_model and ae_scaler and ae_cols:
        transaction_data = {col: transaction.get(col) for col in ae_cols}
        transaction_data = ae_scaler.transform(pd.DataFrame(transaction_data, index=[0]))
        transaction_data = pd.DataFrame(transaction_data, columns=ae_cols)
        prediction = ae_model.predict(transaction_data)
        is_anomaly = prediction.max() > 0.5
        logger.info(f"[transaction_anomaly][autoencoder] Transaction by user '{user_id}' is {'anomaly' if is_anomaly else 'not anomaly'}")
    
    # Check if the transaction is anomaly using the isolation forest model
    if if_model and if_encoder:
        transaction_data = {col: transaction.get(col) for col in if_encoder.get_feature_names_out()}
        transaction_data = pd.DataFrame(transaction_data, index=[0])
        prediction = if_model.predict(if_encoder.transform(transaction_data))
        is_anomaly |= prediction == -1
        logger.info(f"[transaction_anomaly][isolation_forest] Transaction by user '{user_id}' is {'anomaly' if is_anomaly else 'not anomaly'}")
    
    is_expense = is_anomaly

    response_data = {'is_expense': is_expense}
    return jsonify(response_data)

def send_monthly_report():
    """
    Generates and "sends" a monthly report for all registered users.
    This function is scheduled to run regularly (e.g., monthly).
    """
    logger.info("Starting monthly report generation for all users...")
    users = get_all_users()

    if not users:
        logger.info("No users found to send monthly reports to.")
        return

    # The analysis is for the previous full month.
    last_month_date = datetime.now() - relativedelta(months=1)
    year = str(last_month_date.year)
    month = str(last_month_date.month)

    for user in users:
        user_id = user['user_id']
        username = user['username']
        logger.info(f"Generating monthly report for user: {username} (ID: {user_id}) for {year}-{month}")

        headers = {
            'Content-Type': 'application/json' 
        }

        try:
            # 1. Fetch budget info from the backend for the previous month.
            # The analyze_user_data endpoint requires a budget object to provide comprehensive feedback.
            backend_info_url = "https://j13b207.p.ssafy.io/api/ai/report/information"
            backend_payload = {
                "userId": int(user_id),  # Convert to int for consistency with Java DTO
                "username": username,
                "year": year,
                "month": month,
            }

            backend_res = requests.post(backend_info_url, json=backend_payload, headers=headers)
            backend_res.raise_for_status()
            backend_data = backend_res.json()

            budget_data = backend_data.get('budget_set', {})
            if not budget_data:
                logger.warning(f"No budget data found for user {username} (ID: {user_id}). Analysis will proceed without budget context.")

            # 2. Call the /ai/analyze endpoint to perform the analysis.
            # This reuses the existing logic for analyzing the previous month's data for an existing user.
            analyze_url = "http://localhost:5000/ai/analyze"
            analyze_payload = {"user_id": user_id, "username": username, "budget": budget_data, "year": year, "month": month}
            report_response = requests.post(analyze_url, json=analyze_payload, headers=headers)
            report_response.raise_for_status()

            report_data = report_response.json()

            # save report_data for debugging
            with open(f"report_data_{username}_{year}_{month}.json", "w", encoding='utf-8') as f:
                json.dump(report_data, f, indent=2, ensure_ascii=False)

            # if "error" in report_data:
            #     logger.error(f"Failed to generate monthly report for {username} (ID: {user_id}): {report_data['error']}")
            # elif "message" in report_data:
            #     logger.info(f"Analysis for {username} (ID: {user_id}) resulted in a message: {report_data['message']}")
            # else:
            #     logger.info(f"Successfully generated monthly report for {username} (ID: {user_id}).")
            #     # Save the generated report to the backend database.

            #     save_report_url = "https://j13b207.p.ssafy.io/api/ai/report/save"
            #     save_payload = report_data
            #     logger.info(f"Saving report for user {username} (ID: {user_id}). Full Payload: {json.dumps(save_payload, indent=2)}") # Added for debugging
            #     save_res = requests.post(save_report_url, json=save_payload, headers=headers)
            #     if save_res.status_code == 201:
            #         logger.info(f"Successfully saved report for user {username} (ID: {user_id}) to the backend.")
            #     else:
            #         logger.error(f"Failed to save report for user {username} (ID: {user_id}). Status: {save_res.status_code}, Response: {save_res.text}")


        except requests.exceptions.RequestException as e:
            logger.error(f"A network error occurred while processing report for {username} (ID: {user_id}): {e}")
        except Exception as e:
            logger.error(f"Error generating monthly report for {username} (ID: {user_id}): {e}", exc_info=True)

    logger.info("Monthly report generation complete.")
    
    
if __name__ == "__main__":
    # Create necessary directories
    os.makedirs('data', exist_ok=True)

    # Schedule the monthly report job
    scheduler.add_job(
        func=send_monthly_report,
        trigger=CronTrigger(day=1, hour=0, minute=0), # Run on the first day of every month at midnight
        id='monthly_report_job',
        name='Monthly Report Generator',
        replace_existing=True
    )
    scheduler.start()
    # logger.info("Scheduler started. Monthly report job scheduled.")
    # next_run = scheduler.next_run
    # logger.info(f"Next scheduled job for monthly report will run at {next_run.strftime('%Y-%m-%d %H:%M:%S')}")


    # Shut down the scheduler when the app exits
    import atexit
    atexit.register(lambda: scheduler.shutdown())

    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)