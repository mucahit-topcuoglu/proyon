'use client';

/**
 * Generate Roadmap CTA Component
 * Shown when a project has no roadmap yet
 * Triggers AI-powered roadmap generation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { generateMultiRoadmap } from '@/actions/generateRoadmapMulti';
import { RoadmapCreationMode } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface GenerateRoadmapCTAProps {
  projectId: string;
  projectTitle: string;
  projectDescription: string;
  onRoadmapGenerated?: () => void; // Callback roadmap oluşturulunca
}

export function GenerateRoadmapCTA({ projectId, projectTitle, projectDescription, onRoadmapGenerated }: GenerateRoadmapCTAProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setStatus('idle');
      setMessage('');

      // Get user ID from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      }

      const result = await generateMultiRoadmap({
        userId: session.user.id,
        projectId: projectId,
        projectText: `${projectTitle}\n\n${projectDescription}`,
        mode: RoadmapCreationMode.AI_AUTO,
      });

      if (result.success) {
        setStatus('success');
        setMessage(`${result.categoryCount} kategori, ${result.nodeCount} adım oluşturuldu! 🎉`);
        
        // Callback'i çağır (nodes'ları yeniden yükle)
        if (onRoadmapGenerated) {
          setTimeout(() => {
            onRoadmapGenerated();
          }, 1000);
        }
      } else {
        setStatus('error');
        setMessage(result.error || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Generate roadmap error:', error);
      setStatus('error');
      setMessage('Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass rounded-2xl p-12 max-w-2xl text-center space-y-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 rounded-full">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Projeniz Hazır!
          </h2>
          <p className="text-slate-400 text-lg">
            <span className="text-white font-semibold">{projectTitle}</span> için yapay zeka destekli bir yol haritası oluşturalım mı?
          </p>
        </div>

        {/* Description */}
        <div className="glass-dark rounded-lg p-6 space-y-3 text-left">
          <p className="text-slate-300 text-sm">
            🤖 <span className="font-semibold">ProYön AI</span> projenizi analiz edecek ve:
          </p>
          <ul className="space-y-2 text-slate-400 text-sm ml-6">
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Adım adım detaylı bir yol haritası oluşturacak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Her adım için teknik detaylar ve tahmini süre belirleyecek</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Bağımlılıkları otomatik tespit edecek</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-0.5">•</span>
              <span>Sıkıştığınızda size yardımcı olacak</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <motion.div
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          <Button
            onClick={handleGenerate}
            disabled={loading || status === 'success'}
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Yol Haritası Oluşturuluyor...
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Başarılı!
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Yol Haritası Oluştur
              </>
            )}
          </Button>
        </motion.div>

        {/* Status Message */}
        <div className={message ? 'block' : 'hidden'}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-center gap-2 p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message}</span>
          </motion.div>
        </div>

        {/* Info Text */}
        <p className="text-slate-500 text-xs">
          Bu işlem yaklaşık 10-20 saniye sürebilir. SambaNova DeepSeek AI kullanılmaktadır.
        </p>
      </motion.div>
    </div>
  );
}
