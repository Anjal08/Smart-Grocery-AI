# SmartSpend AI — Pricing Engine

A standalone FastAPI microservice that scrapes localized grocery prices from Indian e-commerce platforms (Flipkart, Blinkit) using stealth browser automation and MongoDB caching.

## Architecture

```
┌──────────────┐    GET /scrape-price     ┌─────────────────┐
│  Next.js App │ ──────────────────────▶  │  FastAPI Server  │
│  (port 3000) │  ◀──────────────────────  │   (port 8000)   │
└──────────────┘    JSON response         └────────┬────────┘
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                              ┌──────────┐  ┌───────────┐  ┌──────────┐
                              │ MongoDB  │  │ Playwright │  │ Stealth  │
                              │ (Motor)  │  │ (Headless) │  │ Plugin   │
                              └──────────┘  └───────────┘  └──────────┘
```

## Setup

### 1. Create a virtual environment
```bash
cd pricing-engine
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Playwright browsers
```bash
playwright install chromium
```

### 4. Configure environment
The `.env` file is pre-configured to connect to your MongoDB Atlas cluster:
```env
MONGODB_URI=mongodb+srv://...
DB_NAME=smartgrocery
PORT=8000
```

### 5. Run the server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### `GET /scrape-price`
Cache-first price lookup with live scraping fallback.

| Parameter   | Type   | Default   | Description                        |
|-------------|--------|-----------|------------------------------------|
| `item_name` | string | required  | Grocery item to search for         |
| `pincode`   | string | `226001`  | Delivery pincode (Lucknow default) |
| `store`     | string | `flipkart`| `flipkart`, `blinkit`, or `all`    |

**Example:**
```bash
curl "http://localhost:8000/scrape-price?item_name=Amul%20Butter%20500g&pincode=226001"
```

**Response:**
```json
{
  "source": "live_scrape",
  "item_name": "Amul Butter 500g",
  "product_name": "Amul Pasteurised Butter 500 g Carton",
  "price": 285.0,
  "store": "Flipkart",
  "pincode": "226001",
  "url": "https://www.flipkart.com/...",
  "scraped_at": "2026-05-07T08:30:00+00:00"
}
```

### `POST /scrape-bulk`
Scrape prices for multiple items in one request.

**Body:** `["Amul Butter 500g", "Fortune Atta 5kg", "Toor Dal 1kg"]`

### `GET /health`
Health check endpoint.

## Testing
```bash
python test_scraper.py
```

## Deploying to Railway.app

1. Push the `pricing-engine` folder to a Git repo.
2. Connect to Railway and set environment variables (`MONGODB_URI`, `DB_NAME`).
3. Railway will auto-detect the Python project. Set start command:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Add a `Procfile` if needed:
   ```
   web: playwright install chromium && uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

## File Structure
```
pricing-engine/
├── main.py            # FastAPI routes & app config
├── scraper.py         # Stealth Playwright scraping logic
├── database.py        # Async MongoDB (Motor) connection layer
├── test_scraper.py    # Verification script
├── requirements.txt   # Python dependencies
├── .env               # Environment variables
└── README.md          # This file
```
