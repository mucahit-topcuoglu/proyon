// ============================================================================
// SHOPIER WEBHOOK HANDLER
// POST /api/webhooks/shopier
// Security: Signature verification, Idempotency check
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyShopierSignature, checkIdempotency, activateSubscription, getUserEmail } from '@/lib/services/payment';
import { sendPaymentSuccessEmail } from '@/lib/services/email';
import { notifyPaymentSuccess } from '@/lib/services/notification';
import { PRICING, getDaysToGrant, type PlanType, type BillingCycle } from '@/lib/constants/pricing';
import type { ShopierWebhookPayload } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.formData();
    
    // Convert FormData to object
    const payload: Record<string, string> = {};
    body.forEach((value, key) => {
      payload[key] = value.toString();
    });

    console.log('[SHOPIER WEBHOOK] Received:', payload);

    // ========================================================================
    // 1. VERIFY SIGNATURE
    // ========================================================================
    if (!verifyShopierSignature(payload)) {
      console.error('[SHOPIER WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // ========================================================================
    // 2. CHECK PAYMENT STATUS
    // ========================================================================
    if (payload.status !== 'success') {
      console.log('[SHOPIER WEBHOOK] Payment not successful:', payload.status);
      return NextResponse.json({ message: 'Payment not successful' }, { status: 200 });
    }

    // ========================================================================
    // 3. IDEMPOTENCY CHECK
    // ========================================================================
    const paymentId = payload.payment_id;
    if (await checkIdempotency(paymentId)) {
      console.log('[SHOPIER WEBHOOK] Payment already processed:', paymentId);
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // ========================================================================
    // 4. EXTRACT USER & PLAN INFO
    // ========================================================================
    const userId = payload.custom_arg;
    if (!userId) {
      console.error('[SHOPIER WEBHOOK] Missing user_id in custom_arg');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    // Parse product_info for plan details (format: "plus_monthly" or "pro_yearly")
    const productInfo = payload.product_info || '';
    const [plan, cycle] = productInfo.split('_') as [PlanType, BillingCycle];

    if (!plan || !['plus', 'pro'].includes(plan)) {
      console.error('[SHOPIER WEBHOOK] Invalid plan:', plan);
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const amount = parseFloat(payload.total_amount || '0');

    // ========================================================================
    // 5. ACTIVATE SUBSCRIPTION
    // ========================================================================
    const result = await activateSubscription({
      userId,
      paymentId,
      plan,
      cycle: cycle || 'monthly',
      provider: 'shopier',
      amount,
      currency: 'TRY',
      isAutoRenew: false,
      webhookPayload: payload as unknown as Record<string, unknown>,
    });

    console.log('[SHOPIER WEBHOOK] Subscription activated:', result);

    // ========================================================================
    // 6. SEND EMAIL NOTIFICATION
    // ========================================================================
    const userEmail = await getUserEmail(userId);
    if (userEmail) {
      await sendPaymentSuccessEmail(userEmail, {
        plan,
        amount,
        currency: 'TRY',
        expiryDate: result.periodEnd,
        daysGranted: result.daysGranted,
        isRecurring: false,
      });
    }

    // ========================================================================
    // 7. CREATE IN-APP NOTIFICATION
    // ========================================================================
    await notifyPaymentSuccess(userId, plan, amount, 'TRY');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[SHOPIER WEBHOOK] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
