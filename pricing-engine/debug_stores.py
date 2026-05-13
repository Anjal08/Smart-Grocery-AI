import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

async def debug_bb_flipkart(query: str):
    # 1. BigBasket
    bb_url = f"https://www.bigbasket.com/ps/?q={query.replace(' ', '%20')}"
    print(f"Checking BigBasket: {bb_url}")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        page = await context.new_page()
        await stealth_async(page)
        await page.goto(bb_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)
        await page.screenshot(path="bb_debug.png")
        text = await page.evaluate("() => document.body.innerText")
        print("BIGBASKET SNIPPET:")
        print(text[:1000].encode('ascii', 'ignore').decode())
        await browser.close()

    # 2. Flipkart Minutes (Hyperlocal)
    fk_url = f"https://www.flipkart.com/search?q={query.replace(' ', '+')}&marketplace=HYPERLOCAL"
    print(f"Checking Flipkart: {fk_url}")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
        page = await context.new_page()
        await stealth_async(page)
        # Set pincode cookie for Flipkart
        await context.add_cookies([{"name": "pincode", "value": "226001", "domain": ".flipkart.com", "path": "/"}])
        await page.goto(fk_url, wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)
        await page.screenshot(path="fk_debug.png")
        text = await page.evaluate("() => document.body.innerText")
        print("FLIPKART SNIPPET:")
        print(text[:1000].encode('ascii', 'ignore').decode())
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_bb_flipkart("Atta 5kg"))
