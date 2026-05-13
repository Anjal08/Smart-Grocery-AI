import asyncio
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

async def test_search(query):
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        context = await browser.new_context(user_agent=USER_AGENT)
        page = await context.new_page()
        await stealth_async(page)
        
        # Test BigBasket
        url = f"https://www.bigbasket.com/ps/?q={query.replace(' ', '%20')}"
        print(f"Searching BigBasket: {url}")
        await page.goto(url, wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        items = await page.evaluate("""() => {
            const res = [];
            document.querySelectorAll('div.h-full.flex.flex-col, [class*="ProductCard"]').forEach(card => {
                const nameNode = card.querySelector('h3 > a') || card.querySelector('[class*="productTitle"]');
                const priceNode = Array.from(card.querySelectorAll('span')).find(s => s.innerText && s.innerText.includes('₹') && (s.className.includes('bold') || s.className.includes('Price')));
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    res.push({ title: nameNode.innerText.trim(), price: pVal });
                }
            });
            return res;
        }""")
        print(f"BigBasket Results: {len(items)}")
        for item in items[:3]:
            print(f" - {item['title']}: {item['price']}")

        # Test Blinkit
        url = f"https://blinkit.com/s/?q={query.replace(' ', '%20')}"
        print(f"Searching Blinkit: {url}")
        await page.goto(url, wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        items = await page.evaluate("""() => {
            const res = [];
            document.querySelectorAll('div[role="button"], a[href*="/prn/"]').forEach(card => {
                const nameNode = card.querySelector('.tw-text-ellipsis') || card.querySelector('div[style*="webkit-line-clamp"]');
                const priceNode = Array.from(card.querySelectorAll('div, span')).find(d => d.innerText && d.innerText.includes('₹') && d.innerText.length < 15);
                if (nameNode && priceNode) {
                    const pVal = parseFloat(priceNode.innerText.replace(/[₹,]/g, '').trim());
                    res.push({ title: nameNode.innerText.trim(), price: pVal });
                }
            });
            return res;
        }""")
        print(f"Blinkit Results: {len(items)}")
        for item in items[:3]:
            print(f" - {item['title']}: {item['price']}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_search("Aashirvaad Aata"))
