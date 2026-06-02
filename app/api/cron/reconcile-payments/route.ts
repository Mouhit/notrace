// app/api/cron/reconcile-payments/route.ts
// Daily payment reconciliation cron - By Engage Ad

import { reconcilePayments } from '@/lib/payment-reconciliation';

export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const result = await reconcilePayments();

    console.log(`✅ Payment reconciliation: fixed ${result.fixed}, failed ${result.failed}`);

    return Response.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Reconciliation cron error:', error);
    return Response.json(
      { error: 'Reconciliation failed' },
      { status: 500 }
    );
  }
}
