import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { scanIngredients } from "@/lib/healthScanner";

/**
 * POST /api/health/scan
 * Scans a single product's ingredients for health analysis.
 * Body: { ingredients: string, productName: string, userId?: string }
 */
export async function POST(request: Request) {
  try {
    const { ingredients, productName, userId } = await request.json();

    if (!ingredients && !productName) {
      return NextResponse.json(
        { error: "Provide either ingredients text or product name" },
        { status: 400 }
      );
    }

    // Load user health preferences if userId provided
    let userPrefs: string[] = [];
    if (userId) {
      await dbConnect();
      const user = await User.findById(userId).select("healthPreferences");
      if (user) {
        userPrefs = user.healthPreferences || [];
      }
    }

    const result = await scanIngredients(
      ingredients || "",
      productName || "Unknown Product",
      userPrefs
    );

    return NextResponse.json(
      { success: true, ...result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Health Scan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to scan product" },
      { status: 500 }
    );
  }
}
