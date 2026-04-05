import requests
from datetime import datetime, timezone

API_URL = "http://localhost:3000/temperature"


def convert_voltage_to_temperature(voltage):
    if voltage is None:
        raise ValueError("Voltage cannot be None")
    if voltage < 0.0 or voltage > 5.0:
        raise ValueError("Voltage out of range (0.0 - 5.0)")

    temperature = (voltage / 5.0) * 100
    return round(temperature, 2)


def send_to_api(temperature):
    payload = {
        "temperature": temperature,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    response = requests.post(API_URL, json=payload)
    response.raise_for_status()
    return response.json()


def process(voltage):
    temperature = convert_voltage_to_temperature(voltage)
    result = send_to_api(temperature)
    print(f"Stored: {temperature}°C → id={result['id']}")
    return result

