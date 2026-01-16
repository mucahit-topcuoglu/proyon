'use client';

import { auth } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateProjectWizard } from '@/components/project/create-project-wizard';
import { Loader2 } from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserSession() {
      try {
        const { data: sessionData } = await auth.getSession();
        
        if (!sessionData.session) {
          router.push('/login');
          return;
        }

        setUserId(sessionData.session.user.id);
        setLoading(false);
      } catch (error) {
        console.error('Session error:', error);
        router.push('/login');
      }
    }

    getUserSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950/10 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return <CreateProjectWizard userId={userId} />;
}
