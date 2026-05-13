import Pantry from "@/models/Pantry";
import Inventory from "@/models/Inventory";
import PurchaseLog from "@/models/PurchaseLog";

/**
 * Predictive Engine — Auto-Shopping List
 *
 * Analyzes purchase history to predict when staple items need refilling.
 * Uses a weighted moving average (recent purchases weighted more heavily).
 */

interface PredictedItem {
  name: string;
  category: string;
  avgIntervalDays: number;
  lastPurchaseDate: Date;
  predictedRefillDate: Date;
  confidence: number; // 0-1, based on data volume
  purchaseCount: number;
  emoji: string;
  savings: number;
}

const EMOJI_MAP: Record<string, string> = {
  "milk": "🥛",
  "butter": "🧈",
  "bhujia": "🥨",
  "bread": "🍞",
  "atta": "🌾",
  "salt": "🧂",
  "oil": "🫗",
  "paneer": "🧀",
  "noodle": "🍜",
  "tea": "🍵",
  "coffee": "☕",
  "chips": "🥔",
  "biscuit": "🍪",
  "cola": "🥤",
  "soap": "🧼",
  "cleaner": "🧹",
  "handwash": "🧴",
  "toothpaste": "🪥",
  "orange": "🧃",
  "sugar": "🍬",
  "egg": "🥚",
  "onion": "🧅",
  "potato": "🥔",
  "tomato": "🍅",
  "dal": "🥣",
  "rice": "🍚",
  "ghee": "🍯",
  "lemon": "🍋",
};

const CATEGORY_EMOJI: Record<string, string> = {
  "Dairy": "🥛",
  "Staples": "🌾",
  "Bakery": "🍞",
  "Snacks": "🍪",
  "Beverages": "🥤",
  "Cleaning": "🧹",
  "Personal Care": "🧴",
  "Produce": "🍎",
};

function getEmoji(name: string, category: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (lowerName.includes(key)) return emoji;
  }
  return CATEGORY_EMOJI[category] || "📦";
}

interface ShoppingList {
  urgent: PredictedItem[];   // refill within 3 days
  soon: PredictedItem[];     // refill within 7 days
  upcoming: PredictedItem[]; // refill within 14 days
}

/**
 * Calculate weighted moving average of intervals.
 * More recent intervals get higher weight.
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
 * Calculate confidence based on number of data points.
 * More purchases = higher confidence.
 */
function calculateConfidence(purchaseCount: number): number {
  if (purchaseCount <= 2) return 0.3;
  if (purchaseCount <= 4) return 0.5;
  if (purchaseCount <= 6) return 0.7;
  if (purchaseCount <= 10) return 0.85;
  return 0.95;
}

/**
 * Rebuild all purchase logs from Pantry + Inventory data.
 * Groups items by normalized name and computes prediction metrics.
 */
export async function rebuildPurchaseLogs(): Promise<number> {
  // Gather all items from both collections
  const pantryItems = await Pantry.find({}).lean();
  const inventoryItems = await Inventory.find({}).lean();

  // Merge all items
  const allItems = [
    ...pantryItems.map((i: any) => ({
      name: i.name.toLowerCase().trim(),
      category: i.category,
      purchaseDate: new Date(i.purchaseDate),
    })),
    ...inventoryItems.map((i: any) => ({
      name: i.name.toLowerCase().trim(),
      category: i.category,
      purchaseDate: new Date(i.purchaseDate),
    })),
  ];

  // Group by item name
  const grouped: Record<
    string,
    { category: string; dates: Date[] }
  > = {};

  allItems.forEach((item) => {
    if (!grouped[item.name]) {
      grouped[item.name] = { category: item.category, dates: [] };
    }
    grouped[item.name].dates.push(item.purchaseDate);
  });

  let updatedCount = 0;

  for (const [itemName, data] of Object.entries(grouped)) {
    // Sort dates chronologically
    const sortedDates = data.dates.sort(
      (a, b) => a.getTime() - b.getTime()
    );

    // Calculate intervals between consecutive purchases (in days)
    const intervals: number[] = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diffMs =
        sortedDates[i].getTime() - sortedDates[i - 1].getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        intervals.push(diffDays);
      }
    }

    const avgInterval =
      intervals.length > 0 ? weightedMovingAverage(intervals) : 14; // default 14 days

    const lastPurchase = sortedDates[sortedDates.length - 1];
    const predictedRefill = new Date(lastPurchase);
    predictedRefill.setDate(predictedRefill.getDate() + avgInterval);

    const isStaple = sortedDates.length >= 3;

    // Upsert PurchaseLog
    await PurchaseLog.findOneAndUpdate(
      { itemName },
      {
        $set: {
          category: data.category,
          purchaseDates: sortedDates,
          avgIntervalDays: avgInterval,
          lastPurchaseDate: lastPurchase,
          predictedRefillDate: predictedRefill,
          isStaple,
        },
      },
      { upsert: true, returnDocument: "after" }
    );

    updatedCount++;
  }

  return updatedCount;
}

/**
 * Generate the auto-shopping list from PurchaseLog data.
 * Only includes staple items (purchased 3+ times).
 */
export async function generateShoppingList(): Promise<ShoppingList> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysFromNow = new Date(
    now.getTime() + 14 * 24 * 60 * 60 * 1000
  );

  // Fetch all staple items with upcoming refill dates
  const logs = await PurchaseLog.find({
    isStaple: true,
    predictedRefillDate: { $lte: fourteenDaysFromNow },
  })
    .sort({ predictedRefillDate: 1 })
    .lean();

  const shoppingList: ShoppingList = {
    urgent: [],
    soon: [],
    upcoming: [],
  };

  for (const log of logs) {
    const item: PredictedItem = {
      name: log.itemName,
      category: log.category,
      avgIntervalDays: log.avgIntervalDays,
      lastPurchaseDate: log.lastPurchaseDate,
      predictedRefillDate: log.predictedRefillDate,
      confidence: calculateConfidence(log.purchaseDates.length),
      purchaseCount: log.purchaseDates.length,
      emoji: getEmoji(log.itemName, log.category),
      savings: Math.floor(Math.random() * 40) + 10, // Simulated savings for demo
    };

    if (log.predictedRefillDate <= threeDaysFromNow) {
      shoppingList.urgent.push(item);
    } else if (log.predictedRefillDate <= sevenDaysFromNow) {
      shoppingList.soon.push(item);
    } else {
      shoppingList.upcoming.push(item);
    }
  }

  return shoppingList;
}
