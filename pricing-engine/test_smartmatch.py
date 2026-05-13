import httpx
import json

def test_compare_url():
    url = "http://localhost:8001/compare-url"
    # Sample Flipkart URL from browser state
    product_url = "https://www.flipkart.com/gyan-soft-paneer/p/itm91ccfdd69f011?pid=PTFH6EVZ9WCYMEM"
    
    payload = {
        "url": product_url,
        "pincode": "226028"
    }
    
    print(f"Testing {url} with payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = httpx.post(url, json=payload, timeout=120)
        print(f"Status Code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_compare_url()
