from flask import Flask, jsonify, render_template_string, request
import pandas as pd
import os
from dotenv import load_dotenv
import logging
import model_functions.ae_functions as ae
import model_functions.it_functions as it
import json
import requests
from datetime import datetime
from llm import generate_llm_response

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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


# Configuration for non-expense categories
# These categories will be excluded from expense calculations
NON_EXPENSE_CATEGORIES = [
    '의료/건강',    # Medical/Health
    '주거/통신',    # Housing/Communication
    '금융',         # Financial
    '자동차'        # Car
]

# Assuming HTML_TEMPLATE is defined elsewhere, you may need to define it here or import it
# For this example, I'll assume it's a placeholder
HTML_TEMPLATE = """
<html>
<head><title>Anomaly Detection Results</title></head>
<body>
    <h1>Anomaly Detection Results</h1>
    {% if error %}
        <p style="color:red;">Error: {{ error }}</p>
    {% else %}
        <h2>Stats</h2>
        <ul>
            {% for key, value in stats.items() %}
                <li>{{ key }}: {{ value }}</li>
            {% endfor %}
        </ul>
        <h2>Anomalies</h2>
        {{ anomalies_table | safe }}
    {% endif %}
</body>
</html>
"""

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


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)  # Changed port to 5001 to avoid conflict
