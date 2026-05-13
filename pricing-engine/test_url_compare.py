import asyncio
import json
from url_extractor import ProductExtractor

async def test_extraction():
    url = "https://dl.flipkart.com/s/!2TUHUNNNN"
    print(f"Extracting from {url}...")
    try:
        extractor = ProductExtractor()
        result = await extractor.extract_from_url(url)
        print("Extraction Result:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except Exception as e:
        print("Error during extraction:", e)

if __name__ == "__main__":
    asyncio.run(test_extraction())
