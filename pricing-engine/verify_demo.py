import requests
import json
import time

TEST_URLS = [
    # 1. Amul Butter 500g
    "https://www.zepto.com/pn/amul-butter/pvid/60201376-0f74-4b53-83f5-0453d8650e41",
    # 2. Maggi 420g
    "https://www.zepto.com/pn/maggi-2-minute-instant-noodles-pouch/pvid/80201376-0f74-4b53-83f5-0453d8650e41",
    # 3. Tata Salt 1kg
    "https://www.zepto.com/pn/tata-salt-vacuum-evaporated-iodized-salt/pvid/90201376-0f74-4b53-83f5-0453d8650e41",
    # 4. Dove Soap 125g
    "https://www.zepto.com/pn/dove-cream-beauty-bar/pvid/10201376-0f74-4b53-83f5-0453d8650e41",
    # 5. Capsicum Green (Fuzzy Mode Test)
    "https://www.zepto.com/pn/capsicum-green/pvid/d673de9d-fdda-4ed7-9817-dc37f4d48b82"
]

def verify_demo():
    print("=== STARTING FINAL DEMO VERIFICATION ===\n")
    for url in TEST_URLS:
        print(f"Testing URL: {url}")
        try:
            resp = requests.post("http://localhost:8000/compare-url", json={"url": url}, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                print(f"[SUCCESS] Extracted: {data['original_product']['title']}")
                matches = [m for m in data['other_store_prices'] if m['title'] != 'Checking...']
                print(f"   Matches Found: {len(matches)}")
                for store in data['other_store_prices']:
                    if store['title'] != 'Checking...':
                        print(f"   - {store['store']}: INR {store['price']}")
                    else:
                        print(f"   - {store['store']}: {store['title']}")
            else:
                print(f"[FAILED] Status {resp.status_code}")
        except Exception as e:
            print(f"[ERROR] {str(e)}")
        print("-" * 40)
        time.sleep(1)

if __name__ == "__main__":
    verify_demo()
