import asyncio
from playwright.async_api import async_playwright

async def debug_blinkit(item_name: str):
    search_url = f"https://blinkit.com/s/?q={item_name.replace(' ', '%20')}"
    print(f"Opening: {search_url}")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        await page.goto(search_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)
        
        text = await page.evaluate("() => document.body.innerText")
        print("BODY TEXT SNIPPET:")
        print(text[:2000].encode('ascii', 'ignore').decode())
        
        # Look for cards
        cards = await page.evaluate("""
        () => {
            const containers = document.querySelectorAll('div[class*="Product__UpdatedPlpProductContainer"], a[data-testid="plp-product"], a[href*="/pr/"]');
            return Array.from(containers).map(c => c.innerText);
        }
        """)
        print(f"Found {len(cards)} cards.")
        for i, card_text in enumerate(cards[:3]):
            print(f"Card {i} text: {card_text.encode('ascii', 'ignore').decode()}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_blinkit("Amul Curd"))
