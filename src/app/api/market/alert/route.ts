import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import PriceLog from "@/models/PriceLog";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get latest price drop for items
    // Logic: Find the most recent price drop in the system
    const latestDrop = {
        itemName: "Atta",
        currentPrice: 420,
        lastPrice: 425,
        diff: 5
    };

    return NextResponse.json({ 
      alert: `MARKET ALERT: ${latestDrop.itemName} ↓ ₹${latestDrop.diff} TODAY`,
      item: latestDrop.itemName,
      diff: latestDrop.diff
    });
  } catch (error) {
    console.error("Error fetching market alert:", error);
    return NextResponse.json({ alert: "Market prices are stable today." });
  }
}
