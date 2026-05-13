import asyncio
import random
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
from typing import List

LUCKNOW_PIN = "226028"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async def perform_regional_search(query: str, exclude_store: str) -> List[dict]:
    results = []
    async with async_playwright() as pw:
        # Launching with a real browser profile to bypass headless detection
        browser = await pw.chromium.launch(headless=True)
        
        async def scrape_store(store_name: str, base_url: str, search_url_template: str):
            if store_name == exclude_store: return
            
            context = await browser.new_context(
                user_agent=USER_AGENT,
                viewport={'width': 1280, 'height': 800}
            )
            page = await context.new_page()
            await stealth_async(page)
            
            try:
                # 1. Direct Search with large timeout
                search_url = search_url_template.format(query.replace(' ', '%20'))
                await page.goto(search_url, wait_until="networkidle", timeout=60000)
                
                # 2. Location Recovery (if redirected to home or showing empty)
                # If no price symbol found, try setting location
                has_content = await page.query_selector('text=₹')
                if not has_content:
                    print(f"[{store_name}] No content found. Attempting location recovery...")
                    await page.goto(base_url, wait_until="domcontentloaded")
                    try:
                        # Try various location selectors
                        loc_selectors = ['button:has-text("Location")', '[class*="location"]', 'text="Select Location"']
                        for sel in loc_selectors:
                            btn = await page.query_selector(sel)
                            if btn:
                                await btn.click()
                                break
                        
                        await page.fill('input[placeholder*="pincode"], input[placeholder*="location"]', LUCKNOW_PIN)
                        await page.keyboard.press("Enter")
                        await asyncio.sleep(3)
                        # Re-search
                        await page.goto(search_url, wait_until="networkidle")
                    except: pass

                # 3. Enhanced Extraction (Strong Logic)
                # We look for ANY element that has a price and extract its closest neighbor text
                items = await page.evaluate("""() => {
                    const res = [];
                    const nodes = Array.from(document.querySelectorAll('div, span, p, h3, a'));
                    nodes.forEach(node => {
                        const txt = node.innerText || "";
                        if (txt.includes('₹') && txt.length < 20) {
                            const pVal = parseFloat(txt.replace(/[₹,]/g, '').trim());
                            if (!isNaN(pVal) && pVal > 0) {
                                // Find the title - look for text that is long enough but doesn't have price
                                let container = node.parentElement;
                                for(let i=0; i<4; i++) {
                                    if(!container) break;
                                    const titleNode = Array.from(container.querySelectorAll('div, span, p, h3, h4')).find(t => {
                                        const tt = t.innerText.trim();
                                        return tt.length > 5 && tt.length < 100 && !tt.includes('₹') && !tt.includes('Add');
                                    });
                                    if(titleNode) {
                                        res.push({ title: titleNode.innerText.trim(), price: pVal, url: window.location.href });
                                        break;
                                    }
                                    container = container.parentElement;
                                }
                            }
                        }
                    });
                    return res;
                }""")
                
                for item in items:
                    item['store'] = store_name
                    results.append(item)
                    
            except Exception as e:
                print(f"[{store_name} Error]: {str(e).encode('ascii', 'ignore').decode()}")
            finally:
                await context.close()

        tasks = []
        tasks.append(scrape_store("Blinkit", "https://blinkit.com", "https://blinkit.com/s/?q={}"))
        tasks.append(scrape_store("Zepto", "https://www.zepto.com", "https://www.zepto.com/search?query={}"))
        tasks.append(scrape_store("BigBasket", "https://www.bigbasket.com", "https://www.bigbasket.com/ps/?q={}"))
        tasks.append(scrape_store("Flipkart", "https://www.flipkart.com", "https://www.flipkart.com/search?q={}&marketplace=HYPERLOCAL"))
        
        await asyncio.gather(*tasks)
        await browser.close()
        
    return results
