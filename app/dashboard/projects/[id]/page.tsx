import { Suspense } from 'react';
import { ProjectDashboard } from '@/components/dashboard';
import { ProjectDashboardSkeleton } from '@/components/dashboard';

export default async function ProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-slate-950">
      <Suspense fallback={<ProjectDashboardSkeleton />}>
        <ProjectDashboard projectId={id} />
      </Suspense>
    </div>
  );
}
