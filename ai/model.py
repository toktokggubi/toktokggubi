from math import e
import numpy as np
import tensorflow as tf
from sklearn.ensemble import IsolationForest
import joblib
import os
import pandas as pd
import logging


def find_autoencoder_model(uid: str):
    """Helper function to find and load autoencoder model"""
    model_path = os.path.join("./model", uid, "_autoencoder_model.keras")
    if os.path.exists(model_path):
        return tf.keras.models.load_model(model_path, custom_objects={'mse': tf.keras.losses.MeanSquaredError()})
    return None

def find_isolation_forest_model(uid: str):
    """Helper function to find and load isolation forest model"""
    model_path = os.path.join("./model", uid, "_isolation_forest_model.joblib")
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None

def save_autoencoder_model(model, uid: str):
    """Helper function to save autoencoder model"""
    model_dir = os.path.join("./model", uid)
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "_autoencoder_model.keras")
    model.save(model_path)
    logging.info(f"Autoencoder model saved to {model_path}")

def save_isolation_forest_model(model, uid: str):
    """Helper function to save isolation forest model"""
    model_dir = os.path.join("./model", uid)
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "_isolation_forest_model.joblib")
    joblib.dump(model, model_path)
    logging.info(f"Isolation Forest model saved to {model_path}")

def find_preprocessor(uid: str, name: str):
    """Helper function to find and load a preprocessor."""
    model_path = os.path.join("./model", uid, f"_{name}.joblib")
    if os.path.exists(model_path):
        return joblib.load(model_path)
    return None

def save_preprocessor(preprocessor, uid: str, name: str):
    """Helper function to save a preprocessor."""
    model_dir = os.path.join("./model", uid)
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, f"_{name}.joblib")
    joblib.dump(preprocessor, model_path)
    logging.info(f"Preprocessor '{name}' saved to {model_path}")

class DetectionModel:
    """
    This is a class that encapsulates the combined model of AutoEncoder and Isolation Forest for anomaly detection.
    """
    def __init__(self, autoencoder=None, isolation_forest=None, uid: str = None):
        """
        Initialize the Detection Model.

        Args:
            autoencoder (tf.keras.Model, optional): A pre-trained AutoEncoder Model.
            isolation_forest (sklearn.ensemble.IsolationForest, optional): A pre-trained Isolation Forest Model.
            uid (str, optional): User ID for model loading/saving.
        """
        self.autoencoder = autoencoder or find_autoencoder_model(uid) if uid else None
        self.isolation_forest = isolation_forest or find_isolation_forest_model(uid) if uid else None
        self.uid = uid

    



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

        
