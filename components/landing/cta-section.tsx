'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/proyon';
import { ArrowRight, CheckCircle2, Phone } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-muted/20">
      {/* Subtle Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-12 md:p-16 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <GradientText>
                  Bugün Başlayın
                </GradientText>
              </h2>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Ekibinizle daha verimli çalışın. ProYön ile proje yönetimini bir üst seviyeye taşıyın.
              </p>

              {/* Benefits List */}
              <div className="space-y-3 pt-4">
                {[
                  'Kredi kartı gerektirmez',
                  '14 gün ücretsiz deneme',
                  'Kurulum desteği dahil',
                  'İstediğiniz zaman iptal edebilirsiniz',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 pt-6">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Ücretsiz Deneyin
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-all"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Satış Ekibi ile Görüşün
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Stats/Social Proof */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: '5000+', label: 'Aktif Kullanıcı' },
                  { value: '10K+', label: 'Tamamlanan Proje' },
                  { value: '99.9%', label: 'Platform Uptime' },
                  { value: '4.9/5', label: 'Müşteri Memnuniyeti' },
                ].map((stat, i) => (
                  <div key={i} className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust Indicators */}
              <div className="bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                <p className="text-sm font-semibold mb-4">Güvenlik & Uyumluluk</p>
                <div className="flex flex-wrap gap-3">
                  {['ISO 27001', 'GDPR', 'SOC 2', 'SSL/TLS'].map((badge, i) => (
                    <div key={i} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                      {badge}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
