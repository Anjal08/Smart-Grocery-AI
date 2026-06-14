import { NextResponse } from 'next/server';
import { generatePriceForecast } from '@/lib/predictionService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Missing "query" parameter' }, { status: 400 });
    }

    // Call the prediction service directly
    const forecast = await generatePriceForecast(query.trim());

    // Return the raw structure that the new frontend component expects
    return NextResponse.json(forecast);

  } catch (error: any) {
    console.error('Search Prices Route Error:', error);
    return NextResponse.json({
      error: 'Internal server error while processing the price search.'
    }, { status: 500 });
  }
}
