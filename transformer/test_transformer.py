# test_transformer.py
import unittest
from transformer import convert_voltage_to_temperature

class TestConvertVoltageToTemperature(unittest.TestCase):

    # --- Valid input handling ---

    def test_valid_midpoint_voltage(self):
        result = convert_voltage_to_temperature(2.5)
        self.assertEqual(result, 50.0)

    def test_valid_boundary_min(self):
        result = convert_voltage_to_temperature(0.0)
        self.assertEqual(result, 0.0)

    def test_valid_boundary_max(self):
        result = convert_voltage_to_temperature(5.0)
        self.assertEqual(result, 100.0)

    # --- Correct voltage-to-temperature conversion ---

    def test_conversion_one_volt(self):
        self.assertEqual(convert_voltage_to_temperature(1.0), 20.0)

    def test_conversion_four_volts(self):
        self.assertEqual(convert_voltage_to_temperature(4.0), 80.0)

    def test_rounding(self):
        # 1/3 volt -> 6.666... should round to 6.67
        result = convert_voltage_to_temperature(1 / 3)
        self.assertEqual(result, 6.67)

    # --- Error handling ---

    def test_none_raises_value_error(self):
        with self.assertRaises(ValueError):
            convert_voltage_to_temperature(None)

    def test_negative_voltage_raises_value_error(self):
        with self.assertRaises(ValueError):
            convert_voltage_to_temperature(-0.1)

    def test_over_max_voltage_raises_value_error(self):
        with self.assertRaises(ValueError):
            convert_voltage_to_temperature(5.1)


if __name__ == '__main__':
    unittest.main()
