import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    const items = await Inventory.find({}).sort({ purchaseDate: -1 });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch inventory", error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}
