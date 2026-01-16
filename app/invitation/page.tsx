'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlassCard, GradientText } from '@/components/proyon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getInvitationByToken, acceptInvitation, rejectInvitation } from '@/actions/collaboration';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

function InvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails(token);
    }
  }, [token]);

  async function fetchInvitationDetails(token: string) {
    setLoading(true);
    const result = await getInvitationByToken(token);
    
    if (result.success) {
      setInvitation(result.invitation);
    } else {
      setError(result.error || 'Davet bulunamadı');
    }
    setLoading(false);
  }

  async function handleAccept() {
    if (!token) return;
    
    try {
      setActionLoading(true);
      console.log('🎯 Starting invitation acceptance...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ User fetch error:', userError);
        throw new Error('Kullanıcı bilgisi alınamadı');
      }
      
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        toast.error('Daveti kabul etmek için giriş yapmalısınız');
        router.push(`/login?redirect=/invitation?token=${token}`);
        return;
      }
      
      console.log('✅ User found:', user.id);
      console.log('📤 Calling acceptInvitation...');
      
      // Accept invitation with user ID (email check removed for flexibility)
      const result = await acceptInvitation(token, user.id);
      
      console.log('📥 acceptInvitation result:', result);
      
      if (result.success) {
        console.log('✅ Invitation accepted successfully!');
        toast.success('Davet kabul edildi! Projeye yönlendiriliyorsunuz...');
        
        // Wait a bit longer to ensure database commit, then hard redirect
        setTimeout(() => {
          console.log('🚀 Redirecting to project:', (result as any).projectId);
          window.location.href = `/dashboard/projects/${(result as any).projectId}`;
        }, 2000);
      } else {
        console.error('❌ Invitation acceptance failed:', result.error);
        toast.error(result.error || 'Davet kabul edilemedi');
        setActionLoading(false);
      }
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in handleAccept:', error);
      toast.error(error.message || 'Beklenmeyen bir hata oluştu');
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!token) return;
    
    setActionLoading(true);
    const result = await rejectInvitation(token);
    
    if (result.success) {
      toast.success('Davet reddedildi');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      toast.error(result.error || 'İşlem başarısız');
      setActionLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <GlassCard className="max-w-md">
          <div className="text-center space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Geçersiz Davet</h1>
            <p className="text-muted-foreground">
              Bu davet linki geçersiz veya süresi dolmuş.
            </p>
            <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <GlassCard className="max-w-md">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary mx-auto animate-spin" />
            <h1 className="text-2xl font-bold">Yükleniyor...</h1>
            <p className="text-muted-foreground">Davet bilgileri kontrol ediliyor</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <GlassCard className="max-w-md">
          <div className="text-center space-y-4">
            <XCircle className="w-16 h-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Hata</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => router.push('/')}>Ana Sayfaya Dön</Button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <GlassCard className="max-w-lg w-full" neonBorder>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto neon-glow">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <GradientText as="h1" className="text-3xl font-bold">
              Proje Daveti
            </GradientText>
          </div>

          <div className="bg-secondary/10 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Davet Edilen Proje</p>
              <p className="text-lg font-semibold">{invitation?.projects?.title || 'Proje'}</p>
            </div>
            {invitation?.projects?.description && (
              <div>
                <p className="text-sm text-muted-foreground">Açıklama</p>
                <p className="text-sm">{invitation.projects.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Rolünüz</p>
              <Badge variant="outline">
                {invitation?.role === 'editor' ? 'Düzenleyici' : 'Görüntüleyici'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{invitation?.email}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleAccept}
              disabled={actionLoading}
              className="flex-1 bg-primary hover:bg-primary/90 neon-glow"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Kabul Et
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              variant="outline"
              className="flex-1"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reddet
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Bu daveti kabul ederek projeye erişim hakkı kazanacaksınız
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default function InvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <InvitationContent />
    </Suspense>
  );
}
