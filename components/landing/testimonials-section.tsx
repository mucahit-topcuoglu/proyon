'use client';

import { GlassCard } from '@/components/proyon';
import { Star, Building2 } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Dr. Ahmet Yılmaz',
    role: 'CTO',
    company: 'TechVenture A.Ş.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AhmetCTO',
    rating: 5,
    text: 'ProYön platformu ile 15 kişilik geliştirme ekibimizin verimliliği %40 arttı. AI destekli roadmap özelliği planlama süremizi yarıya indirdi.',
  },
  {
    name: 'Zeynep Kara',
    role: 'Proje Müdürü',
    company: 'Digital Solutions Ltd.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZeynepPM',
    rating: 5,
    text: 'Kurumsal seviye güvenlik standartları ve kullanıcı dostu arayüz. Ekibimiz adaptasyon sürecini sadece 2 günde tamamladı.',
  },
  {
    name: 'Mehmet Demir',
    role: 'Yazılım Mimarı',
    company: 'CloudTech Inc.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MehmetArch',
    rating: 5,
    text: 'Real-time collaboration özellikleri sayesinde remote çalışan ekibimiz artık çok daha senkronize. Analytics modülü de mükemmel.',
  },
  {
    name: 'Ayşe Şahin',
    role: 'CEO & Founder',
    company: 'StartupX Ventures',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AyseCEO',
    rating: 5,
    text: 'Yatırımcılara sunum yaparken public sharing özelliği çok işe yaradı. Profesyonel görünüm ve detaylı raporlama harika.',
  },
  {
    name: 'Can Arslan',
    role: 'Lead Developer',
    company: 'DevOps Solutions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CanLead',
    rating: 5,
    text: 'API entegrasyonu çok kolay, dokümantasyon detaylı. Groq entegrasyonu ile AI yanıtları gerçekten çok hızlı geliyor.',
  },
  {
    name: 'Elif Öztürk',
    role: 'Operasyon Direktörü',
    company: 'Enterprise Corp.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ElifOps',
    rating: 5,
    text: 'Sadece yazılım değil, inşaat ve üretim projelerimizi de ProYön ile yönetiyoruz. Esneklik ve ölçeklenebilirlik harika.',
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wide">Müşteri Referansları</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Lider Şirketler{' '}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ProYön'e Güveniyor
            </span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Farklı sektörlerden yüzlerce şirket projelerini ProYön ile yönetiyor
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <GlassCard 
              key={index} 
              hover
              className="group transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex flex-col gap-6 p-2">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-bold text-base">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-xs text-primary font-medium mt-1">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground leading-relaxed text-sm">
                  &quot;{testimonial.text}&quot;
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 pt-12 border-t border-border/50">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Güvenilir teknolojiler ve standartlar
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            {[
              'ISO 27001 Certified',
              'GDPR Compliant',
              'SOC 2 Type II',
              '256-bit Encryption',
              '99.9% Uptime SLA',
            ].map((badge, i) => (
              <div key={i} className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
