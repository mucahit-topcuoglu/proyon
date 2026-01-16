import { NextRequest, NextResponse } from 'next/server';
import { parseDocument } from '@/lib/fileParser';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya çok büyük (max 10MB)' },
        { status: 400 }
      );
    }

    // Parse document
    const text = await parseDocument(file);
    
    // Upload to Supabase Storage - USE SERVICE ROLE to bypass RLS
    const supabase = createServiceClient();
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeFileName}`;
    const storagePath = `documents/${fileName}`;
    
    try {
      // Upload to Supabase Storage (RLS bypassed with service role)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        return NextResponse.json(
          { error: 'Dosya yüklenemedi: ' + uploadError.message },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(storagePath);

      console.log('✅ Dosya Supabase Storage\'a yüklendi:', publicUrl);

      return NextResponse.json({
        success: true,
        text,
        url: publicUrl,
        filename: file.name,
        size: file.size,
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      return NextResponse.json(
        { error: 'Dosya yüklenemedi: ' + (error as Error).message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Document parse error:', error);
    return NextResponse.json(
      { error: error.message || 'Dosya parse edilemedi' },
      { status: 500 }
    );
  }
}
