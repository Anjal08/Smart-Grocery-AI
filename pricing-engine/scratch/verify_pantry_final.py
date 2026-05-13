import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv(r"c:\Users\anjali patel\OneDrive\Desktop\SmartGrocery\pricing-engine\.env")

async def verify_pantry():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "smartgrocery")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    col = db["pantries"]
    count = await col.count_documents({})
    print(f"VERIFICATION 1: Total Items in 'pantries' = {count}")
    
    items = await col.find().sort("purchaseDate", -1).limit(5).to_list(length=5)
    print("VERIFICATION 2: Item List:")
    for item in items:
        # Use 'Rs.' instead of the symbol to avoid encoding issues in logs
        print(f"- {item.get('name')} | Category: {item.get('category')} | Price: Rs. {item.get('price')}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_pantry())
