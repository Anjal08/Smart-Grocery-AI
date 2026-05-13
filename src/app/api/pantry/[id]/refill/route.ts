import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";
import PurchaseLog from "@/models/PurchaseLog";

/**
 * PUT /api/pantry/[id]/refill
 * Sets the purchaseDate to current date, updates the estimatedExpiryDate,
 * and increments quantities. This resets estimation logic and contributes
 * to the LSTM predictive engine via the purchase log.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const body = await request.json();
    const addedQuantity = body.quantity || 1;

    const document = await Pantry.findById(id);
    if (!document) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const now = new Date();
    
    // Attempt standard shelf life fallback for new expiry depending on category if needed
    let shelfLifeDays = 30;
    if (document.category === "Fresh Produce") shelfLifeDays = 7;
    if (document.category === "Dairy & Bakery") shelfLifeDays = 4;
    
    const newExpiry = new Date(now);
    newExpiry.setDate(newExpiry.getDate() + shelfLifeDays);

    // Update item
    document.purchaseDate = now;
    document.estimatedExpiryDate = newExpiry;
    document.quantity = Number(document.quantity) + Number(addedQuantity);
    document.status = "in_stock";
    
    await document.save();

    // Log the purchase for LSTM sequence prediction
    const log = await PurchaseLog.findOne({
      itemName: { $regex: new RegExp(`^${document.name}$`, "i") }
    });

    if (log) {
      log.purchaseDates.push(now);
      await log.save();
    } else {
      await PurchaseLog.create({
        itemName: document.name.toLowerCase().trim(),
        category: document.category,
        purchaseDates: [document.purchaseDate, now]
      });
    }

    return NextResponse.json({ success: true, item: document }, { status: 200 });

  } catch (error: any) {
    console.error("Refill Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refill item" },
      { status: 500 }
    );
  }
}
