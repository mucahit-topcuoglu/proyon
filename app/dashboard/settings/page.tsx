'use client';

/**
 * ⚙️ Settings & Profile Page
 * 
 * Kullanıcı profili ve hesap ayarları
 * - Profil bilgileri düzenleme
 * - Şifre değiştirme
 * - Email güncelleme
 * - Hesap tercihleri
 * - Tehlikeli bölge (hesap silme)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { auth, supabase } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientText } from '@/components/proyon';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Bell,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Settings as SettingsIcon,
  Shield,
  Palette,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Profile Form
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  
  // Feedback
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      setLoading(true);
      const { data: sessionData } = await auth.getSession();
      
      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const currentUser = sessionData.session.user;
      setUser(currentUser);
      setEmail(currentUser.email || '');
      setFullName(currentUser.user_metadata?.full_name || '');
      setBio(currentUser.user_metadata?.bio || '');
      
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          bio: bio,
        }
      });

      if (error) throw error;

      setSuccessMessage('✅ Profil bilgileri güncellendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Bir hata oluştu');
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor');
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalıdır');
      setSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setSuccessMessage('✅ Şifre başarıyla değiştirildi!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Şifre değiştirilemedi');
    } finally {
      setSaving(false);
    }
  }

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      });

      if (error) throw error;

      setSuccessMessage('✅ Email güncelleme linki gönderildi! Lütfen email\'inizi kontrol edin.');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Email güncellenemedi');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirm = window.confirm(
      '⚠️ UYARI: Hesabınızı silmek üzeresiniz!\n\n' +
      'Bu işlem GERİ ALINAMAZ ve tüm verileriniz silinecektir:\n' +
      '• Tüm projeleriniz\n' +
      '• Tüm roadmap\'leriniz\n' +
      '• Tüm ilerleme verileriniz\n\n' +
      'Devam etmek istediğinizden emin misiniz?'
    );

    if (!confirm) return;

    const doubleConfirm = window.prompt(
      'Hesabınızı silmek için "HESABIMI SIL" yazın:'
    );

    if (doubleConfirm !== 'HESABIMI SIL') {
      alert('İşlem iptal edildi');
      return;
    }

    try {
      setSaving(true);

      // Delete user's projects first (cascade will delete nodes)
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);

      if (projectsError) throw projectsError;

      // Note: Supabase Auth doesn't allow direct user deletion from client
      // You need to do this via Admin API or Auth Dashboard
      alert(
        '⚠️ Veri silme işlemi tamamlandı.\n\n' +
        'Hesap silme işlemini tamamlamak için lütfen destek ekibi ile iletişime geçin:\n' +
        'support@proyon.com'
      );

      router.push('/');
      
    } catch (error: any) {
      setErrorMessage(error.message || 'Hesap silinemedi');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
          <span className="text-slate-400">Ayarlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/10 to-slate-950">
      {/* Page Header */}
      <div className="border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <GradientText as="h1" className="text-3xl font-bold">
            ⚙️ Ayarlar
          </GradientText>
          <p className="text-slate-400 mt-2">
            Profil ve hesap ayarlarınızı yönetin
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-300">{successMessage}</span>
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{errorMessage}</span>
          </motion.div>
        )}

        {/* Profile Information */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Profil Bilgileri</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="Adınız ve soyadınız"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                placeholder="Kendiniz hakkında kısa bir açıklama..."
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </Button>
          </form>
        </motion.section>

        {/* Email Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">Email Adresi</h2>
          </div>

          <form onSubmit={handleEmailChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="email@example.com"
              />
              <p className="text-xs text-slate-500 mt-2">
                Email değiştirirseniz yeni adresinize bir doğrulama linki gönderilecektir.
              </p>
            </div>

            <Button
              type="submit"
              disabled={saving || email === user?.email}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Güncelle
                </>
              )}
            </Button>
          </form>
        </motion.section>

        {/* Password Change */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">Şifre Değiştir</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 pr-10"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Şifre Tekrar
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <Button
              type="submit"
              disabled={saving || !newPassword || !confirmPassword}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Değiştiriliyor...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Şifreyi Değiştir
                </>
              )}
            </Button>
          </form>
        </motion.section>

        {/* Notification Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Bildirim Tercihleri</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Email Bildirimleri</div>
                <div className="text-sm text-slate-400">
                  Önemli güncellemeler için email alın
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Proje Güncellemeleri</div>
                <div className="text-sm text-slate-400">
                  Proje ilerlemeleriniz hakkında bildirim alın
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={projectUpdates}
                  onChange={(e) => setProjectUpdates(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Tehlikeli Bölge</h2>
          </div>

          <p className="text-slate-300 mb-4">
            Hesabınızı silmek, tüm projelerinizi ve verilerinizi kalıcı olarak silecektir.
            Bu işlem geri alınamaz.
          </p>

          <Button
            onClick={handleDeleteAccount}
            disabled={saving}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hesabı Sil
          </Button>
        </motion.section>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-slate-500 pt-4"
        >
          <p>
            Hesap oluşturma tarihi:{' '}
            {user?.created_at && new Date(user.created_at).toLocaleDateString('tr-TR')}
          </p>
          <p className="mt-1">
            Kullanıcı ID: <code className="text-xs bg-slate-800/50 px-2 py-1 rounded">{user?.id}</code>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
