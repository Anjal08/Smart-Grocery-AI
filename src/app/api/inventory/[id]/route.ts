import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inventory from '@/models/Inventory';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Item deleted' }, { status: 200 });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { 
        name: body.name,
        price: body.price,
        category: body.category,
        brand: body.brand
      },
      { returnDocument: "after" }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updatedItem }, { status: 200 });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
