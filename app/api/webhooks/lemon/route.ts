// ============================================================================
// LEMON SQUEEZY WEBHOOK HANDLER
// POST /api/webhooks/lemon
// Security: Signature verification, Idempotency check
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyLemonSignature, checkIdempotency, activateSubscription, cancelSubscription, getUserEmail } from '@/lib/services/payment';
import { sendPaymentSuccessEmail } from '@/lib/services/email';
import { notifyPaymentSuccess, notifySubscriptionCancelled, notifyPaymentFailed } from '@/lib/services/notification';
import type { PlanType, BillingCycle } from '@/lib/constants/pricing';
import type { LemonWebhookPayload } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || '';

    console.log('[LEMON WEBHOOK] Received event');

    // ========================================================================
    // 1. VERIFY SIGNATURE
    // ========================================================================
    if (!verifyLemonSignature(rawBody, signature)) {
      console.error('[LEMON WEBHOOK] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload: LemonWebhookPayload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;

    console.log('[LEMON WEBHOOK] Event:', eventName);

    // ========================================================================
    // 2. EXTRACT USER INFO
    // ========================================================================
    const userId = customData?.user_id;
    if (!userId) {
      console.error('[LEMON WEBHOOK] Missing user_id in custom_data');
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const plan = (customData?.plan || 'plus') as PlanType;
    const cycle = (customData?.cycle || 'monthly') as BillingCycle;
    const subscriptionId = payload.data.id;
    const amount = payload.data.attributes.subtotal / 100; // Lemon sends cents

    // ========================================================================
    // 3. HANDLE EVENTS
    // ========================================================================
    switch (eventName) {
      case 'subscription_created':
      case 'subscription_payment_success': {
        // Idempotency check
        const paymentId = `LEMON_${subscriptionId}_${Date.now()}`;
        if (await checkIdempotency(paymentId)) {
          console.log('[LEMON WEBHOOK] Already processed');
          return NextResponse.json({ message: 'Already processed' });
        }

        const result = await activateSubscription({
          userId,
          paymentId,
          plan,
          cycle,
          provider: 'lemon',
          amount,
          currency: 'USD',
          providerSubscriptionId: subscriptionId,
          isAutoRenew: true,
          webhookPayload: payload as unknown as Record<string, unknown>,
        });

        console.log('[LEMON WEBHOOK] Subscription activated:', result);

        // Send email
        const userEmail = await getUserEmail(userId);
        if (userEmail) {
          await sendPaymentSuccessEmail(userEmail, {
            plan,
            amount,
            currency: 'USD',
            expiryDate: result.periodEnd,
            isRecurring: true,
          });
        }

        // In-app notification
        await notifyPaymentSuccess(userId, plan, amount, 'USD');
        break;
      }

      case 'subscription_updated': {
        const status = payload.data.attributes.status;
        console.log('[LEMON WEBHOOK] Subscription updated, status:', status);

        if (status === 'cancelled' || status === 'expired') {
          await cancelSubscription(userId, `Lemon status: ${status}`);

          const endsAt = payload.data.attributes.ends_at;
          if (endsAt) {
            await notifySubscriptionCancelled(userId, plan, new Date(endsAt));
          }
        }
        break;
      }

      case 'subscription_cancelled': {
        console.log('[LEMON WEBHOOK] Subscription cancelled');
        await cancelSubscription(userId, 'User cancelled');

        const endsAt = payload.data.attributes.ends_at;
        if (endsAt) {
          await notifySubscriptionCancelled(userId, plan, new Date(endsAt));
        }
        break;
      }

      case 'subscription_payment_failed': {
        console.log('[LEMON WEBHOOK] Payment failed');
        await notifyPaymentFailed(userId, plan);
        break;
      }

      default:
        console.log('[LEMON WEBHOOK] Unhandled event:', eventName);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[LEMON WEBHOOK] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
