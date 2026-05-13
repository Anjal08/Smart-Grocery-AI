import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";
import { NextResponse } from "next/server";

const GROCERY_DICTIONARY: Record<string, { category: string; shelfLife: number }> = {
  milk: { category: "Dairy & Bakery", shelfLife: 7 },
  bread: { category: "Dairy & Bakery", shelfLife: 5 },
  egg: { category: "Dairy & Bakery", shelfLife: 15 },
  apple: { category: "Fresh Produce", shelfLife: 10 },
  spinach: { category: "Fresh Produce", shelfLife: 3 },
  tomato: { category: "Fresh Produce", shelfLife: 7 },
  chicken: { category: "Staples", shelfLife: 3 },
  rice: { category: "Staples", shelfLife: 365 },
  dal: { category: "Staples", shelfLife: 365 },
  chips: { category: "Snacks & Drinks", shelfLife: 90 },
  coke: { category: "Snacks & Drinks", shelfLife: 180 },
  biscuit: { category: "Snacks & Drinks", shelfLife: 60 },
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, price } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }

    await dbConnect();

    // Dictionary matching (exact or simple include)
    const lowerName = name.toLowerCase();
    const dictionaryMatch = Object.entries(GROCERY_DICTIONARY).find(([key]) => lowerName.includes(key));
    
    const category = dictionaryMatch ? dictionaryMatch[1].category : "Staples";
    const shelfLife = dictionaryMatch ? dictionaryMatch[1].shelfLife : 7;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + shelfLife);

    const newItem = await Pantry.create({
      userId: (session.user as any).id,
      name,
      category,
      price: price || 0,
      quantity: 1,
      unit: "pcs",
      purchaseDate: new Date(),
      estimatedExpiryDate: expiryDate,
      status: "in_stock"
    });

    return NextResponse.json({ message: "Item added successfully", item: newItem });
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
