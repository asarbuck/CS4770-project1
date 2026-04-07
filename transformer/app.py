# app.py
import requests
from flask import Flask, request, jsonify
from transformer import convert_voltage_to_temperature

app = Flask(__name__)

API_URL = "http://localhost:4000/temperature"

@app.route('/transform', methods=['POST'])
def transform():
    data = request.get_json()

    if not data or 'sampledValue' not in data:
        return jsonify({"error": "Missing sampledValue"}), 400

    try:
        temperature = convert_voltage_to_temperature(data['sampledValue'])
        result = {
            "sensorId": data.get("sensorId"),
            "temperature": temperature,
            "unit": "Celsius",
            "timestamp": data.get("timestamp")
        }

        try:
            requests.post(API_URL, json={
                "temperature": temperature,
                "timestamp": data.get("timestamp")
            })
        except Exception as e:
            print(f"Failed to reach REST API: {e}")

        return jsonify(result), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)