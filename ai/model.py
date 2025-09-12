from math import e
import numpy as np
import tensorflow as tf
from sklearn.ensemble import IsolationForest
import joblib
import os
import pandas as pd
import logging


class DetectionModel:
    """
    This is a class that encapsulates the combined model of AutoEncoder and Isolation Forest for anomaly detection.
    """
    def __init__(self, autoencoder=None, isolation_forest=None, uid : str = None):
        """
        Initializing for Detection Model.

        Args:
            input_dim (int): The dimension of the input data
            autoencoder(tf.keras.Model, optional): A pre-trained AutoEncoder Model.
            isolation_forest (sklearn.ensemble.IsolationForest, optional): A pre-trained Isolation Forest Model.
        """

        # search corresponding uid in directory:
        def find_autoencoder_model(self, uid : str):
            model_path = os.path.join("./model", uid, "_autoencoder_model.h5")
            if os.path.exists(model_path):
                return tf.keras.models.load_model(model_path)
            return None
        
        def find_isolation_forest_model(self, uid : str):
            model_path = os.path.join("./model", uid, "_isolation_forest_model.joblib")
            if os.path.exists(model_path):
                return joblib.load(model_path)
            return None
        

        self.autoencoder = find_autoencoder_model(uid)
        self.isolation_forest = find_isolation_forest_model(uid)



def data_preprocessing(data_source):
    """
    Loads the payment data from a CSV File or using the DataFrame
    then performs initial preprocessing
    """

    if isinstance(data_source, str):
        df = pd.read_csv(data_source)
    elif isinstance(data_source, pd.DataFrame):
        df = data_source.copy()
    else :
        raise TypeError("Input must be a filepath (str) or a pandas dataframe")

    # check if the data has the required columns
    # The '금액' (amount) column has commas, so we remove them before converting to a float.
    df['금액'] = df['금액'].replace({',': ''}, regex=True).astype(float)
    # Anomalies can be unusually high or low, so we use the absolute value.
    df['금액'] = df['금액'].abs()
    # Filter for '지출' (expense) data only, as per the original notebook.
    
    df['날짜'] = pd.to_datetime(df['날짜'])
    df['시간'] = pd.to_datetime(df['시간']).dt.time

    df = df[df['타입'] == '지출'].copy()


    return df

        
