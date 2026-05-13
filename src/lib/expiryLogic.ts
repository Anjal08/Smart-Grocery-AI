export type ExpiryCategory = 'Dairy' | 'Produce' | 'Meat' | 'Bakery' | 'Pantry' | 'Unknown';

/**
 * Standard shelf lives in days
 */
export const SHELF_LIVES: Record<string, number> = {
  Milk: 4,
  Bread: 6,
  Eggs: 21,
  Cheese: 14,
  Apples: 14,
  Bananas: 5,
  Tomatoes: 7,
  Potatoes: 30,
  Onions: 30,
  Chicken: 2,
};

/**
 * Returns estimated expiry date based on common rules
 */
export function calculateEstimatedExpiry(itemName: string, category?: string, purchaseDate = new Date()): Date {
  const expiryDays = getShelfLife(itemName, category);
  const expiryDate = new Date(purchaseDate);
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  return expiryDate;
}

export function getShelfLife(itemName: string, category?: string): number {
  const normalizedName = itemName.trim().toLowerCase();
  
  // 1. Precise name matching
  for (const [key, days] of Object.entries(SHELF_LIVES)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return days;
    }
  }

  // 2. Category fallback
  if (category) {
    switch (category) {
      case 'Dairy & Bakery': return 5;
      case 'Fresh Produce': return 7;
      case 'Snacks & Drinks': return 14;
      case 'Staples': return 30;
      default: return 14;
    }
  }

  // Default to 7 days if unknown
  return 7;
}

/**
 * Calculates percentage of shelf life remaining
 */
export function getPercentLeft(purchaseDate: Date, expiryDate: Date): number {
  const now = new Date();
  const totalDuration = expiryDate.getTime() - purchaseDate.getTime();
  const remainingTime = expiryDate.getTime() - now.getTime();
  
  if (totalDuration <= 0) return 0;
  
  let percent = (remainingTime / totalDuration) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

/**
 * Formats "Days Remaining" message
 */
export function formatDaysRemaining(expiryDate: Date): string {
  const now = new Date();
  const remainingMs = expiryDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
  
  if (remainingDays < 0) return "Expired";
  if (remainingDays === 0) return "Expires Today";
  if (remainingDays === 1) return "Expires Tomorrow";
  return `Est. ${remainingDays} Days`;
}
