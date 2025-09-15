import logging
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import warnings
from tensorflow.keras.models import Sequential
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense

warnings.filterwarnings('ignore')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def run(data_path):
    logger.info("Autoencoder Anomaly Detection")

    # Data Preprocessing
    logger.info("Data Preprocessing")
    df = pd.read_csv(data_path)

    # Format date and time as strings in the specified format
    df['날짜'] = pd.to_datetime(df['날짜']).dt.strftime('%Y-%m-%d')  # Format as '2025-09-15'
    df['시간'] = pd.to_datetime(df['시간']).dt.strftime('%H:%M')     # Format as '14:30'
    df['결제일시'] = pd.to_datetime(df['날짜'] + ' ' + df['시간'])   # Combine into datetime object

    # 중복 제거
    df.drop_duplicates(subset=['날짜', '시간', '금액', '결제수단'], inplace=True)
    logger.info(f"중복 제거 후 데이터 크기: {df.shape}")

    # --- '타입'이 '지출'인 데이터만 필터링 ---
    df = df[df['타입'] == '지출'].copy()
    logger.info(f"지출 내역 필터링 후 데이터 크기: {df.shape}")

    # 요일, 시간, 월 등 시간 관련 변수 생성
    df['요일'] = df['결제일시'].dt.dayofweek # 0:월요일, 6:일요일
    df['시'] = df['결제일시'].dt.hour
    df['주말여부'] = df['요일'].apply(lambda x: 1 if x >= 5 else 0)

    # 3. 범주형 데이터 인코딩
    # Preserve original categories before one-hot encoding
    df = df.drop(columns=["소분류"])
    
    # Store original category information
    if '대분류' in df.columns:
        category_mapping = df[['날짜', '시간', '내용', '금액', '대분류']].copy()
    
    # Create dummies for model training
    df = pd.get_dummies(df, columns=['대분류', '결제수단'])

    # 4. 금액 정규화 (Normalization)
    # '금액' 컬럼의 값 범위를 0과 1 사이로 조정하여 모델 학습을 용이하게 합니다.
    scaler = MinMaxScaler()
    df['금액_정규화'] = scaler.fit_transform(df[['금액']])

    # 5. 모델 학습에 사용할 최종 데이터셋 준비
    # '날짜', '시간' 등 불필요한 원본 컬럼을 제거합니다.
    features = ['요일', '시', '주말여부', '금액_정규화']
    # get_dummies로 생성된 컬럼들을 features 리스트에 추가
    # features.extend([col for col in df.columns if col.startswith(('대분류_', '소분류_', '결제수단_'))])
    features.extend([col for col in df.columns if col.startswith(('대분류_'))])

    X = df[features]
    logger.info(f"Feature Engineering 후 데이터 크기: {X.shape}")

    logger.info(X.describe())
    input_dim = X.shape[1]
    encoding_dim = 16 # 압축된 차원, 이 값은 조절 가능


    # AutoEncoder Modeling
    input_layer = Input(shape=(input_dim,))
    encoder = Dense(64, activation="relu")(input_layer)
    encoder = Dense(32, activation="relu")(encoder)
    encoder = Dense(encoding_dim, activation="relu")(encoder)

    decoder = Dense(32, activation='relu')(encoder)
    decoder = Dense(64, activation='relu')(decoder)
    decoder = Dense(input_dim, activation='sigmoid')(decoder) # 복원된 출력

    autoencoder = Model(inputs=input_layer, outputs=decoder)
    autoencoder.compile(optimizer='adam', loss='mse')

    # AutoEncoder Training
    history = autoencoder.fit(X, X,
                          epochs=100,
                          batch_size=16,
                          shuffle=True,
                          validation_split=0.2,
                          verbose=1)

    # AutoEncoder 저장
    #autoencoder.save('autoencoder.h5')
    
    # Make Prediction
    # 1. 재구성 손실(Reconstruction Loss) 계산
    predictions = autoencoder.predict(X)
    mse = np.mean(np.power(X - predictions, 2), axis=1)

    # 2. 임계값(Threshold) 설정
    threshold = np.percentile(mse, 95) # 상위 5%를 이상치로 간주

    print(f"이상 탐지 임계값: {threshold:.4f}")

    # 3. 이상치 데이터 찾기
    df['재구성_손실'] = mse
    df['이상거래'] = (df['재구성_손실'] > threshold).astype(int)

    # 4. 이상 거래로 판단된 데이터 확인
    anomalies = df[df['이상거래'] == 1]
    print("\n이상 거래로 탐지된 데이터:")
    print(anomalies[['결제일시', '금액', '내용', '재구성_손실']])

    # Prepare the result in the same format as isolation forest
    if not anomalies.empty:
        # Create a copy of the original data with categories
        if 'category_mapping' in locals() and not category_mapping.empty:
            # Merge with original categories using date, time, content, and amount as keys
            results = df.loc[anomalies.index, ['날짜', '시간', '내용', '금액']].copy()
            results = results.merge(
                category_mapping,
                on=['날짜', '시간', '내용', '금액'],
                how='left',
                suffixes=('', '_original')
            )
            
            # If merge failed to find some categories, try with just date, time, and amount
            if results['대분류'].isna().any():
                temp = df.loc[anomalies.index, ['날짜', '시간', '금액']].copy()
                temp = temp.merge(
                    category_mapping[['날짜', '시간', '금액', '대분류']].drop_duplicates(),
                    on=['날짜', '시간', '금액'],
                    how='left'
                )
                results['대분류'] = results['대분류'].fillna(temp['대분류'])
        else:
            # Fallback if we don't have the original categories
            results = df.loc[anomalies.index, ['날짜', '시간', '내용', '금액']].copy()
            results['대분류'] = 'Unknown'
        
        # Add anomaly information
        results['anomaly'] = -1
        results['anomaly_score'] = anomalies['재구성_손실'].values
        
        # Convert date and time to string format for JSON serialization
        if '날짜' in results.columns and pd.api.types.is_datetime64_any_dtype(results['날짜']):
            results['날짜'] = results['날짜'].dt.strftime('%Y-%m-%d')
        if '시간' in results.columns:
            results['시간'] = results['시간'].astype(str)
    else:
        # Ensure we have all required columns even for empty results
        results = pd.DataFrame(columns=['날짜', '시간', '대분류', '내용', '금액', 'anomaly', 'anomaly_score'])
        
    # Ensure all required columns exist in the results
    for col in ['대분류', '내용']:
        if col not in results.columns:
            results[col] = 'Unknown'
    
    # Add additional information in the same format as isolation forest
    stats = {
        "total_transactions": len(df),
        "anomaly_count": len(anomalies),
        "anomaly_percentage": len(anomalies) / len(df) if len(df) > 0 else 0,
        "total_amount": anomalies['금액'].sum() if not anomalies.empty else 0,
        "anomaly_categories": {}
    }
    
    # Calculate anomaly categories from the results if available
    if not anomalies.empty and '대분류' in results.columns:
        stats["anomaly_categories"] = results['대분류'].value_counts().to_dict()
    
    # Prepare plot data
    plot_data = {
        "timestamps": df['결제일시'].dt.strftime('%Y-%m-%d %H:%M:%S').tolist(),
        "amounts": df['금액'].tolist(),
        "colors": np.where(df['이상거래'] == 1, 'red', 'blue').tolist(),
        "error_indices": df[df['이상거래'] == 1].index.tolist(),
        "reconstruction_errors": df[df['이상거래'] == 1]['재구성_손실'].tolist() if not anomalies.empty else []
    }
    
    return results

