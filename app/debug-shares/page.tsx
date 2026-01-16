'use client';

import { useEffect, useState } from 'react';
import { GlassCard, GradientText } from '@/components/proyon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase/client';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function DebugPublicShares() {
  const [shares, setShares] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    // Get all public shares
    const { data: sharesData, error: sharesError } = await supabase
      .from('public_shares')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Shares data:', sharesData);
    console.log('Shares error:', sharesError);

    // Get all projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Projects data:', projectsData);
    console.log('Projects error:', projectsError);

    setShares(sharesData || []);
    setProjects(projectsData || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <GradientText as="h1" className="text-4xl font-bold">
            Debug: Public Shares
          </GradientText>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>

        {/* Public Shares */}
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4">Public Shares ({shares.length})</h2>
          {shares.length === 0 ? (
            <p className="text-muted-foreground">Hiç public share yok</p>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => (
                <div key={share.id} className="border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={share.is_active ? 'default' : 'secondary'}>
                      {share.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    <code className="text-xs">{share.id}</code>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Project ID:</strong> {share.project_id}</div>
                    <div><strong>Token:</strong> {share.share_token}</div>
                    <div><strong>Views:</strong> {share.view_count || 0}</div>
                    <div><strong>Timeline:</strong> {share.show_timeline ? '✅' : '❌'}</div>
                    <div><strong>Stats:</strong> {share.show_stats ? '✅' : '❌'}</div>
                    <div><strong>Comments:</strong> {share.allow_comments ? '✅' : '❌'}</div>
                    <div><strong>Created:</strong> {new Date(share.created_at).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Projects */}
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4">All Projects ({projects.length})</h2>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">Hiç proje yok</p>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border border-border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold">{project.title}</h3>
                  <div className="text-sm space-y-1">
                    <div><strong>ID:</strong> <code className="text-xs">{project.id}</code></div>
                    <div><strong>Public:</strong> {project.is_public ? '✅' : '❌'}</div>
                    <div><strong>Progress:</strong> {project.progress || 0}%</div>
                    <div><strong>Created:</strong> {new Date(project.created_at).toLocaleString('tr-TR')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Query Test */}
        <GlassCard>
          <h2 className="text-2xl font-bold mb-4">Active Public Shares (Query Test)</h2>
          <pre className="text-xs bg-secondary/20 p-4 rounded overflow-auto">
            {JSON.stringify(
              shares.filter(s => s.is_active),
              null,
              2
            )}
          </pre>
        </GlassCard>
      </div>
    </div>
  );
}
