/**
 * Premium Upsell Modal
 * Prompts free users to upgrade for advanced AI features
 */

'use client';

import { useState } from 'react';
import { X, Crown, Zap, Brain, TrendingUp, Check } from 'lucide-react';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'roadmap' | 'analysis' | 'general';
}

export function PremiumUpsellModal({ 
  isOpen, 
  onClose, 
  trigger = 'general' 
}: PremiumUpsellModalProps) {
  if (!isOpen) return null;

  const features = [
    {
      icon: Brain,
      title: 'GitHub DeepSeek-V3 AI',
      description: 'Daha derin teknik analiz ve stratejik planlama',
      highlight: true
    },
    {
      icon: TrendingUp,
      title: 'Gelişmiş Roadmap Oluşturma',
      description: '16.000 token kapasiteli detaylı proje planlaması'
    },
    {
      icon: Zap,
      title: 'Öncelikli İşleme',
      description: 'Daha hızlı AI yanıtları ve öncelikli destek'
    },
    {
      icon: Check,
      title: 'Tüm Free Özellikler',
      description: 'Google Gemini, Groq chat ve tüm temel özellikler'
    }
  ];

  const triggerMessages = {
    roadmap: 'Daha detaylı ve stratejik roadmap oluşturmak için Premium\'a yükseltin!',
    analysis: 'Derin teknik analiz için Premium AI\'ya geçiş yapın!',
    general: 'ProYön Premium ile projelerinizi bir üst seviyeye taşıyın!'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-br from-yellow-500/10 via-orange-500/10 to-pink-500/10 p-8 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
              <Crown size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                ProYön Premium
              </h2>
              <p className="text-sm text-slate-300">
                Gelişmiş AI ile daha iyi sonuçlar
              </p>
            </div>
          </div>

          <p className="text-slate-200 text-base">
            {triggerMessages[trigger]}
          </p>
        </div>

        {/* Features grid */}
        <div className="p-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-xl border transition-all
                  ${feature.highlight 
                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-lg
                    ${feature.highlight 
                      ? 'bg-yellow-500/20 text-yellow-500' 
                      : 'bg-slate-700 text-slate-300'
                    }
                  `}>
                    <feature.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">₺99</span>
              <span className="text-slate-400">/ay</span>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              İlk ay %50 indirimli: <span className="text-green-400 font-semibold">₺49,50</span>
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span>Sınırsız Premium AI kullanımı</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span>Öncelikli destek</span>
              </li>
              <li className="flex items-center gap-2">
                <Check size={16} className="text-green-400" />
                <span>Gelişmiş roadmap özellikleri</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // TODO: Implement upgrade flow
                alert('Premium yükseltme sistemi yakında aktif olacak!');
              }}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              Premium\'a Yükselt
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl transition-colors border border-slate-700"
            >
              Şimdi Değil
            </button>
          </div>

          <p className="text-xs text-center text-slate-500 mt-4">
            İstediğin zaman iptal edebilirsin. Taahhüt yok.
          </p>
        </div>
      </div>
    </div>
  );
}
