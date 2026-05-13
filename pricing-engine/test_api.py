import requests
import json

def test_compare_url():
    url = "http://localhost:8000/compare-url"
    data = {"url": "https://dl.flipkart.com/s/!2TUHUNNNN"}
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_compare_url()
