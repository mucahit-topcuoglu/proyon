// ============================================================================
// PAYMENT SERVICE
// Handles Shopier (TR) and Lemon Squeezy (Global) integrations
// ============================================================================

import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PRICING, getDaysToGrant, type PlanType, type BillingCycle, type UserCountry } from '@/lib/constants/pricing';
import type { ShopierFormData } from '@/types/payment';

// ============================================================================
// SHOPIER (Turkey) - Form Submit Mode
// ============================================================================

interface ShopierCheckoutParams {
  userId: string;
  userEmail: string;
  plan: PlanType;
  cycle: BillingCycle;
}

export function createShopierCheckout(params: ShopierCheckoutParams): ShopierFormData {
  const { userId, userEmail, plan, cycle } = params;
  const price = PRICING.TR[plan][cycle === 'one_time' ? 'monthly' : cycle];
  const currency = 'TRY';

  const apiKey = process.env.SHOPIER_API_KEY;
  const apiSecret = process.env.SHOPIER_API_SECRET;
  const websiteIndex = process.env.SHOPIER_WEBSITE_INDEX || '1';
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/shopier`;

  // Check if Shopier is configured
  if (!apiKey || !apiSecret) {
    throw new Error('Shopier ödeme sistemi henüz yapılandırılmamış. Lütfen daha sonra tekrar deneyin.');
  }

  // Generate order ID
  const orderId = `PRO_${userId.slice(0, 8)}_${Date.now()}`;

  // Shopier form fields
  const productName = `Proyon ${plan.charAt(0).toUpperCase() + plan.slice(1)} - ${cycle === 'yearly' ? 'Yıllık' : 'Aylık'}`;
  const productInfo = `${plan}_${cycle}`;

  // Create signature
  const signatureData = [
    apiKey,
    userEmail,
    price.toFixed(2),
    currency,
    orderId,
    productName,
    productInfo,
    userId, // custom_arg
  ].join('');

  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureData)
    .digest('base64');

  return {
    actionUrl: 'https://www.shopier.com/ShowProduct/api_pay4.php',
    fields: {
      API_key: apiKey,
      website_index: websiteIndex,
      product_name: productName,
      product_info: productInfo,
      product_price: price.toFixed(2),
      currency: currency,
      buyer_email: userEmail,
      order_id: orderId,
      callback_url: callbackUrl,
      custom_arg: userId,
      signature: signature,
    },
  };
}

export function verifyShopierSignature(payload: Record<string, string>): boolean {
  const apiSecret = process.env.SHOPIER_API_SECRET;
  
  if (!apiSecret) {
    console.error('[SHOPIER] API secret not configured');
    return false;
  }

  const signatureData = [
    payload.status,
    payload.order_id,
    payload.payment_id,
    payload.installment,
    payload.total_amount,
  ].join('');

  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(signatureData)
    .digest('base64');

  return payload.signature === expectedSignature;
}

// ============================================================================
// LEMON SQUEEZY (Global) - Overlay Mode
// ============================================================================

interface LemonCheckoutParams {
  userId: string;
  userEmail: string;
  plan: PlanType;
  cycle: BillingCycle;
}

export async function createLemonCheckout(params: LemonCheckoutParams): Promise<string> {
  const { userId, userEmail, plan, cycle } = params;

  const apiKey = process.env.LEMON_SQUEEZY_API_KEY;
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

  // Check if Lemon Squeezy is configured
  if (!apiKey || !storeId) {
    throw new Error('Lemon Squeezy payment system is not configured. Please try again later.');
  }

  // Get variant ID based on plan and cycle
  const variantId = getLemonVariantId(plan, cycle);
  
  if (!variantId) {
    throw new Error('Payment plan variant not configured. Please contact support.');
  }

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: {
              user_id: userId,
              plan: plan,
              cycle: cycle,
            },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=true`,
          },
        },
        relationships: {
          store: {
            data: { type: 'stores', id: storeId },
          },
          variant: {
            data: { type: 'variants', id: variantId },
          },
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[LEMON] Checkout creation failed:', data);
    throw new Error('Failed to create Lemon Squeezy checkout');
  }

  return data.data.attributes.url;
}

function getLemonVariantId(plan: PlanType, cycle: BillingCycle): string {
  // Map plan+cycle to Lemon Squeezy variant IDs
  // Configure these in your .env
  const variants: Record<string, string> = {
    'plus_monthly': process.env.LEMON_VARIANT_PLUS_MONTHLY || '',
    'plus_yearly': process.env.LEMON_VARIANT_PLUS_YEARLY || '',
    'pro_monthly': process.env.LEMON_VARIANT_PRO_MONTHLY || '',
    'pro_yearly': process.env.LEMON_VARIANT_PRO_YEARLY || '',
  };

  const key = `${plan}_${cycle === 'one_time' ? 'monthly' : cycle}`;
  return variants[key] || '';
}

export function verifyLemonSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error('[LEMON] Webhook secret not configured');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

export async function checkIdempotency(paymentId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('payment_transactions')
    .select('id')
    .eq('payment_id', paymentId)
    .single();

  return !!data;
}

interface ActivateSubscriptionParams {
  userId: string;
  paymentId: string;
  plan: PlanType;
  cycle: BillingCycle;
  provider: 'shopier' | 'lemon' | 'free';
  amount: number;
  currency: 'TRY' | 'USD';
  providerSubscriptionId?: string;
  isAutoRenew?: boolean;
  webhookPayload?: Record<string, unknown>;
}

export async function activateSubscription(params: ActivateSubscriptionParams) {
  const {
    userId,
    paymentId,
    plan,
    cycle,
    provider,
    amount,
    currency,
    providerSubscriptionId,
    isAutoRenew = false,
    webhookPayload,
  } = params;

  const now = new Date();
  const daysToAdd = getDaysToGrant(cycle);
  const periodEnd = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  // Upsert subscription
  const { data: subscription, error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        provider,
        provider_subscription_id: providerSubscriptionId,
        status: plan === 'free' ? 'free_tier' : 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        plan_type: plan,
        billing_cycle: cycle,
        is_auto_renew: isAutoRenew,
        amount_paid: amount,
        currency,
        payment_id: paymentId,
        updated_at: now.toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (subError) {
    console.error('[PAYMENT] Subscription upsert failed:', subError);
    throw new Error('Failed to activate subscription');
  }

  // Record transaction
  const { error: txError } = await supabaseAdmin
    .from('payment_transactions')
    .insert({
      user_id: userId,
      subscription_id: subscription.id,
      provider,
      provider_transaction_id: providerSubscriptionId,
      payment_id: paymentId,
      amount,
      currency,
      status: 'completed',
      plan_type: plan,
      days_granted: daysToAdd,
      webhook_payload: webhookPayload,
    });

  if (txError) {
    console.error('[PAYMENT] Transaction insert failed:', txError);
  }

  return {
    subscription,
    periodEnd,
    daysGranted: daysToAdd,
  };
}

export async function cancelSubscription(userId: string, reason?: string) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancel_reason: reason,
      is_auto_renew: false,
    })
    .eq('user_id', userId);

  return !error;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[PAYMENT] Get subscription failed:', error);
  }

  return data;
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    console.error('[PAYMENT] Get user email failed:', error);
    return null;
  }

  return data.user.email || null;
}
