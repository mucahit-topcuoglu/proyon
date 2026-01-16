import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Check if likes_count column exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'public_shares' 
          AND column_name = 'likes_count';
        `
      });

    const hasLikesColumn = columns && columns.length > 0;

    // Check if public_share_likes table exists
    const { data: tables, error: tablesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name = 'public_share_likes';
        `
      });

    const hasLikesTable = tables && tables.length > 0;

    return NextResponse.json({
      status: 'ok',
      hasLikesColumn,
      hasLikesTable,
      message: hasLikesColumn && hasLikesTable 
        ? '✅ Beğeni sistemi kurulu' 
        : '⚠️ Migration gerekli',
      instructions: !hasLikesColumn || !hasLikesTable
        ? 'Supabase Dashboard -> SQL Editor\'da migration dosyasını çalıştırın'
        : null
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      note: 'exec_sql RPC fonksiyonu yoksa Supabase Dashboard kullanın'
    }, { status: 500 });
  }
}
