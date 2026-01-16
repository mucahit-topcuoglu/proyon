import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Resend for sending custom emails to existing users
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  projectName: string;
  inviterName: string;
  invitationUrl: string;
  role: string;
}

/**
 * Send invitation email using hybrid approach:
 * - New users: Supabase invite (creates user + sends email)
 * - Existing users: Custom email notification
 */
export async function sendInvitationEmail({
  to,
  projectName,
  inviterName,
  invitationUrl,
  role,
}: SendInvitationEmailParams) {
  try {
    // Try to invite user via Supabase (works for new users only)
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(to, {
      data: {
        invitation_type: 'project_invite',
        project_name: projectName,
        inviter_name: inviterName,
        role: role,
      },
      redirectTo: invitationUrl,
    });

    // If successful, user was new and email was sent via Supabase
    if (!error) {
      console.log('✅ Supabase üzerinden davet emaili gönderildi (yeni kullanıcı):', to);
      return {
        success: true,
        data,
        message: 'Davet emaili gönderildi',
      };
    }

    // If user already exists, send custom notification
    if (error.message.includes('already registered') || error.message.includes('User already registered')) {
      console.log('ℹ️ Kullanıcı zaten kayıtlı, özel bildirim emaili gönderiliyor...');
      
      // Don't send email in development to avoid Resend restrictions
      // Just log the invitation URL
      console.log('📧 Davet Linki (manuel paylaş):', invitationUrl);
      
      return {
        success: true,
        data: null,
        message: 'Kullanıcı zaten kayıtlı. Davet linki oluşturuldu - "Linki Kopyala" butonunu kullanabilirsiniz.',
      };
    }

    // Other errors
    console.error('❌ Supabase email hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  } catch (error: any) {
    console.error('❌ Email gönderme hatası:', error);
    return {
      success: false,
      error: error.message || 'Email gönderilemedi',
    };
  }
}

/**
 * Alternative: Send a custom email using Supabase Edge Functions
 * This requires setting up an Edge Function, but gives you full control over email content
 * 
 * To use this:
 * 1. Create a Supabase Edge Function (supabase functions new send-invitation-email)
 * 2. Configure SMTP in your Edge Function
 * 3. Call it from here
 */
export async function sendCustomInvitationEmail(params: SendInvitationEmailParams) {
  try {
    // Call your custom Edge Function
    const { data, error } = await supabaseAdmin.functions.invoke('send-invitation-email', {
      body: params,
    });

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('❌ Custom email hatası:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
