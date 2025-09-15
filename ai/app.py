from flask import Flask, jsonify, render_template_string
import pandas as pd
import os
import numpy as np
import model_functions.ae_functions as ae
import model_functions.it_functions as it
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
        data_path = os.path.join('data', 'payment_duck.csv')
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
        data_path = os.path.join('data', 'payment_duck.csv')
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
        
        # If we have duplicates (detected by both methods), keep only one copy
        if not combined_df.empty and '날짜' in combined_df.columns and '시간' in combined_df.columns and '금액' in combined_df.columns:
            combined_df = combined_df.drop_duplicates(subset=['날짜', '시간', '금액', '내용'])
        
        # Calculate statistics
        total_transactions = len(pd.read_csv(data_path))
        anomaly_count = len(combined_df)
        
        if combined_df.empty:
            logger.info("No anomalies detected by either method")
            return render_template_string(
                HTML_TEMPLATE, 
                anomalies_table="<p>No anomalies detected by either method.</p>", 
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
        
        # Prepare the results
        stats = {
            "anomaly_count": anomaly_count,
            "anomaly_percentage": anomaly_count / total_transactions if total_transactions > 0 else 0,
            "total_transactions": total_transactions,
            "total_amount": combined_df['금액'].sum(),
            "anomaly_categories": combined_df['대분류'].value_counts().to_dict()
        }
        
        # Convert to HTML table
        display_columns = ['날짜', '시간', '대분류', '내용', '금액', 'detection_method']
        if 'anomaly_score' in combined_df.columns:
            display_columns.append('anomaly_score')
            
        anomalies_table = combined_df[display_columns].to_html(index=False)
        
        logger.info(f"Combined detection found {anomaly_count} anomalies")
        
        # Prepare plot data (using autoencoder's plot data if available)
        plot_data = {}
        if hasattr(ae_results, 'get') and 'plot_data' in ae_results:
            plot_data = ae_results['plot_data']
        
        return render_template_string(
            HTML_TEMPLATE, 
            anomalies_table=anomalies_table, 
            error=None, 
            stats=stats,
            timestamps=plot_data.get('timestamps', []),
            amounts=plot_data.get('amounts', []),
            colors=plot_data.get('colors', []),
            error_indices=plot_data.get('error_indices', []),
            reconstruction_errors=plot_data.get('reconstruction_errors', [])
        )
        
    except Exception as e:
        error_msg = f"Error during combined anomaly detection: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return render_template_string(
            HTML_TEMPLATE, 
            error=error_msg, 
            anomalies_table="", 
            stats={}
        )

if __name__ == "__main__":
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)  