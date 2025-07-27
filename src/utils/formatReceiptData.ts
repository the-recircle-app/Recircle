/**
 * Receipt Data Formatting Utilities
 * Demonstrates data processing for receipt validation and rewards
 */

export interface ReceiptData {
  id: string;
  userId: number;
  storeName: string;
  amount: number;
  purchaseDate: string;
  category: string;
  isValidated: boolean;
  rewardAmount: number;
}

/**
 * Formats receipt data for display in the UI
 */
export function formatReceiptForDisplay(receipt: ReceiptData) {
  return {
    ...receipt,
    formattedAmount: `$${receipt.amount.toFixed(2)}`,
    formattedDate: new Date(receipt.purchaseDate).toLocaleDateString(),
    categoryIcon: getCategoryIcon(receipt.category),
    rewardText: `+${receipt.rewardAmount} B3TR`
  };
}

/**
 * Gets the appropriate icon for a purchase category
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    thrift_store: '🛍️',
    pre_owned: '🎮',
    ride_share: '🚗',
    electric_vehicle: '⚡',
    public_transit: '🚌'
  };
  
  return icons[category] || '♻️';
}

/**
 * Calculates environmental impact from receipts
 */
export function calculateEnvironmentalImpact(receipts: ReceiptData[]) {
  const impact = receipts.reduce((acc, receipt) => {
    // Simplified impact calculation for demonstration
    const co2Saved = receipt.amount * 0.1; // kg CO2 per dollar
    const wasteReduced = receipt.amount * 0.08; // kg waste per dollar
    
    return {
      co2Saved: acc.co2Saved + co2Saved,
      wasteReduced: acc.wasteReduced + wasteReduced,
      totalSpent: acc.totalSpent + receipt.amount
    };
  }, { co2Saved: 0, wasteReduced: 0, totalSpent: 0 });
  
  return {
    ...impact,
    co2Saved: Math.round(impact.co2Saved * 10) / 10,
    wasteReduced: Math.round(impact.wasteReduced * 10) / 10
  };
}