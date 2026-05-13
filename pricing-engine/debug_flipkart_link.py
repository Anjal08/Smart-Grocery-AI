import asyncio
import json
from url_extractor import extract_from_url, normalize_product_identity

async def debug_link():
    url = "https://dl.flipkart.com/s/I2nvgBNNNN"
    print(f"[*] Testing Shortened URL: {url}")
    
    try:
        result = await extract_from_url(url, "226028")
        if result:
            identity = normalize_product_identity(result.get("product_name", ""))
            output = {
                "extraction": result,
                "normalized": identity
            }
            with open("debug_output.json", "w", encoding="utf-8") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            print("[+] Success! Results saved to debug_output.json")
        else:
            print("[-] Extraction Failed: No result returned.")
    except Exception as e:
        print(f"[!] Error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_link())
