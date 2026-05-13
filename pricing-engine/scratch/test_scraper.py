import asyncio
import sys
import os

# Add pricing-engine to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import ProductExtractor, perform_regional_search, normalize_title, validate_match

async def test():
    url = "https://dl.flipkart.com/s/!2AgvXNNNN"
    print(f"Extracting identity for {url} ...")
    
    extractor = ProductExtractor()
    source_product = await extractor.extract_from_url(url)
    
    print("\n[Source Product Extracted]")
    print(source_product)
    
    if not source_product or not source_product.get("title"):
        print("Failed to extract title.")
        return
        
    identity = normalize_title(source_product["title"])
    print("\n[Identity]")
    print(identity)
    
    search_q = identity["search_query"].lower()
    print(f"\n[Searching for: {search_q} on all platforms (Lucknow 226028) ...]")
    
    raw_results = await perform_regional_search(search_q, source_product["store"])
    
    print("\n[Raw Search Results]")
    for r in raw_results:
        try:
            print(f"  - {r['store']}: {r['title']} | Rs {r['price']} | {r['url']}")
        except UnicodeEncodeError:
            print(f"  - {r['store']}: <unicode title> | Rs {r['price']} | {r['url']}")
        
    print("\n[Filtered Validated Matches]")
    verified_matches = []
    for item in raw_results:
        if validate_match(identity, item["title"]):
            verified_matches.append(item)
            try:
                print(f"  [MATCH] {item['store']}: {item['title']} | Rs {item['price']} | {item['url']}")
            except UnicodeEncodeError:
                pass
            
    if not verified_matches:
        print("\n[Broad Fallback]")
        broad_query = f"{identity['brand']} {identity['product_name']}".strip()
        print(f"Searching for: {broad_query}")
        broad_results = await perform_regional_search(broad_query, source_product["store"])
        for item in broad_results:
            if validate_match(identity, item["title"]):
                verified_matches.append(item)
                try:
                    print(f"  [MATCH] {item['store']}: {item['title']} | Rs {item['price']} | {item['url']}")
                except:
                    pass

if __name__ == "__main__":
    asyncio.run(test())
