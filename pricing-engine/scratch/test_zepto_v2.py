import asyncio
import sys
import os

# Add parent directory to path to import main
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import ProductExtractor

async def test():
    extractor = ProductExtractor()
    url = "https://www.zepto.com/pn/pomegranate-premium/pvid/dfbc240c-b5f0-411d-9382-3aab63bbeb24"
    print(f"Testing URL: {url}")
    result = await extractor.extract_from_url(url)
    print("\nResult:")
    print(result)

if __name__ == "__main__":
    asyncio.run(test())
