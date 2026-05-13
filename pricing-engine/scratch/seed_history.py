"""
Seed 6 search history entries with full price comparison data
into the FastAPI's search_history collection.
"""
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net"
DB_NAME = "smartgrocery"

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
col = db["search_history"]

now = datetime.now(timezone.utc)

# 6 items matching MOCK_DATA in main.py, with full price comparison
items = [
    {
        "query": "Amul Butter 500g",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=2),
        "top_result": {
            "store": "BigBasket",
            "title": "Amul Butter - 500 g",
            "price": 280,
            "url": "https://www.bigbasket.com/pd/104862/amul-butter-pasteurised-500-g-carton/",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/54099eb2-2d08-4013-a822-a3eebc72f19f.jpeg",
            "emoji": "🧈",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 285, "emoji": "🧈"},
            {"store": "Zepto",            "price": 285, "emoji": "🧈"},
            {"store": "BigBasket",        "price": 280, "emoji": "🧈"},
            {"store": "Flipkart Minutes", "price": 282, "emoji": "🧈"},
        ]
    },
    {
        "query": "Amul Gold Milk 500ml",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=5),
        "top_result": {
            "store": "BigBasket",
            "title": "Amul Gold Full Cream Milk - 500 ml",
            "price": 32,
            "url": "https://www.bigbasket.com/pd/306926/amul-gold-milk-homogenised-standardised-500-ml-pouch/",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/674a2754-52d3-4a11-82d2-850787a957d4.jpeg",
            "emoji": "🥛",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 33, "emoji": "🥛"},
            {"store": "Zepto",            "price": 33, "emoji": "🥛"},
            {"store": "BigBasket",        "price": 32, "emoji": "🥛"},
            {"store": "Flipkart Minutes", "price": 33, "emoji": "🥛"},
        ]
    },
    {
        "query": "Mother Dairy Paneer 200g",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=10),
        "top_result": {
            "store": "BigBasket",
            "title": "Mother Dairy Paneer - 200 g",
            "price": 92,
            "url": "https://www.bigbasket.com/pd/279588/amul-malai-paneer-200-g-pouch/",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/c641885a-0498-4f81-8919-66635955b98f.jpeg",
            "emoji": "🧀",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 95, "emoji": "🧀"},
            {"store": "Zepto",            "price": 98, "emoji": "🧀"},
            {"store": "BigBasket",        "price": 92, "emoji": "🧀"},
            {"store": "Flipkart Minutes", "price": 95, "emoji": "🧀"},
        ]
    },
    {
        "query": "Britannia Wheat Bread",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=15),
        "top_result": {
            "store": "BigBasket",
            "title": "Britannia 100% Whole Wheat Bread - 400 g",
            "price": 48,
            "url": "https://www.bigbasket.com/search?q=britannia%20wheat%20bread",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/97a0a644-8468-45e0-8777-a8417c80775d.jpeg",
            "emoji": "🍞",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 50, "emoji": "🍞"},
            {"store": "Zepto",            "price": 50, "emoji": "🍞"},
            {"store": "BigBasket",        "price": 48, "emoji": "🍞"},
            {"store": "Flipkart Minutes", "price": 49, "emoji": "🍞"},
        ]
    },
    {
        "query": "Tata Salt 1kg",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=20),
        "top_result": {
            "store": "BigBasket",
            "title": "Tata Salt Vacuum Evaporated Iodised - 1 kg",
            "price": 25,
            "url": "https://www.bigbasket.com/search?q=tata%20salt%201kg",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/49969299-1a95-460d-9b7e-07a82b069d39.jpeg",
            "emoji": "🧂",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 28, "emoji": "🧂"},
            {"store": "Zepto",            "price": 28, "emoji": "🧂"},
            {"store": "BigBasket",        "price": 25, "emoji": "🧂"},
            {"store": "Flipkart Minutes", "price": 27, "emoji": "🧂"},
        ]
    },
    {
        "query": "Maggi Noodles 420g",
        "source_url": None,
        "result_count": 4,
        "timestamp": now - timedelta(minutes=25),
        "top_result": {
            "store": "BigBasket",
            "title": "Maggi 2-Minute Masala Instant Noodles - 420 g",
            "price": 92,
            "url": "https://www.bigbasket.com/search?q=maggi%20noodles%20420g",
            "image_url": "https://cdn.zeptonow.com/production/inventory/product/cf7f586c-73ef-45e5-a229-38a835680914.jpeg",
            "emoji": "🍜",
            "is_best_value": True
        },
        "all_results": [
            {"store": "Blinkit",          "price": 98, "emoji": "🍜"},
            {"store": "Zepto",            "price": 98, "emoji": "🍜"},
            {"store": "BigBasket",        "price": 92, "emoji": "🍜"},
            {"store": "Flipkart Minutes", "price": 95, "emoji": "🍜"},
        ]
    },
]

# Remove old copies of these exact queries first
queries = [i["query"] for i in items]
deleted = col.delete_many({"query": {"$in": queries}})
print(f"Removed {deleted.deleted_count} old entries")

result = col.insert_many(items)
print(f"✅ Inserted {len(result.inserted_ids)} history entries:")
for item in items:
    best = item["top_result"]
    print(f"  • {item['query']} → Best: {best['store']} @ ₹{best['price']} {best['emoji']}")

client.close()
print("\nDone! Open http://localhost:3000/price-search to see history sidebar.")
