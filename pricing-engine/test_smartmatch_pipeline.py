import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_compare_url(url):
    print(f"\nTesting SmartMatch for URL: {url}")
    payload = {"url": url}
    try:
        start_time = time.time()
        response = requests.post(f"{BASE_URL}/compare-url", json=payload, timeout=120)
        end_time = time.time()
        
        print(f"Status Code: {response.status_code}")
        print(f"Time Taken: {round(end_time - start_time, 2)}s")
        
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2))
            
            if data.get("status") == "success":
                print("[PASS] SmartMatch found matches!")
            elif data.get("status") == "no_match_found":
                print("[INFO] SmartMatch returned no_match_found as expected for strict matching.")
            else:
                print("[FAIL] Unexpected status in response.")
        else:
            print(f"[FAIL] Server returned error: {response.text}")
            
    except Exception as e:
        print(f"[ERROR] Request failed: {e}")

if __name__ == "__main__":
    # Test with a Blinkit URL (Amul Butter is a good stable target)
    test_urls = [
        "https://blinkit.com/pn/amul-pasteurised-butter/pjid/2361",
        "https://www.flipkart.com/amul-pasteurised-butter/p/itmd2dac5a7f0d05" # This might be different
    ]
    
    for url in test_urls:
        test_compare_url(url)
