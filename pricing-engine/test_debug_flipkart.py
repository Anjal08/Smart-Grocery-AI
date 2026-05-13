import requests
import json

url = "http://localhost:8000/compare-url"
payload = {
    "url": "https://dl.flipkart.com/dl/amul-malai-paneer/p/itmd2dac5a7f0d05?pid=PTFFSFHZPJ9AHZGT&lid=LSTPTFFSFHZPJ9AHZGTQR7X2U&marketplace=HYPERLOCAL&shopId=luc_118_wh_hl_01&_refId=&_appId=CL"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print("Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
