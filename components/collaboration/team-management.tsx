'use client';

/**
 * 👥 Team Management Component
 * 
 * Proje ekip üyelerini yönetme
 * - Mevcut üyeleri görüntüleme
 * - Yeni üye davet etme
 * - Rol değiştirme
 * - Üye çıkarma
 * - Kategori bazlı yetkilendirme
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryPermissionManager } from './category-permission-manager';
import { getProjectCategories, grantCategoryAccess } from '@/actions/roadmapCategories';
import {
  getProjectMembers,
  inviteToProject,
  removeMember,
  updateMemberRole,
  getProjectInvitations,
  cancelInvitation,
} from '@/actions/collaboration';
import {
  Users,
  Mail,
  Trash2,
  Crown,
  Edit3,
  Eye,
  Loader2,
  UserPlus,
  X,
  CheckCircle2,
  Clock,
  Shield,
  FolderKanban,
} from 'lucide-react';

interface TeamManagementProps {
  projectId: string;
  userId: string;
  isOwner: boolean;
  open: boolean;
  onClose: () => void;
}

export function TeamManagement({
  projectId,
  userId,
  isOwner,
  open,
  onClose,
}: TeamManagementProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteCategories, setInviteCategories] = useState<string[]>([]); // Selected category IDs for invite
  const [projectCategories, setProjectCategories] = useState<any[]>([]); // All project categories

  // Category permissions
  const [showCategoryPermissions, setShowCategoryPermissions] = useState(false);
  const [selectedMember, setSelectedMember] = useState<{id: string; name: string} | null>(null);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, projectId]);

  async function loadData() {
    setLoading(true);
    
    // Load members
    const membersResult = await getProjectMembers(projectId);
    if (membersResult.success) {
      setMembers(membersResult.members || []);
      console.log('👥 TeamManagement members loaded:', membersResult.members);
      console.log('👑 isOwner:', isOwner);
    }

    // Load pending invitations
    const invitationsResult = await getProjectInvitations(projectId);
    if (invitationsResult.success) {
      setInvitations(invitationsResult.invitations || []);
    }

    // Load project categories
    const categoriesResult = await getProjectCategories(projectId);
    if (categoriesResult.success && categoriesResult.categories) {
      setProjectCategories(categoriesResult.categories);
      console.log('📁 Project categories loaded:', categoriesResult.categories);
    }

    setLoading(false);
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      setMessage('❌ Email adresi gerekli');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setMessage('❌ Geçersiz email adresi formatı (örnek: kullanici@example.com)');
      return;
    }

    setInviting(true);
    setMessage('');

    const result = await inviteToProject({
      projectId,
      email: inviteEmail.trim().toLowerCase(), // Normalize email
      role: inviteRole,
      invitedBy: userId,
    });

    if (result.success) {
      // Show invitation link that can be copied
      const invitationLink = (result as any).invitationUrl;
      if (invitationLink) {
        // Copy to clipboard
        navigator.clipboard.writeText(invitationLink);
        setMessage(`✅ Davet linki kopyalandı! Panoya yapıştırılabilir: ${invitationLink.substring(0, 50)}...`);
        
        // Note: Category permissions will be set after user accepts invitation
        // For now, we clear the form
      } else {
        setMessage(`✅ ${result.message}`);
      }
      
      // Reset form
      setInviteEmail('');
      setInviteCategories([]);
      setShowInviteForm(false);
      loadData();
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setInviting(false);
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm('Bu üyeyi projeden çıkarmak istediğinizden emin misiniz?')) {
      return;
    }

    // Pass current user ID as removedBy parameter
    const result = await removeMember(projectId, memberId, userId);
    if (result.success) {
      setMessage(`✅ ${result.message}`);
      loadData();
    } else {
      setMessage(`❌ ${result.error}`);
    }
  }

  async function handleCancelInvitation(invitationId: string) {
    const result = await cancelInvitation(invitationId);
    if (result.success) {
      setMessage(`✅ ${result.message}`);
      loadData();
    } else {
      setMessage(`❌ ${result.error}`);
    }
  }

  async function handleRoleChange(memberId: string, newRole: 'editor' | 'viewer') {
    const result = await updateMemberRole(memberId, newRole, {});
    if (result.success) {
      setMessage(`✅ ${result.message}`);
      loadData();
    } else {
      setMessage(`❌ ${result.error}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
        {/* Show Category Permission Manager if selected, otherwise show team list */}
        {showCategoryPermissions && selectedMember ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-violet-400" />
                Kategori İzinleri
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedMember.name} için kategori bazlı yetkilendirme
              </DialogDescription>
            </DialogHeader>
            
            <CategoryPermissionManager
              projectId={projectId}
              userId={userId}
              memberUserId={selectedMember.id}
              memberName={selectedMember.name}
              onClose={() => {
                setShowCategoryPermissions(false);
                setSelectedMember(null);
                loadData();
              }}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-violet-400" />
                Ekip Yönetimi
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Proje ekip üyelerini yönetin ve yeni üyeler davet edin
              </DialogDescription>
            </DialogHeader>

            {/* Message */}
            {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg text-sm ${
              message.startsWith('✅')
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {message}
          </motion.div>
        )}

            <div className="space-y-6">
          {/* Invite Button */}
          {isOwner && !showInviteForm && (
            <Button
              onClick={() => setShowInviteForm(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Yeni Üye Davet Et
            </Button>
          )}

          {/* Invite Form */}
          <AnimatePresence>
            {showInviteForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Üye Davet Et</h3>
                  <button
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                      setInviteCategories([]);
                      setMessage('');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Adresi
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="kullanici@example.com"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rol
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setInviteRole('editor')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inviteRole === 'editor'
                          ? 'border-violet-500 bg-violet-500/20 text-white'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Edit3 className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Editor</div>
                      <div className="text-xs text-slate-500">Düzenleme yapabilir</div>
                    </button>
                    <button
                      onClick={() => setInviteRole('viewer')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        inviteRole === 'viewer'
                          ? 'border-cyan-500 bg-cyan-500/20 text-white'
                          : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Eye className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-sm font-medium">Viewer</div>
                      <div className="text-xs text-slate-500">Sadece görüntüleyebilir</div>
                    </button>
                  </div>
                </div>

                {/* Category Selection */}
                {projectCategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Kategori Erişimi (Opsiyonel)
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Üyenin erişebileceği kategorileri seçin. Boş bırakılırsa tüm kategorilere erişim verilir.
                    </p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {projectCategories.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={inviteCategories.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInviteCategories([...inviteCategories, cat.id]);
                              } else {
                                setInviteCategories(inviteCategories.filter(id => id !== cat.id));
                              }
                            }}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500"
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-sm text-white">{cat.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Davet Gönder
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Members */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Ekip Üyeleri ({members.length})
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                Henüz ekip üyesi yok
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {member.user?.user_metadata?.full_name?.charAt(0) || 
                             member.user?.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">
                            {member.user?.user_metadata?.full_name || 'Kullanıcı'}
                          </div>
                          <div className="text-sm text-slate-400">
                            {member.user?.email}
                          </div>
                          {member.joined_at && (
                            <div className="text-xs text-slate-500 mt-1">
                              📅 Katıldı: {new Date(member.joined_at).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Role Badge */}
                        <Badge
                          className={
                            member.role === 'owner'
                              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              : member.role === 'editor'
                              ? 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                              : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                          }
                        >
                          {member.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                          {member.role === 'editor' && <Edit3 className="w-3 h-3 mr-1" />}
                          {member.role === 'viewer' && <Eye className="w-3 h-3 mr-1" />}
                          {member.role === 'owner' ? 'Sahip' : member.role === 'editor' ? 'Editor' : 'Viewer'}
                        </Badge>

                        {/* Actions (only for owner) */}
                        {isOwner && member.role !== 'owner' && (
                          <div className="flex gap-1">
                            {/* Category Permissions */}
                            <button
                              onClick={() => {
                                const memberName = member.user?.user_metadata?.full_name || member.user?.email || 'Kullanıcı';
                                setSelectedMember({ id: member.user_id, name: memberName });
                                setShowCategoryPermissions(true);
                              }}
                              className="p-2 text-slate-400 hover:text-fuchsia-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Kategori izinleri"
                            >
                              <FolderKanban className="w-4 h-4" />
                            </button>

                            {/* Role Switch */}
                            <button
                              onClick={() =>
                                handleRoleChange(
                                  member.id,
                                  member.role === 'editor' ? 'viewer' : 'editor'
                                )
                              }
                              className="p-2 text-slate-400 hover:text-violet-400 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Rolü değiştir"
                            >
                              <Shield className="w-4 h-4" />
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Projeden çıkar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permissions */}
                    {member.role !== 'owner' && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        {member.can_edit && (
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Düzenleyebilir
                          </Badge>
                        )}
                        {member.can_manage_tasks && (
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Görev yönetebilir
                          </Badge>
                        )}
                        {member.can_invite && (
                          <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Davet gönderebilir
                          </Badge>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Bekleyen Davetler ({invitations.length})
              </h3>

              <div className="space-y-2">
                {invitations.map((invitation) => {
                  const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invitation?token=${invitation.token}`;
                  const expiresDate = new Date(invitation.expires_at);
                  const isExpired = expiresDate < new Date();
                  
                  return (
                    <motion.div
                      key={invitation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${
                        isExpired 
                          ? 'bg-red-500/10 border-red-500/30' 
                          : 'bg-orange-500/10 border-orange-500/30'
                      } border rounded-lg p-4`}
                    >
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="text-white font-medium">{invitation.email}</div>
                              {isExpired && (
                                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                                  Süresi Doldu
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-slate-400 mt-1">
                              {invitation.role === 'editor' ? 'Editor' : 'Viewer'} olarak davet edildi
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              📅 {new Date(invitation.created_at).toLocaleDateString('tr-TR')}
                              {' · '}
                              ⏰ Son geçerlilik: {expiresDate.toLocaleDateString('tr-TR')}
                            </div>
                          </div>

                          {isOwner && (
                            <button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              className="p-2 text-orange-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Daveti iptal et"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Actions */}
                        {isOwner && !isExpired && (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(invitationUrl);
                                setMessage('✅ Davet linki kopyalandı!');
                                setTimeout(() => setMessage(''), 3000);
                              }}
                              className="text-xs"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Linki Kopyala
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async () => {
                                // Resend invitation email
                                const result = await inviteToProject({
                                  projectId,
                                  email: invitation.email,
                                  role: invitation.role,
                                  invitedBy: userId,
                                });
                                if (result.success) {
                                  setMessage('✅ Davet emaili yeniden gönderildi!');
                                } else {
                                  setMessage('❌ Email gönderilemedi');
                                }
                              }}
                              className="text-xs"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Emaili Yeniden Gönder
                            </Button>
                          </div>
                        )}

                        {/* Expired notice */}
                        {isExpired && isOwner && (
                          <div className="text-xs text-red-400">
                            Bu davet süresi doldu. Yeni bir davet göndermeniz gerekiyor.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
