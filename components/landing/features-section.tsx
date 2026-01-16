'use client';

import { GlassCard } from '@/components/proyon';
import { 
  Bot,
  LineChart,
  Shield,
  Users,
  Zap,
  GitBranch,
  Clock,
  Globe,
  FileText
} from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Planning',
    description: 'Yapay zeka destekli otomatik proje planlaması. Sadece proje detaylarınızı girin, AI sizin için kapsamlı roadmap oluştursun.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Ekibinizle gerçek zamanlı işbirliği yapın. Görev atamaları, yorumlar ve anlık bildirimlerle senkronize çalışın.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
  },
  {
    icon: LineChart,
    title: 'Advanced Analytics',
    description: 'Detaylı raporlar ve analizlerle proje performansınızı izleyin. Veri odaklı kararlar alın, süreçlerinizi optimize edin.',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'ISO 27001 uyumlu güvenlik standartları. Row Level Security, şifreleme ve düzenli güvenlik denetimleri.',
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
  },
  {
    icon: Zap,
    title: 'Lightning Performance',
    description: 'Groq LPU teknolojisi ile ultra-hızlı AI yanıtları. Geleneksel sistemlerden 10x daha hızlı işlem gücü.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-600/10',
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Proje değişikliklerini takip edin. Geçmiş sürümlere dönün, değişiklikleri karşılaştırın ve merge edin.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Otomatik zaman takibi ve raporlama. Hangi görevlere ne kadar zaman harcandığını detaylı analiz edin.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-600/10',
  },
  {
    icon: Globe,
    title: 'Public Sharing',
    description: 'Projelerinizi herkese açık paylaşın. Portfolio oluşturun, topluluktan feedback alın ve görünürlüğünüzü artırın.',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-600/10',
  },
  {
    icon: FileText,
    title: 'Smart Documentation',
    description: 'AI destekli otomatik dokümantasyon. Proje adımlarınız ve süreçleriniz otomatik olarak belgeleniyor.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-600/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Platform Özellikleri</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            İhtiyacınız Olan{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Her Şey
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Kurumsal seviye proje yönetimi için gerekli tüm araçlar ve özellikler tek platformda
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <GlassCard 
                key={index} 
                hover
                className="group transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col gap-4 h-full p-2">
                  <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}
