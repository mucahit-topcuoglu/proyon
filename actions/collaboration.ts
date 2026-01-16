'use server';

/**
 * 🤝 Project Collaboration Actions
 * 
 * Ekip yönetimi ve davet işlemleri
 * - Ekip üyesi ekleme/çıkarma
 * - Davet gönderme/iptal etme
 * - Rol değiştirme
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { sendInvitationEmail } from '@/lib/supabase-email';
import { sendProjectInvitationEmail } from '@/lib/email/invitation-service';
import { logMemberInvited, logMemberJoined, logActivity } from './activityLogs';
import { createNotification } from './notifications';
import { ActivityType, NotificationType } from '@/types';

// Admin client for server actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// =============================================
// TEAM MEMBERS
// =============================================

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true });

    if (error) throw error;

    // Manually fetch user details for each member
    const membersWithUsers = await Promise.all(
      (data || []).map(async (member: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
        return {
          ...member,
          user: userData?.user || null,
        };
      })
    );

    return {
      success: true,
      members: membersWithUsers,
    };
  } catch (error: any) {
    console.error('Get members error:', error);
    return {
      success: false,
      error: error.message || 'Ekip üyeleri yüklenemedi',
    };
  }
}

/**
 * Remove a member from project
 */
export async function removeMember(projectId: string, memberId: string, removedBy: string) {
  try {
    // Get member info before deletion
    const { data: member } = await supabase
      .from('project_members')
      .select('user_id')
      .eq('id', memberId)
      .single() as { data: { user_id: string } | null };

    // Delete member
    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('id', memberId)
      .eq('project_id', projectId);

    if (error) throw error;

    // Also clean up old invitations for this user so they can be re-invited
    if (member) {
      const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
      const userEmail = userData?.user?.email;
      
      if (userEmail) {
        await supabase
          .from('project_invitations')
          .delete()
          .eq('project_id', projectId)
          .eq('email', userEmail);
        
        console.log(`🧹 Cleaned up old invitations for ${userEmail}`);
      }

      // Log activity
      await logActivity({
        project_id: projectId,
        user_id: removedBy,
        type: ActivityType.MEMBER_REMOVED,
        action: `${userData?.user?.user_metadata?.full_name || userEmail || 'Üye'} projeden çıkarıldı`,
        entity_type: 'member',
        entity_id: member.user_id,
      });
    }

    return {
      success: true,
      message: 'Üye projeden çıkarıldı',
    };
  } catch (error: any) {
    console.error('Remove member error:', error);
    return {
      success: false,
      error: error.message || 'Üye çıkarılamadı',
    };
  }
}

/**
 * Update member role and permissions
 */
export async function updateMemberRole(
  memberId: string,
  role: 'editor' | 'viewer',
  permissions: {
    can_edit?: boolean;
    can_manage_tasks?: boolean;
    can_invite?: boolean;
  }
) {
  try {
    const updates: any = { role };

    if (role === 'editor') {
      updates.can_edit = permissions.can_edit ?? true;
      updates.can_manage_tasks = permissions.can_manage_tasks ?? true;
      updates.can_invite = permissions.can_invite ?? false;
    } else {
      updates.can_edit = false;
      updates.can_manage_tasks = false;
      updates.can_invite = false;
    }

    // Get member and project info
    const { data: member } = await supabase
      .from('project_members')
      .select('user_id, project_id')
      .eq('id', memberId)
      .single() as { data: { user_id: string; project_id: string } | null };

    const { error } = await (supabase
      .from('project_members') as any)
      .update(updates)
      .eq('id', memberId);

    if (error) throw error;

    // Log activity
    if (member) {
      const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
      await logActivity({
        project_id: member.project_id,
        user_id: member.user_id,
        type: ActivityType.MEMBER_ROLE_CHANGED,
        action: `${userData?.user?.user_metadata?.full_name || 'Üye'} rolü ${role} olarak değiştirildi`,
        entity_type: 'member',
        entity_id: member.user_id,
        metadata: { new_role: role, permissions },
      });
    }

    return {
      success: true,
      message: 'Rol güncellendi',
    };
  } catch (error: any) {
    console.error('Update role error:', error);
    return {
      success: false,
      error: error.message || 'Rol güncellenemedi',
    };
  }
}

// =============================================
// INVITATIONS
// =============================================

/**
 * Send project invitation with professional email
 */
export async function inviteToProject(input: {
  projectId: string;
  email: string;
  role: 'editor' | 'viewer';
  invitedBy: string;
  categoryIds?: string[]; // Optional: restrict access to specific categories
}) {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return {
        success: false,
        error: 'Geçersiz email adresi formatı',
      };
    }

    // Check if user already invited (use maybeSingle to avoid error if not found)
    const { data: existingInvitations } = await supabase
      .from('project_invitations')
      .select('id, status')
      .eq('project_id', input.projectId)
      .eq('email', input.email);

    // Check for pending invitation
    const pendingInvitation = existingInvitations?.find((inv: any) => inv.status === 'pending');
    if (pendingInvitation) {
      return {
        success: false,
        error: 'Bu email adresine zaten bekleyen bir davet var',
      };
    }

    // Double-check if user is already a member by looking up their user_id
    // This is the SOURCE OF TRUTH - ignore old invitation records
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', input.email)
      .maybeSingle() as { data: { id: string } | null };

    if (userProfile) {
      const { data: member } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', input.projectId)
        .eq('user_id', userProfile.id)
        .maybeSingle();

      if (member) {
        return {
          success: false,
          error: 'Bu kullanıcı zaten proje üyesi',
        };
      }
    }

    // Clean up old invitations (expired, rejected, accepted) for this email+project
    // This prevents duplicate key constraint errors
    if (existingInvitations && existingInvitations.length > 0) {
      const oldInvitationIds = existingInvitations
        .filter((inv: any) => inv.status !== 'pending') // Keep pending, remove others
        .map((inv: any) => inv.id);
      
      if (oldInvitationIds.length > 0) {
        await supabase
          .from('project_invitations')
          .delete()
          .in('id', oldInvitationIds);
        
        console.log(`🧹 Cleaned up ${oldInvitationIds.length} old invitation(s) for ${input.email}`);
      }
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const { data, error } = await (supabase
      .from('project_invitations')
      .insert({
        project_id: input.projectId,
        email: input.email,
        invited_by: input.invitedBy,
        role: input.role,
        token,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        category_ids: input.categoryIds || [], // Store category restrictions
      } as any)
      .select()
      .single() as any);

    if (error || !data) throw error || new Error('Davet oluşturulamadı');

    // Send professional invitation email
    try {
      await sendProjectInvitationEmail({
        invitationId: data.id,
        recipientEmail: input.email,
        inviterUserId: input.invitedBy,
        projectId: input.projectId,
        role: input.role.toUpperCase() as any, // Convert 'editor' -> 'EDITOR'
        categoryIds: input.categoryIds || [],
        token,
      });
      console.log('✅ Profesyonel davet emaili gönderildi:', input.email);
    } catch (emailError) {
      console.error('❌ Email gönderilemedi (davet oluşturuldu ama email gitmedi):', emailError);
      // Continue anyway - invitation is created
    }
    
    // Generate invitation link with proper domain
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000');
    const invitationUrl = `${baseUrl}/invitation?token=${token}`;
    
    // Also log for development
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 DAVET OLUŞTURULDU');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Alıcı:', input.email);
    console.log('Rol:', input.role);
    console.log('Kategoriler:', input.categoryIds?.length ? input.categoryIds.join(', ') : 'Tüm kategoriler');
    console.log('Davet Linki:', invitationUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Log activity
    await logMemberInvited({
      projectId: input.projectId,
      userId: input.invitedBy,
      invitedEmail: input.email,
      role: input.role,
    });

    // Send notification to invited user if they have an account
    try {
      // Check if user exists
      const { data: invitedUserData } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', input.email)
        .single() as { data: { id: string; email: string } | null };

      if (invitedUserData) {
        // Get project info
        const { data: projectData } = await supabase
          .from('projects')
          .select('title')
          .eq('id', input.projectId)
          .single() as { data: { title: string } | null };

        // Get inviter info
        const { data: inviterData } = await supabase.auth.admin.getUserById(input.invitedBy);
        const inviterName = inviterData?.user?.user_metadata?.full_name || 'Bir kullanıcı';

        // Create notification
        await createNotification({
          user_id: invitedUserData.id,
          type: NotificationType.INVITATION_RECEIVED,
          title: 'Yeni Proje Daveti',
          message: `${inviterName} sizi "${projectData?.title || 'bir proje'}" projesine davet etti`,
          link: `/invitation?token=${token}`,
          metadata: {
            project_id: input.projectId,
            inviter_id: input.invitedBy,
            role: input.role,
          },
        });
      }
    } catch (notifError) {
      console.error('Notification creation failed:', notifError);
      // Don't fail the invitation if notification fails
    }

    return {
      success: true,
      data,
      invitationUrl, // Return the URL so it can be copied
      message: `Davet oluşturuldu. Link: ${invitationUrl}`,
    };
  } catch (error: any) {
    console.error('Invite error:', error);
    return {
      success: false,
      error: error.message || 'Davet gönderilemedi',
    };
  }
}

/**
 * Get pending invitations for a project
 */
export async function getProjectInvitations(projectId: string) {
  try {
    const { data, error } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Manually fetch inviter details for each invitation
    const invitationsWithInviters = await Promise.all(
      (data || []).map(async (invitation: any) => {
        const { data: userData } = await supabase.auth.admin.getUserById(invitation.invited_by);
        return {
          ...invitation,
          inviter: userData?.user || null,
        };
      })
    );

    return {
      success: true,
      invitations: invitationsWithInviters,
    };
  } catch (error: any) {
    console.error('Get invitations error:', error);
    return {
      success: false,
      error: error.message || 'Davetler yüklenemedi',
    };
  }
}

/**
 * Cancel/delete invitation
 */
export async function cancelInvitation(invitationId: string) {
  try {
    const { error } = await supabase
      .from('project_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;

    return {
      success: true,
      message: 'Davet iptal edildi',
    };
  } catch (error: any) {
    console.error('Cancel invitation error:', error);
    return {
      success: false,
      error: error.message || 'Davet iptal edilemedi',
    };
  }
}

/**
 * Get invitation details by token (for invitation page)
 */
export async function getInvitationByToken(token: string) {
  try {
    const { data: invitation, error } = await supabase
      .from('project_invitations')
      .select(`
        *,
        projects (
          id,
          title,
          description
        )
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .single() as { data: any; error: any };

    if (error || !invitation) {
      return {
        success: false,
        error: 'Geçersiz veya süresi dolmuş davet',
      };
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      await (supabase
        .from('project_invitations') as any)
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return {
        success: false,
        error: 'Davet süresi dolmuş',
      };
    }

    return {
      success: true,
      invitation,
    };
  } catch (error: any) {
    console.error('Get invitation error:', error);
    return {
      success: false,
      error: error.message || 'Davet bilgileri alınamadı',
    };
  }
}

/**
 * Accept project invitation
 */
export async function acceptInvitation(token: string, userId: string) {
  try {
    console.log('🔄 Davet kabul ediliyor:', { token: token.substring(0, 10) + '...', userId });

    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single() as { data: any; error: any };

    if (invError || !invitation) {
      console.error('❌ Davet bulunamadı:', invError);
      return {
        success: false,
        error: 'Geçersiz veya süresi dolmuş davet',
      };
    }

    console.log('✅ Davet bulundu:', { projectId: invitation.project_id, role: invitation.role });

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      console.error('❌ Davet süresi dolmuş');
      await (supabase
        .from('project_invitations') as any)
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return {
        success: false,
        error: 'Davet süresi dolmuş',
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', invitation.project_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      console.log('⚠️ Kullanıcı zaten üye');
      // Mark invitation as accepted anyway
      await (supabase
        .from('project_invitations') as any)
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      return {
        success: true,
        projectId: invitation.project_id,
        message: 'Zaten proje üyesisiniz',
      };
    }

    // Add user as member
    const permissions = invitation.role === 'editor' 
      ? { can_edit: true, can_manage_tasks: true, can_invite: false }
      : { can_edit: false, can_manage_tasks: false, can_invite: false };

    console.log('📝 Adding member with permissions:', {
      project_id: invitation.project_id,
      user_id: userId,
      role: invitation.role,
      category_ids: invitation.category_ids || [],
      ...permissions,
    });

    const { data: newMember, error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: invitation.project_id,
        user_id: userId,
        role: invitation.role,
        invited_by: invitation.invited_by,
        category_ids: invitation.category_ids || [], // CRITICAL: Include category restrictions
        ...permissions,
      } as any)
      .select()
      .single();

    if (memberError) {
      console.error('❌ Üye ekleme hatası:', memberError);
      throw memberError;
    }

    console.log('✅ Üye başarıyla eklendi:', newMember);

    // Double-check: Verify member was actually added by re-querying
    const { data: verifyMember, error: verifyError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', invitation.project_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (verifyError || !verifyMember) {
      console.error('❌ CRITICAL: Member added but verification failed!', verifyError);
      throw new Error('Üyelik kaydı doğrulanamadı. Lütfen tekrar deneyin.');
    }

    console.log('✅✅ Üyelik doğrulandı:', verifyMember);

    // Mark invitation as accepted
    await (supabase
      .from('project_invitations') as any)
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    console.log('✅ Davet güncellendi');

    // Get user info for activity log
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    // Log activity
    await logMemberJoined({
      projectId: invitation.project_id,
      userId: userId,
      userName: userData?.user?.user_metadata?.full_name || userData?.user?.email || 'Kullanıcı',
    });

    console.log('✅ Activity log kaydedildi');

    // Send notification to project owner
    try {
      const { data: projectData } = await supabase
        .from('projects')
        .select('user_id, title')
        .eq('id', invitation.project_id)
        .single() as { data: { user_id: string; title: string } | null };

      if (projectData) {
        const userName = userData?.user?.user_metadata?.full_name || userData?.user?.email || 'Bir kullanıcı';
        
        await createNotification({
          user_id: projectData.user_id,
          type: NotificationType.INVITATION_ACCEPTED,
          title: 'Davet Kabul Edildi',
          message: `${userName} "${projectData.title}" projesine katıldı`,
          link: `/dashboard/projects/${invitation.project_id}`,
          metadata: {
            project_id: invitation.project_id,
            user_id: userId,
          },
        });

        console.log('✅ Bildirim gönderildi');
      }
    } catch (notifError) {
      console.error('⚠️ Notification creation failed:', notifError);
    }

    console.log('🎉 Davet kabul işlemi tamamlandı');

    return {
      success: true,
      projectId: invitation.project_id,
      message: 'Projeye katıldınız!',
    };
  } catch (error: any) {
    console.error('❌ Accept invitation error:', error);
    return {
      success: false,
      error: error.message || 'Davet kabul edilemedi',
    };
  }
}

/**
 * Reject project invitation
 */
export async function rejectInvitation(token: string) {
  try {
    console.log('🚫 Davet reddediliyor:', token.substring(0, 10) + '...');

    // Get invitation details first
    const { data: invitation, error: invError } = await supabase
      .from('project_invitations')
      .select('*, projects(user_id, title)')
      .eq('token', token)
      .maybeSingle() as { data: any; error: any };

    if (invError || !invitation) {
      console.error('❌ Davet bulunamadı:', invError);
      return {
        success: false,
        error: 'Davet bulunamadı',
      };
    }

    console.log('✅ Davet bulundu, reddediliyor...');

    // Update invitation status
    const { error } = await (supabase
      .from('project_invitations') as any)
      .update({ status: 'rejected' })
      .eq('token', token);

    if (error) throw error;

    console.log('✅ Davet durumu güncellendi');

    // Send notification to project owner
    try {
      if (invitation.projects) {
        await createNotification({
          user_id: invitation.projects.user_id,
          type: NotificationType.INVITATION_REJECTED,
          title: 'Davet Reddedildi',
          message: `${invitation.email} "${invitation.projects.title}" projesine katılma davetini reddetti`,
          link: `/dashboard/projects/${invitation.project_id}`,
          metadata: {
            project_id: invitation.project_id,
            email: invitation.email,
          },
        });
        console.log('✅ Ret bildirimi gönderildi');
      } else {
        console.log('⚠️ Proje bilgisi bulunamadı, bildirim gönderilemedi');
      }
    } catch (notifError) {
      console.error('❌ Notification creation failed:', notifError);
    }

    console.log('🎉 Davet reddetme işlemi tamamlandı');

    return {
      success: true,
      message: 'Davet reddedildi',
    };
  } catch (error: any) {
    console.error('Reject invitation error:', error);
    return {
      success: false,
      error: error.message || 'Davet reddedilemedi',
    };
  }
}
