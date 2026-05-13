import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

async def test_bb_new_strategy():
    query = "Atta 5kg"
    search_url = f"https://www.bigbasket.com/ps/?q={query.replace(' ', '%20')}"
    
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            extra_http_headers={
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": '"Windows"',
            }
        )
        page = await context.new_page()
        await stealth_async(page)

        print("Navigating to Home...")
        await page.goto("https://www.bigbasket.com/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        print(f"Searching: {search_url}")
        await page.goto(search_url, wait_until="domcontentloaded")
        await page.wait_for_timeout(5000)
        
        content = await page.evaluate("() => document.body.innerText")
        print("RESULT PREVIEW:")
        print(content[:500].encode('ascii', 'ignore').decode())
        
        items = await page.evaluate("""
            () => {
                const results = [];
                const cards = document.querySelectorAll('[class*="ProductCard"], .SKUDeck, [class*="PaginateItem"]');
                return Array.from(cards).map(c => c.innerText.split('\\n')[0]);
            }
        """)
        print(f"Found {len(items)} items: {items[:3]}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_bb_new_strategy())
