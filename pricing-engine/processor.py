import re

# The 'Golden 20' list for demo optimization
GOLDEN_SKUS = {
    "amul butter": {"brand": "Amul", "weight": "500g", "emoji": "🧈", "section": "Dairy"},
    "amul gold milk": {"brand": "Amul", "weight": "500ml", "emoji": "🥛", "section": "Dairy"},
    "mother dairy paneer": {"brand": "Mother Dairy", "weight": "200g", "emoji": "🧀", "section": "Dairy"},
    "britannia whole wheat bread": {"brand": "Britannia", "weight": "standard", "emoji": "🍞", "section": "Bakery"},
    "tata salt": {"brand": "Tata", "weight": "1kg", "emoji": "🧂", "section": "Staples"},
    "fortune soyabean oil": {"brand": "Fortune", "weight": "1L", "emoji": "🫗", "section": "Staples"},
    "aashirvaad select atta": {"brand": "Aashirvaad", "weight": "5kg", "emoji": "🌾", "section": "Staples"},
    "maggi 2-minute noodles": {"brand": "Nestle", "weight": "420g", "emoji": "🍜", "section": "Instant"},
    "nescafe classic coffee": {"brand": "Nescafe", "weight": "50g", "emoji": "☕", "section": "Beverages"},
    "red label tea": {"brand": "Brooke Bond", "weight": "500g", "emoji": "🍵", "section": "Beverages"},
    "lays magic masala": {"brand": "Lays", "weight": "50g", "emoji": "🥔", "section": "Snacks"},
    "parle-g gold": {"brand": "Parle", "weight": "1kg", "emoji": "🍪", "section": "Snacks"},
    "coca-cola": {"brand": "Coca-Cola", "weight": "1.25L", "emoji": "🥤", "section": "Beverages"},
    "surf excel easy wash": {"brand": "Surf Excel", "weight": "1kg", "emoji": "🧼", "section": "Cleaning"},
    "vim dishwash liquid": {"brand": "Vim", "weight": "500ml", "emoji": "🧼", "section": "Cleaning"},
    "colgate strong teeth": {"brand": "Colgate", "weight": "200g", "emoji": "🪥", "section": "Personal Care"},
    "dettol handwash": {"brand": "Dettol", "weight": "750ml", "emoji": "🧴", "section": "Personal Care"},
    "dove cream beauty bar": {"brand": "Dove", "weight": "125g", "emoji": "🧼", "section": "Personal Care"},
    "lizol floor cleaner": {"brand": "Lizol", "weight": "500ml", "emoji": "🧹", "section": "Cleaning"},
    "real fruit power orange": {"brand": "Real", "weight": "1L", "emoji": "🧃", "section": "Beverages"}
}

def normalize_title(title: str):
    """Extracts basic product info using regex as a first pass."""
    title = title.lower()
    
    # Simple brand extraction
    brands = ["amul", "mother dairy", "britannia", "tata", "fortune", "aashirvaad", "nestle", "nescafe", "brooke bond", "lays", "parle", "coca-cola", "surf excel", "vim", "colgate", "dettol", "dove", "lizol", "real"]
    brand = next((b for b in brands if b in title), "Unknown")
    
    # Simple weight extraction
    weight_match = re.search(r'(\d+)\s*(g|gm|kg|ml|l|ltr|pc|units)', title)
    weight = weight_match.group(0) if weight_match else "Standard"
    
    # Check for golden emoji
    emoji = "📦"
    section = "General"
    for sku, info in GOLDEN_SKUS.items():
        if sku in title:
            emoji = info.get("emoji", "📦")
            section = info.get("section", "General")
            break
            
    return {
        "raw": title,
        "brand": brand.title(),
        "weight": weight,
        "emoji": emoji,
        "section": section,
        "is_golden": any(sku in title for sku in GOLDEN_SKUS.keys())
    }

def get_golden_sku_info(title: str):
    title_lower = title.lower()
    for sku, info in GOLDEN_SKUS.items():
        if sku in title_lower:
            return info
    return None
