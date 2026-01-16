'use client';

/**
 * 💀 Project Dashboard Skeleton Loader
 * 
 * Loading state for dashboard with animated skeletons
 */

import { motion } from 'framer-motion';

export function ProjectDashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Left Sidebar Skeleton */}
      <aside className="w-80 border-r border-slate-800/50 bg-slate-950/50 p-6 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Abstract */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </aside>

      {/* Center Timeline Skeleton */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-64" />
          </div>

          {/* Timeline Items */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="ml-12 space-y-3">
              <div className="flex gap-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`bg-slate-800/50 rounded ${className}`}
    />
  );
}
