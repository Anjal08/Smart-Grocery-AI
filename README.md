<div align="center">
  <h1>SmartSpend AI 🛒🤖</h1>
  <p><strong>Next-Gen Procurement & Q-Commerce Pricing Engine</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Llama3](https://img.shields.io/badge/AI-Llama_3.1-blueviolet?logo=meta)](https://groq.com)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://mongodb.com/)
</div>

---

## 🚀 Overview

**SmartSpend AI** is a highly advanced, full-stack ecosystem designed to bridge the gap between kitchen inventory and real-time market prices. Originally built to solve the hyper-local grocery inflation problem in urban hubs like Lucknow, it acts as a **Smart Procurement Assistant**. 

The platform audits live prices across Quick-Commerce giants (Blinkit, Zepto, Flipkart Minutes) and leverages **Llama 3** (via Groq) to intelligently route users to the **SmartSpend AI Vault**—predicting exactly how much money users can save through optimized, scheduled batching versus instant delivery.

---

## ✨ Standout Features (For Recruiters & Engineers)

### 1. Multi-Platform Q-Commerce Auditor & AI Vault
Replaced a brittle Python web-scraping layer with a lightning-fast Node.js serverless architecture powered by **Llama 3 (8B-Instant)**. 
- Automatically cross-references prices across Blinkit, Zepto, and Flipkart Minutes.
- Computes dynamic pricing for the **SmartSpend AI Vault** (projected batch-scheduled savings).
- Injects LLM-generated insights directly into the UI to explain market volatility and delivery congestion to the user.
- **Enterprise Error Handling:** Features robust try/catch blocks that return standardized mock data schemas to guarantee the UI never crashes during network drops or API rate limits.

### 2. Smart-Category Grocery Board
A highly reactive, beautiful React shopping list component built with **Tailwind CSS**.
- **Dynamic Categorization Matrix**: Automatically groups items by category (e.g., *Dairy*, *Fresh Produce*).
- **Reaction Checkbox Selection**: Fluid state management with strikethrough logic, dynamic color weighting, and emerald green micro-animations.
- **Real-Time Financial Ticker**: Calculates total basket expenditure and active item counts dynamically via `useMemo` React hooks.

### 3. Kitchen Inventory & Analytics
- Tracks shelf-life and "Pantry Health" to reduce food waste.
- Visualizes weekly spending habits and identifies "Lost Savings" opportunities using `recharts`.

---

## 🏗️ Technical Architecture

The application is built on a modern, decoupled **Serverless / API Route** architecture, prioritizing zero-latency loading and robust type safety.

- **Frontend**: React / Next.js (App Router), Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Next.js Serverless Route Handlers (`/api`), Node.js, Axios.
- **AI Engine**: Groq SDK (`llama-3.1-8b-instant`) strictly constrained to output robust JSON schemas for seamless UI hydration.
- **Database**: MongoDB Atlas for persistent pantry and user data via Mongoose.

*(Note: The system recently underwent a major refactor, migrating the backend pricing engine from a legacy Python headless scraper to a highly scalable Node.js LLM inference model).*

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account
- [Groq API Key](https://console.groq.com/keys) (For Llama 3 access)

### Installation
1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-username/smartspend-ai.git
   cd smartspend-ai
   ```
2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Set Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_key_here
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret
   ```
4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to see the dashboard in action.

---

## 🎯 Why This Project Stands Out

> This project demonstrates my ability to not just write code, but to **architect modern solutions to real-world problems**. It highlights my proficiency in building clean, state-driven React interfaces with Tailwind CSS, while simultaneously handling complex backend integrations. By utilizing Groq and Llama 3 to enforce strict JSON outputs rather than unstructured text, I've proven my ability to build **production-ready AI features** that fail gracefully and prioritize User Experience.

---
<div align="center">
  <b>Developed by Anjali Patel</b><br>
  <i>Final Year Student | Aspiring Full-Stack Developer</i><br>
  <a href="https://www.linkedin.com/in/anjali-p-a2ba1419b">LinkedIn</a> • <a href="https://myportfolio-mu-self.vercel.app/">Portfolio</a>
</div>
