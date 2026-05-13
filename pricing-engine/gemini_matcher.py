import google.generativeai as genai
import os
import json
import asyncio

# Setup Gemini
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

async def get_product_category(title: str):
    """
    Categorizes the product into 'Produce' or 'Branded' and extracts the standardized unit.
    """
    if not model:
        return {"category": "Branded", "target_unit": ""}
        
    prompt = f"""
    Categorize this grocery item: '{title}'
    Rules:
    1. If it's a fresh fruit/vegetable/whole nut, category is 'Produce'.
    2. If it's a packaged brand (Amul, Britannia, etc.), category is 'Branded'.
    3. Extract the target weight/unit (e.g. '500g', '1pc').
    Return ONLY JSON: {{"category": "Produce"|"Branded", "target_unit": "string", "is_golden": boolean}}
    """
    try:
        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)
    except:
        return {"category": "Branded", "target_unit": "", "is_golden": False}

async def final_ai_decision(target_title: str, candidate_title: str, category_info: dict):
    # Determine if we should use Strict or Fuzzy mode
    is_golden = category_info.get("is_golden", False)
    mode = "STRICT_SKU" if is_golden else "FUZZY_SEMANTIC"
    
    logic = f"""
    Mode: {mode}
    Target: {target_title}
    Candidate: {candidate_title}
    
    Rules for {mode}:
    - IF STRICT_SKU: Brand MUST match exactly. Weight MUST match within 5% (e.g. 400g vs 500g is a NO).
    - IF FUZZY_SEMANTIC: Allow synonyms (Anaar/Pomegranate). Core item must be same.
    
    Is this a match? Return ONLY 'YES' or 'NO'.
    """
    
    try:
        response = await model.generate_content_async(logic)
        result = response.text.strip().upper()
        return "YES" if "YES" in result else "NO"
    except Exception as e:
        print(f"[Gemini Match Error]: {str(e).encode('ascii', 'ignore').decode()}")
        return "NO"

async def get_clean_search_query(title: str):
    """
    Simplifies the product title into a core search term for better store searching.
    """
    if not model:
        return title
    
    prompt = f"Convert this grocery product title into a short, effective search query for an e-commerce store (remove noise like 'Premium', 'Fresh', 'Poly Pack'). Product: {title}. Return ONLY the search query string."
    try:
        response = await model.generate_content_async(prompt)
        return response.text.strip().replace('"', '')
    except:
        return title

async def get_product_emoji(title: str):
    """
    Analyzes the product name and returns the single most relevant Unicode Emoji.
    """
    if not model:
        return "📦"
        
    prompt = f"Analyze the grocery product name: '{title}' and return ONLY the single most relevant Unicode Emoji. If unsure, return 📦. Return nothing but the emoji."
    try:
        response = await model.generate_content_async(prompt)
        emoji = response.text.strip()
        # Ensure it's a single emoji or at least very short
        return emoji[:2] if emoji else "📦"
    except:
        return "📦"
