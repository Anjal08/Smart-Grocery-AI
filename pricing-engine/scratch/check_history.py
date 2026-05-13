import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_history():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "smartgrocery")
    print(f"Connecting to {db_name}...")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    col = db["search_history"]
    
    count = await col.count_documents({})
    print(f"Total history records: {count}")
    
    cursor = col.find().sort("timestamp", -1).limit(5)
    async for doc in cursor:
        print(f"Query: {doc.get('query')}, Timestamp: {doc.get('timestamp')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_history())
