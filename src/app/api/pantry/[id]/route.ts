import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pantry from "@/models/Pantry";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    console.log("[Single Delete] Attempting to delete item:", id);

    const document = await Pantry.findByIdAndDelete(id);
    console.log("[Single Delete] Result:", document ? "Found and deleted" : "Not found");

    if (!document) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
