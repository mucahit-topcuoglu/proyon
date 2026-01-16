'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

export function GradientText({ 
  children, 
  className,
  as: Component = 'span' 
}: GradientTextProps) {
  return (
    <Component className={cn('gradient-text', className)}>
      {children}
    </Component>
  );
}
