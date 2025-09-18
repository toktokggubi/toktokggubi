import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import silhouette_score
import warnings
import logging

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run(data_path):
    logger.info("Isolation Forest Anomaly Detection")

    # Data Preprocessing
    logger.info("Data Preprocessing")

    df = pd.read_csv(data_path)

    df['금액'] = df['금액'].replace({',': ''}, regex=True).astype(float)
    df['금액'] = df['금액'].abs()
    df = df[df['타입'] == '지출']
    
    # Format date and time as strings in the specified format
    df['날짜'] = pd.to_datetime(df['날짜']).dt.strftime('%Y-%m-%d')  # Format as '2025-09-15'
    df['시간'] = pd.to_datetime(df['시간']).dt.strftime('%H:%M')     # Format as '14:30'
    df['결제일시'] = pd.to_datetime(df['날짜'] + ' ' + df['시간'])   # Combine into datetime object

    # Encoding features with One-Hot Encoding
    logger.info("Encoding features with One-Hot Encoding")
    df = df.drop(columns=['소분류', '결제수단'], errors='ignore')

    encoder = OneHotEncoder(handle_unknown='ignore')
    encoded_features = encoder.fit_transform(df[['대분류']]).toarray()

    # Feature Engineering
    # Use 결제일시 (datetime) for feature engineering
    df['day_of_month'] = df['결제일시'].dt.day
    df['is_weekend'] = df['결제일시'].dt.dayofweek.isin([5,6])

    features = pd.concat([df[['금액', 'day_of_month', 'is_weekend']].reset_index(drop=True), pd.DataFrame(encoded_features, columns=encoder.get_feature_names_out(['대분류']))], axis=1)
    logger.info(features.describe())
    logger.info(f"Combined features shape: {features.shape}")

    # Train Isolation Forest
    logger.info("Training Isolation Forest")
    model = IsolationForest(contamination=0.15, random_state=10, n_estimators=200, max_samples='auto')
    model.fit(features)

    logger.info(f"{model}")

    silhouette_avg = silhouette_score(features, model.predict(features))
    logger.info(f"Silhouette Score: {silhouette_avg}")

    # Predict anomalies
    logger.info("Predicting anomalies")

    df['anomaly'] = model.predict(features)
    anomalies = df[df['anomaly'] == -1]

    logger.info(f"Found {len(anomalies)} anomalies:")
    logger.info("Detected Anomalies (Excessive Expenses):")
    logger.info(anomalies[['날짜', '시간', '대분류', '내용', '금액']])

    return anomalies