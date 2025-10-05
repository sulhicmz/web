import type { APIRoute } from 'astro';
import { MidtransProvider } from '../../../lib/payments/providers/midtrans';

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  const midtrans = new MidtransProvider({
    serverKey: import.meta.env.MIDTRANS_SERVER_KEY,
    environment: import.meta.env.PAYMENT_ENV as 'sandbox' | 'production',
  });

  try {
    const subscription = await midtrans.createSubscription(body);
    return new Response(JSON.stringify(subscription), { status: 200 });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
};