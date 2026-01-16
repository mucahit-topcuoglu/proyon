/**
 * User Tier Badge Component
 * Displays user's current AI tier (Free/Premium) with appropriate styling
 */

import { Crown, Sparkles } from 'lucide-react';
import { UserTier } from '@/types/ai';

interface UserTierBadgeProps {
  tier: UserTier | string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function UserTierBadge({ 
  tier, 
  showLabel = true, 
  size = 'md',
  className = '' 
}: UserTierBadgeProps) {
  const isPremium = tier === UserTier.PREMIUM || tier === 'premium';

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  if (isPremium) {
    return (
      <div
        className={`
          inline-flex items-center gap-1.5 
          ${sizeClasses[size]}
          bg-gradient-to-r from-yellow-500/20 to-orange-500/20 
          border border-yellow-500/30 
          rounded-full
          ${className}
        `}
      >
        <Crown 
          size={iconSizes[size]} 
          className="text-yellow-500 fill-yellow-500/30" 
        />
        {showLabel && (
          <span className="font-semibold text-yellow-500">
            Premium
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 
        ${sizeClasses[size]}
        bg-slate-800/50 
        border border-slate-700 
        rounded-full
        ${className}
      `}
    >
      <Sparkles 
        size={iconSizes[size]} 
        className="text-blue-400" 
      />
      {showLabel && (
        <span className="font-medium text-slate-300">
          Free
        </span>
      )}
    </div>
  );
}

export function UserTierBadgeInline({ tier }: { tier: UserTier | string }) {
  const isPremium = tier === UserTier.PREMIUM || tier === 'premium';

  if (isPremium) {
    return (
      <span className="inline-flex items-center gap-1 text-yellow-500">
        <Crown size={14} className="fill-yellow-500/30" />
        <span className="font-semibold">Premium</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-blue-400">
      <Sparkles size={14} />
      <span className="font-medium">Free</span>
    </span>
  );
}
