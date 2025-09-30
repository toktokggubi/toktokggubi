from flask import Flask, jsonify, render_template_string, request
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

from db import get_db_connection, register_user_if_not_exists, get_all_users
from external_request import get_user_transactions

import numpy as np
import sys
import model_functions.ae_functions as ae
import model_functions.it_functions as it
import logging
import model
import json
import requests
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from llm import initialize_llm, generate_llm_response

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

initialize_llm()

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

@app.route("/ai/")
def hello_world():
    return "<p>Autoencoder Anomaly Detection API</p>"

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

    summary_prompt += "\n위 정보를 바탕으로, 사용자가 예산 상태를 쉽게 파악할 수 있도록 친근한 어조로 작성해주세요. 예산 초과 여부와 어떤 분야에 주의해야 하는지 언급해주세요."
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

            if "error" in report_data:
                logger.error(f"Failed to generate monthly report for {username} (ID: {user_id}): {report_data['error']}")
            elif "message" in report_data:
                logger.info(f"Analysis for {username} (ID: {user_id}) resulted in a message: {report_data['message']}")
            else:
                logger.info(f"Successfully generated monthly report for {username} (ID: {user_id}).")
                # Save the generated report to the backend database.

                save_report_url = "https://j13b207.p.ssafy.io/api/ai/report/save"
                save_payload = report_data
                logger.info(f"Saving report for user {username} (ID: {user_id}). Full Payload: {json.dumps(save_payload, indent=2)}") # Added for debugging
                save_res = requests.post(save_report_url, json=save_payload, headers=headers)
                if save_res.status_code == 201:
                    logger.info(f"Successfully saved report for user {username} (ID: {user_id}) to the backend.")
                else:
                    logger.error(f"Failed to save report for user {username} (ID: {user_id}). Status: {save_res.status_code}, Response: {save_res.text}")


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
        trigger=CronTrigger(day=30, hour=12, minute=10), # Run on the first day of every month at midnight
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
