import pandas as pd
import logging
import requests
from datetime import datetime

logger = logging.getLogger(__name__)

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
