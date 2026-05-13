import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pantry from '@/models/Pantry';
import ScanHistory from '@/models/ScanHistory';
import { calculateEstimatedExpiry } from '@/lib/expiryLogic';
import { calculateFinalSavings } from '@/lib/savingsLogic';

export async function POST(request: Request) {
  try {
    const { items, storeName } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array provided' }, { status: 400 });
    }

    await dbConnect();

    const savedItems = [];
    const oneMinuteAgo = new Date(Date.now() - 60000);

    const allowedCategories = ['Fresh Produce', 'Snacks & Drinks', 'Dairy & Bakery', 'Staples'];

    for (const item of items) {
      // 1. Basic Deduplication Logic
      const existingItem = await Pantry.findOne({
        name: item.name,
        price: item.price,
        category: item.category,
        purchaseDate: { $gte: oneMinuteAgo }
      });

      if (existingItem) {
        console.log(`Skipping duplicate item: ${item.name}`);
        continue;
      }

      // 2. Data Enrichment
      const estimatedExpiryDate = calculateEstimatedExpiry(item.name, item.category);
      const finalCategory = allowedCategories.includes(item.category) ? item.category : 'Staples';

      const newPantryItem = new Pantry({
        name: item.name || 'Unknown Item',
        brand: item.brand || '',
        price: item.price || 0,
        quantity: item.quantity || 1,
        unit: item.unit || 'pcs',
        category: finalCategory,
        estimatedExpiryDate,
        status: 'in_stock',
        purchaseDate: new Date()
      });

      const saved = await newPantryItem.save();
      savedItems.push(saved);
    }

    // 3. Create Scan History record
    const totalAmount = items.reduce((sum, i) => sum + (i.price || 0), 0);
    const totalSavings = calculateFinalSavings(items);
    
    const scanHistory = new ScanHistory({
      storeName: storeName || 'Other',
      totalAmount,
      totalSavings,
      itemCount: items.length,
      date: new Date()
    });
    
    await scanHistory.save();

    return NextResponse.json({ 
      success: true, 
      count: savedItems.length,
      items: savedItems,
      scanHistory
    }, { status: 201 });

  } catch (error: any) {
    console.error("Add Multiple Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error during mass addition.' }, { status: 500 });
  }
}
