from flask import Flask, jsonify, render_template_string
import pandas as pd
import os
import numpy as np
from model_functions.ae_functions import run
import logging
import json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

@app.route("/ai/")
def hello_world():
    return "<p>Autoencoder Anomaly Detection API</p>"

@app.route("/ai/encoder")
def autoencoder():
    try:
        # Load and preprocess data
        data_path = os.path.join('data', 'payment_duck.csv')
        if not os.path.exists(data_path):
            return jsonify({"error": f"Data file not found at {data_path}"}), 404
        
        # Get anomalies using the autoencoder
        results = run(data_path)

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

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)  