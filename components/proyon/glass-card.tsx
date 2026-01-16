'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  neonBorder?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  hover = false,
  neonBorder = false 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-lg p-6',
        hover && 'transition-all duration-300 hover:scale-[1.02] hover:neon-glow',
        neonBorder && 'border-2 border-primary/30',
        className
      )}
    >
      {children}
    </div>
  );
}
