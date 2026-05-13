"""
test_scraper.py - Quick verification script for the Pricing Engine.

Usage:
    python test_scraper.py

This will:
1. Test the MongoDB connection.
2. Run a live scrape for "Amul Butter" with pincode 226001 (Lucknow).
3. Verify the cache hit on a second call.
"""

import asyncio
import sys
from datetime import datetime, timezone

# Ensure we can import our modules
sys.path.insert(0, ".")

from database import get_db, get_cached_price, upsert_price, ensure_indexes, close_client
from scraper import scrape_flipkart, scrape_blinkit


async def main():
    print("=" * 60)
    print("  SmartSpend AI - Pricing Engine Test Suite")
    print("=" * 60)

    # -- Test 1: MongoDB Connection --
    print("\n[INFO] Test 1: MongoDB Connection...")
    try:
        db = get_db()
        collections = await db.list_collection_names()
        print(f"   [OK] Connected! Collections: {collections}")
        await ensure_indexes()
        print("   [OK] Indexes ensured on price_cache")
    except Exception as e:
        print(f"   [FAIL] MongoDB connection failed: {e}")
        return

    # -- Test 2: Live Scrape (Blinkit) --
    item = "Amul Butter 500g"
    pincode = "226001"
    print(f"\n[INFO] Test 2: Live scrape (Blinkit) for '{item}' at pincode {pincode}...")

    try:
        result = await scrape_blinkit(item, pincode)
        if result:
            print(f"   [OK] Scraped successfully!")
            print(f"   Product : {result['product_name']}")
            print(f"   Price   : {result['price']}")
            print(f"   Store   : {result['store']}")
            print(f"   URL     : {result['url'][:80]}...")

            # Save to cache
            cache_doc = {
                "item_name": item,
                "product_name": result["product_name"],
                "price": result["price"],
                "store": result["store"],
                "url": result["url"],
                "pincode": pincode,
                "scraped_at": datetime.now(timezone.utc),
            }
            await upsert_price(cache_doc)
            print("   [OK] Saved to price_cache collection")
        else:
            print("   [WARN] Scraper returned no results (site may have blocked or layout changed)")
    except Exception as e:
        print(f"   [FAIL] Scrape failed: {e}")

    # -- Test 3: Cache Hit --
    print(f"\n[INFO] Test 3: Cache lookup for '{item}'...")
    try:
        cached = await get_cached_price(item, pincode)
        if cached:
            print(f"   [OK] Cache HIT!")
            print(f"   Cached Price : {cached['price']}")
            print(f"   Scraped At   : {cached['scraped_at']}")
        else:
            print("   [WARN] Cache MISS (expected if scrape failed)")
    except Exception as e:
        print(f"   [FAIL] Cache lookup failed: {e}")

    # -- Cleanup --
    await close_client()
    print("\n" + "=" * 60)
    print("  Tests complete!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
