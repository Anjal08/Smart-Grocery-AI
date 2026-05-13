import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ScanHistory from '@/models/ScanHistory';

export async function GET() {
  try {
    await dbConnect();
    const history = await ScanHistory.find().sort({ date: -1 }).limit(5);
    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Fetch History Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
