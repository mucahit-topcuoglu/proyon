// ============================================================================
// SUBSCRIPTION STATUS API
// GET /api/subscription - Get current user's subscription
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getUserSubscription } from '@/lib/services/payment';
import type { SubscriptionInfo } from '@/types/payment';
import type { PlanType } from '@/lib/constants/pricing';

export async function GET(request: NextRequest) {
  try {
    // ========================================================================
    // AUTHENTICATE - Try Bearer token first, then cookies
    // ========================================================================
    let user = null;
    
    // Try Authorization header first (for client-side auth)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Use anon key with token in header
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
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get subscription
    const subscription = await getUserSubscription(user.id);

    if (!subscription) {
      const info: SubscriptionInfo = {
        hasPlan: false,
        plan: 'free',
        status: 'free_tier',
        daysRemaining: 0,
        isAutoRenew: false,
        canUpgrade: true,
      };
      return NextResponse.json(info);
    }

    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    const daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isActive = subscription.status === 'active' || subscription.status === 'free_tier';

    const info: SubscriptionInfo = {
      hasPlan: isActive && daysRemaining > 0,
      plan: subscription.plan_type as PlanType,
      status: subscription.status,
      provider: subscription.provider,
      daysRemaining,
      expiresAt: subscription.current_period_end,
      isAutoRenew: subscription.is_auto_renew,
      canUpgrade: subscription.plan_type === 'free' || subscription.plan_type === 'plus',
    };

    return NextResponse.json(info);

  } catch (error) {
    console.error('[SUBSCRIPTION API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}
