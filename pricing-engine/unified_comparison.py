import asyncio
import re
from rapidfuzz import fuzz
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import requests

from gemini_matcher import get_ai_search_term, ai_validate_matches

LUCKNOW_PIN = "226028"
LUCKNOW_LAT = 26.8467
LUCKNOW_LON = 80.9462
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# --- 1. Source Detection ---
def get_source_store(url: str) -> str:
    if "blinkit.com" in url: return "Blinkit"
    elif "flipkart.com" in url: return "Flipkart"
    elif "zepto.com" in url: return "Zepto"
    elif "bigbasket.com" in url: return "BigBasket"
    return "Unknown"

# --- 2. Identity Extraction & Validation Logic ---
def extract_weight(title: str) -> str:
    match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|l|ml|pc|pcs|pieces?|pack|pouch|dozen|units?)', title, re.IGNORECASE)
    if match: return match.group(1).lower().replace(' ', '') + match.group(2).lower()
    return ""

def clean_title(title: str) -> dict:
    weight = extract_weight(title)
    clean_base = title
    
    # Remove promotional words
    promos = ["buy 1 get 1", "on sale", "discount", "free", "offer", "combo"]
    for p in promos:
        clean_base = re.sub(p, '', clean_base, flags=re.IGNORECASE)

    if weight:
        clean_base = re.sub(r'(\d+(?:\.\d+)?)\s*(kg|g|l|ml|pc|pcs|pieces?|pack|pouch|dozen|units?)', '', clean_base, flags=re.IGNORECASE)
    clean_base = re.sub(r'[^a-zA-Z0-9\s]', ' ', clean_base)
    clean_base = re.sub(r'\s+', ' ', clean_base).strip()
    
    words = clean_base.split()
    brand = words[0] if words else "Unknown"
    product_name = " ".join(words[1:]) if len(words) > 1 else brand
    
    return {
        "brand": brand,
        "product_name": product_name,
        "weight": weight,
        "search_query": f"{brand} {product_name} {weight}".strip()
    }

# --- 3. Dynamic Search Loop ---
async def search_and_extract(query: str, exclude_store: str):
    results = []
    stores = [
        {"name": "Blinkit", "url": "https://blinkit.com/s/?q={}"},
        {"name": "Zepto", "url": "https://www.zepto.com/search?query={}"},
        {"name": "BigBasket", "url": "https://www.bigbasket.com/ps/?q={}"},
        {"name": "Flipkart", "url": "https://www.flipkart.com/search?q={}&marketplace=HYPERLOCAL"}
    ]
    
    targets = [s for s in stores if s["name"] != exclude_store]
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        
        async def scrape_target(store):
            context = await browser.new_context(
                user_agent=USER_AGENT,
                geolocation={"latitude": LUCKNOW_LAT, "longitude": LUCKNOW_LON},
                permissions=["geolocation"]
            )
            # Inject Lucknow Pincode
            await context.add_cookies([
                {"name": "pincode", "value": LUCKNOW_PIN, "url": "https://blinkit.com"},
                {"name": "pincode", "value": LUCKNOW_PIN, "url": "https://www.zepto.com"},
                {"name": "pincode", "value": LUCKNOW_PIN, "domain": ".bigbasket.com", "path": "/"},
                {"name": "pincode", "value": LUCKNOW_PIN, "domain": ".flipkart.com", "path": "/"}
            ])
            page = await context.new_page()
            await stealth_async(page)
            try:
                search_url = store["url"].format(query.replace(' ', '%20'))
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(2)
                
                # Auto-Scroll
                await page.evaluate("window.scrollBy(0, 500)")
                await asyncio.sleep(1)

                items = await page.evaluate("""() => {
                    const res = [];
                    // Generic fallback extraction logic for demo
                    const cards = Array.from(document.querySelectorAll('div, a')).filter(n => n.innerText && n.innerText.includes('₹') && n.innerText.length > 10 && n.innerText.length < 100);
                    cards.forEach(c => {
                        const price = c.innerText.match(/₹\s*(\d+)/);
                        if (price) res.push({ title: c.innerText.replace(price[0], '').trim(), price: parseFloat(price[1]), url: window.location.href });
                    });
                    return res;
                }""")
                for item in items: item['store'] = store["name"]
                results.extend(items)
            except:
                pass
            finally:
                await context.close()
                
        await asyncio.gather(*(scrape_target(t) for t in targets))
        await browser.close()
    return results

async def compare_flow(url: str):
    source = get_source_store(url)
    print(f"Source Detected: {source}")
    
    # Mock source title
    raw_title = "Tender Coconut 1pc" 
    
    # 1. The 'Super-Cleaner' (Categorization)
    category_info = await get_product_category(raw_title)
    print(f"AI Categorization: {category_info}")
    
    # 2. Broad-to-Narrow Search
    search_query = raw_title
    print(f"Initial Search: {search_query}")
    results = await search_and_extract(search_query, source)
    
    if len(results) < 2:
        print("!!! Low results. Triggering Broad-to-Narrow Search...")
        broad_query = raw_title.split()[-1] # e.g. 'Coconut'
        results = await search_and_extract(broad_query, source)
    
    # 3. Final AI Verification (Gemini has the 'Final Say')
    verified_matches = []
    stores_processed = set()
    
    for candidate in results:
        if candidate['store'] in stores_processed: continue
        
        print(f"Verifying {candidate['store']} match: {candidate['title']}...")
        decision = await final_ai_decision(raw_title, candidate['title'], category_info)
        
        if decision == 'YES':
            verified_matches.append(candidate)
            stores_processed.add(candidate['store'])
            print(f"  [AI VERIFIED YES] {candidate['store']}: ₹{candidate['price']}")
        else:
            print(f"  [AI REJECTED NO] Mismatch detected.")

    print(f"\nFinal Verified Prices: {verified_matches if verified_matches else 'No exact matches found.'}")

if __name__ == "__main__":
    asyncio.run(compare_flow("https://www.zepto.com/pn/tender-coconut/pvid/123"))
