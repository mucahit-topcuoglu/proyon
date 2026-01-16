'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientText } from '@/components/proyon';
import { ArrowRight, CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-muted/20">
      {/* Professional Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Badge */}
            <div className="inline-flex">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-medium hover:bg-primary/15 transition-all">
                <Zap className="w-3.5 h-3.5 mr-2" />
                Enterprise-Grade Project Management
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Proje Yönetiminde{' '}
                <GradientText className="block mt-2">
                  Yeni Nesil Çözüm
                </GradientText>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
                Yapay zeka destekli profesyonel proje yönetim platformu ile ekibinizin verimliliğini artırın, 
                süreçlerinizi optimize edin ve hedeflerinize daha hızlı ulaşın.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                { icon: CheckCircle2, text: 'AI-Powered Roadmaps' },
                { icon: Users, text: 'Team Collaboration' },
                { icon: TrendingUp, text: 'Real-time Analytics' },
                { icon: Zap, text: 'Lightning Fast' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Ücretsiz Başlayın
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 px-8 py-6 text-base font-semibold hover:bg-muted/50 transition-all"
                >
                  Demo Talebi
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-4">Güvenilir şirketler tarafından kullanılıyor</p>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>5000+ Aktif Kullanıcı</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>ISO 27001</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-3xl opacity-50" />
              
              {/* Main Card */}
              <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  {/* Dashboard Preview */}
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-primary to-primary/50 rounded-full w-2/3" />
                    <div className="h-4 bg-muted rounded-full w-full" />
                    <div className="h-4 bg-muted rounded-full w-5/6" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    {[
                      { label: 'Projeler', value: '24' },
                      { label: 'Tamamlanan', value: '18' },
                      { label: 'Aktif', value: '6' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3 pt-4">
                    {[75, 90, 60].map((progress, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Proje {i + 1}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-4 shadow-lg animate-bounce">
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
