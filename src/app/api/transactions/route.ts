import { auth } from "@/auth";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    
    // Get transactions for the current user
    const transactions = await Transaction.find({ userId: (session.user as any).id })
      .sort({ date: -1 })
      .limit(50);

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemName, category, price, source } = await req.json();

    await dbConnect();
    const newTransaction = await Transaction.create({
      userId: (session.user as any).id,
      itemName,
      category,
      price,
      source: source || "Search Addition",
      date: new Date()
    });

    return NextResponse.json({ success: true, transaction: newTransaction });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
