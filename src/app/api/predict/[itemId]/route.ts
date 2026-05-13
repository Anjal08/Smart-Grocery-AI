import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import PurchaseLog from "@/models/PurchaseLog";
import { trainAndPredictLSTM } from "@/services/predictionEngine";

export const dynamic = "force-dynamic";

/**
 * Calculate simple weighted moving average of intervals.
 * Fallback used when interval history is too small (< 5).
 */
function weightedMovingAverage(intervals: number[]): number {
  if (intervals.length === 0) return 7; // default 7 days
  if (intervals.length === 1) return intervals[0];

  let totalWeight = 0;
  let weightedSum = 0;

  intervals.forEach((interval, index) => {
    // Weight increases linearly: first=1, second=2, etc.
    const weight = index + 1;
    weightedSum += interval * weight;
    totalWeight += weight;
  });

  return Math.round(weightedSum / totalWeight);
}

/**
 * GET /api/predict/[itemId]
 * Uses a deep learning LSTM model to predict the next purchase date.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await dbConnect();
    const { itemId } = await params;

    // Fetch the specific item from PurchaseLog
    const log = await PurchaseLog.findById(itemId).lean();

    if (!log) {
      return NextResponse.json({ error: "Item not found in purchase log" }, { status: 404 });
    }

    if (!log.purchaseDates || log.purchaseDates.length < 2) {
      return NextResponse.json(
        { error: "Not enough purchase history to make a prediction" },
        { status: 400 }
      );
    }

    // Sort dates chronologically to ensure accurate interval calculation
    const sortedDates = [...log.purchaseDates].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    // Calculate historical intervals (minimum 1 day)
    const intervals: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diffMs = new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime();
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      intervals.push(diffDays);
    }

    const lastPurchaseDate = new Date(sortedDates[sortedDates.length - 1]);
    let nextIntervalDays = 0;
    let method = "";
    let trainingLoss = null;

    // FALLBACK CONDITION: Less than 5 intervals defaults to WMA
    if (intervals.length < 5) {
      nextIntervalDays = weightedMovingAverage(intervals);
      method = "WMA";
    } else {
      // Execute LSTM Model
      const result = await trainAndPredictLSTM(intervals, 3);
      if (result) {
        nextIntervalDays = result.nextInterval;
        trainingLoss = result.loss;
        method = "LSTM";
      } else {
        // Fallback array was insufficient for the window constraints
        nextIntervalDays = weightedMovingAverage(intervals);
        method = "WMA (Fallback)";
      }
    }

    // Determine predicted refill date based on the calculated interval
    const predicted_next_date = new Date(lastPurchaseDate);
    predicted_next_date.setDate(predicted_next_date.getDate() + nextIntervalDays);

    return NextResponse.json(
      {
        itemId: log._id,
        itemName: log.itemName,
        historical_intervals: intervals,
        method,
        predicted_interval: nextIntervalDays,
        predicted_next_date,
        trainingLoss,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Prediction API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
