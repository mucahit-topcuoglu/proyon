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
  BookOpen,
  Rocket,
  FileText,
  Lightbulb,
  Check,
  AlertCircle,
  ArrowRight,
  Play,
  Upload,
  Sparkles,
  Target,
  Clock,
  FileCheck,
  Download,
  Info,
  CheckCircle2,
  Zap,
  Globe,
  Settings,
  X,
} from 'lucide-react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('quick-start');

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
              <BookOpen className="w-3.5 h-3.5 mr-2" />
              Dokümantasyon
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            ProYön'ü{' '}
            <GradientText className="block mt-2">
              Nasıl Kullanırım?
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Yapay zeka destekli proje yönetim platformumuzu kullanmaya başlamak için
            ihtiyacınız olan her şey burada.
          </p>
        </div>
      </section>

      {/* Documentation Content */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 h-auto p-1 bg-muted/50">
              <TabsTrigger
                value="quick-start"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Rocket className="w-5 h-5" />
                <span className="text-xs font-medium">Hızlı Başlangıç</span>
              </TabsTrigger>
              <TabsTrigger
                value="file-formats"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-medium">Dosya Formatları</span>
              </TabsTrigger>
              <TabsTrigger
                value="roadmap-analysis"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Target className="w-5 h-5" />
                <span className="text-xs font-medium">Yol Haritası Analizi</span>
              </TabsTrigger>
              <TabsTrigger
                value="tips"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Lightbulb className="w-5 h-5" />
                <span className="text-xs font-medium">İpuçları</span>
              </TabsTrigger>
            </TabsList>

            {/* Quick Start Tab */}
            <TabsContent value="quick-start" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Hızlı Başlangıç
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    İlk projenizi oluşturmak ve AI ile yol haritası üretmek sadece 4 adım!
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <Card className="border-primary/20 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">1</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Hesap Oluşturun</CardTitle>
                          <CardDescription className="text-base">
                            Ücretsiz hesap oluşturarak başlayın
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-20">
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Sağ üst köşedeki "Ücretsiz Başla" butonuna tıklayın</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>E-posta ve şifrenizi girerek kayıt olun</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>E-posta adresinizi onaylayın</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Step 2 */}
                  <Card className="border-primary/20 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">2</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Yeni Proje Oluşturun</CardTitle>
                          <CardDescription className="text-base">
                            Proje bilgilerinizi girin ve doküman yükleyin
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-20">
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Dashboard'dan "Yeni Proje" butonuna tıklayın</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Proje adı, açıklama ve kategori seçin</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Proje dokümanınızı yükleyin (PDF, Word, TXT vb.)</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Step 3 */}
                  <Card className="border-primary/20 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">3</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">AI ile Yol Haritası Oluşturun</CardTitle>
                          <CardDescription className="text-base">
                            Yapay zeka otomatik olarak yol haritanızı oluşturur
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-20">
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Groq LPU ile ultra-hızlı analiz (5-10 saniye)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Otomatik görev ve milestone oluşturma</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Akıllı zaman tahmini ve öncelik belirleme</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Step 4 */}
                  <Card className="border-primary/20 hover:border-primary/50 transition-all">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-primary">4</span>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-2">Yönetin ve Takip Edin</CardTitle>
                          <CardDescription className="text-base">
                            Projenizi görsel olarak yönetin ve ilerleyişi izleyin
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-20">
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Görsel roadmap üzerinde görevleri düzenleyin</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Ekip üyelerinizle işbirliği yapın</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>Proyon AI asistan ile doğal dilde etkileşim kurun</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-12 text-center">
                  <Link href="/signup">
                    <Button size="lg" className="group">
                      Hemen Başlayın
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            {/* File Formats Tab */}
            <TabsContent value="file-formats" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Dosya Formatları
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Desteklenen dosya türleri ve limitler
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {/* Supported Formats */}
                  <Card>
                    <CardHeader>
                      <FileCheck className="w-10 h-10 text-green-500 mb-4" />
                      <CardTitle className="text-2xl">Desteklenen Formatlar</CardTitle>
                      <CardDescription>
                        AI analizi için kullanabileceğiniz dosya türleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {[
                          { format: 'PDF', desc: 'Portable Document Format' },
                          { format: 'DOCX', desc: 'Microsoft Word' },
                          { format: 'DOC', desc: 'Microsoft Word (Eski)' },
                          { format: 'TXT', desc: 'Plain Text' },
                          { format: 'MD', desc: 'Markdown' },
                          { format: 'RTF', desc: 'Rich Text Format' },
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <div>
                              <span className="font-semibold">{item.format}</span>
                              <span className="text-sm text-muted-foreground ml-2">- {item.desc}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* File Limits */}
                  <Card>
                    <CardHeader>
                      <Info className="w-10 h-10 text-blue-500 mb-4" />
                      <CardTitle className="text-2xl">Dosya Limitleri</CardTitle>
                      <CardDescription>
                        Plan türüne göre dosya boyutu limitleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Free Plan</span>
                            <Badge variant="outline">Ücretsiz</Badge>
                          </div>
                          <p className="text-2xl font-bold text-primary">5 MB</p>
                          <p className="text-sm text-muted-foreground mt-1">Dosya başına maksimum boyut</p>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Pro Plan</span>
                            <Badge className="bg-primary">Önerilen</Badge>
                          </div>
                          <p className="text-2xl font-bold text-primary">50 MB</p>
                          <p className="text-sm text-muted-foreground mt-1">Dosya başına maksimum boyut</p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Enterprise Plan</span>
                            <Badge variant="secondary">Kurumsal</Badge>
                          </div>
                          <p className="text-2xl font-bold text-primary">Sınırsız</p>
                          <p className="text-sm text-muted-foreground mt-1">Özel limitler</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Best Practices */}
                <Card className="border-blue-500/20">
                  <CardHeader>
                    <AlertCircle className="w-10 h-10 text-blue-500 mb-4" />
                    <CardTitle className="text-2xl">Önemli Notlar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Dosyalarınız güvenli bir şekilde şifrelenerek saklanır ve sadece size aittir.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          AI analizi için dosyanızın yapılandırılmış ve okunabilir olması önemlidir.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Görsel içerikli PDF'lerde OCR (optik karakter tanıma) otomatik olarak yapılır.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Şifreli PDF dosyaları yüklemeden önce şifresini kaldırmanız gerekmektedir.
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Roadmap Analysis Tab */}
            <TabsContent value="roadmap-analysis" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Yol Haritası Analizi
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    AI tarafından oluşturulan yol haritanızı nasıl yorumlarsınız?
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Phases */}
                  <Card>
                    <CardHeader>
                      <Target className="w-10 h-10 text-primary mb-4" />
                      <CardTitle className="text-2xl">Aşamalar (Phases)</CardTitle>
                      <CardDescription>
                        Projenizin ana yapı taşları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        AI, projenizi mantıksal bölümlere ayırır. Her aşama belirli bir hedefi temsil eder.
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-blue-500">1</span>
                          </div>
                          <div>
                            <p className="font-semibold">Planlama & Tasarım</p>
                            <p className="text-sm text-muted-foreground">Projenin temellerinin atıldığı başlangıç aşaması</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-purple-500">2</span>
                          </div>
                          <div>
                            <p className="font-semibold">Geliştirme</p>
                            <p className="text-sm text-muted-foreground">Asıl ürünün inşa edildiği ana aşama</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-green-500">3</span>
                          </div>
                          <div>
                            <p className="font-semibold">Test & Yayın</p>
                            <p className="text-sm text-muted-foreground">Kalite kontrolü ve lansmanın yapıldığı final aşaması</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Milestones */}
                  <Card>
                    <CardHeader>
                      <Zap className="w-10 h-10 text-yellow-500 mb-4" />
                      <CardTitle className="text-2xl">Kilometre Taşları (Milestones)</CardTitle>
                      <CardDescription>
                        Kritik başarı noktaları
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Her aşamanın sonunda bir milestone vardır. Bunlar projenizin önemli tamamlanma noktalarıdır.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <strong>İlerleme Takibi:</strong> Her milestone'un tamamlanma yüzdesi gösterilir
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <strong>Tarih Tahminleri:</strong> AI, her milestone için gerçekçi tamamlanma tarihi önerir
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            <strong>Bağımlılıklar:</strong> Hangi milestone'ların birbirine bağlı olduğu gösterilir
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Tasks */}
                  <Card>
                    <CardHeader>
                      <FileCheck className="w-10 h-10 text-green-500 mb-4" />
                      <CardTitle className="text-2xl">Görevler (Tasks)</CardTitle>
                      <CardDescription>
                        Aksiyon alınacak somut adımlar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Her milestone altında yapılması gereken spesifik görevler listelenir.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-semibold mb-2">Öncelik Seviyeleri</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span className="text-sm">Yüksek - Kritik görevler</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span className="text-sm">Orta - Önemli görevler</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">Düşük - Opsiyonel görevler</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="font-semibold mb-2">Görev Durumları</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                              <span className="text-sm">Yapılacak</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-sm">Devam Ediyor</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm">Tamamlandı</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Time Estimates */}
                  <Card className="border-blue-500/20">
                    <CardHeader>
                      <Clock className="w-10 h-10 text-blue-500 mb-4" />
                      <CardTitle className="text-2xl">Zaman Tahminleri</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        AI, her görev için gerçekçi süre tahminleri yapar:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Tahminler, benzer projelerin analizi ve endüstri standartlarına dayanır
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Ekip büyüklüğü ve deneyim seviyesine göre özelleştirilebilir
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Proyon AI'dan "süreleri güncelle" diyerek yeniden hesaplatabilirsiniz
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tips Tab */}
            <TabsContent value="tips" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    İpuçları ve En İyi Uygulamalar
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Daha iyi sonuçlar için doküman hazırlama rehberi
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Document Preparation */}
                  <Card className="border-green-500/20">
                    <CardHeader>
                      <Lightbulb className="w-10 h-10 text-green-500 mb-4" />
                      <CardTitle className="text-2xl">Doküman Hazırlama</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Net ve Yapılandırılmış Olun</p>
                            <p className="text-sm text-muted-foreground">
                              Başlıklar, alt başlıklar ve madde işaretleri kullanın. AI yapılandırılmış içeriği daha iyi analiz eder.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Hedefleri Açıkça Belirtin</p>
                            <p className="text-sm text-muted-foreground">
                              Projenizin nihai hedefini, beklenen çıktıları ve başarı kriterlerini net bir şekilde yazın.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Kapsam ve Kısıtlamaları Ekleyin</p>
                            <p className="text-sm text-muted-foreground">
                              Bütçe, zaman, kaynak kısıtlamalarını ve projenin kapsamını belirtin.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Teknik Detaylar</p>
                            <p className="text-sm text-muted-foreground">
                              Kullanılacak teknolojiler, platformlar veya standartlar varsa bunları belirtin.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Content Examples */}
                  <Card>
                    <CardHeader>
                      <FileText className="w-10 h-10 text-blue-500 mb-4" />
                      <CardTitle className="text-2xl">İyi vs Kötü Örnekler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center">
                              <X className="w-4 h-4 text-red-500" />
                            </div>
                            <p className="font-semibold text-red-500">Kötü Örnek</p>
                          </div>
                          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground italic">
                              "Bir web sitesi yapmak istiyorum. Modern olsun."
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Check className="w-4 h-4 text-green-500" />
                            </div>
                            <p className="font-semibold text-green-500">İyi Örnek</p>
                          </div>
                          <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              "E-ticaret web sitesi geliştirmek istiyorum. Hedef: 100+ ürün satışı, mobil uyumlu, 
                              ödeme entegrasyonu (Stripe), admin paneli, stok yönetimi. Teknolojiler: Next.js, 
                              PostgreSQL. Süre: 3 ay, Bütçe: 50.000 TL."
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* AI Tips */}
                  <Card className="border-purple-500/20">
                    <CardHeader>
                      <Sparkles className="w-10 h-10 text-purple-500 mb-4" />
                      <CardTitle className="text-2xl">Proyon AI Kullanımı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Doğal Dilde Konuşun</p>
                            <p className="text-sm text-muted-foreground">
                              "Yeni bir görev ekle" yerine "Mobil uygulama için API entegrasyonu görevi ekle" şeklinde detaylı talimatlar verin.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Analiz İsteyin</p>
                            <p className="text-sm text-muted-foreground">
                              "Projemin risklerini analiz et", "Hangi görevler kritik yolda?" gibi sorular sorabilirsiniz.
                            </p>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1">Öneriler Alın</p>
                            <p className="text-sm text-muted-foreground">
                              "Bu aşamayı optimize etmek için önerilerin var mı?" diye sorarak akıllı öneriler alabilirsiniz.
                            </p>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Performance Tips */}
                  <Card>
                    <CardHeader>
                      <Zap className="w-10 h-10 text-yellow-500 mb-4" />
                      <CardTitle className="text-2xl">Performans İpuçları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Çok büyük dosyalar yerine 5-10 sayfalık özetlenmiş dokümanlar yükleyin
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Görsel ağırlıklı PDF'ler yerine text tabanlı dokümanlar tercih edin
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Birden fazla küçük doküman yerine tek bir birleştirilmiş doküman kullanın
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Gereksiz eklentiler (görsel, grafik) olmayan temiz dokümanlar hazırlayın
                          </span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Hala Sorunuz mu Var?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Destek ekibimiz size yardımcı olmak için hazır. 7/24 canlı destek ile hemen yanıt alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/support">
                <Button size="lg" className="group">
                  Destek Al
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/api-docs">
                <Button size="lg" variant="outline">
                  API Dokümantasyonu
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
