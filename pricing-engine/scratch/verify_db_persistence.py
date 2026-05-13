
import asyncio
from database import get_db

async def verify_history():
    db = get_db()
    history_col = db["search_history"]
    count = await history_col.count_documents({})
    print(f"Total history items in DB: {count}")
    
    cursor = history_col.find().sort("timestamp", -1).limit(10)
    print("Recent items in DB:")
    async for doc in cursor:
        print(f"- {doc['query']} ({doc['timestamp']})")

if __name__ == "__main__":
    asyncio.run(verify_history())
