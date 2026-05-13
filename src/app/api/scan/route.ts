import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import Pantry from '@/models/Pantry';
import { calculateEstimatedExpiry } from '@/lib/expiryLogic';

// Initialize Gemini with the explicit working key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);

export async function POST(request: Request) {
  try {
    const { base64Image, mimeType } = await request.json();

    if (!base64Image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // 1. Process via Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a receipt extraction AI. Extract the grocery items from this receipt.
      Estimate the brand if visible, otherwise pass an empty string.
      Extract the price as a raw number.
      Categorize each item strictly into one of these 4 categories: 'Fresh Produce', 'Snacks & Drinks', 'Dairy & Bakery', or 'Staples'.
      Also, detect the name of the store.
      Return ONLY a JSON object in this exact format:
      {
        "detectedStore": "Store Name",
        "items": [
          {
            "name": "Milk 1L",
            "brand": "Amul",
            "price": 60,
            "category": "Dairy & Bakery"
          }
        ]
      }
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    let textResult = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData: any = {};
    try {
       parsedData = JSON.parse(textResult);
    } catch(err) {
       console.error("Failed to parse Gemini output:", textResult);
       return NextResponse.json({ error: 'AI failed to return valid JSON' }, { status: 422 });
    }

    // 2. Persist to MongoDB (Pantry collection)
    await dbConnect();
    const savedItems = [];

    for (const item of (parsedData.items || [])) {
      const estimatedExpiryDate = calculateEstimatedExpiry(item.name, item.category);
      
      const newPantryItem = new Pantry({
        name: item.name || 'Unknown Item',
        brand: item.brand || '',
        price: item.price || 0,
        quantity: 1,
        unit: 'pcs',
        category: item.category || 'Staples',
        estimatedExpiryDate,
        status: 'in_stock',
        purchaseDate: new Date()
      });

      const saved = await newPantryItem.save();
      savedItems.push(saved);
    }

    return NextResponse.json({ 
      success: true, 
      count: savedItems.length,
      items: savedItems, 
      detectedStore: parsedData.detectedStore || 'Other' 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Scan Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during scanning process.' }, { status: 500 });
  }
}
