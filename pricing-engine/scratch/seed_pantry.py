import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# Load environment
load_dotenv(r"c:\Users\anjali patel\OneDrive\Desktop\SmartGrocery\pricing-engine\.env")

async def seed_demo_items():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DB_NAME", "smartgrocery")
    print(f"Connecting to: {uri} (DB: {db_name})")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    pantry_col = db["pantries"] # The collection name is usually pluralized in Mongoose or specified as 'pantries'
    
    # Check if 'pantry' or 'pantries'
    collections = await db.list_collection_names()
    print(f"Existing collections: {collections}")
    
    target_col = "pantries" if "pantries" in collections else "pantry"
    if "pantries" not in collections and "pantry" not in collections:
        target_col = "pantries" # Default to pantries
        
    print(f"Targeting collection: {target_col}")
    col = db[target_col]

    now = datetime.now(timezone.utc)
    
    items = [
        {
            "name": "Amul Butter - 500 g",
            "brand": "Amul",
            "price": 285,
            "quantity": 1,
            "unit": "pcs",
            "category": "Dairy & Bakery",
            "purchaseDate": now,
            "estimatedExpiryDate": now + timedelta(days=30),
            "status": "in_stock",
            "ingredients": "Milk Fat, Salt"
        },
        {
            "name": "Amul Gold Full Cream Milk - 500 ml",
            "brand": "Amul",
            "price": 33,
            "quantity": 2,
            "unit": "pcs",
            "category": "Dairy & Bakery",
            "purchaseDate": now,
            "estimatedExpiryDate": now + timedelta(days=2),
            "status": "in_stock",
            "ingredients": "Milk"
        },
        {
            "name": "Aashirvaad Superior MP Atta - 5 kg",
            "brand": "Aashirvaad",
            "price": 245,
            "quantity": 1,
            "unit": "pcs",
            "category": "Staples",
            "purchaseDate": now,
            "estimatedExpiryDate": now + timedelta(days=90),
            "status": "in_stock",
            "ingredients": "Whole Wheat"
        },
        {
            "name": "Tata Salt - 1 kg",
            "brand": "Tata",
            "price": 28,
            "quantity": 1,
            "unit": "pcs",
            "category": "Staples",
            "purchaseDate": now,
            "estimatedExpiryDate": now + timedelta(days=365),
            "status": "in_stock",
            "ingredients": "Salt, Iodine"
        },
        {
            "name": "Maggi 2-Minute Masala Noodles",
            "brand": "Nestle",
            "price": 98,
            "quantity": 4,
            "unit": "pcs",
            "category": "Snacks & Drinks",
            "purchaseDate": now,
            "estimatedExpiryDate": now + timedelta(days=180),
            "status": "in_stock",
            "ingredients": "Wheat Flour, Palm Oil, Spices"
        }
    ]

    print(f"Inserting {len(items)} items...")
    result = await col.insert_many(items)
    print(f"Successfully inserted {len(result.inserted_ids)} items.")
    
    # Verification 1
    count = await col.count_documents({})
    print(f"Verification 1: Total pantry items = {count}")
    
    # Verification 2
    latest = await col.find().sort("purchaseDate", -1).limit(5).to_list(length=5)
    print("Verification 2: Latest 5 items:")
    for item in latest:
        print(f"- {item.get('name')} (Price: ₹{item.get('price')})")

    client.close()

if __name__ == "__main__":
    asyncio.run(seed_demo_items())
