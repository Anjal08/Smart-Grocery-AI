import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";
import ScanHistory from "@/models/ScanHistory";
import { calculateEstimatedExpiry } from "@/lib/expiryLogic";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);

/**
 * POST /api/receipt/process
 * Accepts a receipt image, extracts structured data via Gemini 1.5 Pro Vision,
 * and persists items to the categorized Pantry collection.
 */
export async function POST(request: Request) {
  try {
    const { base64Image, mimeType } = await request.json();

    if (!base64Image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // 1. Process via Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a high-precision grocery receipt parser. 
      Analyze the attached receipt image and extract a structured list of items.
      
      For each item, categorize it STRICTLY into one of these 4 categories:
      1. 'Fresh Produce' (Fruits, Vegetables, Herbs)
      2. 'Dairy & Bakery' (Milk, Cheese, Bread, Eggs, Butter)
      3. 'Snacks & Drinks' (Chips, Sodas, Juices, Chocolates, Biscuits)
      4. 'Staples' (Grains, Pulses, Oils, Spices, Flour, Household Items)

      Extraction Rules:
      - name: The full name of the product.
      - brand: The brand name (e.g., Amul, Tata, Lays) or empty string if unknown.
      - price: Numeric price per item (in INR).
      - quantity: The number of items purchased (default 1).
      - unit: The unit of measurement (e.g., kg, L, pcs, g).
      - category: MUST be one of the 4 categories listed above.

      Return ONLY a valid JSON object in this format:
      {
        "detectedStore": "Store Name",
        "items": [
          {
            "name": "Product Name",
            "brand": "Brand",
            "price": 100,
            "quantity": 1,
            "unit": "kg",
            "category": "Category Name"
          }
        ]
      }
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    let textResult = result.response.text();

    // Clean up potential markdown formatting
    textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(textResult);
    } catch (err) {
      console.error("Failed to parse Gemini output:", textResult);
      return NextResponse.json(
        { error: "AI failed to return valid JSON. Please try a clearer photo." },
        { status: 422 }
      );
    }

    const items = parsedData.items || [];
    const detectedStore = parsedData.detectedStore || "Other";

    // 2. We don't persist yet! We return the preview to the user.
    // The actual save happens when they click "Confirm" via /api/pantry/sync

    return NextResponse.json(
      {
        success: true,
        items,
        detectedStore,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Receipt Process Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
