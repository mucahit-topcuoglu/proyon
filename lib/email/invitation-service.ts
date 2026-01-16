'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/actions';
import { getInvitationEmailTemplate } from '@/lib/email/templates/invitation-template';
import type { MemberRole } from '@/types';

interface SendProjectInvitationParams {
  invitationId: string;
  recipientEmail: string;
  inviterUserId: string;
  projectId: string;
  role: MemberRole;
  categoryIds: string[];
  token: string;
}

export async function sendProjectInvitationEmail(
  params: SendProjectInvitationParams
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use admin client to bypass RLS
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Get inviter info from admin client
    const { data: inviterData, error: inviterError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', params.inviterUserId)
      .single();

    let inviterName: string;
    let inviterEmail: string;

    if (inviterError || !inviterData) {
      // Fallback: Try to get from auth.users
      const { data: { user: inviter } } = await supabaseAdmin.auth.admin.getUserById(params.inviterUserId);
      if (!inviter) {
        throw new Error('Davet gönderen kullanıcı bulunamadı');
      }
      inviterName = inviter.user_metadata?.full_name || inviter.email || 'Bir kullanıcı';
      inviterEmail = inviter.email || '';
    } else {
      inviterName = inviterData.full_name || inviterData.email || 'Bir kullanıcı';
      inviterEmail = inviterData.email || '';
    }

    // 2. Get project info
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('title, description')
      .eq('id', params.projectId)
      .single();

    if (projectError || !project) {
      throw new Error('Proje bilgileri alınamadı');
    }

    // 3. Get category names
    let categoryNames: string[] = [];
    if (params.categoryIds.length > 0) {
      const { data: categories } = await supabaseAdmin
        .from('roadmap_categories')
        .select('name')
        .in('id', params.categoryIds);

      categoryNames = categories?.map(cat => cat.name) || [];
    }

    // 4. Check if user exists
    const { data: existingUsers } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', params.recipientEmail);

    const isNewUser = !existingUsers || existingUsers.length === 0;

    // 5. Generate invitation URL with proper domain
    // Use production domain directly to avoid Vercel URL issues
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://y-beta-beryl.vercel.app'
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    
    const invitationUrl = `${baseUrl}/invitation?token=${params.token}`;
    
    console.log('🔗 Davet linki oluşturuldu:', {
      env: process.env.NODE_ENV,
      baseUrl,
      invitationUrl,
      token: params.token.substring(0, 10) + '...',
    });

    // 6. Calculate expiry date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 7. Generate email template
    const template = getInvitationEmailTemplate({
      inviterName,
      inviterEmail,
      projectTitle: project.title,
      projectDescription: project.description || undefined,
      role: params.role,
      categories: categoryNames,
      invitationUrl,
      expiresAt,
      isNewUser,
    });

    // 8. Send email
    const emailResult = await sendEmail({
      to: params.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Email gönderilemedi');
    }

    // 9. Update invitation record with admin client
    await supabaseAdmin
      .from('project_invitations')
      .update({
        email_sent_at: new Date().toISOString(),
      })
      .eq('id', params.invitationId);

    console.log('✅ Davet emaili gönderildi:', {
      to: params.recipientEmail,
      project: project.title,
      role: params.role,
      isNewUser,
    });

    return { success: true };
  } catch (error: any) {
    console.error('❌ Davet emaili gönderilemedi:', error);
    return {
      success: false,
      error: error.message || 'Davet emaili gönderilemedi',
    };
  }
}
