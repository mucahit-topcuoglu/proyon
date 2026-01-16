// Proyon Constants

export const APP_NAME = 'Proyon';
export const APP_DESCRIPTION = 'Proje Yönetim - Modern Project Management Platform';

// Design System Constants
export const DESIGN_TOKENS = {
  colors: {
    background: {
      main: '#020617', // Deep Slate
      card: 'rgba(15, 23, 42, 0.5)', // Slate 900 with 50% opacity
    },
    primary: {
      violet: '#7c3aed', // Electric Violet
      fuchsia: '#d946ef', // Neon Fuchsia
    },
    accent: {
      cyan: '#22d3ee', // Cyan for actions
    },
  },
  effects: {
    backdropBlur: 'blur(12px)',
    neonGlow: '0 0 10px rgba(124, 58, 237, 0.5), 0 0 20px rgba(124, 58, 237, 0.3)',
  },
} as const;

// Navigation
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Projects', href: '/projects', icon: 'FolderKanban' },
  { label: 'Tasks', href: '/tasks', icon: 'CheckSquare' },
  { label: 'Team', href: '/team', icon: 'Users' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;
