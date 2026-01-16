import Link from 'next/link';
import { GradientText } from '@/components/proyon';
import { Navbar, Footer } from '@/components/landing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Calendar, Users, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PublicProjectsClient } from './client';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PublicProject {
  id: string;
  share_token: string;
  description: string;
  team_members: string;
  view_count: number;
  likes_count: number;
  created_at: string;
  projects: {
    id: string;
    title: string;
    description: string;
    tags: string[];
    created_at: string;
    status: string;
  };
}

async function getAllPublicProjects() {
  try {
    const supabase = await createClient();
    
    const { data: publicShares, error } = await supabase
      .from('public_shares')
      .select(`
        *,
        projects (
          id,
          title,
          description,
          tags,
          created_at,
          user_id,
          status
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public projects:', error);
      return [];
    }

    console.log('📊 Public shares found:', publicShares?.length || 0);

    return (publicShares || []) as PublicProject[];
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return [];
  }
}

export default async function PublicProjectsPage() {
  const initialProjects = await getAllPublicProjects();
  const totalViews = initialProjects.reduce((acc, p) => acc + (p.view_count || 0), 0);

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
              <Globe className="w-3.5 h-3.5 mr-2" />
              Public Projeler
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Topluluktan{' '}
            <GradientText className="block mt-2">
              İlham Alın
            </GradientText>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Topluluk üyelerinin paylaştığı {initialProjects.length} projeyi keşfedin ve 
            kendi projeleriniz için ilham alın.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { label: 'Toplam Proje', value: initialProjects.length },
              { label: 'Aktif Kullanıcı', value: '500+' },
              { label: 'Görüntülenme', value: totalViews.toLocaleString('tr-TR') },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client-side filtering component (includes CTA and Footer) */}
      <PublicProjectsClient initialProjects={initialProjects} />
    </div>
  );
}
