
import requests
import json
import time

def verify_paneer():
    url = "https://dl.flipkart.com/s/!X_1" # The one from user's screenshot
    print(f"--- Verifying Amul Paneer Link: {url} ---")
    
    try:
        # Step 1: Test /get-pincode (The one failing in frontend)
        print("\n[Test 1] Verifying /get-pincode...")
        p_res = requests.get("http://localhost:8000/get-pincode?lat=26.8467&lon=80.9462", timeout=5)
        print(f"Status: {p_res.status_code}, Response: {p_res.text}")
        
        # Step 2: Test /compare-url
        print("\n[Test 2] Verifying /compare-url for Amul Paneer...")
        start_time = time.time()
        c_res = requests.post("http://localhost:8000/compare-url", json={"url": url}, timeout=60)
        elapsed = time.time() - start_time
        
        if c_res.status_code == 200:
            data = c_res.json()
            print(f"[SUCCESS] Time: {elapsed:.2f}s")
            print(f"Product: {data['original_product']['title']}")
            print(f"Price: {data['original_product']['price']}")
            print(f"Store: {data['original_product']['store']}")
            print(f"\nOther Store Prices found: {len(data['other_store_prices'])}")
            for p in data['other_store_prices']:
                print(f"- {p['store']}: {p['price']}")
        else:
            print(f"[FAILED] Status: {c_res.status_code}, Detail: {c_res.text}")
            
    except Exception as e:
        print(f"[ERROR] Connection failed: {e}")

if __name__ == "__main__":
    verify_paneer()
