import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { batchScanIngredients } from "@/lib/healthScanner";

/**
 * POST /api/health/batch
 * Batch scans multiple products for health analysis.
 * Body: { products: [{ name, ingredients }], userId?: string }
 */
export async function POST(request: Request) {
  try {
    const { products, userId } = await request.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of products" },
        { status: 400 }
      );
    }

    if (products.length > 20) {
      return NextResponse.json(
        { error: "Maximum 20 products per batch" },
        { status: 400 }
      );
    }

    let userPrefs: string[] = [];
    if (userId) {
      await dbConnect();
      const user = await User.findById(userId).select("healthPreferences");
      if (user) {
        userPrefs = user.healthPreferences || [];
      }
    }

    const results = await batchScanIngredients(products, userPrefs);

    return NextResponse.json(
      {
        success: true,
        scannedCount: results.length,
        results,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Batch Health Scan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to batch scan" },
      { status: 500 }
    );
  }
}
