import sys
sys.stdout.reconfigure(encoding='utf-8')
from pymongo import MongoClient
from datetime import datetime, timezone, timedelta

MONGODB_URI = "mongodb+srv://patelanjali0801_db_user:pgdMkQr3PJjf9tmI@smartgrocery.8x59i4t.mongodb.net"
client = MongoClient(MONGODB_URI)
col = client["smartgrocery"]["search_history"]

now = datetime.now(timezone.utc)

# Push Maggi to be 22 minutes ago (between Tata Salt at -20 and Aashirvaad at any older time)
result = col.update_one(
    {"query": "Maggi Noodles 420g"},
    {"$set": {"timestamp": now - timedelta(minutes=22)}}
)
print("Updated Maggi timestamp:", result.modified_count, "doc(s)")

# Verify order
print("\nTop 10 history by recency:")
recent = list(col.find().sort("timestamp", -1).limit(10))
for i, doc in enumerate(recent, 1):
    q = doc.get("query", "")
    tr = doc.get("top_result", {}) or {}
    emoji = tr.get("emoji", "")
    price = tr.get("price", "?")
    print(f"  {i}. {emoji} {q} | Rs.{price}")

client.close()
