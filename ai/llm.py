import os
import sys
import logging
from huggingface_hub import InferenceClient

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

try:
    import openai
except ImportError:
    openai = None

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

logger = logging.getLogger(__name__)

def initialize_llm():
    """
    Initialize the LLM based on the provider configuration.
    Should be called at application startup.
    """
    global LLM_ENABLED, hf_client, local_hf_model, local_hf_tokenizer, LLM_MODEL_NAME

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

def generate_llm_response(prompt, max_tokens=1024, is_json=False):
    """
    Generates a response from the configured LLM.
    """
    if not LLM_ENABLED:
        logger.warning("LLM is disabled. Skipping API call.")
        return None

    system_message = """
    당신은 이제 **소비 분석 전문가**입니다. 당신의 목표는 사용자의 소비 내역을 분석하고, 비정상적인 지출(이상치)을 파악하며, 합리적인 소비 습관을 위한 개선 제안을 하는 것입니다. 당신은 데이터에 기반한 객관적인 분석가이며, 동시에 사용자가 이해하기 쉽고 실행 가능한 조언을 제공하는 친절한 컨설턴트입니다. 주어진 숫자를 기반으로 틀리지 않게 적으세요. 절대 자신의 감정을 말하지 마세요. 반드시 데이터에 기반해서 이야기 해야합니다. 반드시 근거가 없는 설명은 하지 마세요. 그리고 분석 리포트는 앱을 통해서 전달하기 때문에 반드시 다른 앱을 사용하는 것은 언급하지 않아야 합니다.
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

            attention_mask = (inputs != local_hf_tokenizer.pad_token_id).long().to(local_hf_model.device)

            outputs = local_hf_model.generate(
                inputs,
                attention_mask=attention_mask,
                max_new_tokens=max_tokens,
                do_sample=True,
                temperature=0.4,  # Increased temperature for more diverse output
                top_p=0.9,
                repetition_penalty=1.2,  # Added repetition penalty to prevent repeating words/phrases
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

        # logger.info(f"LLM Raw Response:\n---\n{llm_response_content}\n---")
        return llm_response_content

    except Exception as e:
        logger.error(f"Error calling {LLM_PROVIDER} LLM API: {e}")
        return None
