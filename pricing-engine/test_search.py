import urllib.request
import json
import time

url = "http://localhost:8000/compare-url"
data = json.dumps({"url": "https://dl.flipkart.com/s/InjVAqNNNN"}).encode('utf-8')
headers = {'Content-Type': 'application/json'}
req = urllib.request.Request(url, data=data, headers=headers)

try:
    print("Sending request to the Pricing Engine...")
    print("This may take up to 60 seconds as Playwright scrapes 4 stores in parallel.")
    start = time.time()
    with urllib.request.urlopen(req, timeout=120) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"\nTime taken: {time.time()-start:.2f}s")
        print("--- RESULTS ---")
        print(json.dumps(result, indent=2))
except Exception as e:
    print(f"Error: {e}")
