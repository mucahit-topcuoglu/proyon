/**
 * Email Verification API Route
 * POST /api/auth/verify - Doğrulama kodunu kontrol et
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCode, resendVerificationCode } from '@/actions/emailVerification';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, action } = body;

    // Resend code
    if (action === 'resend') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email gerekli' },
          { status: 400 }
        );
      }

      const result = await resendVerificationCode(email, 'signup');
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Doğrulama kodu tekrar gönderildi',
      });
    }

    // Verify code
    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email ve kod gerekli' },
        { status: 400 }
      );
    }

    // Kodu doğrula
    const verifyResult = await verifyCode(email, code, 'signup');

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error },
        { status: 400 }
      );
    }

    // Başarılı! Supabase'de email confirmation disabled olduğu için
    // kullanıcı zaten confirmed. Sadece verification_codes'u mark ettik.
    return NextResponse.json({
      success: true,
      message: 'Email başarıyla doğrulandı',
    });
  } catch (error) {
    console.error('Verification API error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
