/**
 * Email Verification Page
 * Kullanıcı kayıt olduktan sonra 6 haneli kodu girer
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Mail, RefreshCw, AlertCircle, Rocket } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      router.push('/signup');
    }
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (code.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalıdır');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Doğrulama başarısız');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login?verified=true');
      }, 2000);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, action: 'resend' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Kod gönderilemedi');
        setResendLoading(false);
        return;
      }

      setResendCooldown(60);
      setError('');
      alert('Yeni doğrulama kodu gönderildi!');
    } catch (err) {
      setError('Kod gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-2xl mb-4"
          >
            <Mail className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Email Doğrulama
          </h1>
          <p className="text-slate-400">
            <strong className="text-slate-300">{email}</strong> adresine gönderilen kodu girin
          </p>
        </div>

        {/* Verification Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl"
        >
          {success ? (
            // Success Message
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Doğrulama Başarılı! 🎉
              </h3>
              <p className="text-slate-400 mb-4">
                Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Doğrulama Kodu
                </label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="text-center text-3xl font-bold tracking-[1em] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-600 focus:border-violet-500"
                  disabled={loading}
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  ⏱️ Kod 10 dakika geçerlidir
                </p>
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white font-medium py-6"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Doğrulanıyor...' : 'Doğrula'}
              </Button>

              {/* Resend Code */}
              <div className="text-center space-y-3 pt-4">
                <p className="text-sm text-slate-400">Kod gelmedi mi?</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="w-full bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 
                    ? `${resendCooldown} saniye bekleyin` 
                    : 'Kodu Tekrar Gönder'}
                </Button>
              </div>

              {/* Back to Signup */}
              <div className="pt-6 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push('/signup')}
                  className="w-full text-slate-400 hover:text-white text-sm"
                >
                  Farklı email ile kayıt ol
                </Button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-slate-600 text-sm mt-8"
        >
          Proyön - Git for Projects © 2025
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/20 to-slate-950 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
