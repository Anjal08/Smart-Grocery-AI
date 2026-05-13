import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { rebuildPurchaseLogs } from "@/lib/predictiveEngine";

/**
 * POST /api/analytics/refresh
 * Recalculates all purchase predictions from raw Pantry+Inventory data.
 */
export async function POST() {
  try {
    await dbConnect();
    const updatedCount = await rebuildPurchaseLogs();

    return NextResponse.json(
      {
        success: true,
        message: `Refreshed predictions for ${updatedCount} items.`,
        updatedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Analytics Refresh Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refresh analytics" },
      { status: 500 }
    );
  }
}
