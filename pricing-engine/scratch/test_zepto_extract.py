import asyncio
from url_extractor import ProductExtractor

async def main():
    extractor = ProductExtractor()
    url = "https://www.zepto.com/pn/pomegranate-premium/pvid/dfbc240c-b5f0-411d-9382-3aab63bbeb24"
    result = await extractor.extract_from_url(url)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
