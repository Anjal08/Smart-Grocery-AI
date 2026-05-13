import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";
import { calculateEstimatedExpiry } from "@/lib/expiryLogic";

/**
 * POST /api/pantry/sync
 * Syncs items into the Pantry collection with deduplication.
 * If an item with the same name + brand exists within 24 hours, it updates the quantity.
 * Otherwise, creates a new entry.
 *
 * Body: { items: [{ name, brand, price, quantity, unit, category }], storeName?: string }
 */
export async function POST(request: Request) {
  try {
    const { items, storeName } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    const results: any[] = [];
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const item of items) {
      // Check for duplicate: same name + brand purchased in last 24h
      const existing = await Pantry.findOne({
        name: { $regex: new RegExp(`^${item.name}$`, "i") },
        brand: item.brand || "",
        purchaseDate: { $gte: twentyFourHoursAgo },
      });

      if (existing) {
        // Merge: increment quantity, update price if higher
        existing.quantity += item.quantity || 1;
        if (item.price && item.price > existing.price) {
          existing.price = item.price;
        }
        await existing.save();
        results.push({ action: "updated", item: existing });
      } else {
        // Create new pantry item
        const newItem = await Pantry.create({
          name: item.name,
          brand: item.brand || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          unit: item.unit || "pcs",
          category: item.category || "Staples",
          purchaseDate: new Date(),
          estimatedExpiryDate: calculateEstimatedExpiry(
            item.name,
            item.category
          ),
          status: "in_stock",
          ingredients: item.ingredients || "",
        });
        results.push({ action: "created", item: newItem });
      }
    }

    return NextResponse.json(
      {
        success: true,
        synced: results.length,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Pantry Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
