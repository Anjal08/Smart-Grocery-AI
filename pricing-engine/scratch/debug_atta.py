import asyncio
import re
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async def test_extraction(url):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)
        page = await context.new_page()
        await stealth_async(page)
        
        print(f"Testing URL: {url}")
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await asyncio.sleep(3)
            
            # Current logic in main.py
            title = await page.evaluate("""() => {
                const titleSels = [
                    'h1 span.VU-ZEz', 'h1.yhB1nd', 'h1.B_NuCI', 
                    'span.VU-ZEz', 'a.w_S_fX', 'h1', '.product-title',
                    '[data-testid="product-card-name"]', '.name'
                ];
                for (const sel of titleSels) {
                    const n = document.querySelector(sel);
                    if (n && n.innerText.trim().length > 3) return n.innerText.trim();
                }
                return '';
            }""")
            
            print(f"DOM Title: {title}")
            
            # Fallback logic
            is_id = bool(re.search(r'^[a-zA-Z0-9]{10,20}$', title))
            if not title or is_id:
                target_url = page.url if page.url != url else url
                print(f"Target URL: {target_url}")
                parts = target_url.split('?')[0].split('/')
                print(f"URL Parts: {parts}")
                clean_parts = [p for p in parts if len(p) > 5 and not re.search(r'^[a-zA-Z0-9]{10,20}$', p)]
                print(f"Clean Parts: {clean_parts}")
                if clean_parts:
                    title = max(clean_parts, key=len).replace('-', ' ').replace('_', ' ').title()
                elif '/p/' in target_url:
                    parts = target_url.split('?')[0].split('/')
                    if len(parts) >= 3:
                        title = parts[-3].replace('-', ' ').title()
            
            print(f"Final Extracted Title: {title}")
            
        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    # Test with a suspected URL pattern from the screenshot
    # The screenshot shows https://www.flipkart.com/aa... and the title Itmf9D4Gzrc2Afd6
    # This ID looks like the Flipkart P-ID.
    asyncio.run(test_extraction("https://www.flipkart.com/aashirvaad-superior-mp-atta/p/itmf9D4Gzrc2Afd6"))
