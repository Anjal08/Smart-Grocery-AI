import requests
import json

def test():
    url = "http://localhost:8000/compare-url"
    payload = {"url": "https://www.zepto.com/pn/pomegranate-premium/pvid/dfbc240c-b5f0-411d-9382-3aab63bbeb24"}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
