# Test file for transformer implementation
# Test areas : 
#       Input edges, voltage to temp calculation, decimal inputs for temp calc, error handling
# Usage : python -m unittest .\test_transformer.py 

import unittest
from unittest.mock import patch, MagicMock
from transformer import convert_voltage_to_temperature
from app import app

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

class TestTransformEndpoint(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    @patch("app.requests.post")
    def test_valid_reading_posts_to_api(self, mock_post):
        mock_post.return_value = MagicMock(status_code=201)
        response = self.client.post('/transform', json={
            "sensorId": "s1",
            "sampledValue": 2.5,
            "timestamp": "2026-04-07T12:00:00Z"
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["temperature"], 50.0)
        self.assertEqual(data["unit"], "Celsius")
        mock_post.assert_called_once_with(
            "http://localhost:4000/temperature",
            json={"temperature": 50.0, "timestamp": "2026-04-07T12:00:00Z"}
        )

    @patch("app.requests.post")
    def test_api_failure_does_not_break_response(self, mock_post):
        mock_post.side_effect = Exception("API down")
        response = self.client.post('/transform', json={
            "sensorId": "s1",
            "sampledValue": 2.5,
            "timestamp": "2026-04-07T12:00:00Z"
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["temperature"], 50.0)

    @patch("app.requests.post")
    def test_missing_sampled_value_returns_400(self, mock_post):
        response = self.client.post('/transform', json={"sensorId": "s1"})
        self.assertEqual(response.status_code, 400)
        mock_post.assert_not_called()

    @patch("app.requests.post")
    def test_invalid_voltage_returns_400(self, mock_post):
        response = self.client.post('/transform', json={
            "sensorId": "s1",
            "sampledValue": 99.0,
            "timestamp": "2026-04-07T12:00:00Z"
        })
        self.assertEqual(response.status_code, 400)
        mock_post.assert_not_called()


if __name__ == '__main__':
    unittest.main()
