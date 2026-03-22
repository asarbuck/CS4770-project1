# Test file for transformer implementation
# Test areas : 
#       Input edges, voltage to temp calculation, decimal inputs for temp calc, error handling
# Usage : python -m unittest .\test_transformer.py 

import unittest
from transformer import convert_voltage_to_temperature

class TestConvertVoltageToTemperature(unittest.TestCase):

    # edge cases for input 

    def test_valid_midpoint_voltage(self):
        result = convert_voltage_to_temperature(2.5)
        self.assertEqual(result, 50.0)

    def test_valid_boundary_min(self):
        result = convert_voltage_to_temperature(0.0)
        self.assertEqual(result, 0.0)

    def test_valid_boundary_max(self):
        result = convert_voltage_to_temperature(5.0)
        self.assertEqual(result, 100.0)

    # temperature calculation testing

    def test_conversion_one_volt(self):
        self.assertEqual(convert_voltage_to_temperature(1.0), 20.0)

    def test_conversion_four_volts(self):
        self.assertEqual(convert_voltage_to_temperature(4.0), 80.0)

    # decimal testing  
    def test_rounding(self):
        result = convert_voltage_to_temperature(2/3)
        self.assertEqual(result, 13.33)

    # test convert_voltage_to_temperature error handling

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
