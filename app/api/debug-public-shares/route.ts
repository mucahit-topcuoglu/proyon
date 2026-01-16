import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Normal client (RLS enabled)
    const supabase = await createClient();
    
    const { data: normalData, error: normalError } = await supabase
      .from('public_shares')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          tags,
          created_at,
          user_id,
          status
        )
      `)
      .eq('is_active', true);

    // Service client (RLS bypassed)
    const serviceClient = createServiceClient();
    
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('public_shares')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          tags,
          created_at,
          user_id,
          status
        )
      `)
      .eq('is_active', true);

    // All shares (including inactive)
    const { data: allShares, error: allError } = await serviceClient
      .from('public_shares')
      .select('*');

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      results: {
        withRLS: {
          count: normalData?.length || 0,
          data: normalData,
          error: normalError,
        },
        withoutRLS: {
          count: serviceData?.length || 0,
          data: serviceData,
          error: serviceError,
        },
        allShares: {
          count: allShares?.length || 0,
          active: allShares?.filter(s => s.is_active).length || 0,
          inactive: allShares?.filter(s => !s.is_active).length || 0,
          data: allShares,
          error: allError,
        }
      },
      analysis: {
        rlsBlocking: (serviceData?.length || 0) > (normalData?.length || 0),
        hasShares: (allShares?.length || 0) > 0,
        hasActiveShares: (allShares?.filter(s => s.is_active).length || 0) > 0,
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
