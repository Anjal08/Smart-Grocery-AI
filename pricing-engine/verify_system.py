import requests
import json
import asyncio

API_URL = "http://localhost:8000/compare-url"

TEST_URLS = [
    # Zepto Amul Milk
    "https://www.zepto.com/pn/amul-gold-full-cream-milk-poly-pack/pvid/61821876-0f74-4b53-83f5-0453d8650e41",
    # BigBasket Tomato
    "https://www.bigbasket.com/pd/10000200/fresho-tomato-local-1-kg/",
    # Blinkit Bread
    "https://blinkit.com/prn/harvest-gold-white-bread/prid/123"
]

async def test_item(url):
    print(f"\nTesting URL: {url}")
    try:
        response = requests.post(API_URL, json={"url": url}, timeout=60)
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS: {data['original_product']['title']}")
            print(f"Matches Found: {len(data['other_store_prices'])}")
            for m in data['other_store_prices']:
                print(f" - {m['store']}: {m['price']}")
        else:
            print(f"FAILED: Status {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"ERROR: {e}")

async def main():
    for url in TEST_URLS:
        await test_item(url)

if __name__ == "__main__":
    asyncio.run(main())
