// ============================================================================
// PRICING CONSTANTS - SINGLE SOURCE OF TRUTH
// Zero Trust: Prices NEVER come from frontend
// ============================================================================

export type PlanType = 'free' | 'plus' | 'pro';
export type BillingCycle = 'monthly' | 'yearly' | 'one_time';
export type UserCountry = 'TR' | 'GLOBAL';

// Plan definitions
export const PLANS = {
  FREE: 'free' as PlanType,
  PLUS: 'plus' as PlanType,
  PRO: 'pro' as PlanType,
} as const;

// ============================================================================
// PRICING - HARDCODED SERVER-SIDE ONLY
// ============================================================================

export const PRICING = {
  TR: {
    free: { monthly: 0, yearly: 0, currency: 'TRY' as const },
    plus: { monthly: 149, yearly: 1490, currency: 'TRY' as const },
    pro: { monthly: 299, yearly: 2990, currency: 'TRY' as const },
  },
  GLOBAL: {
    free: { monthly: 0, yearly: 0, currency: 'USD' as const },
    plus: { monthly: 9, yearly: 90, currency: 'USD' as const },
    pro: { monthly: 19, yearly: 190, currency: 'USD' as const },
  },
} as const;

// Days granted for Shopier (time-based)
export const SHOPIER_DAYS = {
  monthly: 30,
  yearly: 365,
} as const;

// ============================================================================
// PLAN FEATURES
// ============================================================================

export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    description: 'Başlangıç için ideal',
    features: [
      { text: '3 Proje', included: true },
      { text: 'Temel AI Önerileri', included: true },
      { text: 'Community Destek', included: true },
      { text: 'Roadmap Görünümü', included: true },
      { text: 'İşbirliği', included: false },
      { text: 'Öncelikli Destek', included: false },
      { text: 'API Erişimi', included: false },
    ],
    badge: null,
  },
  plus: {
    name: 'Plus',
    description: 'Büyüyen ekipler için',
    features: [
      { text: '15 Proje', included: true },
      { text: 'Gelişmiş AI Önerileri', included: true },
      { text: 'Email Destek', included: true },
      { text: 'Tüm Görünümler', included: true },
      { text: '5 Kişiye Kadar İşbirliği', included: true },
      { text: 'Öncelikli Destek', included: false },
      { text: 'API Erişimi', included: false },
    ],
    badge: 'Popüler',
  },
  pro: {
    name: 'Pro',
    description: 'Profesyonel kullanım',
    features: [
      { text: 'Sınırsız Proje', included: true },
      { text: 'Premium AI Önerileri', included: true },
      { text: '7/24 Destek', included: true },
      { text: 'Tüm Görünümler + Analytics', included: true },
      { text: 'Sınırsız İşbirliği', included: true },
      { text: 'Öncelikli Destek', included: true },
      { text: 'API Erişimi', included: true },
    ],
    badge: 'En İyi Değer',
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPrice(
  plan: PlanType,
  cycle: BillingCycle,
  country: UserCountry
): number {
  if (plan === 'free') return 0;
  const cycleMapped = cycle === 'one_time' ? 'monthly' : cycle;
  return PRICING[country][plan][cycleMapped];
}

export function getCurrency(country: UserCountry): 'TRY' | 'USD' {
  return country === 'TR' ? 'TRY' : 'USD';
}

export function getDaysToGrant(cycle: BillingCycle): number {
  if (cycle === 'one_time') return 30;
  return SHOPIER_DAYS[cycle];
}

export function formatPrice(amount: number, currency: 'TRY' | 'USD'): string {
  if (amount === 0) return 'Ücretsiz';
  return currency === 'TRY' 
    ? `${amount}₺` 
    : `$${amount}`;
}

export function getPlanDisplayName(plan: PlanType): string {
  return PLAN_FEATURES[plan].name;
}
