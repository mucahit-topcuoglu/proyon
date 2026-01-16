// ============================================================================
// CHECKOUT API ROUTE
// POST /api/checkout
// Security: Auth from session, prices from constants, RLS enforced
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { PRICING, getDaysToGrant, type PlanType, type BillingCycle, type UserCountry } from '@/lib/constants/pricing';
import { createShopierCheckout, createLemonCheckout, activateSubscription, getUserSubscription } from '@/lib/services/payment';
import { notifyFreePlanActivated } from '@/lib/services/notification';
import type { CheckoutRequest, CheckoutResponse } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // 1. AUTHENTICATE USER - Try Bearer token first, then cookies
    // ========================================================================
    let user = null;
    
    // Try Authorization header first (for client-side auth)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Use anon key to verify token (service role not required for getUser with token)
      const supabaseWithToken = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      const { data: { user: tokenUser }, error } = await supabaseWithToken.auth.getUser();
      if (!error && tokenUser) {
        user = tokenUser;
      }
    }
    
    // Fallback to cookie-based auth
    if (!user) {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            },
          },
        }
      );
      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    // ========================================================================
    // 2. PARSE & VALIDATE REQUEST
    // ========================================================================
    const body: CheckoutRequest = await request.json();
    const { plan, cycle, country, agreements } = body;

    // Validate plan
    if (!['free', 'plus', 'pro'].includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Validate cycle
    if (!['monthly', 'yearly', 'one_time'].includes(cycle)) {
      return NextResponse.json(
        { success: false, error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    // Validate agreements
    if (!agreements.terms || !agreements.privacy) {
      return NextResponse.json(
        { success: false, error: 'Terms and Privacy must be accepted' },
        { status: 400 }
      );
    }

    // Turkey requires KVKK and Distance Sales
    if (country === 'TR' && (!agreements.kvkk || !agreements.distanceSales)) {
      return NextResponse.json(
        { success: false, error: 'KVKK and Distance Sales agreements required for Turkey' },
        { status: 400 }
      );
    }

    // ========================================================================
    // 3. CHECK EXISTING SUBSCRIPTION
    // ========================================================================
    const existingSubscription = await getUserSubscription(user.id);

    if (existingSubscription && 
        existingSubscription.status === 'active' && 
        new Date(existingSubscription.current_period_end) > new Date()) {
      // Allow upgrade from free to paid
      if (existingSubscription.plan_type !== 'free' && plan !== 'free') {
        return NextResponse.json(
          { success: false, error: 'You already have an active subscription' },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // 4. HANDLE FREE PLAN - No payment provider needed
    // ========================================================================
    if (plan === 'free') {
      const paymentId = `FREE_${user.id}_${Date.now()}`;

      await activateSubscription({
        userId: user.id,
        paymentId,
        plan: 'free',
        cycle: 'monthly',
        provider: 'free',
        amount: 0,
        currency: country === 'TR' ? 'TRY' : 'USD',
        isAutoRenew: false,
      });

      await notifyFreePlanActivated(user.id);

      const response: CheckoutResponse = {
        success: true,
        provider: 'free',
        message: 'Free plan activated successfully',
      };

      return NextResponse.json(response);
    }

    // ========================================================================
    // 5. GET PRICE FROM CONSTANTS (Zero Trust)
    // ========================================================================
    const cycleMapped = cycle === 'one_time' ? 'monthly' : cycle;
    const price = PRICING[country][plan as 'plus' | 'pro'][cycleMapped];
    const currency = country === 'TR' ? 'TRY' : 'USD';

    // ========================================================================
    // 6. CREATE CHECKOUT BASED ON COUNTRY
    // ========================================================================
    
    // TURKEY -> SHOPIER (Form Submit)
    if (country === 'TR') {
      const shopierFormData = createShopierCheckout({
        userId: user.id,
        userEmail: user.email!,
        plan: plan as PlanType,
        cycle: cycle as BillingCycle,
      });

      const response: CheckoutResponse = {
        success: true,
        provider: 'shopier',
        shopierFormData,
      };

      return NextResponse.json(response);
    }

    // GLOBAL -> LEMON SQUEEZY (Overlay)
    const checkoutUrl = await createLemonCheckout({
      userId: user.id,
      userEmail: user.email!,
      plan: plan as PlanType,
      cycle: cycle as BillingCycle,
    });

    const response: CheckoutResponse = {
      success: true,
      provider: 'lemon',
      checkoutUrl,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[CHECKOUT] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: `Checkout failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
