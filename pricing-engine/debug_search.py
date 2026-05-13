import asyncio
from scraper import perform_regional_search
import json

async def debug_search():
    query = "Amul Dark Chocolate"
    print(f"Searching for: {query}")
    results = await perform_regional_search(query, "Zepto")
    print(f"Results Found: {len(results)}")
    with open("debug_results.json", "w") as f:
        json.dump(results, f, indent=4)

if __name__ == "__main__":
    asyncio.run(debug_search())
