import urllib.request
import json
import time

urls_to_test = [
    "https://www.zepto.com/pn/amul-fresh-malai-paneer/pvid/54099eb2-2d08-4013-a822-a3eebc72f19f"
]

url = "http://localhost:3000/api/scrape"
headers = {'Content-Type': 'application/json'}

for test_link in urls_to_test:
    print(f"\n--- Testing Link: {test_link[:60]}... ---")
    data = json.dumps({"productName": test_link}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers)

    try:
        start = time.time()
        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f"Time taken: {time.time()-start:.2f}s")
            
            # Print just the cheapest and availability summary
            print(f"Query Result for: {result.get('query')}")
            print(f"Cheapest Store: {result.get('cheapest')}")
            for store in result.get('results', []):
                status = f"₹{store['price']}" if store['available'] else "Unavailable"
                print(f"  - {store['platform']}: {status}")
                
    except Exception as e:
        print(f"Error testing link: {e}")
