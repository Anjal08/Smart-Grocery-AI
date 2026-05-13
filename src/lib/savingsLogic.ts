// src/lib/savingsLogic.ts

export const calculateFinalSavings = (items: any[]) => {
  return items.reduce((total, item) => {
    const price = item.price || 0;
    const cat = (item.category || '').toLowerCase();
    
    let percentage = 0.05; // 5% default
    
    if (cat === 'pantry') percentage = 0.15; // 15% on Staples
    else if (cat === 'produce') percentage = 0.08; // 8%
    else if (cat === 'meat' || cat === 'bakery') percentage = 0.10; // 10%
    else if (cat === 'dairy') percentage = 0.05; // 5%
    
    return total + (price * percentage);
  }, 0);
};
