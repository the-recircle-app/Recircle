const TREMENDOUS_API_KEY = process.env.TREMENDOUS_API_KEY;
const IS_SANDBOX = TREMENDOUS_API_KEY?.startsWith('TEST_');

if (!TREMENDOUS_API_KEY) {
  throw new Error('TREMENDOUS_API_KEY environment variable is required');
}

const BASE_URL = IS_SANDBOX 
  ? 'https://testflight.tremendous.com/api/v2'
  : 'https://api.tremendous.com/api/v2';

console.log(`[TREMENDOUS] Initialized in ${IS_SANDBOX ? 'SANDBOX' : 'PRODUCTION'} mode with base URL: ${BASE_URL}`);

export interface GiftCardProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  countries: string[];
  currencies: string[];
  minAmount: number;
  maxAmount: number;
  imageUrl?: string;
}

export interface CreateOrderParams {
  recipientEmail: string;
  recipientName: string;
  productId: string;
  amount: number;
  currency: string;
  externalId: string;
}

export interface TremendousOrderResult {
  orderId: string;
  rewardId: string;
  deliveryStatus: string;
  deliveryDetails: any;
}

async function tremendousRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TREMENDOUS_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tremendous API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

export async function getCatalog(): Promise<GiftCardProduct[]> {
  try {
    console.log('[TREMENDOUS] Fetching gift card catalog...');
    
    const response = await tremendousRequest('/products');
    
    const products: GiftCardProduct[] = response.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category || 'gift_card',
      countries: product.countries || ['US'],
      currencies: product.currencies || ['USD'],
      minAmount: product.min_price?.amount || 5,
      maxAmount: product.max_price?.amount || 500,
      imageUrl: product.image_url,
    }));

    console.log(`[TREMENDOUS] ✅ Fetched ${products.length} products`);
    return products;

  } catch (error: any) {
    console.error('[TREMENDOUS] Error fetching catalog:', error);
    throw new Error(`Failed to fetch gift card catalog: ${error.message}`);
  }
}

export async function createOrder(params: CreateOrderParams): Promise<TremendousOrderResult> {
  try {
    console.log('[TREMENDOUS] Creating order:', {
      product: params.productId,
      amount: params.amount,
      email: params.recipientEmail,
    });

    const orderData = {
      external_id: params.externalId,
      payment: {
        funding_source_id: IS_SANDBOX ? 'SANDBOX_FUNDING_SOURCE' : undefined,
      },
      rewards: [
        {
          value: {
            denomination: params.amount,
            currency_code: params.currency,
          },
          recipient: {
            name: params.recipientName,
            email: params.recipientEmail,
          },
          products: [params.productId],
          delivery: {
            method: 'EMAIL',
          },
        },
      ],
    };

    const response = await tremendousRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    const order = response.order;
    const reward = order.rewards?.[0];

    const result: TremendousOrderResult = {
      orderId: order.id,
      rewardId: reward?.id || '',
      deliveryStatus: reward?.delivery?.status || 'PENDING',
      deliveryDetails: {
        method: reward?.delivery?.method,
        status: reward?.delivery?.status,
        link: reward?.delivery?.link,
      },
    };

    console.log('[TREMENDOUS] ✅ Order created:', result.orderId);
    return result;

  } catch (error: any) {
    console.error('[TREMENDOUS] Error creating order:', error);
    throw new Error(`Failed to create gift card order: ${error.message}`);
  }
}

export async function getOrderStatus(orderId: string): Promise<any> {
  try {
    const response = await tremendousRequest(`/orders/${orderId}`);
    return response.order;
  } catch (error: any) {
    console.error('[TREMENDOUS] Error fetching order status:', error);
    throw new Error(`Failed to fetch order status: ${error.message}`);
  }
}
