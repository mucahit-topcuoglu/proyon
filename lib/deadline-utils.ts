/**
 * Deadline utility functions (client-side)
 */

import type { DeadlineStatus } from '@/types';

/**
 * Calculate deadline status
 */
export function getDeadlineStatus(
  deadline: string | null,
  nodeStatus: string
): DeadlineStatus {
  if (!deadline) return 'no_deadline';
  if (nodeStatus === 'completed' || nodeStatus === 'done') return 'completed';

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  if (diffDays <= 7) return 'due_this_week';
  return 'future';
}

/**
 * Get deadline badge color and text
 */
export function getDeadlineBadge(status: DeadlineStatus): {
  color: string;
  text: string;
  icon: string;
} {
  switch (status) {
    case 'overdue':
      return { color: 'red', text: 'Gecikmiş', icon: '🔴' };
    case 'due_today':
      return { color: 'orange', text: 'Bugün', icon: '🟠' };
    case 'due_this_week':
      return { color: 'yellow', text: 'Bu Hafta', icon: '🟡' };
    case 'completed':
      return { color: 'green', text: 'Tamamlandı', icon: '✅' };
    case 'future':
      return { color: 'blue', text: 'Gelecek', icon: '🔵' };
    default:
      return { color: 'gray', text: 'Deadline Yok', icon: '⚪' };
  }
}

/**
 * Format deadline for display
 */
export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} gün gecikmiş`;
  } else if (diffDays === 0) {
    return 'Bugün';
  } else if (diffDays === 1) {
    return 'Yarın';
  } else if (diffDays <= 7) {
    return `${diffDays} gün içinde`;
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta içinde`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} ay içinde`;
  }
}

/**
 * Extract @mentions from comment content
 */
export function extractMentions(content: string, projectMembers: any[]): string[] {
  const mentionRegex = /@(\w+|[^\s@]+@[^\s@]+\.[^\s@]+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];

  const mentioned: string[] = [];
  
  for (const match of matches) {
    const username = match.slice(1); // Remove @
    
    // Find member by username or email
    const member = projectMembers.find(
      (m: any) => 
        m.profiles?.email === username ||
        m.profiles?.full_name?.toLowerCase() === username.toLowerCase()
    );
    
    if (member) {
      mentioned.push(member.user_id);
    }
  }
  
  return [...new Set(mentioned)]; // Remove duplicates
}
