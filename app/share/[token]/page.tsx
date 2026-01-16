'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getPublicShare, recordShareView, toggleLike, getLikeStatus } from '@/actions/publicSharing';
import { CategoryTabs } from '@/components/roadmap/category-tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProjectComments from '@/components/collaboration/project-comments';
import { Navbar, Footer } from '@/components/landing';
import { supabase } from '@/lib/supabase/client';
import {
  Globe, Calendar, Users, Mail, Phone, Linkedin, Twitter, Instagram,
  ChevronLeft, ChevronRight, Share2, Heart, Eye, Loader2, AlertCircle,
  X, Check, TrendingUp, BarChart3, MessageCircle,
} from 'lucide-react';

export default function PublicProjectPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [share, setShare] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (token) loadPublicProject();
  }, [token]);

  async function loadPublicProject() {
    try {
      setLoading(true);
      const shareResult: any = await getPublicShare(token);
      if (!shareResult.success || !shareResult.data) {
        setError(shareResult.error || 'Paylaşım bulunamadı');
        setLoading(false);
        return;
      }

      setShare(shareResult.data);
      setProject(shareResult.data.project);
      setLikesCount(shareResult.data.likes_count || 0);

      const likeStatus = await getLikeStatus(shareResult.data.id);
      if (likeStatus.success) setIsLiked(likeStatus.isLiked || false);

      await recordShareView({
        shareId: shareResult.data.id,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
      });

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu');
      setLoading(false);
    }
  }

  async function handleLike() {
    if (!share) return;
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Beğenmek için giriş yapmalısınız!');
      return;
    }
    
    const result = await toggleLike(share.id);
    if (result.success) {
      setIsLiked(result.isLiked!);
      setLikesCount(result.likesCount!);
    }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: project?.title || 'ProYön Projesi', text: share?.description || '', url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const nextImage = () => {
    if (share?.project_images?.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % share.project_images.length);
    }
  };

  const prevImage = () => {
    if (share?.project_images?.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + share.project_images.length) % share.project_images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Proje yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !share || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-24">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Proje Bulunamadı</h1>
            <p className="text-muted-foreground mb-6">{error || 'Bu proje mevcut değil.'}</p>
            <Link href="/public-projects"><Button>Public Projelere Dön</Button></Link>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const hasImages = share.project_images && share.project_images.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 -right-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Navbar />

      {/* Hero Split Screen */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: Project Info */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-sm text-violet-400 font-medium">Live Project</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    {project.title}
                  </span>
                </h1>
                
                {share.description && (
                  <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                    {share.description}
                  </p>
                )}

                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, idx: number) => (
                      <span 
                        key={idx} 
                        className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 transition-colors"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Action Buttons */}
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`group relative px-6 py-3 rounded-xl font-semibold overflow-hidden transition-all ${
                    isLiked 
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/50' 
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-2">
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likesCount}</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
                >
                  {copied ? (
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Kopyalandı</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Share2 className="w-5 h-5" />
                      <span>Paylaş</span>
                    </div>
                  )}
                </motion.button>
              </div>

              {/* Stats Cards */}
              {share.show_stats && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Eye, label: 'Görüntülenme', value: share.view_count || 0 },
                    { icon: Heart, label: 'Beğeni', value: likesCount },
                    { icon: Calendar, label: 'Tarih', value: new Date(project.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }
                  ].map((stat, idx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
                    >
                      <stat.icon className="w-5 h-5 text-violet-400 mb-2 group-hover:scale-110 transition-transform" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString('tr-TR') : stat.value}
                      </div>
                      <div className="text-xs text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right: Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {hasImages ? (
                <div className="relative">
                  {/* Main Featured Image */}
                  <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20 cursor-pointer group" onClick={() => setLightboxOpen(true)}>
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute inset-0"
                    >
                      <Image 
                        src={share.project_images[currentImageIndex]} 
                        alt={project.title}
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        priority
                      />
                    </motion.div>
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-6 right-6 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white font-medium">
                      {currentImageIndex + 1} / {share.project_images.length}
                    </div>

                    {/* Navigation Dots */}
                    {share.project_images.length > 1 && (
                      <div className="absolute bottom-6 left-6 flex gap-2">
                        {share.project_images.map((_img: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              idx === currentImageIndex 
                                ? 'bg-white w-8' 
                                : 'bg-white/40 hover:bg-white/70'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floating Navigation Buttons */}
                  {share.project_images.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl"
                      >
                        <ChevronLeft className="w-7 h-7" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl"
                      >
                        <ChevronRight className="w-7 h-7" />
                      </motion.button>
                    </>
                  )}

                  {/* Thumbnail Strip */}
                  {share.project_images.length > 1 && (
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
                      {share.project_images.map((img: string, idx: number) => (
                        <motion.button
                          key={idx}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`relative flex-shrink-0 snap-start rounded-xl overflow-hidden transition-all ${
                            idx === currentImageIndex 
                              ? 'w-28 h-28 ring-4 ring-violet-500 shadow-lg shadow-violet-500/50' 
                              : 'w-20 h-20 ring-2 ring-white/20 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image src={img} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                          {idx === currentImageIndex && (
                            <div className="absolute inset-0 bg-gradient-to-t from-violet-500/30 to-transparent" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-2 border-dashed border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center p-8">
                    <Globe className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                    <p className="text-slate-400">Proje görseli yok</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Info Cards */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {share.team_members && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white">Team Members</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{share.team_members}</p>
              </motion.div>
            )}

            {share.show_contact && share.contact_info && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-6 h-6 text-fuchsia-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white">Contact</h3>
                </div>
                <div className="space-y-3">
                  {share.contact_info.email && (
                    <a href={`mailto:${share.contact_info.email}`} className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                      {share.contact_info.email}
                    </a>
                  )}
                  {share.contact_info.phone && (
                    <a href={`tel:${share.contact_info.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                      <Phone className="w-4 h-4" />
                      {share.contact_info.phone}
                    </a>
                  )}
                  {share.contact_info.linkedin && (
                    <a href={share.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && hasImages && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4" 
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
              <Image src={share.project_images[currentImageIndex]} alt={project.title} fill className="object-contain" />
            </div>
            {share.project_images.length > 1 && (
              <>
                <button 
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button 
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roadmap Timeline */}
      {share.show_timeline && (
        <section className="relative py-16 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-4 shadow-lg shadow-violet-500/50">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Proje Yol Haritası</h2>
              <p className="text-slate-400">Geliştirme süreci ve kilometre taşları</p>
            </motion.div>
            <CategoryTabs projectId={project.id} readOnly={true} />
          </div>
        </section>
      )}

      {/* Comments Section */}
      {share.allow_comments && (
        <section className="relative py-16 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 mb-4 shadow-lg shadow-cyan-500/50">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Yorumlar</h2>
                <p className="text-slate-400">Projeyi değerlendirin ve görüşlerinizi paylaşın</p>
              </div>
              <ProjectComments projectId={project.id} shareId={share.id} allowComments={true} />
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 border border-white/20 backdrop-blur-sm text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10">
              <TrendingUp className="w-12 h-12 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-3">Kendi Projenizi Oluşturun</h2>
              <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                ProYön ile projelerinizi yönetin ve topluluğa açın
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/70 transition-all"
                  >
                    Ücretsiz Başla
                  </motion.button>
                </Link>
                <Link href="/public-projects">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold backdrop-blur-sm hover:bg-white/20 transition-all"
                  >
                    Diğer Projelere Göz At
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
