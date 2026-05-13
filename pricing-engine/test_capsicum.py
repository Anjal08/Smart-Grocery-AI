import requests
import json

def test_capsicum():
    url = "http://localhost:8000/compare-url"
    payload = {
        "url": "https://www.zepto.com/pn/capsicum-green/pvid/d673de9d-fdda-4ed7-9817-dc37f4d48b82"
    }
    print(f"Testing Capsicum URL: {payload['url']}")
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Extracted Title: {data['original_product']['title']}")
        print(f"Other Store Prices: {len(data['other_store_prices'])}")
        for item in data['other_store_prices']:
            print(f"- {item['store']}: {item['title']} - {item['price']}")
    else:
        print(response.text)

if __name__ == "__main__":
    test_capsicum()
