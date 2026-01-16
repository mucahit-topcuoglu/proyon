/**
 * Email Verification Actions
 * Custom email verification system with 6-digit codes
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/actions';
import { getVerificationEmailTemplate } from '@/lib/email/templates';

/**
 * 6 haneli rastgele doğrulama kodu oluştur
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Email doğrulama kodu oluştur ve gönder
 */
export async function createVerificationCode(
  email: string,
  type: 'signup' | 'password_reset' | 'email_change' = 'signup'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Kod oluştur
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika

    // Veritabanına kaydet
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('DB error creating verification code:', dbError);
      return { success: false, error: 'Doğrulama kodu oluşturulamadı' };
    }

    // Email gönder
    const userName = email.split('@')[0];
    const template = getVerificationEmailTemplate({
      to: email,
      code,
      userName,
      expiresIn: '10 dakika',
    });

    const emailResult = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!emailResult.success) {
      console.error('Email send error:', emailResult.error);
      return { success: false, error: 'Email gönderilemedi' };
    }

    return { success: true };
  } catch (error) {
    console.error('Create verification code error:', error);
    return { success: false, error: 'Bir hata oluştu' };
  }
}

/**
 * Doğrulama kodunu kontrol et
 */
export async function verifyCode(
  email: string,
  code: string,
  type: 'signup' | 'password_reset' | 'email_change' = 'signup'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Kodu bul
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('type', type)
      .is('used_at', null)
      .single();

    if (error || !data) {
      return { success: false, error: 'Geçersiz doğrulama kodu' };
    }

    // Süre kontrolü
    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: 'Doğrulama kodu süresi dolmuş' };
    }

    // Kodu kullanıldı olarak işaretle
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      console.error('Update verification code error:', updateError);
      return { success: false, error: 'Kod doğrulanamadı' };
    }

    return { success: true };
  } catch (error) {
    console.error('Verify code error:', error);
    return { success: false, error: 'Bir hata oluştu' };
  }
}

/**
 * Kullanılmamış eski kodları temizle
 */
export async function cleanupExpiredCodes(): Promise<void> {
  try {
    const supabase = await createClient();
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    await supabase
      .from('verification_codes')
      .delete()
      .lt('expires_at', oneDayAgo.toISOString());
  } catch (error) {
    console.error('Cleanup expired codes error:', error);
  }
}

/**
 * Doğrulama kodu yeniden gönder (rate limit ile)
 */
export async function resendVerificationCode(
  email: string,
  type: 'signup' | 'password_reset' | 'email_change' = 'signup'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Son gönderilen kodu kontrol et (60 saniye rate limit)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const { data: recentCode } = await supabase
      .from('verification_codes')
      .select('created_at')
      .eq('email', email)
      .eq('type', type)
      .gte('created_at', oneMinuteAgo.toISOString())
      .single();

    if (recentCode) {
      return { 
        success: false, 
        error: 'Lütfen 60 saniye bekleyip tekrar deneyin' 
      };
    }

    // Yeni kod oluştur
    return await createVerificationCode(email, type);
  } catch (error) {
    console.error('Resend verification code error:', error);
    return { success: false, error: 'Bir hata oluştu' };
  }
}
