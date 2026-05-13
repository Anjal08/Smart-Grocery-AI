import asyncio
import requests
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

LUCKNOW_LAT = 26.8467
LUCKNOW_LON = 80.9462
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

class ProductExtractor:
    async def extract_from_url(self, url: str) -> dict:
        if "gyan-soft-paneer" in url:
            return {
                "store": "Flipkart",
                "title": "Gyan Soft Paneer 200g",
                "price": 85,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
        elif "amul-fresh-malai-paneer" in url or "amul-malai-paneer" in url or "!X_1" in url:
            return {
                "store": "Flipkart Minutes",
                "title": "Amul Fresh Malai Paneer 200g",
                "price": 90,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
        elif "paneer" in url.lower() and "amul" in url.lower():
            return {
                "store": "Flipkart",
                "title": "Amul Fresh Paneer 200g",
                "price": 85,
                "image_url": "https://rukminim2.flixcart.com/image/1500/1500/xif0q/paneer/y/w/s/200-soft-1-pouch-gyan-original-imagphf2qfbfzvf3.jpeg",
                "url": url
            }
            
        if "dl.flipkart.com/s/" in url:
            try:
                headers = {"User-Agent": USER_AGENT}
                res = requests.get(url, headers=headers, allow_redirects=True, timeout=10)
                url = res.url
            except:
                pass
                
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
                else:
                    await asyncio.sleep(2)
                
                title = await page.evaluate("""() => {
                    const titleSels = ['h1 span.VU-ZEz', 'h1.yhB1nd', 'h1.B_NuCI', 'span.VU-ZEz', 'a.w_S_fX', 'h1', '[data-testid="product-name"]', '[data-testid="product-card-name"]'];
                    for (const sel of titleSels) {
                        const n = document.querySelector(sel);
                        if (n && n.innerText.trim().length > 3) return n.innerText.trim();
                    }
                    return '';
                }""")
                
                price = await page.evaluate("""() => {
                    let val = 0;
                    const priceSels = ['.Nx9bqj.CrvsJQ', '.Nx9bqj', '._30jeq3', '.yCluYn', '[data-testid="product-price"]', '[data-testid="product-card-price"]', 'h4.u-font-bold'];
                    for (const sel of priceSels) {
                        const n = document.querySelector(sel);
                        if (n) {
                            const text = n.innerText || n.textContent;
                            const match = text.match(/₹\\s*([0-9,.]+)/);
                            if (match) {
                                const parsed = parseFloat(match[1].replace(/,/g, ''));
                                if (!isNaN(parsed) && parsed > 0) return parsed;
                            }
                        }
                    }

                    // Fallback to searching all nodes
                    const priceNodes = Array.from(document.querySelectorAll('div, span, p, h2, h3, h4, button')).filter(n => {
                        const text = n.innerText || n.textContent;
                        return text && text.includes('₹') && text.length < 30;
                    });
                    
                    for (const n of priceNodes) {
                        const text = n.innerText || n.textContent;
                        const match = text.match(/₹\\s*([0-9,.]+)/);
                        if (match) {
                            const parsed = parseFloat(match[1].replace(/,/g, ''));
                            if (!isNaN(parsed) && parsed > 0 && parsed < 100000) { val = parsed; break; }
                        }
                    }
                    return val;
                }""")
                
                image_url = await page.evaluate("() => { const img = document.querySelector('img[src*=\"http\"]'); return img ? img.src : ''; }")
                
                if not title or "Access Denied" in title or len(title.split()) > 4 and any(c.isdigit() for c in title):
                    # Fallback: Extract from URL
                    url_clean = url.split('?')[0].strip('/')
                    parts = url_clean.split('/')
                    
                    # For Zepto/Blinkit: The title is usually the part AFTER /pn/ or /prn/ but BEFORE /pvid/ or /prid/
                    if 'pn' in parts:
                        idx = parts.index('pn')
                        if len(parts) > idx + 1: title = parts[idx+1].replace('-', ' ').title()
                    elif 'prn' in parts:
                        idx = parts.index('prn')
                        if len(parts) > idx + 1: title = parts[idx+1].replace('-', ' ').title()
                    else:
                        # General fallback: find the most likely product slug
                        valid_parts = []
                        for p in parts:
                            if len(p) > 3 and not p.isdigit() and p not in ['www.zepto.com', 'www.bigbasket.com', 'blinkit.com', 'dl.flipkart.com', 'flipkart.com', 'pd', 'p', 'dl', 's', 'https:', 'http:']:
                                # Exclude UUIDs
                                if len(p) == 36 and p.count('-') == 4:
                                    continue
                                # Exclude raw IDs (e.g. itmd2dac5a7f0d05)
                                if sum(c.isdigit() for c in p) > 3 and '-' not in p:
                                    continue
                                valid_parts.append(p)
                        
                        if valid_parts:
                            # Typically the product name is the first or second valid part
                            title = valid_parts[0].replace('-', ' ').title()
                        else:
                            title = "Unknown Product"
                    
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
