import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net"
client = MongoClient(MONGODB_URI)
col = client["smartgrocery"]["search_history"]

count = col.count_documents({})
print("Total history docs:", count)

recent = list(col.find().sort("timestamp", -1).limit(10))
for doc in recent:
    q = doc.get("query", "")
    rc = doc.get("result_count", 0)
    tr = doc.get("top_result", {}) or {}
    store = tr.get("store", "?")
    price = tr.get("price", "?")
    emoji = tr.get("emoji", "")
    print(f"  [{emoji}] {q} | {rc} stores | best: {store} Rs.{price}")

client.close()
