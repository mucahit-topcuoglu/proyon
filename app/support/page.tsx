'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  CheckCircle2,
  AlertCircle,
  Send,
  Users,
  Github,
  Globe,
  Activity,
  Clock,
  Shield,
  CreditCard,
  FileText,
  Settings,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('faq');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const faqs: FAQ[] = [
    {
      category: 'Genel',
      question: 'ProYön nedir ve nasıl çalışır?',
      answer: 'ProYön, yapay zeka destekli proje yönetim platformudur. Proje dokümanınızı yüklersiniz, AI otomatik olarak detaylı bir yol haritası oluşturur. Groq LPU teknolojisi sayesinde bu işlem sadece 5-10 saniye sürer. Ardından görsel roadmap üzerinde projenizi yönetebilir, ekibinizle işbirliği yapabilir ve Proyon AI asistanı ile doğal dilde etkileşime geçebilirsiniz.'
    },
    {
      category: 'Genel',
      question: 'Hangi dilleri destekliyorsunuz?',
      answer: 'ProYön şu anda Türkçe ve İngilizce dillerini desteklemektedir. Proyon AI asistanı her iki dilde de doğal konuşma yapabilir. Platform arayüzü ve dokümantasyon da bu dillerde mevcuttur. Yakında Almanca, Fransızca ve İspanyolca desteği de eklenecektir.'
    },
    {
      category: 'Fiyatlandırma',
      question: 'Ücretsiz deneme süresi var mı?',
      answer: 'Evet! 14 gün boyunca ücretsiz deneme yapabilirsiniz. Kredi kartı bilgisi gerektirmez. Deneme süresince Pro plan özelliklerinin tamamına erişebilirsiniz. Deneme süresi sonunda istediğiniz plana geçiş yapabilir veya ücretsiz plan ile devam edebilirsiniz.'
    },
    {
      category: 'Fiyatlandırma',
      question: 'Planımı iptal edersem ne olur?',
      answer: 'Planınızı istediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut ödeme döneminizin sonuna kadar tüm özelliklere erişmeye devam edersiniz. Verileriniz silinmez, ücretsiz plana otomatik olarak geçiş yapılır. Dilerseniz verilerinizi export edebilir veya daha sonra tekrar Pro plana yükseltebilirsiniz.'
    },
    {
      category: 'Fiyatlandırma',
      question: 'Ücret iadesi alabir miyim?',
      answer: '14 günlük deneme süresince herhangi bir ücret alınmaz. Ödeme yaptıktan sonraki ilk 7 gün içinde memnun kalmazsanız tam ücret iadesi yapıyoruz, sorulsuz sualsiz. 7 günden sonra iade yapılmamakta ancak planınızı iptal ederek sonraki dönem için ödeme yapmamanız mümkündür.'
    },
    {
      category: 'Güvenlik',
      question: 'Verilerim güvende mi?',
      answer: 'Evet, verileriniz son derece güvenli. Row Level Security (RLS) ile her kullanıcı sadece kendi verilerine erişebilir. End-to-end şifreleme ile tüm veriler korunur. ISO 27001 standartlarına uygun çalışıyoruz. GDPR uyumlu veri işleme politikamız var. Düzenli güvenlik denetimleri yapılır ve güvenlik açıkları hızla giderilir. Verileriniz Supabase\'in güvenli altyapısında saklanır.'
    },
    {
      category: 'Güvenlik',
      question: 'İki faktörlü kimlik doğrulama (2FA) var mı?',
      answer: 'Evet, hesap güvenliğinizi artırmak için 2FA desteği sunuyoruz. Ayarlar bölümünden Google Authenticator veya benzeri uygulamalar ile 2FA\'yı aktif edebilirsiniz. Özellikle kurumsal kullanıcılarımıza 2FA kullanımını şiddetle öneriyoruz.'
    },
    {
      category: 'Özellikler',
      question: 'Aynı anda kaç proje oluşturabilirim?',
      answer: 'Free plan ile 3 proje, Pro plan ile 50 proje, Enterprise plan ile sınırsız proje oluşturabilirsiniz. Her proje için ayrı yol haritaları, görevler ve takım üyeleri atayabilirsiniz. Proje limitleri hakkında detaylı bilgi için fiyatlandırma sayfamızı inceleyebilirsiniz.'
    },
    {
      category: 'Özellikler',
      question: 'Ekip üyelerim projelere nasıl erişir?',
      answer: 'Dashboard\'dan "Takım" bölümüne girerek e-posta ile davet gönderebilirsiniz. Davet edilen kişiler e-postalarına gelen linke tıklayarak projeye erişim sağlar. Her üyeye farklı roller (Admin, Editor, Viewer) atayabilir ve yetkileri özelleştirebilirsiniz. Rol bazlı erişim kontrolü sayesinde güvenli işbirliği yapabilirsiniz.'
    },
    {
      category: 'Özellikler',
      question: 'Hangi dosya formatlarını destekliyorsunuz?',
      answer: 'PDF, DOCX, DOC, TXT, MD ve RTF formatlarını destekliyoruz. Free plan ile maksimum 5 MB, Pro plan ile 50 MB, Enterprise plan ile sınırsız boyutta dosya yükleyebilirsiniz. Görsel içerikli PDF\'lerde OCR otomatik olarak yapılır. Şifreli dosyalar için önce şifreyi kaldırmanız gerekir.'
    },
    {
      category: 'Teknik',
      question: 'API entegrasyonu mevcut mu?',
      answer: 'Evet, RESTful API ile ProYön\'ü kendi uygulamalarınıza entegre edebilirsiniz. API dokümantasyonu için /api-docs sayfasını ziyaret edin. API anahtarınızı dashboard\'dan oluşturabilirsiniz. Rate limit: Free plan 100 istek/saat, Pro plan 1000 istek/saat, Enterprise sınırsız.'
    },
    {
      category: 'Teknik',
      question: 'Mobil uygulamanız var mı?',
      answer: 'Şu anda web tabanlı responsive uygulamamız var ve tüm mobil cihazlarda mükemmel çalışıyor. Progressive Web App (PWA) olarak ana ekrana ekleyebilir, offline kullanabilirsiniz. Native iOS ve Android uygulamaları 2026 Q1\'de yayınlanacak.'
    },
    {
      category: 'Kullanım',
      question: 'Proyon AI asistanı nasıl kullanılır?',
      answer: 'Herhangi bir proje sayfasında sağ altta Proyon AI butonu vardır. Tıkladığınızda chat penceresi açılır. Doğal dilde Türkçe veya İngilizce yazabilirsiniz. Örnek: "Backend için bir görev ekle", "Bu projenin risklerini analiz et", "Deadline yaklaşan görevleri göster". AI, projenizi anlar ve istediğiniz işlemi yapar veya analiz sağlar.'
    },
    {
      category: 'Kullanım',
      question: 'Roadmap nasıl düzenlenir?',
      answer: 'Görsel roadmap\'te drag & drop ile görevleri taşıyabilir, sıralayabilirsiniz. Görev kartlarına tıklayarak detayları düzenleyebilir, deadline ekleyebilir, ekip üyesi atayabilirsiniz. Yeni aşama veya milestone eklemek için "+" butonunu kullanın. Proyon AI\'ya "yeni bir görev ekle" diyerek de ekleyebilirsiniz.'
    },
  ];

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

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
              <HelpCircle className="w-3.5 h-3.5 mr-2" />
              Destek Merkezi
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Size Nasıl{' '}
            <GradientText className="block mt-2">
              Yardımcı Olabiliriz?
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Sorularınızın yanıtlarını bulun veya bize ulaşın. 
            7/24 size yardımcı olmak için buradayız.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Clock, label: 'Ortalama Yanıt', value: '<2 saat' },
              { icon: MessageCircle, label: 'Memnuniyet', value: '%98' },
              { icon: Users, label: 'Aktif Destek', value: '7/24' },
              { icon: CheckCircle2, label: 'Çözüm Oranı', value: '%95' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center">
                  <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Content */}
      <section className="relative py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-12 h-auto p-1 bg-muted/50">
              <TabsTrigger
                value="faq"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-xs font-medium">SSS</span>
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Mail className="w-5 h-5" />
                <span className="text-xs font-medium">İletişim</span>
              </TabsTrigger>
              <TabsTrigger
                value="community"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Topluluk</span>
              </TabsTrigger>
              <TabsTrigger
                value="status"
                className="flex flex-col items-center gap-2 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="w-5 h-5" />
                <span className="text-xs font-medium">Sistem Durumu</span>
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Sık Sorulan Sorular
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    En çok merak edilen konular ve yanıtları
                  </p>
                </div>

                {Object.entries(groupedFaqs).map(([category, questions]) => (
                  <div key={category} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="text-sm">
                        {category}
                      </Badge>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    
                    <Accordion type="single" collapsible className="space-y-4">
                      {questions.map((faq, i) => (
                        <AccordionItem
                          key={i}
                          value={`${category}-${i}`}
                          className="border border-border rounded-lg px-6 data-[state=open]:border-primary/50"
                        >
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-semibold">{faq.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}

                <Card className="mt-12 border-blue-500/20">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      Cevabını bulamadınız mı?
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Destek ekibimiz size yardımcı olmak için hazır
                    </p>
                    <Button onClick={() => setActiveTab('contact')}>
                      Bize Ulaşın
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Bize Ulaşın
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Formu doldurun, en kısa sürede size dönüş yapalım
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  {/* Contact Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">İletişim Yolları</CardTitle>
                      <CardDescription>
                        Size en uygun yöntemle ulaşın
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-semibold mb-1">E-posta</p>
                          <a href="mailto:destek@proyon.com" className="text-sm text-primary hover:underline">
                            destek@proyon.com
                          </a>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ortalama yanıt süresi: 2 saat
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold mb-1">Canlı Destek</p>
                          <p className="text-sm text-muted-foreground">
                            7/24 canlı destek hattı
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Sohbet Başlat
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                        <Users className="w-6 h-6 text-blue-500 flex-shrink-0" />
                        <div>
                          <p className="font-semibold mb-1">Topluluk Forumu</p>
                          <p className="text-sm text-muted-foreground">
                            Diğer kullanıcılarla etkileşime geçin
                          </p>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => setActiveTab('community')}>
                            Foruma Git
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">İletişim Formu</CardTitle>
                      <CardDescription>
                        Formunuzu doldurun, size ulaşalım
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isSubmitted ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Mesajınız Gönderildi!</h3>
                          <p className="text-muted-foreground">
                            En kısa sürede size dönüş yapacağız.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Ad Soyad</label>
                            <Input
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              placeholder="Adınız ve soyadınız"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">E-posta</label>
                            <Input
                              required
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              placeholder="ornek@email.com"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Konu</label>
                            <Input
                              required
                              value={formData.subject}
                              onChange={(e) => setFormData({...formData, subject: e.target.value})}
                              placeholder="Konuyu kısaca belirtin"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Mesajınız</label>
                            <Textarea
                              required
                              value={formData.message}
                              onChange={(e) => setFormData({...formData, message: e.target.value})}
                              placeholder="Detaylı açıklama yapın..."
                              rows={4}
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                              'Gönderiliyor...'
                            ) : (
                              <>
                                Gönder
                                <Send className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </form>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Community Tab */}
            <TabsContent value="community" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Topluluk
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    ProYön topluluğuna katılın ve diğer kullanıcılarla etkileşime geçin
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Github className="w-10 h-10 text-primary mb-4" />
                      <CardTitle className="text-2xl">GitHub Discussions</CardTitle>
                      <CardDescription>
                        Özellik önerileri, bug raporları ve teknik tartışmalar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        GitHub discussions üzerinden geliştirme sürecine katkıda bulunun,
                        yeni özellikler önerin ve diğer geliştiricilerle etkileşime geçin.
                      </p>
                      <Button variant="outline" className="w-full group">
                        GitHub'a Git
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <MessageCircle className="w-10 h-10 text-blue-500 mb-4" />
                      <CardTitle className="text-2xl">Discord Sunucusu</CardTitle>
                      <CardDescription>
                        Gerçek zamanlı sohbet ve topluluk desteği
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Discord sunucumuzda diğer ProYön kullanıcılarıyla tanışın,
                        sorularınızı sorun ve deneyimlerinizi paylaşın.
                      </p>
                      <Button variant="outline" className="w-full group">
                        Discord'a Katıl
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Globe className="w-10 h-10 text-green-500 mb-4" />
                      <CardTitle className="text-2xl">Topluluk Forumu</CardTitle>
                      <CardDescription>
                        Kullanıcı deneyimleri ve ipuçları paylaşımı
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Topluluk forumunda best practice'ler öğrenin, projelerinizi
                        paylaşın ve diğer kullanıcılardan ilham alın.
                      </p>
                      <Button variant="outline" className="w-full group">
                        Foruma Git
                        <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <FileText className="w-10 h-10 text-purple-500 mb-4" />
                      <CardTitle className="text-2xl">Blog & Rehberler</CardTitle>
                      <CardDescription>
                        Eğitim içerikleri ve güncellemeler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Blog yazılarımızda proje yönetimi ipuçları, başarı hikayeleri
                        ve platform güncellemelerini okuyun.
                      </p>
                      <Link href="/blog">
                        <Button variant="outline" className="w-full group">
                          Blog'u İncele
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mt-8 border-primary/20">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <Users className="w-12 h-12 text-primary flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Topluluk Moderatörü Ol
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          ProYön topluluğunu büyütmeye yardımcı olmak ister misiniz?
                          Aktif kullanıcılarımızı moderatör olarak davet ediyoruz.
                        </p>
                        <Button variant="outline">
                          Başvur
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Status Tab */}
            <TabsContent value="status" className="mt-0">
              <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Sistem Durumu
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    ProYön servislerinin anlık durumu
                  </p>
                </div>

                {/* Overall Status */}
                <Card className="mb-8 border-green-500/20 bg-green-500/5">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-center gap-4">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-green-500 mb-1">
                          Tüm Sistemler Çalışıyor
                        </h3>
                        <p className="text-muted-foreground">
                          Son güncelleme: Bugün, 14:30
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Status */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Servis Durumları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Web Sitesi', status: 'operational', uptime: '99.99%' },
                      { name: 'API', status: 'operational', uptime: '99.98%' },
                      { name: 'AI Roadmap Oluşturma', status: 'operational', uptime: '99.95%' },
                      { name: 'Proyon AI Asistan', status: 'operational', uptime: '99.97%' },
                      { name: 'Dosya Yükleme', status: 'operational', uptime: '100%' },
                      { name: 'Veritabanı', status: 'operational', uptime: '99.99%' },
                    ].map((service, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="font-semibold">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Uptime: {service.uptime}
                          </div>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Çalışıyor
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">Performans Metrikleri</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-primary mb-1">45ms</p>
                        <p className="text-sm text-muted-foreground">Ortalama API Yanıt Süresi</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-500 mb-1">99.95%</p>
                        <p className="text-sm text-muted-foreground">30 Günlük Uptime</p>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-500 mb-1">5.2s</p>
                        <p className="text-sm text-muted-foreground">Ortalama Roadmap Oluşturma</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Planned Maintenance */}
                <Card className="border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Settings className="w-6 h-6 text-blue-500" />
                      Planlı Bakımlar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Şu anda planlanmış bakım bulunmamaktadır. 
                      Planlanan bakımlar en az 48 saat önceden duyurulur.
                    </p>
                  </CardContent>
                </Card>

                <div className="mt-8 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Geçmiş kesintileri ve detaylı uptime raporunu görüntüleyin
                  </p>
                  <Button variant="outline">
                    Durum Sayfasını Görüntüle
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
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
            <MessageCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Hala Yardıma İhtiyacınız Var mı?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Destek ekibimiz size yardımcı olmak için 7/24 hazır. 
              Canlı sohbet veya e-posta ile bize ulaşın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="group">
                Canlı Sohbet Başlat
                <MessageCircle className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setActiveTab('contact')}>
                E-posta Gönder
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
