import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { generateShoppingList } from "@/lib/predictiveEngine";

export const dynamic = "force-dynamic";

/**
 * GET /api/analytics/shopping-list
 * Returns the AI-predicted auto-shopping list grouped by urgency.
 */
export async function GET() {
  try {
    await dbConnect();
    const shoppingList = await generateShoppingList();

    return NextResponse.json(
      {
        success: true,
        ...shoppingList,
        totalItems:
          shoppingList.urgent.length +
          shoppingList.soon.length +
          shoppingList.upcoming.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Shopping List Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}
