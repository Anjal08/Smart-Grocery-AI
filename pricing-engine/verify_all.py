import asyncio
import sys
import os
from datetime import datetime

# Add current dir to path
sys.path.insert(0, ".")

async def verify():
    print("="*50)
    print("SMARTSPEND AI - SYSTEM VERIFICATION")
    print("="*50)
    
    # 1. Check Python & Environment
    print(f"\n[1/4] Environment Check:")
    print(f"  Python Version: {sys.version}")
    print(f"  CWD: {os.getcwd()}")
    
    # 2. Check MongoDB
    print(f"\n[2/4] Database Check:")
    try:
        from database import get_db, ensure_indexes
        db = get_db()
        await ensure_indexes()
        collections = await db.list_collection_names()
        print(f"  [OK] MongoDB Connected. Collections: {collections}")
    except Exception as e:
        print(f"  [FAIL] MongoDB Error: {e}")
        print("  TIP: Check your .env file and MONGODB_URI.")
        return

    # 3. Check Playwright
    print(f"\n[3/4] Scraper Engine Check:")
    try:
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            print(f"  [OK] Playwright/Chromium is installed and working.")
            await browser.close()
    except Exception as e:
        print(f"  [FAIL] Scraper Engine Error: {e}")
        print("  TIP: Run 'playwright install chromium' to fix this.")
        return

    # 4. Test Live Scrape
    print(f"\n[4/4] Live Scrape Test (Blinkit):")
    try:
        from scraper import scrape_blinkit
        test_item = "Milk"
        print(f"  Searching for '{test_item}'...")
        result = await scrape_blinkit(test_item)
        if result:
            print(f"  [OK] Scraped successfully!")
            print(f"  Product: {result['product_name']}")
            print(f"  Price: {result['price']}")
        else:
            print(f"  [WARN] Scraper returned None. Site might be blocking or layout changed.")
    except Exception as e:
        print(f"  [FAIL] Scrape execution error: {e}")

    print("\n" + "="*50)
    print("VERIFICATION COMPLETE")
    print("="*50)

if __name__ == "__main__":
    asyncio.run(verify())
