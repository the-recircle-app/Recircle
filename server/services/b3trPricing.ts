import NodeCache from 'node-cache';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const B3TR_COINGECKO_ID = 'vebetterdao';
const CACHE_TTL_SECONDS = 60;
const TESTING_FALLBACK_PRICE = 0.07;

const priceCache = new NodeCache({ stdTTL: CACHE_TTL_SECONDS });

interface PriceData {
  price: number;
  timestamp: number;
}

let lastKnownPrice: number | null = TESTING_FALLBACK_PRICE;

export async function getB3TRPriceUSD(): Promise<number> {
  const cached = priceCache.get<PriceData>('b3tr_price');
  
  if (cached) {
    console.log(`[B3TR-PRICING] Using cached price: $${cached.price}`);
    return cached.price;
  }

  try {
    console.log('[B3TR-PRICING] Fetching fresh price from CoinGecko...');
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${B3TR_COINGECKO_ID}&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}`);
    }

    const data = await response.json();
    const price = data[B3TR_COINGECKO_ID]?.usd;

    if (!price || typeof price !== 'number') {
      throw new Error('Invalid price data from CoinGecko');
    }

    const priceData: PriceData = {
      price,
      timestamp: Date.now(),
    };

    priceCache.set('b3tr_price', priceData);
    lastKnownPrice = price;

    console.log(`[B3TR-PRICING] ✅ Fresh price fetched: $${price}`);
    return price;

  } catch (error) {
    console.error('[B3TR-PRICING] ⚠️ Error fetching price:', error);

    if (lastKnownPrice !== null) {
      console.log(`[B3TR-PRICING] Using last known price: $${lastKnownPrice}`);
      return lastKnownPrice;
    }

    throw new Error('Unable to fetch B3TR price and no fallback available');
  }
}

export function calculateB3TRAmount(
  usdAmount: number,
  markupUsd: number = parseFloat(process.env.GIFT_CARD_MARKUP_USD || '1.75')
): { b3trAmount: number; totalUsd: number; b3trPriceUsed: number; markupUsd: number } {
  const totalUsd = usdAmount + markupUsd;
  
  if (lastKnownPrice === null || lastKnownPrice <= 0) {
    throw new Error('B3TR price not available');
  }

  const b3trAmount = totalUsd / lastKnownPrice;

  return {
    b3trAmount: Math.ceil(b3trAmount * 100) / 100,
    totalUsd,
    b3trPriceUsed: lastKnownPrice,
    markupUsd,
  };
}

export function formatB3TRAmount(amount: number): string {
  return amount.toFixed(2);
}
