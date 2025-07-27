/**
 * Reward calculation utilities with transportation priority
 * Prioritizes rideshare and sustainable transportation while maintaining secondhand purchases
 */

export interface RewardTier {
  min: number;
  max: number;
  category: string;
  priority: number;
}

// Transportation-focused reward tiers (higher rewards)
export const REWARD_TIERS: { [key: string]: RewardTier } = {
  // Primary Focus - Transportation (highest rewards)
  ride_share: { min: 5, max: 8, category: "Rideshare Transportation", priority: 1 },
  electric_vehicle: { min: 6, max: 8, category: "Electric Vehicle Rental", priority: 1 },
  public_transit: { min: 3, max: 5, category: "Public Transportation", priority: 1 },
  
  // Secondary Focus - Circular Economy (standard rewards)
  transportation: { min: 2, max: 5, category: "Transportation Service", priority: 2 },
  pre_owned: { min: 2, max: 4, category: "Pre-owned Item", priority: 2 },
  used_books: { min: 1, max: 3, category: "Used Books", priority: 2 },
  
  // Default category
  sustainable_purchase: { min: 1, max: 3, category: "Sustainable Purchase", priority: 3 }
};

/**
 * Calculate reward based on receipt category and amount
 * Transportation receipts get priority and higher rewards
 */
export function calculateReceiptReward(receiptData: any): number {
  const amount = receiptData.amount || 0;
  const category = receiptData.category || receiptData.sustainableCategory;
  
  // Determine reward tier based on category
  let tier = REWARD_TIERS.sustainable_purchase; // default
  
  if (category) {
    const categoryLower = category.toLowerCase();
    
    // Transportation categories (highest priority)
    if (categoryLower.includes('ride_share') || categoryLower.includes('uber') || categoryLower.includes('lyft') || categoryLower.includes('waymo')) {
      tier = REWARD_TIERS.ride_share;
    } else if (categoryLower.includes('electric') || categoryLower.includes('ev') || categoryLower.includes('tesla') || categoryLower.includes('hybrid')) {
      tier = REWARD_TIERS.electric_vehicle;
    } else if (categoryLower.includes('transit') || categoryLower.includes('bus') || categoryLower.includes('train') || categoryLower.includes('subway')) {
      tier = REWARD_TIERS.public_transit;
    }
    // Secondhand categories (secondary priority)
    else if (categoryLower.includes('transportation') || categoryLower.includes('rideshare') || categoryLower.includes('transit')) {
      tier = REWARD_TIERS.transportation;
    } else if (categoryLower.includes('pre_owned') || categoryLower.includes('used_video_games') || categoryLower.includes('gamestop')) {
      tier = REWARD_TIERS.pre_owned;
    } else if (categoryLower.includes('used_books') || categoryLower.includes('book')) {
      tier = REWARD_TIERS.used_books;
    }
  }
  
  // Calculate base reward within tier range
  const baseReward = Math.min(tier.max, Math.max(tier.min, Math.floor(amount * 0.1)));
  
  // Transportation gets a bonus multiplier
  const transportationBonus = tier.priority === 1 ? 1.2 : 1.0;
  
  const finalReward = Math.round(baseReward * transportationBonus * 100) / 100;
  
  console.log(`Reward calculation: Category=${tier.category}, Amount=$${amount}, Base=${baseReward}, Bonus=${transportationBonus}x, Final=${finalReward} B3TR`);
  
  return finalReward;
}

/**
 * Calculate environmental impact based on category
 * Transportation shows miles shared, purchases show waste diverted
 */
export function calculateEnvironmentalImpact(receiptData: any): { metric: string; value: number; unit: string } {
  const amount = receiptData.amount || 0;
  const category = receiptData.category || receiptData.sustainableCategory || '';
  const categoryLower = category.toLowerCase();
  
  // Transportation impact (miles shared, emissions reduced)
  if (categoryLower.includes('ride_share') || categoryLower.includes('uber') || categoryLower.includes('lyft')) {
    // Average rideshare trip: 8 miles, estimate based on receipt amount
    const estimatedMiles = Math.round((amount / 15) * 8); // $15 average trip = 8 miles
    return { metric: "Miles Shared", value: estimatedMiles, unit: "miles" };
  }
  
  if (categoryLower.includes('transit') || categoryLower.includes('bus') || categoryLower.includes('train')) {
    // Public transit CO2 savings
    const co2Saved = Math.round((amount / 5) * 2.3); // $5 trip saves ~2.3kg CO2
    return { metric: "CO2 Saved", value: co2Saved, unit: "kg" };
  }
  
  if (categoryLower.includes('electric') || categoryLower.includes('ev')) {
    // Electric vehicle CO2 savings
    const co2Saved = Math.round((amount / 50) * 15); // $50 rental saves ~15kg CO2
    return { metric: "CO2 Saved", value: co2Saved, unit: "kg" };
  }
  
  // Secondhand purchases (waste diverted)
  if (categoryLower.includes('transportation') || categoryLower.includes('rideshare') || categoryLower.includes('sustainable')) {
    const wasteDiv = Math.round((amount / 10) * 2.3); // $10 purchase = ~2.3kg waste diverted
    return { metric: "Waste Diverted", value: wasteDiv, unit: "kg" };
  }
  
  // Default impact
  return { metric: "Impact Created", value: Math.round(amount * 0.1), unit: "points" };
}

/**
 * Get reward tier information for display
 */
export function getRewardTierInfo(category: string): RewardTier {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('ride_share') || categoryLower.includes('uber') || categoryLower.includes('lyft')) {
    return REWARD_TIERS.ride_share;
  }
  if (categoryLower.includes('electric') || categoryLower.includes('ev')) {
    return REWARD_TIERS.electric_vehicle;
  }
  if (categoryLower.includes('transit')) {
    return REWARD_TIERS.public_transit;
  }
  if (categoryLower.includes('transportation')) {
    return REWARD_TIERS.transportation;
  }
  if (categoryLower.includes('pre_owned') || categoryLower.includes('used')) {
    return REWARD_TIERS.pre_owned;
  }
  if (categoryLower.includes('book')) {
    return REWARD_TIERS.used_books;
  }
  
  return REWARD_TIERS.sustainable_purchase;
}