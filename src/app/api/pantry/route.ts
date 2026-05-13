import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";

export const dynamic = "force-dynamic";

/**
 * GET /api/pantry
 * Returns all pantry items, optionally filtered by category.
 * Query params: ?category=Snacks
 */
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const items = await Pantry.find(filter).sort({ purchaseDate: -1 });

    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    console.error("Pantry GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pantry items" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pantry
 * Bulk delete items.
 * Body: { ids: ["id1", "id2", ...] }
 */
export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { ids } = await request.json();
    console.log("[Bulk Delete] Attempting to delete items:", ids);

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid IDs provided" }, { status: 400 });
    }

    const result = await Pantry.deleteMany({ _id: { $in: ids } });
    console.log("[Bulk Delete] Success. Deleted count:", result.deletedCount);

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Pantry Bulk DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete pantry items" },
      { status: 500 }
    );
  }
}
