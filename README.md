# SmartGrocery AI: Hyper-Local Grocery Optimizer 🛒🤖

**SmartSpend AI** is a full-stack ecosystem designed to bridge the gap between kitchen inventory and real-time market prices. Built specifically for the **Lucknow (226028)** region, it automates price auditing across Blinkit, Zepto, and BigBasket while managing a digital "Smart Pantry" to reduce food waste.

---

## 🌟 Key Features

- **Real-Time Price Auditor:** A specialized Python microservice that scrapes live pricing and availability from major quick-commerce platforms.
- **AI-Driven Entity Matching:** Utilizes **Gemini 1.5 Flash** and semantic normalization to match products across stores despite inconsistent naming (e.g., matching "Amul Butter 500g" to "Butter Pasteurised Salted").
- **Smart Inventory Management:** Track shelf-life and "Pantry Health" with automatic alerts for expiring items.
- **Optimized "Emoji-First" UI:** High-performance dashboard using emoji-based visuals to ensure 100% stability and zero-latency loading.
- **Analytics Dashboard:** Visualizes weekly spending habits and identifies "Lost Savings" opportunities.
- **Health Scanner:** Analyzes product ingredients for nutritional value using NLP.

---

## 🏗️ System Architecture

The project follows a **Modular Agentic Workflow**, separating the user-facing interface from the high-intensity data scraping layer.



### Tech Stack:
- **Frontend:** Next.js 14, Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (Atlas).
- **Automation Layer:** Python, Playwright (Headless Browser), Asyncio.
- **AI Integration:** Google Gemini API (Semantic Data Cleaning).

---

## 🚀 Getting Started

### Prerequisites:
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas Account
- Gemini API Key

### Installation:

1. **Clone the Repo:**
   ```bash
   git clone [https://github.com/your-username/smartspend-ai.git](https://github.com/your-username/smartspend-ai.git)
   
2.Frontend & Backend Setup:
    npm install

3.Python Microservice Setup:
    cd scraper
    pip install -r requirements.txt

4.Environment Variables:
   MONGO_URI=your_mongodb_uri
   GEMINI_API_KEY=your_key
   PORT=5000
.

👩‍💻 Author
Anjali Patel Final Year Student | Aspiring Full-Stack Developer | https://www.linkedin.com/in/anjali-p-a2ba1419b | https://myportfolio-mu-self.vercel.app/


### **Why this README works for you:**
1. **The Architecture Image:** By including a placeholder for a diagram, you show that you understand the **Data Flow**, which is the #1 thing recruiters ask about in tech interviews.
2. **The "Agentic" Buzzword:** Using terms like "Modular Agentic Workflow" and "Semantic Normalization" shows you are up-to-date with 2026 AI trends.
3. **The Local Focus:** Highlighting **Lucknow (226028)** shows you built this to solve a *specific* problem, not just a generic tutorial project.

**Would you like me to help you draft the "About Me" section for your GitHub profile to match
