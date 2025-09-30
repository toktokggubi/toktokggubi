import pandas as pd
import sys
import logging
import json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from llm import generate_llm_response

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
                    budget_amount_str = f"{int(budget_amount):,}원"
            summary_prompt += f"  - {category_kr}: 예산 {budget_amount_str} / 지출 {int(actual_spending):,}원\n"

    summary_prompt += "\n위 정보를 바탕으로, 사용자가 예산 상태를 쉽게 파악할 수 있도록 친근한 어조로 작성해주세요. 예산 초과 여부와 어떤 분야에 주의해야 하는지 언급해주세요."
    llm_generated_summary = generate_llm_response(summary_prompt) or "이상 소비 내역이 발견되었습니다. 지출 내역을 검토하여 예산을 관리하는 것을 추천합니다."
    overall_summary = (
        f"'{username}'님의 {year}년 {month}월 총 지출은 {total_spending_this_month:,}원 입니다. "
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
        def safe_int(value, default=0):
            try:
                return int(value)
            except (TypeError, ValueError):
                return default

        llm_adjustment_str = generate_llm_response(adjustment_prompt, is_json=True)
        if llm_adjustment_str:
            try:
                # Strip markdown code block markers if present
                json_str = llm_adjustment_str.strip()
                if json_str.startswith('```json'):
                    json_str = json_str[7:].strip()  # remove ```json\n or space
                if json_str.endswith('```'):
                    json_str = json_str[:-3].strip()

                # Attempt to parse as JSON
                adjustment = json.loads(json_str)

                # Convert numeric fields safely
                adjustment['currentSpending'] = safe_int(adjustment.get('currentSpending'))
                adjustment['budget'] = safe_int(adjustment.get('budget'))
            except (json.JSONDecodeError, TypeError) as e:
                # If parsing fails, try to find the JSON object and attempt basic quote fixes
                try:
                    import re
                    json_match = re.search(r'\{.*\}', json_str, flags=re.DOTALL)
                    if json_match:
                        json_str = json_match.group(0)
                        # Replace single quotes around words (likely keys) with double quotes
                        json_str = re.sub(r"'(\w+)'\s*:", r'"\1":', json_str)
                        adjustment = json.loads(json_str)
                        adjustment['currentSpending'] = safe_int(adjustment.get('currentSpending'))
                        adjustment['budget'] = safe_int(adjustment.get('budget'))
                    else:
                        raise ValueError("No JSON object found in response")
                except Exception as fix_e:
                    logger.error(f"Failed to parse LLM adjustment response after fixes: {fix_e}. Original response: {llm_adjustment_str}")
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
