'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import {
  BookOpen,
  TrendingUp,
  Trophy,
  Megaphone,
  Search,
  Clock,
  ArrowRight,
  User,
  Calendar,
  Tag,
  Sparkles,
  Rocket,
  Target,
  Zap,
  Users,
  BarChart3,
  Brain,
  Globe,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  featured?: boolean;
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Tümü', icon: BookOpen },
    { id: 'guides', name: 'Rehberler', icon: Target },
    { id: 'case-studies', name: 'Başarı Hikayeleri', icon: Trophy },
    { id: 'updates', name: 'Güncellemeler', icon: Megaphone },
    { id: 'ai-trends', name: 'AI Trendleri', icon: Brain },
  ];

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Yapay Zeka ile Proje Planlama: Kapsamlı Rehber',
      excerpt: 'AI destekli proje yönetiminin temellerini öğrenin. Geleneksel yöntemlerle yapay zeka arasındaki farkları keşfedin ve projelerinizi nasıl optimize edeceğinizi öğrenin.',
      category: 'guides',
      date: '28 Aralık 2025',
      author: 'Ahmet Yılmaz',
      readTime: '8 dakika',
      image: '/blog/ai-planning.jpg',
      featured: true,
    },
    {
      id: '2',
      title: 'TechCorp: ProYön ile %50 Daha Hızlı Proje Teslimi',
      excerpt: 'TechCorp, ProYön kullanarak proje teslim sürelerini yarıya indirdi. 50+ kişilik ekiple yapay zeka destekli yönetimin getirdiği değişimi okuyun.',
      category: 'case-studies',
      date: '25 Aralık 2025',
      author: 'Zeynep Kaya',
      readTime: '12 dakika',
      image: '/blog/techcorp-success.jpg',
      featured: true,
    },
    {
      id: '3',
      title: 'Groq LPU Entegrasyonu: 10x Daha Hızlı AI İşleme',
      excerpt: 'ProYön artık Groq LPU teknolojisi ile çalışıyor. AI roadmap oluşturma süresi 60 saniyeden 5 saniyeye düştü. Teknik detayları ve performans karşılaştırmalarını öğrenin.',
      category: 'updates',
      date: '20 Aralık 2025',
      author: 'Mehmet Demir',
      readTime: '6 dakika',
      image: '/blog/groq-update.jpg',
      featured: true,
    },
    {
      id: '4',
      title: '2025 AI Proje Yönetimi Trendleri',
      excerpt: 'Yapay zeka, proje yönetimi dünyasını nasıl dönüştürüyor? 2025 yılında dikkat edilmesi gereken 7 önemli trend.',
      category: 'ai-trends',
      date: '15 Aralık 2025',
      author: 'Ayşe Öztürk',
      readTime: '10 dakika',
      image: '/blog/ai-trends-2025.jpg',
    },
    {
      id: '5',
      title: 'Agile Metodolojide AI\'ın Rolü',
      excerpt: 'Sprint planlama, backlog yönetimi ve retrospektif toplantılarında yapay zekanın kullanımı. Scrum Master\'lar için pratik ipuçları.',
      category: 'guides',
      date: '12 Aralık 2025',
      author: 'Can Yıldız',
      readTime: '9 dakika',
      image: '/blog/agile-ai.jpg',
    },
    {
      id: '6',
      title: 'StartupX: 3 Ayda 100+ Proje Başarıyla Tamamlandı',
      excerpt: 'StartupX ajansı, ProYön sayesinde müşteri memnuniyetini %95\'e çıkardı ve proje sayısını 3 katına çıkardı. Başarı stratejilerini keşfedin.',
      category: 'case-studies',
      date: '8 Aralık 2025',
      author: 'Elif Şahin',
      readTime: '11 dakika',
      image: '/blog/startupx-story.jpg',
    },
    {
      id: '7',
      title: 'Proyon AI Asistan Güncellemesi: Yeni Özellikler',
      excerpt: 'Proyon AI artık daha akıllı! Doğal dil işleme iyileştirmeleri, çoklu dil desteği ve gelişmiş bağlam anlama özellikleri.',
      category: 'updates',
      date: '5 Aralık 2025',
      author: 'Ali Çelik',
      readTime: '5 dakika',
      image: '/blog/proyon-update.jpg',
    },
    {
      id: '8',
      title: 'Uzaktan Ekip Yönetiminde AI Kullanımı',
      excerpt: 'Hibrit ve remote çalışma modellerinde yapay zeka destekli araçlar. Ekip koordinasyonu ve iletişim için en iyi uygulamalar.',
      category: 'guides',
      date: '1 Aralık 2025',
      author: 'Fatma Arslan',
      readTime: '7 dakika',
      image: '/blog/remote-teams.jpg',
    },
    {
      id: '9',
      title: 'GPT-4 vs Groq: Proje Yönetiminde Hangisi Daha İyi?',
      excerpt: 'İki güçlü AI teknolojisinin detaylı karşılaştırması. Hız, doğruluk ve maliyet analizi.',
      category: 'ai-trends',
      date: '28 Kasım 2025',
      author: 'Burak Aydın',
      readTime: '13 dakika',
      image: '/blog/gpt-vs-groq.jpg',
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

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
              ProYön Blog
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Proje Yönetimi ve{' '}
            <GradientText className="block mt-2">
              Yapay Zeka Dünyası
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Rehberler, başarı hikayeleri, güncellemeler ve AI trendleri.
            Proje yönetiminde uzmanlaşın.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-8 border-y border-border/50 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'all' && !searchQuery && (
        <section className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold">Öne Çıkan Yazılar</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl opacity-20">
                        {post.category === 'guides' && <Target />}
                        {post.category === 'case-studies' && <Trophy />}
                        {post.category === 'updates' && <Megaphone />}
                        {post.category === 'ai-trends' && <Brain />}
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find(c => c.id === post.category)?.name}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Öne Çıkan
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{post.author}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="group/btn">
                        Oku
                        <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">
              {selectedCategory === 'all' ? 'Tüm Yazılar' : categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-muted-foreground">
              {filteredPosts.length} yazı bulundu
            </p>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 to-purple-500/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-5xl opacity-10">
                        {post.category === 'guides' && <Target />}
                        {post.category === 'case-studies' && <Trophy />}
                        {post.category === 'updates' && <Megaphone />}
                        {post.category === 'ai-trends' && <Brain />}
                      </div>
                    </div>
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="text-xs w-fit mb-3">
                      {categories.find(c => c.id === post.category)?.name}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{post.author}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="group/btn">
                        Oku
                        <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Yazı Bulunamadı</h3>
              <p className="text-muted-foreground mb-6">
                Arama kriterlerinize uygun blog yazısı bulunamadı. Farklı bir arama deneyin.
              </p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Tüm Yazıları Göster
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="relative py-24 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 rounded-3xl p-12 border border-primary/20">
            <Megaphone className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Güncellemelerden Haberdar Olun
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Yeni blog yazıları, özellik güncellemeleri ve özel içerikler için e-posta listemize katılın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="E-posta adresiniz"
                className="flex-1"
              />
              <Button size="lg">
                Abone Ol
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Spam yapmıyoruz. İstediğiniz zaman abonelikten çıkabilirsiniz.
            </p>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Popüler Konular</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Rocket, title: 'Proje Başlatma', count: '12 yazı' },
              { icon: Users, title: 'Ekip Yönetimi', count: '18 yazı' },
              { icon: BarChart3, title: 'Analitik', count: '9 yazı' },
              { icon: Zap, title: 'Verimlilik', count: '15 yazı' },
              { icon: Brain, title: 'AI & Otomasyon', count: '22 yazı' },
              { icon: Target, title: 'Strateji', count: '14 yazı' },
              { icon: Globe, title: 'Uzaktan Çalışma', count: '11 yazı' },
              { icon: TrendingUp, title: 'Büyüme', count: '16 yazı' },
            ].map((topic, i) => {
              const Icon = topic.icon;
              return (
                <Card key={i} className="group hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{topic.title}</h3>
                    <p className="text-sm text-muted-foreground">{topic.count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
