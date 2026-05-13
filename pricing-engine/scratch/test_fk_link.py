
import requests
import asyncio
from playwright.async_api import async_playwright

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async def test_fk_link():
    # Example shortened link (mimicking the one in screenshot)
    url = "https://dl.flipkart.com/s/!X_1" # This is incomplete but let's see if requests handles it
    
    print(f"Testing URL: {url}")
    try:
        res = requests.get(url, headers={"User-Agent": USER_AGENT}, allow_redirects=True, timeout=10)
        print(f"Resolved URL: {res.url}")
        print(f"Status: {res.status_code}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_fk_link())
