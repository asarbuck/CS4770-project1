Input from Sampler
{
  "sensorId": "s1",
  "sampledValue": 3.847,
  "timestamp": "2026-03-14T10:00:00Z"
}

Output
{
  "sensorId": "s1",
  "temperature": 76.94,
  "unit": "Celsius",
  "timestamp": "2026-03-14T10:00:00Z"
}
```


To run
python app.py
to start the server

them you can run
curl -X POST http://127.0.0.1:5000/transform \
  -H "Content-Type: application/json" \
  -d '{"sensorId": "s1", "sampledValue": 2.5, "timestamp": "2026-03-14T10:00:00Z"}'
It should return this 
  {
  "sensorId": "s1",
  "temperature": 50.0,
  "unit": "Celsius",
  "timestamp": "2026-03-14T10:00:00Z"
}

---
Keep it to **2 files** just like the Sampler:
```
transformer/
  ├── app.py            ← Flask server, defines POST /transform
  ├── transformer.py    ← Pure conversion logic (easy to test)
  └── README.md