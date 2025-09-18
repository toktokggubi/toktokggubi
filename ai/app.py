from flask import Flask, jsonify, render_template_string, request
import pandas as pd
import os
import numpy as np
import model_functions.ae_functions as ae
import model_functions.it_functions as it
import logging
import model
import json
from huggingface_hub import InferenceClient
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta



try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
            device = "cuda" if torch.cuda.is_available() else "cpu"
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


# --- Database Configuration ---
# To connect to the database, ensure the following environment variables are set in compose.yml:
# DB_HOST, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
try:
    import psycopg2
    from psycopg2 import sql
    PSYCOPG2_AVAILABLE = True
    DB_HOST = os.environ.get("DB_HOST", "postgres")
    DB_NAME = os.environ.get("POSTGRES_DB")
    DB_USER = os.environ.get("POSTGRES_USER")
    DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
except ImportError:
    PSYCOPG2_AVAILABLE = False
    logger.warning("psycopg2-binary is not installed. Database operations will be disabled.")

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    if not PSYCOPG2_AVAILABLE or not all([DB_HOST, DB_NAME, DB_USER, DB_PASSWORD]):
        logger.error("Database connection details are not fully configured or psycopg2 is not installed.")
        return None
    try:
        conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
        return conn
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

# HTML template for displaying results
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Autoencoder Anomaly Detection</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .results { margin-top: 20px; }
        .plot { margin: 30px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Autoencoder Anomaly Detection Results</h1>
        {% if error %}
            <div style="color: red;">{{ error }}</div>
        {% else %}
            <div class="results">
                <h2>Statistics</h2>
                <p>Total transactions analyzed: {{ stats.total_transactions }}</p>
                <p>Number of anomalies detected: {{ stats.anomaly_count }} ({{ (stats.anomaly_percentage * 100)|round(2) }}%)</p>
                
                <div class="plot" id="anomalyPlot"></div>
                <div class="plot" id="reconstructionErrorPlot"></div>
                
                <h2>Top Anomalies</h2>
                {{ anomalies_table|safe }}
            </div>
        {% endif %}
    </div>

    <script>
        // Plot for anomaly visualization
        var anomalyData = [{
            x: {{ timestamps|tojson|safe }},
            y: {{ amounts|tojson|safe }},
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: {{ colors|tojson|safe }},
                size: 8,
                opacity: 0.7
            },
            name: 'Transactions'
        }];

        var anomalyLayout = {
            title: 'Transaction Amounts with Anomalies',
            xaxis: { title: 'Transaction Time' },
            yaxis: { title: 'Amount' },
            showlegend: true
        };

        Plotly.newPlot('anomalyPlot', anomalyData, anomalyLayout);

        // Plot for reconstruction error
        var errorData = [{
            x: Array.from({{ error_indices|tojson|safe }}),
            y: {{ reconstruction_errors|tojson|safe }},
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: 'red',
                size: 8,
                opacity: 0.7
            },
            name: 'Reconstruction Error'
        }];

        var errorLayout = {
            title: 'Reconstruction Error',
            xaxis: { title: 'Transaction Index' },
            yaxis: { title: 'Error' },
            showlegend: true
        };

        Plotly.newPlot('reconstructionErrorPlot', errorData, errorLayout);
    </script>
</body>
</html>
"""
def generate_llm_response(prompt, max_tokens=1024, is_json=False):
    """
    Generates a response from the configured LLM.
    """
    if not LLM_ENABLED:
        logger.warning("LLM is disabled. Skipping API call.")
        return None

    system_message = "You are a helpful financial assistant providing analysis for a user's spending habits. Your responses must be in Korean."
    if is_json:
        system_message += " You must respond only with the requested JSON object, without any additional text or explanations."

    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": prompt}
    ]

    llm_response_content = None

    try:
        if LLM_PROVIDER == "huggingface-local":
            # Format the chat messages and tokenize them, returning an attention mask to avoid warnings.
            chat_string = local_hf_tokenizer.apply_chat_template(
                messages, tokenize=False, add_generation_prompt=True
            )
            inputs = local_hf_tokenizer(
                chat_string, return_tensors="pt", padding=True
            ).to(local_hf_model.device)

            outputs = local_hf_model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.2,
                top_p=0.9,
                eos_token_id=local_hf_tokenizer.eos_token_id,
                pad_token_id=local_hf_tokenizer.pad_token_id
            )
            # Decode only the newly generated tokens
            response = local_hf_tokenizer.decode(outputs[0][inputs.input_ids.shape[-1]:], skip_special_tokens=True)

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
        data_path = os.path.join('data', 'payment_lee.csv')
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
            "  \"budget_change_impact\": \"지출을 줄였을 때의 긍정적 효과에 대한 설명\",\n"
            "  \"predicted_savings\": {amount_integer}\n"
            "}\n\n"
            "predicted_savings 값은 주어진 이상 소비 총액({savings})을 그대로 사용해주세요. 모든 텍스트는 한국어로 작성해주세요. 응답은 JSON 객체만 포함해야 합니다."
        )

        llm_adjustment_str = generate_llm_response(adjustment_prompt, is_json=True)
        adjustment = None

        if llm_adjustment_str:
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

def get_user_transactions(user_id: str, start_date: datetime, end_date: datetime):
    """
    Placeholder function to fetch user transaction data.
    In a real application, this would query a database.
    For this example, it loads a user-specific CSV or a default one and filters by date.
    """
    logger.info(f"Fetching data for user '{user_id}' from {start_date.date()} to {end_date.date()}")
    
    data_path = os.path.join('data', f'payment_{user_id}.csv')
    if not os.path.exists(data_path):
        # Fallback to a default file for demonstration
        data_path = os.path.join('data', 'payment_lee.csv')
        logger.warning(f"No data file for user '{user_id}'. Using default data from {data_path}")

    try:
        df = pd.read_csv(data_path)
        df['날짜'] = pd.to_datetime(df['날짜'])
        # Filter data within the specified date range
        mask = (df['날짜'] >= start_date) & (df['날짜'] <= end_date)
        return df.loc[mask].copy()
    except FileNotFoundError:
        logger.error(f"Data file not found at {data_path}")
        return pd.DataFrame()

@app.route("/ai/analyze", methods=['POST'])
def analyze_user_data():
    """
    Main endpoint for dynamic anomaly detection.
    - If models for the user don't exist, it trains them on 1 year of data and analyzes the current month.
    - If models exist, it analyzes the previous month's data and retrains the models.
    """
    try:
        req_data = request.get_json()
        if not req_data or 'user_id' not in req_data or 'username' not in req_data:
            return jsonify({"error": "Request body must be JSON and contain 'user_id' and 'username'"}), 400

        user_id = req_data['user_id']
        username = req_data['username']

        # Register user in the database if they don't exist
        register_user_if_not_exists(user_id, username)

        ae_model_path = os.path.join("./model", user_id, "_autoencoder_model.h5")
        models_exist = os.path.exists(ae_model_path)

        analysis_df = pd.DataFrame()
        response_json = {}

        if not models_exist:
            # --- SCENARIO 1: New User -> Train models and analyze current month ---
            logger.info(f"Models for user '{user_id}' not found. Starting initial training.")
            
            end_date = datetime.now()
            start_date = end_date - relativedelta(years=1)
            train_df = get_user_transactions(user_id, start_date, end_date)

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
            analysis_df = get_user_transactions(user_id, start_of_month, end_date)
            
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
            analysis_df = get_user_transactions(user_id, start_of_last_month, end_of_last_month)

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

        total_transactions = len(analysis_df[analysis_df['타입'] == '지출'])
        anomaly_count = len(filtered_df)

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

        # --- Generate JSON Response using LLM ---
        anomaly_categories = filtered_df['대분류'].value_counts().to_dict()
        anomaly_amount_by_cat = filtered_df.groupby('대분류')['금액'].sum().sort_values(ascending=False)

        summary_prompt = (
            f"'{username}'님의 소비 데이터를 분석한 결과입니다. 이 정보를 바탕으로 사용자에게 현재 소비 상태에 대한 전반적인 요약(overall_summary)을 한국어로 생성해주세요.\n\n"
            f"- 총 거래 건수: {total_transactions}건\n"
            f"- 발견된 이상 소비 건수: {anomaly_count}건\n"
            f"- 이상 소비가 가장 많은 상위 카테고리: {list(anomaly_categories.keys())[:3]}\n\n"
            "요약은 2-3문장으로, 사용자가 예산 상태를 쉽게 파악할 수 있도록 친근한 어조로 작성해주세요. 어떤 분야에 주의해야 하는지 언급해주세요."
        )
        overall_summary = generate_llm_response(summary_prompt) or "이상 소비 내역이 발견되었습니다. 지출 내역을 검토하여 예산을 관리하는 것을 추천합니다."

        anomalies_list_df = filtered_df[['날짜', '시간', '금액', '대분류', '내용']].copy()
        anomalies_list_df.rename(columns={'시간': '시각'}, inplace=True)
        anomalies_list_df['금액'] = anomalies_list_df['금액'].astype(int)
        anomalies_list_df['datetime'] = pd.to_datetime(anomalies_list_df['날짜'] + ' ' + anomalies_list_df['시각'])
        anomalies_list_df = anomalies_list_df.sort_values('datetime', ascending=False).drop(columns=['datetime'])

        recommend_category = anomaly_amount_by_cat.index[0]
        savings = int(anomaly_amount_by_cat.iloc[0])
        
        adjustment_prompt = (
            f"'{username}'님의 이상 소비 분석 결과, '{recommend_category}' 카테고리에서 가장 많은 이상 지출이 발생했습니다. 이 정보를 바탕으로 예산 조정(adjustment) 제안을 JSON 형식으로 생성해주세요.\n\n"
            f"- 조정 추천 카테고리: '{recommend_category}'\n"
            f"- 해당 카테고리 내 이상 소비 총액: {savings}원\n\n"
            "JSON 형식은 다음과 같아야 합니다:\n"
            "{\n"
            "  \"recommendation\": \"'{category}' 분야의 지출을 줄이는 것을 추천하는 문장\",\n"
            "  \"budget_change_impact\": \"지출을 줄였을 때의 긍정적 효과에 대한 설명\",\n"
            "  \"predicted_savings\": {amount_integer}\n"
            "}\n\n"
            "predicted_savings 값은 주어진 이상 소비 총액({savings})을 그대로 사용해주세요. 모든 텍스트는 한국어로 작성해주세요. 응답은 JSON 객체만 포함해야 합니다."
        )
        llm_adjustment_str = generate_llm_response(adjustment_prompt, is_json=True)
        adjustment = None
        if llm_adjustment_str:
            try:
                adjustment = json.loads(llm_adjustment_str)
                adjustment['predicted_savings'] = int(adjustment.get('predicted_savings', savings))
            except (json.JSONDecodeError, TypeError):
                adjustment = None
        
        if not adjustment:
            adjustment = {
                "recommendation": f"'{recommend_category}' 분야의 지출을 줄이는 것을 고려해보세요.",
                "budget_change_impact": f"'{recommend_category}' 관련 지출을 줄이면, 해당 예산을 다른 필수적인 곳에 사용하거나 저축을 늘릴 수 있습니다.",
                "predicted_savings": savings
            }

        response_data = {
            "overall_summary": overall_summary,
            "anomalies": anomalies_list_df.to_dict('records'),
            "adjustment": adjustment
        }

        logger.info(f"Analysis for user '{user_id}' complete. Found {anomaly_count} anomalies.")
        return jsonify(response_data)

    except Exception as e:
        error_msg = f"Error during analysis for user '{user_id}': {str(e)}"
        logger.error(error_msg, exc_info=True)
        return jsonify({"error": error_msg}), 500

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)