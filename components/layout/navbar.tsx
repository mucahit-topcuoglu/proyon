'use client';

/**
 * 🧭 Main Navigation Bar
 * 
 * Ana navigasyon çubuğu - tüm sayfalarda kullanılabilir
 * - Logo + Branding
 * - Ana menü linkleri
 * - User dropdown menu with tier badge
 * - Mobile responsive hamburger menu
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GradientText } from '@/components/proyon';
import { UserTierBadge } from '@/components/dashboard/user-tier-badge';
import { NotificationBell } from '@/components/layout/notification-bell';
import { UserTier } from '@/types/ai';
import {
  Rocket,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FolderKanban,
  User,
  ChevronDown,
  Home,
  Sparkles,
} from 'lucide-react';

// Supabase client for tier lookup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NavbarProps {
  user?: any;
}

export function Navbar({ user: initialUser }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser);
  const [userTier, setUserTier] = useState<UserTier>(UserTier.FREE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Always load user on mount
    loadUser();
  }, []);

  // Hide navbar on auth pages - AFTER all hooks
  if (pathname === '/login' || pathname === '/signup' || pathname === '/verify-email' || pathname === '/') {
    return null;
  }

  async function loadUser() {
    const { data } = await auth.getSession();
    if (data.session) {
      setUser(data.session.user);
      
      // Load user tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('tier')
        .eq('id', data.session.user.id)
        .single();
      
      if (profile?.tier) {
        setUserTier(profile.tier as UserTier);
      }
    }
  }

  async function handleLogout() {
    await auth.signOut();
    router.push('/');
  }

  const navLinks = [
    {
      href: '/dashboard/projects',
      label: 'Projeler',
      icon: FolderKanban,
      active: pathname?.startsWith('/dashboard/projects'),
    },
    {
      href: '/dashboard/analytics',
      label: 'İstatistikler',
      icon: BarChart3,
      active: pathname === '/dashboard/analytics',
    },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/dashboard/projects" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Image 
                src="/logo2.png" 
                alt="ProYön Logo" 
                width={150} 
                height={40} 
                className="h-10 w-auto"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      ${link.active 
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell */}
                <NotificationBell userId={user.id} />
                
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">
                          {user?.user_metadata?.full_name || 'Kullanıcı'}
                        </p>
                        <UserTierBadge tier={userTier} showLabel={false} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-slate-800">
                          <p className="text-sm font-medium text-white mb-1">
                            {user?.user_metadata?.full_name || 'Kullanıcı'}
                          </p>
                          <p className="text-xs text-slate-400 truncate mb-2">
                            {user?.email}
                          </p>
                          <UserTierBadge tier={userTier} size="sm" />
                        </div>

                        <div className="p-2">
                          <Link href="/dashboard/settings">
                            <button
                              onClick={() => setUserMenuOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span className="text-sm">Ayarlar</span>
                            </button>
                          </Link>

                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Çıkış Yap</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-800 py-4 space-y-2"
            >
              {/* Mobile Nav Links */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${link.active 
                          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </button>
                  </Link>
                );
              })}

              {/* Mobile User Section */}
              {user && (
                <>
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user?.user_metadata?.full_name || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link href="/dashboard/settings">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Ayarlar</span>
                    </button>
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Çıkış Yap</span>
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close menus */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
