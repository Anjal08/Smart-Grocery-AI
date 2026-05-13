// src/lib/inventoryUtils.ts

export const getLastKnownPrice = (inventory: any[], itemName: string) => {
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
  
  // Filter for items with the same name (case-insensitive) in the last 90 days
  const recentItems = inventory
    .filter(item => 
      item.name.toLowerCase() === itemName.toLowerCase() && 
      new Date(item.purchaseDate) >= ninetyDaysAgo
    )
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

  // Return price of the most recent one, or 0 if not found
  return recentItems.length > 0 ? recentItems[0].price : 0;
};

export const getCategoryCounts = (inventory: any[]) => {
  const counts: Record<string, number> = {
    'Fruits': 0,
    'Vegetables': 0,
    'Dairy': 0,
    'Staples': 0,
    'Oil': 0,
    'Snacks': 0
  };

  inventory.forEach(item => {
    if (counts.hasOwnProperty(item.category)) {
      counts[item.category]++;
    }
  });

  return counts;
};
