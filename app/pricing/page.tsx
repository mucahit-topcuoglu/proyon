'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import { 
  Check, 
  X, 
  ArrowRight, 
  Zap, 
  TrendingUp, 
  Crown,
  Star,
  Globe,
  Loader2,
  AlertCircle,
  PartyPopper,
  Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { PLAN_FEATURES, PRICING, formatPrice, type PlanType, type BillingCycle, type UserCountry } from '@/lib/constants/pricing';
import type { CheckoutResponse, ShopierFormData, SubscriptionInfo } from '@/types/payment';

// ============================================================================
// LEMON SQUEEZY OVERLAY SCRIPT
// ============================================================================

declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Setup: (config: { eventHandler: (event: { event: string }) => void }) => void;
    };
  }
}

function loadLemonSqueezyScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.LemonSqueezy) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://app.lemonsqueezy.com/js/lemon.js';
    script.async = true;
    script.onload = () => {
      window.createLemonSqueezy?.();
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// ============================================================================
// SUCCESS HANDLER (Separate component for useSearchParams)
// ============================================================================

function SuccessHandler({ onSuccess, onPlanSelect, isAuthReady }: { 
  onSuccess: () => void; 
  onPlanSelect: (plan: PlanType, cycle: BillingCycle) => void;
  isAuthReady: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (processed) return;

    // Handle success callback from payment
    if (searchParams.get('success') === 'true') {
      onSuccess();
      router.replace('/pricing');
      setProcessed(true);
      return;
    }

    // Handle return from login with selected plan (Auth-First flow)
    const selectedPlan = searchParams.get('selected_plan') as PlanType | null;
    const selectedCycle = (searchParams.get('selected_cycle') || 'monthly') as BillingCycle;
    
    if (selectedPlan && ['free', 'plus', 'pro'].includes(selectedPlan)) {
      // Wait for auth to be ready before triggering checkout
      if (!isAuthReady) return;
      
      // Clear URL params and trigger checkout
      router.replace('/pricing');
      // Small delay to ensure URL is cleared
      setTimeout(() => {
        onPlanSelect(selectedPlan, selectedCycle);
      }, 300);
      setProcessed(true);
    }
  }, [searchParams, router, onSuccess, onPlanSelect, processed, isAuthReady]);

  return null;
}

// ============================================================================
// MAIN PRICING CONTENT
// ============================================================================

function PricingContent() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [country, setCountry] = useState<UserCountry>('TR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('plus');
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [shopierFormData, setShopierFormData] = useState<ShopierFormData | null>(null);

  // Legal agreements state
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    kvkk: false,
    distanceSales: false,
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Detect country from browser
  useEffect(() => {
    const lang = navigator.language || '';
    setCountry(lang.startsWith('tr') ? 'TR' : 'GLOBAL');
  }, []);

  // Load Lemon script for global users
  useEffect(() => {
    if (country === 'GLOBAL') {
      loadLemonSqueezyScript().catch(console.error);
    }
  }, [country]);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user }, error } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      
      setIsAuthenticated(!!user || !!session);

      if (user || session) {
        // Fetch subscription info with auth header
        try {
          const headers: Record<string, string> = {};
          if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
          }
          const res = await fetch('/api/subscription', { headers });
          if (res.ok) {
            setSubscription(await res.json());
          }
        } catch {}
      }
    }
    checkAuth();
  }, []);

  // Lemon event handler
  useEffect(() => {
    if (typeof window !== 'undefined' && window.LemonSqueezy) {
      window.LemonSqueezy.Setup({
        eventHandler: (event) => {
          if (event.event === 'Checkout.Success') {
            setShowSuccessDialog(true);
            window.LemonSqueezy.Url.Close();
          }
        },
      });
    }
  }, []);

  // Auto-submit Shopier form
  useEffect(() => {
    if (shopierFormData && formRef.current) {
      formRef.current.submit();
    }
  }, [shopierFormData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePlanSelect = useCallback(async (plan: PlanType, cycle: BillingCycle = billingPeriod) => {
    setSelectedPlan(plan);
    setError(null);

    // Check authentication first (Auth-First flow) - use getUser for accurate check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Redirect to login with return URL
      const returnUrl = `/pricing?selected_plan=${plan}&selected_cycle=${cycle}`;
      router.push(`/login?return_to=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // User is authenticated, show checkout dialog
    if (plan === 'free') {
      // Free plan - activate directly
      await processCheckout(plan, cycle);
    } else {
      // Paid plan - show dialog for agreements
      setShowCheckoutDialog(true);
    }
  }, [billingPeriod, router]);

  const processCheckout = async (plan: PlanType, cycle: BillingCycle) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get current session for auth header
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };
      
      // Add auth header if session exists
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          plan,
          cycle,
          country,
          agreements,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        
        // If unauthorized, redirect to login (Auth-First)
        if (res.status === 401) {
          setShowCheckoutDialog(false);
          const returnUrl = `/pricing?selected_plan=${plan}&selected_cycle=${cycle}`;
          router.push(`/login?return_to=${encodeURIComponent(returnUrl)}`);
          return;
        }
        
        throw new Error(data.error || 'Checkout failed');
      }

      const data: CheckoutResponse = await res.json();

      if (data.provider === 'free') {
        // Free plan activated
        setShowCheckoutDialog(false);
        setShowSuccessDialog(true);
        return;
      }

      if (data.provider === 'shopier' && data.shopierFormData) {
        setShopierFormData(data.shopierFormData);
        setShowCheckoutDialog(false);
      } else if (data.provider === 'lemon' && data.checkoutUrl) {
        if (window.LemonSqueezy) {
          window.LemonSqueezy.Url.Open(data.checkoutUrl);
          setShowCheckoutDialog(false);
        } else {
          window.location.href = data.checkoutUrl;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutSubmit = async () => {
    // Validate agreements
    if (!agreements.terms || !agreements.privacy) {
      setError('Kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz');
      return;
    }

    if (country === 'TR' && (!agreements.kvkk || !agreements.distanceSales)) {
      setError('KVKK ve Mesafeli Satış sözleşmelerini kabul etmelisiniz');
      return;
    }

    await processCheckout(selectedPlan, billingPeriod);
  };

  const canSelectPlan = (plan: PlanType): boolean => {
    if (!subscription?.hasPlan) return true;
    if (subscription.plan === plan) return false;
    // Can upgrade from free to plus/pro, or plus to pro
    if (subscription.plan === 'free') return plan !== 'free';
    if (subscription.plan === 'plus') return plan === 'pro';
    return false;
  };

  const getButtonText = (plan: PlanType): string => {
    if (subscription?.plan === plan) return 'Mevcut Plan';
    if (!canSelectPlan(plan)) return 'Zaten Aktif';
    if (plan === 'free') return 'Ücretsiz Başla';
    return 'Planı Seç';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const plans = [
    {
      type: 'free' as PlanType,
      icon: Zap,
      iconColor: 'text-blue-500',
      popular: false,
    },
    {
      type: 'plus' as PlanType,
      icon: TrendingUp,
      iconColor: 'text-primary',
      popular: true,
    },
    {
      type: 'pro' as PlanType,
      icon: Crown,
      iconColor: 'text-amber-500',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      {/* Success handler with Suspense */}
      <Suspense fallback={null}>
        <SuccessHandler 
          onSuccess={() => setShowSuccessDialog(true)} 
          onPlanSelect={handlePlanSelect}
          isAuthReady={isAuthenticated !== null}
        />
      </Suspense>

      {/* Hidden Shopier Form */}
      {shopierFormData && (
        <form
          ref={formRef}
          action={shopierFormData.actionUrl}
          method="POST"
          style={{ display: 'none' }}
        >
          {Object.entries(shopierFormData.fields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              <Star className="w-3.5 h-3.5 mr-2" />
              Esnek Fiyatlandırma
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            İhtiyacınıza Uygun{' '}
            <GradientText className="block mt-2">Plan Seçin</GradientText>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Her ölçekte ekip için güçlü özellikler.
          </p>

          {/* Country Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              variant={country === 'TR' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCountry('TR')}
            >
              🇹🇷 Türkiye (TRY)
            </Button>
            <Button
              variant={country === 'GLOBAL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCountry('GLOBAL')}
            >
              <Globe className="w-4 h-4 mr-2" />
              Global (USD)
            </Button>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-2 bg-muted/50 rounded-full backdrop-blur-sm border border-border/50">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Aylık
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yıllık
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                %17
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const features = PLAN_FEATURES[plan.type];
              const pricing = PRICING[country][plan.type];
              const price = billingPeriod === 'yearly' ? pricing.yearly : pricing.monthly;
              const displayPrice = billingPeriod === 'yearly' && price > 0 ? Math.round(price / 12) : price;
              const currency = pricing.currency;
              const isCurrentPlan = subscription?.plan === plan.type;
              const canSelect = canSelectPlan(plan.type);
              
              return (
                <Card
                  key={plan.type}
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                    plan.popular
                      ? 'border-primary shadow-xl scale-105 lg:scale-110'
                      : 'border-border hover:border-primary/50'
                  } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
                      En Popüler
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white px-4 py-1 text-xs font-semibold rounded-br-lg">
                      Mevcut
                    </div>
                  )}

                  <CardHeader className="space-y-4 pb-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center ${plan.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{features.name}</CardTitle>
                        {features.badge && (
                          <Badge className="text-xs">{features.badge}</Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {features.description}
                      </CardDescription>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight">
                        {formatPrice(displayPrice, currency)}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground">/ay</span>
                      )}
                    </div>

                    {billingPeriod === 'yearly' && price > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Yıllık faturalandırma ile tasarruf edin
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {features.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className={`flex items-start gap-3 ${!feature.included ? 'opacity-50' : ''}`}
                        >
                          <div className={`mt-0.5 flex-shrink-0 ${
                            feature.included ? 'text-green-500' : 'text-muted-foreground'
                          }`}>
                            {feature.included ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                          </div>
                          <span className="text-sm text-muted-foreground">{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="pt-6">
                    <Button
                      size="lg"
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full group"
                      disabled={!canSelect || isLoading}
                      onClick={() => handlePlanSelect(plan.type)}
                    >
                      {getButtonText(plan.type)}
                      {canSelect && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Enterprise Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-primary/5 via-background to-purple-500/5 border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex mx-auto mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Enterprise</CardTitle>
                <CardDescription className="text-base mt-2">
                  Büyük organizasyonlar için özelleştirilmiş çözümler
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="mailto:enterprise@proyon.com">
                  <Button size="lg" variant="outline" className="group">
                    İletişime Geçin
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Onayı</DialogTitle>
            <DialogDescription>
              {PLAN_FEATURES[selectedPlan].name} planı için ödeme yapacaksınız
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Price Summary */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{PLAN_FEATURES[selectedPlan].name} ({billingPeriod === 'yearly' ? 'Yıllık' : 'Aylık'})</span>
                <span className="text-xl font-bold">
                  {formatPrice(
                    billingPeriod === 'yearly' 
                      ? PRICING[country][selectedPlan].yearly 
                      : PRICING[country][selectedPlan].monthly,
                    PRICING[country][selectedPlan].currency
                  )}
                </span>
              </div>
              {country === 'TR' && (
                <p className="text-xs text-muted-foreground mt-2">
                  {billingPeriod === 'yearly' ? '365' : '30'} günlük erişim
                </p>
              )}
            </div>

            {/* Legal Agreements */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreements.terms}
                  onCheckedChange={(c) => setAgreements(a => ({ ...a, terms: !!c }))}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  <a href="/docs/terms" target="_blank" className="text-primary hover:underline">
                    Kullanım Koşulları
                  </a>
                  &apos;nı okudum ve kabul ediyorum *
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="privacy"
                  checked={agreements.privacy}
                  onCheckedChange={(c) => setAgreements(a => ({ ...a, privacy: !!c }))}
                />
                <Label htmlFor="privacy" className="text-sm cursor-pointer leading-relaxed">
                  <a href="/docs/privacy" target="_blank" className="text-primary hover:underline">
                    Gizlilik Politikası
                  </a>
                  &apos;nı okudum ve kabul ediyorum *
                </Label>
              </div>

              {country === 'TR' && (
                <>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="kvkk"
                      checked={agreements.kvkk}
                      onCheckedChange={(c) => setAgreements(a => ({ ...a, kvkk: !!c }))}
                    />
                    <Label htmlFor="kvkk" className="text-sm cursor-pointer leading-relaxed">
                      <a href="/docs/kvkk" target="_blank" className="text-primary hover:underline">
                        KVKK Aydınlatma Metni
                      </a>
                      &apos;ni okudum ve kabul ediyorum *
                    </Label>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="distanceSales"
                      checked={agreements.distanceSales}
                      onCheckedChange={(c) => setAgreements(a => ({ ...a, distanceSales: !!c }))}
                    />
                    <Label htmlFor="distanceSales" className="text-sm cursor-pointer leading-relaxed">
                      <a href="/docs/distance-sales" target="_blank" className="text-primary hover:underline">
                        Mesafeli Satış Sözleşmesi
                      </a>
                      &apos;ni okudum ve kabul ediyorum *
                    </Label>
                  </div>
                </>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCheckoutDialog(false)}
              disabled={isLoading}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              onClick={handleCheckoutSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Ödeme Yap'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl mb-2">Tebrikler! 🎉</DialogTitle>
            <DialogDescription className="text-base">
              Planınız başarıyla aktifleştirildi. Premium özelliklerin keyfini çıkarın!
            </DialogDescription>
          </div>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Dashboard&apos;a Git
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

export default function PricingPage() {
  return <PricingContent />;
}
