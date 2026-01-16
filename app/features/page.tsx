'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import {
  Bot,
  LineChart,
  Shield,
  Users,
  Zap,
  GitBranch,
  Clock,
  Globe,
  FileText,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Target,
  BarChart3,
  Bell,
  Calendar,
  Cloud,
  Code,
  Database,
  FolderKanban,
  Gauge,
  Lock,
  MessageSquare,
  Palette,
  Rocket,
  Search,
  Settings,
  Share2,
  Smartphone,
  TrendingUp,
  Workflow,
  Layers,
  FileSearch,
  Repeat,
  Download,
} from 'lucide-react';

interface Feature {
  icon: any;
  title: string;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
}

interface FeatureCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  features: Feature[];
}

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('ai');

  const featureCategories: FeatureCategory[] = [
    {
      id: 'ai',
      name: 'AI Özellikleri',
      description: 'Yapay zeka destekli güçlü proje yönetim araçları',
      icon: Bot,
      features: [
        {
          icon: Bot,
          title: 'AI-Powered Roadmap',
          description: 'Yapay zeka destekli otomatik proje planlaması ve roadmap oluşturma',
          details: [
            'Doğal dil işleme ile proje analizi',
            'Otomatik görev ve milestone oluşturma',
            'Akıllı öncelik belirleme',
            'Zaman tahmini ve planlama',
            'Groq LPU ile ultra-hızlı işlem',
          ],
          color: 'text-blue-600',
          bgColor: 'bg-blue-600/10',
        },
        {
          icon: Sparkles,
          title: 'Proyon AI Asistan',
          description: 'Doğal dil ile proje yönetimi ve akıllı asistan desteği',
          details: [
            'Türkçe ve İngilizce doğal dil desteği',
            'Görev ekleme, düzenleme ve silme',
            'Proje analizi ve öneriler',
            'Gerçek zamanlı sohbet desteği',
            'Bağlam farkında konuşma',
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-600/10',
        },
        {
          icon: FileSearch,
          title: 'Akıllı Analiz',
          description: 'AI destekli proje analizi ve öngörücü raporlama',
          details: [
            'Proje risk analizi',
            'Performans tahminleri',
            'Otomatik insight oluşturma',
            'Trend analizi',
            'Akıllı öneriler',
          ],
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-600/10',
        },
        {
          icon: FileText,
          title: 'Otomatik Dokümantasyon',
          description: 'AI ile otomatik proje dokümantasyonu ve raporlama',
          details: [
            'Otomatik döküm oluşturma',
            'Adım bazlı dokümantasyon',
            'Markdown formatı desteği',
            'Versiyon geçmişi',
            'Şablon desteği',
          ],
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-600/10',
        },
      ],
    },
    {
      id: 'collaboration',
      name: 'İşbirliği',
      description: 'Ekip çalışmasını güçlendiren araçlar',
      icon: Users,
      features: [
        {
          icon: Users,
          title: 'Takım Yönetimi',
          description: 'Ekip üyelerini yönetin ve rolleri atayın',
          details: [
            'Rol bazlı yetkilendirme',
            'Takım üyesi davetleri',
            'Görev atamaları',
            'Aktivite takibi',
            'Üye performans metrikleri',
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-600/10',
        },
        {
          icon: MessageSquare,
          title: 'Yorumlar ve Tartışmalar',
          description: 'Proje ve görevler üzerinde gerçek zamanlı iletişim',
          details: [
            'Threaded yorumlar',
            'Mention desteği (@kullanıcı)',
            'Emoji reaksiyonları',
            'Dosya ekleme',
            'Bildirim entegrasyonu',
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-600/10',
        },
        {
          icon: Bell,
          title: 'Akıllı Bildirimler',
          description: 'Önemli güncellemelerden anında haberdar olun',
          details: [
            'Gerçek zamanlı bildirimler',
            'E-posta bildirimleri',
            'Özelleştirilebilir tercihler',
            'Bildirim merkezi',
            'Öncelik bazlı uyarılar',
          ],
          color: 'text-orange-600',
          bgColor: 'bg-orange-600/10',
        },
        {
          icon: Share2,
          title: 'Proje Paylaşımı',
          description: 'Projelerinizi güvenli şekilde paylaşın',
          details: [
            'Public/Private proje seçenekleri',
            'Paylaşım linkleri',
            'Yetki kontrolü',
            'Portfolio oluşturma',
            'Embed desteği',
          ],
          color: 'text-pink-600',
          bgColor: 'bg-pink-600/10',
        },
      ],
    },
    {
      id: 'management',
      name: 'Proje Yönetimi',
      description: 'Profesyonel proje yönetim araçları',
      icon: FolderKanban,
      features: [
        {
          icon: FolderKanban,
          title: 'Kanban Board',
          description: 'Görsel proje yönetimi ve görev takibi',
          details: [
            'Drag & drop görev yönetimi',
            'Özelleştirilebilir kolonlar',
            'Etiket ve öncelik sistemi',
            'Filtreleme ve arama',
            'Görünüm kaydetme',
          ],
          color: 'text-blue-600',
          bgColor: 'bg-blue-600/10',
        },
        {
          icon: Target,
          title: 'Milestone Yönetimi',
          description: 'Proje hedeflerini ve kilometre taşlarını takip edin',
          details: [
            'Görsel milestone timeline',
            'Tamamlanma yüzdeleri',
            'Bağımlılık yönetimi',
            'Otomatik ilerleme takibi',
            'Kritik yol analizi',
          ],
          color: 'text-red-600',
          bgColor: 'bg-red-600/10',
        },
        {
          icon: Calendar,
          title: 'Deadline Yönetimi',
          description: 'Son tarih takibi ve otomatik hatırlatıcılar',
          details: [
            'Görsel deadline takvimi',
            'Otomatik hatırlatmalar',
            'Renkli deadline göstergeleri',
            'Gecikme analizleri',
            'Esnek zaman yönetimi',
          ],
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-600/10',
        },
        {
          icon: Workflow,
          title: 'Özel İş Akışları',
          description: 'Kendi proje süreçlerinizi oluşturun',
          details: [
            'Özelleştirilebilir workflow',
            'Otomatik durum geçişleri',
            'Şablon desteği',
            'Onay mekanizmaları',
            'Koşullu kurallar',
          ],
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-600/10',
        },
      ],
    },
    {
      id: 'analytics',
      name: 'Analitik ve Raporlama',
      description: 'Veri odaklı karar almak için güçlü araçlar',
      icon: LineChart,
      features: [
        {
          icon: LineChart,
          title: 'Gelişmiş Analitik',
          description: 'Detaylı proje ve ekip performans analizi',
          details: [
            'Gerçek zamanlı dashboardlar',
            'Özelleştirilebilir metrikler',
            'Karşılaştırmalı analizler',
            'Trend görselleştirme',
            'Veri export seçenekleri',
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-600/10',
        },
        {
          icon: BarChart3,
          title: 'Özel Raporlar',
          description: 'İhtiyacınıza özel raporlar oluşturun',
          details: [
            'Rapor şablonları',
            'Otomatik rapor oluşturma',
            'PDF/Excel export',
            'Zamanlanmış raporlar',
            'Grafik ve görselleştirme',
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-600/10',
        },
        {
          icon: Clock,
          title: 'Zaman Takibi',
          description: 'Görev ve proje bazlı detaylı zaman analizi',
          details: [
            'Otomatik zaman kaydı',
            'Manuel zaman girişi',
            'Zaman logları',
            'Verimlilik metrikleri',
            'Maliyet analizi',
          ],
          color: 'text-orange-600',
          bgColor: 'bg-orange-600/10',
        },
        {
          icon: TrendingUp,
          title: 'Performans Metrikleri',
          description: 'Ekip ve proje performansını ölçün',
          details: [
            'Velocity hesaplama',
            'Burndown/Burnup charts',
            'Completion rate tracking',
            'Efficiency metrikleri',
            'KPI takibi',
          ],
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-600/10',
        },
      ],
    },
    {
      id: 'integration',
      name: 'Entegrasyon & Güvenlik',
      description: 'Güvenli ve entegre çalışma ortamı',
      icon: Shield,
      features: [
        {
          icon: Shield,
          title: 'Kurumsal Güvenlik',
          description: 'ISO 27001 uyumlu güvenlik standartları',
          details: [
            'Row Level Security (RLS)',
            'End-to-end şifreleme',
            'Düzenli güvenlik denetimleri',
            'GDPR uyumluluğu',
            '2FA desteği',
          ],
          color: 'text-red-600',
          bgColor: 'bg-red-600/10',
        },
        {
          icon: Lock,
          title: 'Gelişmiş Yetkilendirme',
          description: 'Granüler erişim kontrolü ve yetkilendirme',
          details: [
            'Rol bazlı erişim (RBAC)',
            'Proje bazlı yetkiler',
            'Özel roller tanımlama',
            'Audit log',
            'İzin matrisi',
          ],
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-600/10',
        },
        {
          icon: Cloud,
          title: 'Cloud Depolama',
          description: 'Güvenli ve ölçeklenebilir dosya depolama',
          details: [
            'Sınırsız depolama (Pro)',
            'Otomatik yedekleme',
            'Versiyon kontrolü',
            'CDN dağıtımı',
            'Hızlı dosya erişimi',
          ],
          color: 'text-blue-600',
          bgColor: 'bg-blue-600/10',
        },
        {
          icon: Code,
          title: 'API & Webhook',
          description: 'Güçlü API ve webhook desteği',
          details: [
            'RESTful API',
            'Webhook entegrasyonu',
            'API dokümantasyonu',
            'Rate limiting',
            'Özel entegrasyonlar',
          ],
          color: 'text-green-600',
          bgColor: 'bg-green-600/10',
        },
      ],
    },
    {
      id: 'experience',
      name: 'Kullanıcı Deneyimi',
      description: 'Modern ve kullanıcı dostu arayüz',
      icon: Palette,
      features: [
        {
          icon: Palette,
          title: 'Modern Tasarım',
          description: 'Kullanıcı dostu ve estetik arayüz',
          details: [
            'Dark/Light mode',
            'Özelleştirilebilir temalar',
            'Responsive tasarım',
            'Animasyonlar',
            'Accessibility (WCAG)',
          ],
          color: 'text-pink-600',
          bgColor: 'bg-pink-600/10',
        },
        {
          icon: Zap,
          title: 'Lightning Performance',
          description: 'Ultra-hızlı performans ve optimizasyon',
          details: [
            'Groq LPU teknolojisi',
            'Edge computing',
            'Lazy loading',
            'Optimized rendering',
            '10x hızlı AI işleme',
          ],
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-600/10',
        },
        {
          icon: Smartphone,
          title: 'Mobil Uyumlu',
          description: 'Her cihazda mükemmel deneyim',
          details: [
            'Responsive design',
            'Touch-optimized',
            'Progressive Web App',
            'Offline desteği',
            'Native-like experience',
          ],
          color: 'text-purple-600',
          bgColor: 'bg-purple-600/10',
        },
        {
          icon: Search,
          title: 'Güçlü Arama',
          description: 'Hızlı ve akıllı arama özellikleri',
          details: [
            'Full-text search',
            'Filtreleme seçenekleri',
            'Arama geçmişi',
            'Fuzzy search',
            'Keyboard shortcuts',
          ],
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-600/10',
        },
      ],
    },
  ];

  const allFeatures = featureCategories.flatMap(cat => cat.features);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium">
              <Rocket className="w-3.5 h-3.5 mr-2" />
              Platform Özellikleri
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            İhtiyacınız Olan{' '}
            <GradientText className="block mt-2">
              Her Şey, Tek Platformda
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Yapay zeka destekli proje yönetimi için gereken tüm araçlar ve özellikler.
            Profesyonel, güvenli ve kullanımı kolay.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: '30+', label: 'Özellik' },
              { value: '10x', label: 'Daha Hızlı' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Destek' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 mb-12 h-auto p-1 bg-muted/50">
              {featureCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {featureCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-0">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    {category.name}
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {category.description}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {category.features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <Card
                        key={index}
                        className="relative overflow-hidden border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl group"
                      >
                        <CardHeader>
                          <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <Icon className={`w-7 h-7 ${feature.color}`} />
                          </div>
                          <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                          <CardDescription className="text-base">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {feature.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm">
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="relative py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ve Daha Fazlası...
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sürekli geliştirdiğimiz platform ile her gün yeni özellikler ekliyoruz
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: GitBranch, title: 'Version Control', desc: 'Değişiklik takibi' },
              { icon: Download, title: 'Data Export', desc: 'Veri aktarımı' },
              { icon: Repeat, title: 'Automation', desc: 'Otomatik görevler' },
              { icon: Database, title: 'Backup', desc: 'Otomatik yedekleme' },
              { icon: Settings, title: 'Customization', desc: 'Özelleştirme' },
              { icon: Layers, title: 'Templates', desc: 'Hazır şablonlar' },
              { icon: Gauge, title: 'Monitoring', desc: 'Sistem izleme' },
              { icon: Globe, title: 'Multi-language', desc: 'Çoklu dil desteği' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Card key={i} className="text-center hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tüm Özellikleri Keşfedin
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              14 gün ücretsiz deneme ile tüm özellikleri test edin. Kredi kartı gerekmez.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="group">
                  Ücretsiz Başlayın
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  Fiyatlandırmayı İncele
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
