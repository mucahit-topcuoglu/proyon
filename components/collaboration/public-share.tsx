'use client';

/**
 * 🌐 Public Share Settings Component
 * 
 * Proje public paylaşım ayarları (Makale Tarzı)
 * - Proje açıklaması ve ekip üyeleri
 * - İletişim bilgileri (LinkedIn, Twitter, Instagram, Phone, Email)
 * - Public link oluşturma/devre dışı bırakma
 * - Paylaşım ayarları (timeline, stats, comments)
 * - Görüntülenme istatistikleri
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { uploadProjectImage, deleteProjectImage } from '@/actions/uploadProjectImage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  createPublicShare,
  updateShareSettings,
  disablePublicShare,
  getShareAnalytics,
  getProjectShare,
} from '@/actions/publicSharing';
import {
  Globe,
  Link2,
  Eye,
  EyeOff,
  Copy,
  Check,
  BarChart3,
  MessageSquare,
  Clock,
  TrendingUp,
  Share2,
  X,
  Loader2,
  Users,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Instagram,
  Upload,
} from 'lucide-react';

interface PublicShareProps {
  projectId: string;
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function PublicShare({
  projectId,
  userId,
  open,
  onClose,
}: PublicShareProps) {
  const [loading, setLoading] = useState(false);
  const [share, setShare] = useState<any>(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [message, setMessage] = useState('');

  // Project info for showcase
  const [description, setDescription] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [projectImages, setProjectImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Contact info
  const [showContact, setShowContact] = useState(false);
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Display settings
  const [showTimeline, setShowTimeline] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [allowComments, setAllowComments] = useState(false);

  useEffect(() => {
    if (open) {
      checkExistingShare();
    }
  }, [open, projectId]);

  async function checkExistingShare() {
    setLoading(true);
    
    const result: any = await getProjectShare(projectId);
    
    if (result.success && result.share) {
      setShare(result.share);
      setShareUrl(`${process.env.NEXT_PUBLIC_APP_URL}/share/${result.share.share_token}`);
      
      // Load existing data
      setDescription(result.share.description || '');
      setTeamMembers(result.share.team_members || '');
      setProjectImages(result.share.project_images || []);
      setShowContact(result.share.show_contact || false);
      
      // Load contact info
      const contact = result.share.contact_info || {};
      setLinkedin(contact.linkedin || '');
      setTwitter(contact.twitter || '');
      setInstagram(contact.instagram || '');
      setPhone(contact.phone || '');
      setEmail(contact.email || '');
      
      // Load display settings
      setShowTimeline(result.share.show_timeline);
      setShowStats(result.share.show_stats);
      setAllowComments(result.share.allow_comments);
      
      if (result.share.is_active) {
        const analyticsResult = await getShareAnalytics(result.share.id);
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.analytics);
        }
      }
    }
    
    setLoading(false);
  }

  // Handle file upload
  async function handleFileUpload(file: File) {
    if (!file) return;

    setUploadingImage(true);
    setMessage('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const result = await uploadProjectImage(projectId, base64, file.name);
        
        if (result.success && result.url) {
          setProjectImages([...projectImages, result.url]);
          setSelectedFile(null);
          setMessage('✅ Fotoğraf yüklendi!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(`❌ Hata: ${result.error}`);
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage('❌ Yükleme hatası');
      setUploadingImage(false);
    }
  }

  // Handle image deletion
  async function handleDeleteImage(url: string, index: number) {
    // If it's a storage URL, delete from storage
    if (url.includes('supabase')) {
      const result = await deleteProjectImage(url);
      if (!result.success) {
        setMessage(`❌ Silme hatası: ${result.error}`);
        return;
      }
    }
    
    // Remove from array
    setProjectImages(projectImages.filter((_, i) => i !== index));
  }

  async function handleCreateShare() {
    setLoading(true);
    setMessage('');

    const contactInfo = {
      linkedin,
      twitter,
      instagram,
      phone,
      email,
    };

    const result = await createPublicShare({
      projectId,
      userId,
      description,
      teamMembers,
      projectImages,
      contactInfo,
      showContact,
      showTimeline,
      showStats,
      allowComments,
    });

    if (result.success) {
      setShare(result.data);
      setShareUrl(result.shareUrl || '');
      setMessage('✅ Public paylaşım linki oluşturuldu!');
      
      if (result.data?.id) {
        const analyticsResult = await getShareAnalytics(result.data.id);
        if (analyticsResult.success) {
          setAnalytics(analyticsResult.analytics);
        }
      }
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setLoading(false);
  }

  async function handleUpdateSettings() {
    if (!share) return;

    setLoading(true);
    setMessage('');

    const contactInfo = {
      linkedin,
      twitter,
      instagram,
      phone,
      email,
    };

    const result = await updateShareSettings({
      shareId: share.id,
      description,
      teamMembers,
      projectImages,
      contactInfo,
      showContact,
      showTimeline,
      showStats,
      allowComments,
    });

    if (result.success) {
      setShare(result.data);
      setMessage('✅ Ayarlar güncellendi');
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setLoading(false);
  }

  async function handleDisableShare() {
    if (!confirm('Public paylaşımı devre dışı bırakmak istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    const result = await disablePublicShare(projectId);

    if (result.success) {
      setShare(null);
      setShareUrl('');
      setMessage('✅ Paylaşım devre dışı bırakıldı');
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setLoading(false);
  }

  async function copyToClipboard() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            Public Paylaşım
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Projenizi herkese açık bir link ile paylaşın
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
          {!share ? (
            /* Create Share Section */
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-xl p-6 text-center">
                <Globe className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Projenizi Dünya ile Paylaşın
                </h3>
                <p className="text-slate-400 mb-4">
                  Makale tarzı bir public link oluşturun ve projenizi görücüye çıkarın
                </p>
              </div>

              {/* Project Description */}
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Proje Açıklaması
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Projeniz hakkında detaylı bilgi verin. Bu metayı okuyup merak eden potansiyel işverenler ve ekip arkadaşları görecek..."
                  className="min-h-[120px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Team Members */}
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Ekip Üyeleri
                </Label>
                <Input
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="örn: Ahmet Yılmaz (Frontend), Ayşe Demir (Backend), Mehmet Kaya (Designer)"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  Ekip üyelerini sözel olarak yazın
                </p>
              </div>

              {/* Project Images */}
              <div className="space-y-3">
                <Label className="text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Proje Fotoğrafları
                </Label>
                <div className="space-y-2">
                  {/* File Upload */}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          handleFileUpload(file);
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-md text-white hover:bg-slate-700 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'Yükleniyor...' : selectedFile ? selectedFile.name : 'PC/Telefon\'dan Fotoğraf Seç'}
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="veya URL girin (örn: https://imgur.com/abc.jpg)"
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (newImageUrl.trim()) {
                          setProjectImages([...projectImages, newImageUrl.trim()]);
                          setNewImageUrl('');
                        }
                      }}
                      variant="outline"
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 shrink-0"
                    >
                      Ekle
                    </Button>
                  </div>

                  {projectImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {projectImages.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img 
                            src={url} 
                            alt={`Proje ${idx + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(url, idx)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">
                    📤 Direkt fotoğraf yükleyin veya URL ekleyin • Max 5MB • JPG, PNG, WebP, GIF
                  </p>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="space-y-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold">
                    İletişim Bilgilerini Paylaş
                  </Label>
                  <Switch
                    checked={showContact}
                    onCheckedChange={setShowContact}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Aktif edilirse, iletişim bilgileriniz public sayfada görünür olacak
                </p>

                {showContact && (
                  <div className="space-y-3 pt-3 border-t border-slate-700">
                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </Label>
                      <Input
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Twitter className="w-4 h-4" />
                        X (Twitter)
                      </Label>
                      <Input
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://twitter.com/username"
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </Label>
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="https://instagram.com/username"
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefon
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+90 555 123 45 67"
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-posta
                      </Label>
                      <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="bg-slate-900 border-slate-600 text-white text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Display Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Görünüm Ayarları</h4>

                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-violet-400" />
                      <div>
                        <div className="text-white font-medium">Timeline Göster</div>
                        <div className="text-sm text-slate-400">
                          Yol haritası ve adımları göster
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={showTimeline}
                      onCheckedChange={setShowTimeline}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      <div>
                        <div className="text-white font-medium">İstatistikler Göster</div>
                        <div className="text-sm text-slate-400">
                          İlerleme ve tamamlanma oranı göster
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={showStats}
                      onCheckedChange={setShowStats}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white font-medium">Yorumlara İzin Ver</div>
                        <div className="text-sm text-slate-400">
                          Ziyaretçiler yorum yapabilsin
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={allowComments}
                      onCheckedChange={setAllowComments}
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCreateShare}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    Public Link Oluştur
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* Manage Share Section */
            <div className="space-y-4">
              {/* Share Link */}
              <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">Paylaşım Aktif</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <Link2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-white text-sm outline-none"
                  />
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Kopyalandı
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Kopyala
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Analytics */}
              {analytics && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-slate-400">Toplam Görüntüleme</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {analytics.totalViews}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-slate-400">Son Görüntüleme</span>
                    </div>
                    <div className="text-sm font-medium text-white">
                      {analytics.lastViewed
                        ? new Date(analytics.lastViewed).toLocaleDateString('tr-TR')
                        : 'Henüz yok'}
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Project Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Proje Bilgileri</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-white text-xs mb-2">Açıklama</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Projeniz hakkında detaylı bilgi..."
                      className="min-h-[100px] bg-slate-800 border-slate-700 text-white text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white text-xs mb-2">Ekip Üyeleri</Label>
                    <Input
                      value={teamMembers}
                      onChange={(e) => setTeamMembers(e.target.value)}
                      placeholder="Ekip üyelerini yazın..."
                      className="bg-slate-800 border-slate-700 text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-semibold text-sm">
                    İletişim Bilgileri
                  </Label>
                  <Switch
                    checked={showContact}
                    onCheckedChange={setShowContact}
                  />
                </div>

                {showContact && (
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="LinkedIn URL"
                      className="bg-slate-900 border-slate-600 text-white text-xs"
                    />
                    <Input
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="Twitter URL"
                      className="bg-slate-900 border-slate-600 text-white text-xs"
                    />
                    <Input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="Instagram URL"
                      className="bg-slate-900 border-slate-600 text-white text-xs"
                    />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Telefon"
                      className="bg-slate-900 border-slate-600 text-white text-xs"
                    />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta"
                      className="bg-slate-900 border-slate-600 text-white text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Display Settings */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white">Görünüm Ayarları</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Timeline</span>
                    <Switch
                      checked={showTimeline}
                      onCheckedChange={setShowTimeline}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">İstatistikler</span>
                    <Switch
                      checked={showStats}
                      onCheckedChange={setShowStats}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Yorumlar</span>
                    <Switch
                      checked={allowComments}
                      onCheckedChange={setAllowComments}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleUpdateSettings}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Kaydet
                </Button>

                <Button
                  onClick={handleDisableShare}
                  disabled={loading}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Kapat
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
