// ============================================================================
// PAYMENT TYPES
// ============================================================================

import type { PlanType, BillingCycle, UserCountry } from '@/lib/constants/pricing';

// Subscription status
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'free_tier';

// Database types
export interface Subscription {
  id: string;
  user_id: string;
  provider: 'shopier' | 'lemon' | 'free';
  provider_subscription_id?: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  plan_type: PlanType;
  billing_cycle?: BillingCycle;
  is_auto_renew: boolean;
  amount_paid?: number;
  currency: 'TRY' | 'USD';
  payment_id?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  provider: 'shopier' | 'lemon' | 'free';
  provider_transaction_id?: string;
  payment_id: string;
  amount: number;
  currency: 'TRY' | 'USD';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  plan_type: PlanType;
  days_granted?: number;
  webhook_payload?: Record<string, unknown>;
  paid_at: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  action_url?: string;
  action_label?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface LegalAgreements {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  terms_accepted_at?: string;
  privacy_accepted: boolean;
  privacy_accepted_at?: string;
  kvkk_accepted: boolean;
  kvkk_accepted_at?: string;
  distance_sales_accepted: boolean;
  distance_sales_accepted_at?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API Types
// ============================================================================

export interface CheckoutRequest {
  plan: PlanType;
  cycle: BillingCycle;
  country: UserCountry;
  agreements: {
    terms: boolean;
    privacy: boolean;
    kvkk?: boolean;
    distanceSales?: boolean;
  };
}

export interface CheckoutResponse {
  success: boolean;
  provider: 'shopier' | 'lemon' | 'free';
  checkoutUrl?: string;
  shopierFormData?: ShopierFormData;
  message?: string;
  error?: string;
}

export interface ShopierFormData {
  actionUrl: string;
  fields: Record<string, string>;
}

export interface SubscriptionInfo {
  hasPlan: boolean;
  plan: PlanType;
  status: SubscriptionStatus;
  provider?: 'shopier' | 'lemon' | 'free';
  daysRemaining: number;
  expiresAt?: string;
  isAutoRenew: boolean;
  canUpgrade: boolean;
}

// ============================================================================
// Webhook Types
// ============================================================================

export interface ShopierWebhookPayload {
  status: string;
  order_id: string;
  payment_id: string;
  platform_order_id: string;
  installment: string;
  total_amount: string;
  net_amount: string;
  currency: string;
  custom_arg: string; // user_id stored here
  signature: string;
}

export interface LemonWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
      plan?: string;
      cycle?: string;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: {
      order_id: number;
      customer_id: number;
      product_id: number;
      variant_id: number;
      status: string;
      status_formatted: string;
      subtotal: number;
      subtotal_formatted: string;
      currency: string;
      user_email: string;
      user_name: string;
      renews_at?: string;
      ends_at?: string;
      created_at: string;
      updated_at: string;
    };
  };
}
