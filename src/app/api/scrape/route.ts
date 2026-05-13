import { NextResponse } from 'next/server';

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
}

const PLATFORM_COLORS: Record<string, string> = {
  'Blinkit': '#F8CB46',
  'Zepto': '#7B2D8E',
  'BigBasket': '#84C225',
  'Flipkart': '#2874F0',
  'Flipkart Minutes': '#2874F0',
};

const PLATFORM_FEES: Record<string, number> = {
  'Blinkit': 2,
  'Zepto': 4,
  'BigBasket': 0,
  'Flipkart Minutes': 5,
};

export async function POST(req: Request) {
  try {
    const { productName, pincode = '226001' } = await req.json();

    if (!productName) {
      return NextResponse.json({ success: false, error: 'Product name is required' }, { status: 400 });
    }

    // Check if the input is a URL
    const isUrl = productName.startsWith('http://') || productName.startsWith('https://');
    let response;
    
    if (isUrl) {
      // Call our new URL compare endpoint
      const pythonApiUrl = `http://localhost:8000/compare-url`;
      response = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productName })
      });
    } else {
      // Call our standard Smart-Match Engine (/compare endpoint)
      const pythonApiUrl = `http://localhost:8000/compare?q=${encodeURIComponent(productName)}&pincode=${pincode}`;
      response = await fetch(pythonApiUrl);
    }
    
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(`Pricing Engine returned ${response.status}: ${errData.detail || 'Unknown error'}`);
    }

    const data = await response.json();
    const bestMatches = isUrl ? [data.original_product, ...(data.other_store_prices || [])] : data.results;

    // Map Python results to Frontend structure
    const results: PlatformResult[] = bestMatches.map((deal: any) => {
      const platformFee = PLATFORM_FEES[deal.store] || 0;
      const mrp = deal.mrp || deal.price;
      const discount = mrp > deal.price ? Math.round(((mrp - deal.price) / mrp) * 100) : 0;

      return {
        platform: deal.store,
        productName: deal.title || deal.product_name,
        price: deal.price,
        mrp: mrp,
        discount: discount,
        platformFee: platformFee,
        totalPrice: deal.price + platformFee,
        available: true,
        productImage: deal.image_url || '', 
        deepLink: deal.url,
        color: PLATFORM_COLORS[deal.store] || '#94A3B8',
        isBestValue: (isUrl && data.lowest_price_suggestion && data.lowest_price_suggestion.store === deal.store) || deal.is_best_value || false,
        deliveryTime: deal.delivery || '10m',
      };
    });

    // Add placeholders for stores not found
    const foundPlatforms = new Set(results.map(r => r.platform));
    ['Blinkit', 'Zepto', 'BigBasket', 'Flipkart Minutes'].forEach(p => {
      if (!foundPlatforms.has(p)) {
        results.push({
          platform: p,
          productName,
          price: 0,
          mrp: 0,
          discount: 0,
          platformFee: 0,
          totalPrice: 0,
          available: false,
          productImage: '',
          deepLink: '',
          color: PLATFORM_COLORS[p] || '#94A3B8',
          isBestValue: false,
          deliveryTime: '',
        });
      }
    });

    // Sort: available first, then by price
    results.sort((a, b) => {
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      return a.totalPrice - b.totalPrice;
    });

    const available = results.filter(r => r.available);
    const cheapest = available.find(r => r.isBestValue) || available[0] || null;
    const mostExpensive = available[available.length - 1] || null;
    const savings = (cheapest && mostExpensive) ? mostExpensive.totalPrice - cheapest.totalPrice : 0;

    return NextResponse.json({
      success: true,
      query: productName,
      results,
      cheapest: cheapest?.platform || null,
      mostExpensive: mostExpensive?.platform || null,
      savings,
      asOf: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Aggregator logic failed. Check the Python service.',
    }, { status: 500 });
  }
}