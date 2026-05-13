"""
database.py — Async MongoDB connection layer using Motor.
Shares the same Atlas cluster as the MERN frontend.
"""

import os
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "smartgrocery")
CACHE_TTL_HOURS = 6

# ── Singleton client ─────────────────────────────────────────────
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URI)
    return _client


def get_db():
    return get_client()[DB_NAME]


# ── Collections ──────────────────────────────────────────────────
def price_cache_col():
    return get_db()["price_cache"]


def inventory_col():
    return get_db()["inventory"]


# ── Cache helpers ────────────────────────────────────────────────
async def get_cached_price(item_name: str, pincode: str) -> dict | None:
    """Return cached price doc if it exists and is < CACHE_TTL_HOURS old."""
    col = price_cache_col()
    cutoff = datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)

    doc = await col.find_one(
        {
            "item_name": {"$regex": f"^{item_name}$", "$options": "i"},
            "pincode": pincode,
            "scraped_at": {"$gte": cutoff},
        },
        sort=[("scraped_at", -1)],
    )
    return doc


async def upsert_price(data: dict) -> None:
    """Insert or update the price_cache document for an item + pincode."""
    col = price_cache_col()
    await col.update_one(
        {"item_name": data["item_name"], "pincode": data["pincode"]},
        {"$set": data},
        upsert=True,
    )


async def ensure_indexes():
    """Create TTL and compound indexes on first startup."""
    col = price_cache_col()
    await col.create_index(
        [("item_name", 1), ("pincode", 1)], unique=True
    )
    await col.create_index("scraped_at")


# ── Lifecycle ────────────────────────────────────────────────────
async def close_client():
    global _client
    if _client:
        _client.close()
        _client = None
