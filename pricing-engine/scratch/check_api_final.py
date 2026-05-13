import requests
try:
    res = requests.get('http://localhost:8000/history?limit=10', timeout=5)
    print(f"Status: {res.status_code}")
    data = res.json()
    print(f"Count: {len(data.get('history', []))}")
    for item in data.get('history', [])[:5]:
        print(f"- {item.get('query')}")
except Exception as e:
    print(f"Error: {e}")
