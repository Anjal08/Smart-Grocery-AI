import { NextResponse } from 'next/server';
import { generatePriceForecast } from '@/lib/predictionService';

interface PlatformResult {
  platform: string;
  productName: string;
  price: number;
  mrp: number;
  discount: number;
  platformFee: number;
  totalPrice: number;
  available: boolean;
  productImage: string;
  deepLink: string;
  color: string;
  isBestValue: boolean;
  deliveryTime: string;
  emoji: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  'Blinkit': '#F8CB46',
  'Zepto': '#7B2D8E',
  'BigBasket': '#84C225',
  'Flipkart': '#2874F0',
  'Flipkart Minutes': '#2874F0',
  'Local Mandi': '#22C55E'
};

const PLATFORM_FEES: Record<string, number> = {
  'Blinkit': 2,
  'Zepto': 4,
  'BigBasket': 0,
  'Flipkart Minutes': 5,
  'Local Mandi': 0
};

export async function POST(req: Request) {
  try {
    const { productName } = await req.json();

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    // Call the LLM-based prediction service instead of the Python scraper
    const forecast = await generatePriceForecast(productName);

    const mappedResults: PlatformResult[] = forecast.breakdown.map((b: any) => {
      const platformFee = PLATFORM_FEES[b.platform] || 0;
      return {
        platform: b.platform,
        productName: forecast.itemName,
        price: b.price,
        mrp: b.price + (b.price * 0.1), // simulate MRP slightly higher
        discount: 10,
        platformFee,
        totalPrice: b.price + platformFee,
        available: true,
        productImage: '', // frontend fallback will be used
        deepLink: '#',
        color: PLATFORM_COLORS[b.platform] || '#94A3B8',
        isBestValue: b.platform === forecast.bestPlatform,
        deliveryTime: b.eta,
        emoji: '📦'
      };
    });

    const cheapest = mappedResults.find(r => r.isBestValue) || mappedResults[0];
    const mostExpensive = [...mappedResults].sort((a, b) => b.totalPrice - a.totalPrice)[0];
    const savings = mostExpensive.totalPrice - cheapest.totalPrice;

    return NextResponse.json({
      success: true,
      query: productName,
      results: mappedResults,
      cheapest: cheapest.platform,
      mostExpensive: mostExpensive.platform,
      savings: Math.round(savings),
      asOf: new Date().toISOString(),
      aiInsight: forecast.aiInsight,
      predictedPriceDrop: forecast.predictedPriceDrop,
      bestTimeToBuy: forecast.bestTimeToBuy
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI Pricing Engine failed. Please try again.',
    }, { status: 500 });
  }
}