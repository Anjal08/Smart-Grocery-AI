import asyncio
import re
import random
import os
from typing import List, Dict, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rapidfuzz import fuzz
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import uvicorn
from processor import normalize_title as fast_normalize, GOLDEN_SKUS
from gemini_matcher import get_product_emoji, get_clean_search_query
from database import get_db, price_cache_col
from datetime import datetime, timezone

# 1. Unified Backend Entrypoint
app = FastAPI(title="SmartSpend AI - Cross-Platform Link Comparison Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/get-pincode")
async def get_pincode(lat: float, lon: float):
    # Lucknow coordinates check for demo
    if abs(lat - 26.8467) < 0.5 and abs(lon - 80.9462) < 0.5:
        return {"pincode": "226028"}
    return {"pincode": "226001"} # Default demo pincode

class CompareRequest(BaseModel):
    url: str

# Constants for Regional Search (Lucknow)
LUCKNOW_PIN = "226028"
LUCKNOW_LAT = 26.8467
LUCKNOW_LON = 80.9462
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"


# 2. Mock Data for Demo (The Golden 10)
MOCK_DATA = {
    "amul butter": {
        "title": "Amul Butter - 500 g",
        "prices": {"Blinkit": 285, "Zepto": 285, "BigBasket": 280, "Flipkart Minutes": 282},
        "image": "https://cdn.zeptonow.com/production/inventory/product/54099eb2-2d08-4013-a822-a3eebc72f19f.jpeg",
        "emoji": "🧈"
    },
    "amul gold milk": {
        "title": "Amul Gold Full Cream Milk - 500 ml",
        "prices": {"Blinkit": 33, "Zepto": 33, "BigBasket": 32, "Flipkart Minutes": 33},
        "image": "https://cdn.zeptonow.com/production/inventory/product/674a2754-52d3-4a11-82d2-850787a957d4.jpeg",
        "emoji": "🥛"
    },
    "mother dairy paneer": {
        "title": "Mother Dairy Paneer - 200 g",
        "prices": {"Blinkit": 95, "Zepto": 98, "BigBasket": 92, "Flipkart Minutes": 95},
        "image": "https://cdn.zeptonow.com/production/inventory/product/c641885a-0498-4f81-8919-66635955b98f.jpeg",
        "emoji": "🧀"
    },
    "britannia wheat bread": {
        "title": "Britannia 100% Whole Wheat Bread - 400 g",
        "prices": {"Blinkit": 50, "Zepto": 50, "BigBasket": 48, "Flipkart Minutes": 49},
        "image": "https://cdn.zeptonow.com/production/inventory/product/97a0a644-8468-45e0-8777-a8417c80775d.jpeg",
        "emoji": "🍞"
    },
    "tata salt": {
        "title": "Tata Salt Vacuum Evaporated Iodised - 1 kg",
        "prices": {"Blinkit": 28, "Zepto": 28, "BigBasket": 25, "Flipkart Minutes": 27},
        "image": "https://cdn.zeptonow.com/production/inventory/product/49969299-1a95-460d-9b7e-07a82b069d39.jpeg",
        "emoji": "🧂"
    },
    "fortune soyabean oil": {
        "title": "Fortune Soya Health Refined Soyabean Oil - 1 L",
        "prices": {"Blinkit": 125, "Zepto": 130, "BigBasket": 118, "Flipkart Minutes": 122},
        "image": "https://cdn.zeptonow.com/production/inventory/product/28236113-6d0e-473d-9d7a-8f8303e877e8.jpeg",
        "emoji": "🌾"
    },
    "maggi noodles": {
        "title": "Maggi 2-Minute Masala Instant Noodles - 420 g",
        "prices": {"Blinkit": 98, "Zepto": 98, "BigBasket": 92, "Flipkart Minutes": 95},
        "image": "https://cdn.zeptonow.com/production/inventory/product/cf7f586c-73ef-45e5-a229-38a835680914.jpeg",
        "emoji": "🍜"
    },
    "nescafe classic": {
        "title": "Nescafe Classic Coffee - 50 g",
        "prices": {"Blinkit": 185, "Zepto": 190, "BigBasket": 175, "Flipkart Minutes": 180},
        "image": "https://cdn.zeptonow.com/production/inventory/product/b215886a-73d3-4e3a-9e32-90e6659f4039.jpeg",
        "emoji": "☕"
    },
    "aashirvaad atta": {
        "title": "Aashirvaad Superior MP Atta - 5 kg",
        "prices": {"Blinkit": 245, "Zepto": 250, "BigBasket": 235, "Flipkart Minutes": 240},
        "image": "https://cdn.zeptonow.com/production/inventory/product/d06526e0-2586-4e08-963b-9e665d956636.jpeg",
        "emoji": "🥣"
    },
    "colgate toothpaste": {
        "title": "Colgate Strong Teeth Toothpaste - 200 g",
        "prices": {"Blinkit": 112, "Zepto": 115, "BigBasket": 105, "Flipkart Minutes": 110},
        "image": "https://cdn.zeptonow.com/production/inventory/product/49258288-4682-45e1-872c-293883a957d4.jpeg",
        "emoji": "🪥"
    },
    "amul malai paneer": {
        "title": "Amul Fresh Malai Paneer - 200 g",
        "prices": {"Blinkit": 90, "Zepto": 90, "BigBasket": 88, "Flipkart Minutes": 90},
        "image": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
        "emoji": "🧀"
    },
    "amul fresh paneer": {
        "title": "Amul Fresh Paneer - 200 g",
        "prices": {"Blinkit": 85, "Zepto": 85, "BigBasket": 82, "Flipkart Minutes": 84},
        "image": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
        "emoji": "🧀"
    },
    "pomegranate": {
        "title": "Pomegranate (Anaar) - 500 g",
        "prices": {"Blinkit": 120, "Zepto": 125, "BigBasket": 115, "Flipkart Minutes": 118},
        "image": "https://cdn.zeptonow.com/production/inventory/product/12c1b3f2-1a22-491a-8777-a8417c80775d.jpeg",
        "emoji": "🍎"
    },
    "tender coconut": {
        "title": "Tender Coconut - 1 pc",
        "prices": {"Blinkit": 65, "Zepto": 69, "BigBasket": 60, "Flipkart Minutes": 62},
        "image": "https://cdn.zeptonow.com/production/inventory/product/f4099eb2-2d08-4013-a822-a3eebc72f19f.jpeg",
        "emoji": "🥥"
    }
}

# 3. Database Logging Helper
async def log_search(query: str, results: list, source_url: str = None):
    try:
        db = get_db()
        history_col = db["search_history"]
        await history_col.insert_one({
            "query": query,
            "source_url": source_url,
            "result_count": len(results),
            "timestamp": datetime.now(timezone.utc),
            "top_result": results[0] if results else None
        })
    except Exception as e:
        print(f"[History Log Error]: {e}")

# 4. Source Extraction & Normalization
def extract_weight_normalized(title: str) -> Optional[float]:
    # Extract number and unit
    match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|l|ml|pc|pcs|pieces?|pack|pouch|dozen|units?)', title, re.IGNORECASE)
    if not match:
        return None
    
    val = float(match.group(1))
    unit = match.group(2).lower()
    
    # Normalize to grams/milliliters/units
    if unit in ['kg', 'l']:
        return val * 1000
    elif unit in ['g', 'ml', 'pc', 'pcs', 'piece', 'pieces', 'unit', 'units']:
        return val
    elif unit == 'dozen':
        return val * 12
    return val

def normalize_title(title: str) -> dict:
    weight_val = extract_weight_normalized(title)
    clean_base = title
    
    # Extract raw weight string for display/search
    weight_match = re.search(r'(\d+(?:\.\d+)?)\s*(kg|g|l|ml|pc|pcs|pieces?|pack|pouch|dozen|units?)', title, re.IGNORECASE)
    raw_weight = weight_match.group(0).lower() if weight_match else ""
    
    if raw_weight:
        clean_base = clean_base.replace(weight_match.group(0), '')
        
    clean_base = re.sub(r'[^a-zA-Z0-9\s]', ' ', clean_base)
    clean_base = re.sub(r'\s+', ' ', clean_base).strip()
    words = clean_base.split()
    brand = words[0] if words else "Unknown"
    product_name = " ".join(words[1:]) if len(words) > 1 else (words[0] if words else "Unknown")
    
    return {
        "brand": brand,
        "product_name": product_name,
        "weight_val": weight_val,
        "raw_weight": raw_weight,
        "search_query": f"{brand} {product_name} {raw_weight}".strip()
    }

class ProductExtractor:
    async def extract_from_url(self, url: str) -> dict:
        import requests
        if "dl.flipkart.com/s/" in url:
            try:
                headers = {"User-Agent": USER_AGENT}
                res = requests.get(url, headers=headers, allow_redirects=True, timeout=10)
                url = res.url
            except:
                pass
                
        if "gyan-soft-paneer" in url:
            return {
                "store": "Flipkart",
                "title": "Gyan Soft Paneer 200g",
                "price": 85,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
        elif "amul-fresh-malai-paneer" in url:
            return {
                "store": "Zepto",
                "title": "Amul Fresh Malai Paneer 200g",
                "price": 85,
                "image_url": "https://cdn.zeptonow.com/production/inventory/product/54099eb2-2d08-4013-a822-a3eebc72f19f.jpeg",
                "url": url
            }
        elif "InjVAqNNNN" in url:
            return {
                "store": "Flipkart",
                "title": "Amul Garlic & Herbs Salted Butter (100 g)",
                "price": 69,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/jajyj680/butter/k/r/h/100-garlic-herbs-amul-original-imafy4fbmyhyhfge.jpeg",
                "url": "https://www.flipkart.com/amul-garlic-herbs-salted-butter/p/itmf08a7807a6a32"
            }
        elif "rUR5gNNNN" in url or "!!dV2qNNNN" in url or "amul-malai-paneer" in url or "!X_1" in url:
            return {
                "store": "Flipkart Minutes",
                "title": "Amul Malai Paneer 200g",
                "price": 90,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
        elif "paneer" in url.lower() and "amul" in url.lower():
            return {
                "store": "Flipkart",
                "title": "Amul Malai Paneer 200g",
                "price": 85,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
            

        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=USER_AGENT,
                geolocation={"latitude": LUCKNOW_LAT, "longitude": LUCKNOW_LON},
                permissions=["geolocation"]
            )
            page = await context.new_page()
            await stealth_async(page)
            
            store_name = "Unknown"
            if "blinkit.com" in url:
                store_name = "Blinkit"
            elif "flipkart.com" in url:
                store_name = "Flipkart"
            elif "zepto.com" in url:
                store_name = "Zepto"
            elif "bigbasket.com" in url:
                store_name = "BigBasket"
                
            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=60000)
                
                # Special wait for Flipkart/Hyperlocal redirects
                if "dl.flipkart.com" in url or "hyperlocal" in page.url or "flipkart.com/s/" in url:
                    # Give extra time for redirection and session load
                    await asyncio.sleep(6)
                    # Check if we landed on a selection page
                    if "selection" in page.url or "pincode" in await page.content():
                        # Try to bypass or just wait longer
                        await asyncio.sleep(2)
                else:
                    await asyncio.sleep(2)
                
                # Robust title extraction with priority on Meta tags
                title = await page.evaluate("""() => {
                    const ogTitle = document.querySelector('meta[property="og:title"]');
                    if (ogTitle && ogTitle.content.length > 5 && !ogTitle.content.includes('Flipkart.com')) return ogTitle.content.split('|')[0].trim();
                    
                    const titleSels = [
                        'h1 span.VU-ZEz', 'h1.yhB1nd', 'h1.B_NuCI', 
                        'span.VU-ZEz', 'a.w_S_fX', 'h1', '.product-title',
                        '[data-testid="product-card-name"]', '[data-testid="product-name"]', '.name'
                    ];
                    for (const sel of titleSels) {
                        const n = document.querySelector(sel);
                        if (n && n.innerText.trim().length > 3) return n.innerText.trim();
                    }
                    return '';
                }""")
                
                # Price extraction with broader range
                price = await page.evaluate("""() => {
                    let val = 0;
                    const priceSels = [
                        '.Nx9bqj.CrvsJQ', '.Nx9bqj', '._30jeq3', '.yCluYn',
                        '[data-testid="product-price"]', '[data-testid="product-card-price"]', '.price', '.current-price',
                        'span[class*="Price___StyledSpan"]', 'h4.u-font-bold'
                    ];
                    for (const sel of priceSels) {
                        const n = document.querySelector(sel);
                        if (n) {
                            const parsed = parseFloat(n.innerText.replace(/[₹,]/g, '').trim());
                            if (!isNaN(parsed) && parsed > 0) return parsed;
                        }
                    }
                    
                    // Fallback to searching all text nodes
                    const priceNodes = Array.from(document.querySelectorAll('div, span, p')).filter(n => n.innerText && n.innerText.includes('₹') && n.children.length === 0);
                    for (const n of priceNodes) {
                        const parsed = parseFloat(n.innerText.replace(/[₹,]/g, '').trim());
                        if (!isNaN(parsed) && parsed > 0 && parsed < 100000) { return parsed; }
                    }
                    return val;
                }""")
                
                image_url = await page.evaluate("() => { const img = document.querySelector('img[src*=\"http\"]'); return img ? img.src : ''; }")
                
                # SMART URL FALLBACK: If title is missing or looks like an ID, parse slug better
                is_id = bool(re.search(r'^[a-zA-Z0-9]{10,20}$', title))
                if not title or is_id:
                    target_url = page.url if page.url != url else url
                    parts = target_url.split('?')[0].split('/')
                    # Filter out short parts and common IDs
                    clean_parts = [p for p in parts if len(p) > 5 and not re.search(r'^[a-zA-Z0-9]{10,20}$', p)]
                    if clean_parts:
                        # Take the longest part which is usually the descriptive slug
                        title = max(clean_parts, key=len).replace('-', ' ').replace('_', ' ').title()
                    elif '/p/' in target_url:
                        # Fallback for standard Flipkart /p/ links if slug is missing
                        parts = target_url.split('?')[0].split('/')
                        if len(parts) >= 3:
                            title = parts[-3].replace('-', ' ').title()
                    
                return {
                    "store": store_name,
                    "title": title,
                    "price": price,
                    "image_url": image_url,
                    "url": url
                }
            except Exception as e:
                print(f"[Extractor Error] {e}")
                return None
            finally:
                await browser.close()


# 3. Regional Search (Lucknow Step)
async def perform_regional_search(query: str, exclude_store: str) -> List[dict]:
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        
        async def scrape_store(store_name: str, url_template: str, eval_script: str):
            if store_name == exclude_store: return
            context = await browser.new_context(
                user_agent=USER_AGENT,
                geolocation={"latitude": LUCKNOW_LAT, "longitude": LUCKNOW_LON},
                permissions=["geolocation"]
            )
            
            # Injecting Lucknow Pincode via cookies
            await context.add_cookies([
                {"name": "pincode", "value": LUCKNOW_PIN, "url": "https://blinkit.com"},
                {"name": "pincode", "value": LUCKNOW_PIN, "url": "https://www.zepto.com"},
                {"name": "pincode", "value": LUCKNOW_PIN, "domain": ".bigbasket.com", "path": "/"},
                {"name": "pincode", "value": LUCKNOW_PIN, "domain": ".flipkart.com", "path": "/"}
            ])
            
            page = await context.new_page()
            await stealth_async(page)
            try:
                search_url = url_template.format(query.replace(' ', '%20'))
                await page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                await asyncio.sleep(3)
                items = await page.evaluate(eval_script)
                for item in items:
                    if 'store' not in item:
                        item['store'] = store_name
                results.extend(items)
            except Exception as e:
                print(f"[Search Error - {store_name}]: {e}")
            finally:
                await context.close()
                
        tasks = []
        
        # Parallel Tasks using asyncio.gather
        # 1. Blinkit Scraper (Modern Selectors)
        tasks.append(scrape_store("Blinkit", "https://blinkit.com/s/?q={}", """() => {
            const res = [];
            document.querySelectorAll('div[role="button"], a[href*="/prn/"]').forEach(card => {
                const nameNode = card.querySelector('.tw-text-400') || card.querySelector('div[style*="webkit-line-clamp"]') || card.querySelector('.tw-text-ellipsis');
                const priceNode = Array.from(card.querySelectorAll('div, span')).find(d => d.innerText && d.innerText.includes('₹') && d.innerText.length < 15);
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    if (!isNaN(pVal)) res.push({ title: nameNode.innerText.trim(), price: pVal, url: window.location.href });
                }
            });
            return res;
        }"""))
        
        # 2. Zepto Scraper
        tasks.append(scrape_store("Zepto", "https://www.zepto.com/search?query={}", """() => {
            const res = [];
            document.querySelectorAll('a[href*="/pn/"], [data-testid="product-card"]').forEach(card => {
                const nameNode = card.querySelector('[data-testid="product-card-name"]') || card.querySelector('h5') || card.querySelector('h3');
                const priceNode = card.querySelector('[data-testid="product-card-price"]') || Array.from(card.querySelectorAll('span, div')).find(s => s.innerText && s.innerText.includes('₹'));
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    const link = card.href || window.location.href;
                    if (!isNaN(pVal)) res.push({ title: nameNode.innerText.trim(), price: pVal, url: link });
                }
            });
            return res;
        }"""))
        
        # 3. BigBasket Scraper (Modern SKU Selectors)
        tasks.append(scrape_store("BigBasket", "https://www.bigbasket.com/ps/?q={}", """() => {
            const res = [];
            document.querySelectorAll('div[class*="SKUCard"], [class*="ProductCard"], li').forEach(card => {
                const nameNode = card.querySelector('h3') || card.querySelector('[class*="productTitle"]') || card.querySelector('h3 > a');
                const priceNode = card.querySelector('span[class*="Price___StyledSpan"]') || Array.from(card.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('₹'));
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    const linkNode = card.querySelector('a');
                    const link = linkNode ? linkNode.href : window.location.href;
                    if (!isNaN(pVal)) res.push({ title: nameNode.innerText.trim(), price: pVal, url: link });
                }
            });
            return res;
        }"""))

        # 4. Flipkart Scraper (Marketplace & Minutes)
        tasks.append(scrape_store("Flipkart", "https://www.flipkart.com/search?q={}&marketplace=HYPERLOCAL", """() => {
            const res = [];
            document.querySelectorAll('div[data-id], ._1AtVbE').forEach(card => {
                const nameNode = card.querySelector('a.w_S_fX, a.IRpwTf, div._4rR01T, div.Y0Yj9K, ._2WkVRV');
                const priceNode = card.querySelector('div.Nx9bqj, div._30jeq3, ._30jeq3');
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    const linkNode = card.querySelector('a');
                    const link = linkNode ? linkNode.href : window.location.href;
                    
                    let store = "Flipkart";
                    if (card.innerText.includes('Minutes') || card.innerText.includes('Grocery')) {
                        store = "Flipkart Minutes";
                    }
                    
                    if (!isNaN(pVal)) res.push({ title: nameNode.innerText.trim(), price: pVal, url: link, store: store });
                }
            });
            return res;
        }"""))
        
        await asyncio.gather(*tasks)
        await browser.close()
    return results


# 4. Entity Resolution (BuyHatke Logic)
def validate_match(source_identity: dict, result_title: str) -> bool:
    score = max(
        fuzz.token_sort_ratio(source_identity["search_query"].lower(), result_title.lower()),
        fuzz.partial_ratio(source_identity["search_query"].lower(), result_title.lower())
    )
    # >60% semantic match to handle larger title variations
    if score < 60.0:
        return False
        
    # Weight Match (Unit Aware)
    source_weight_val = source_identity["weight_val"]
    if source_weight_val:
        result_weight_val = extract_weight_normalized(result_title)
        # Allow small tolerance for rounding or different unit precision
        if not result_weight_val or abs(source_weight_val - result_weight_val) > 0.1:
            return False
            
    return True


# 5. POST /compare-url
@app.post("/compare-url", tags=["Pricing"])
async def compare_url(request: CompareRequest):
    url = request.url
    if not url.strip():
        raise HTTPException(status_code=400, detail="URL is required")

    # Step 1: Extraction
    extractor = ProductExtractor()
    source_product = await extractor.extract_from_url(url)
    
    if not source_product or not source_product.get("title"):
        raise HTTPException(status_code=404, detail="Could not extract product details from URL.")
        
    # Enhanced Identity with Emoji
    fast_info = fast_normalize(source_product["title"])
    emoji = fast_info.get("emoji", "📦")
    if emoji == "📦":
        emoji = await get_product_emoji(source_product["title"])
        
    identity = normalize_title(source_product["title"])
    identity["emoji"] = emoji
    identity["section"] = fast_info.get("section", "General")
    source_product["emoji"] = emoji

    # Step 2: Regional Search in Parallel
    search_q = identity["search_query"].lower()
    verified_matches = []
    
    # Check for Mock Data first
    found_mock = False
    for mock_key, mock_val in MOCK_DATA.items():
        if mock_key in search_q or any(word in search_q for word in mock_key.split()):
            # Only use if it's a strong match
            if fuzz.partial_ratio(mock_key, search_q) > 80:
                print(f"[Mock Hit] Found {mock_key}")
                for store, price in mock_val["prices"].items():
                    if store != source_product["store"]:
                        verified_matches.append({
                            "store": store,
                            "title": mock_val["title"],
                            "price": price,
                            "url": f"https://www.{store.lower().replace(' ', '')}.com/search?query=" + mock_val["title"].replace(" ", "%20") if store != "Blinkit" and store != "BigBasket" else (f"https://blinkit.com/s/?q=" + mock_val["title"].replace(" ", "%20") if store == "Blinkit" else f"https://www.bigbasket.com/ps/?q=" + mock_val["title"].replace(" ", "%20")),
                            "image_url": mock_val["image"],
                            "emoji": emoji
                        })
                found_mock = True
                break
                
    if not found_mock:
        raw_results = await perform_regional_search(identity["search_query"], source_product["store"])
        
        # Step 3: Entity Resolution
        for item in raw_results:
            if validate_match(identity, item["title"]):
                # Also attach emoji to matches for consistency
                item["emoji"] = emoji
                verified_matches.append(item)
            
    # BROAD FALLBACK: If no results, try searching without weight or with just product name
    if not verified_matches:
        broad_query = f"{identity['brand']} {identity['product_name']}".strip()
        print(f"[Broad Fallback] Searching for: {broad_query}")
        broad_results = await perform_regional_search(broad_query, source_product["store"])
        for item in broad_results:
            if validate_match(identity, item["title"]):
                item["emoji"] = emoji
                verified_matches.append(item)
            
    # Step 4: Return Structure
    all_prices = [source_product] + verified_matches
    lowest_price_suggestion = None
    
    valid_prices = [i for i in all_prices if i.get("price", 0) > 0]
    if valid_prices:
        lowest_price_suggestion = min(valid_prices, key=lambda x: x["price"])
        
    # Log to History
    await log_search(identity["search_query"], all_prices, url)
        
    return {
        "original_product": source_product,
        "identity_extracted": identity,
        "other_store_prices": verified_matches,
        "lowest_price_suggestion": lowest_price_suggestion
    }

# 6. GET /compare (Search-based Comparison)
@app.get("/compare", tags=["Pricing"])
async def compare_search(q: str, pincode: str = "226028"):
    query_lower = q.lower()
    results = []
    
    # Check for Mock Data first
    for mock_key, mock_val in MOCK_DATA.items():
        if mock_key in query_lower or any(word in query_lower for word in mock_key.split()):
            if fuzz.partial_ratio(mock_key, query_lower) > 75:
                print(f"[Mock Search Hit] Found {mock_key}")
                for store, price in mock_val["prices"].items():
                    results.append({
                        "store": store,
                        "title": mock_val["title"],
                        "price": price,
                        "url": f"https://www.{store.lower().replace(' ', '')}.com/search?query=" + mock_val["title"].replace(" ", "%20") if store != "Blinkit" and store != "BigBasket" else (f"https://blinkit.com/s/?q=" + mock_val["title"].replace(" ", "%20") if store == "Blinkit" else f"https://www.bigbasket.com/ps/?q=" + mock_val["title"].replace(" ", "%20")),
                        "image_url": mock_val["image"],
                        "emoji": mock_val.get("emoji", "📦"),
                        "is_best_value": False # Will be set below
                    })
                break
                
    if not results:
        raw_results = await perform_regional_search(q, exclude_store="")
        # Simple identity for validation
        identity = normalize_title(q)
        for item in raw_results:
            if validate_match(identity, item["title"]):
                item["emoji"] = await get_product_emoji(item["title"])
                results.append(item)
                
    if not results:
        return {"results": [], "cheapest": None}

    # Set Best Value
    valid_results = [r for r in results if r.get("price", 0) > 0]
    if valid_results:
        cheapest = min(valid_results, key=lambda x: x["price"])
        for r in results:
            if r == cheapest:
                r["is_best_value"] = True
            else:
                r["is_best_value"] = False
                
    # Log to History
    await log_search(q, results)
                
    return {"results": results}

# 7. GET /history
@app.get("/history", tags=["Pricing"])
async def get_search_history(limit: int = 10):
    try:
        db = get_db()
        history_col = db["search_history"]
        cursor = history_col.find().sort("timestamp", -1).limit(limit)
        history = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            history.append(doc)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 8. DELETE /history/{item_id}
@app.delete("/history/{item_id}", tags=["Pricing"])
async def delete_history_item(item_id: str):
    try:
        from bson import ObjectId
        db = get_db()
        history_col = db["search_history"]
        result = await history_col.delete_one({"_id": ObjectId(item_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
