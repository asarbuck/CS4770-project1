# transformer.py
def convert_voltage_to_temperature(voltage):
    if voltage is None:
        raise ValueError("Voltage cannot be None")
    if voltage < 0.0 or voltage > 5.0:
        raise ValueError("Voltage out of range (0.0 - 5.0)")
    
    temperature = (voltage / 5.0) * 100
    return round(temperature, 2)