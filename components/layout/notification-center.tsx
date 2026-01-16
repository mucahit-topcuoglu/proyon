'use client';

/**
 * 🔔 Notification Center Component
 * 
 * Bell icon with badge + dropdown menu
 * Mevcut cyber-professional tasarıma uygun
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import type { Notification } from '@/types';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/actions/notifications';
import Link from 'next/link';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    const result = await getNotifications(userId);
    if (result.success) {
      setNotifications(result.notifications);
    }
    const countResult = await getUnreadCount(userId);
    if (countResult.success) {
      setUnreadCount(countResult.count);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();

    // Real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(userId);
    loadNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    loadNotifications();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-slate-800/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-96 max-h-[600px] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                <div>
                  <h3 className="text-lg font-bold text-white">Bildirimler</h3>
                  <p className="text-xs text-slate-400">
                    {unreadCount} okunmamış
                  </p>
                </div>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs hover:bg-slate-800"
                    >
                      <CheckCheck className="w-4 h-4 mr-1" />
                      Tümünü Okundu İşaretle
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-slate-400">Bildirim yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {notifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================
// NOTIFICATION ITEM
// =============================================

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const timeAgo = getTimeAgo(new Date(notification.created_at));

  const content = (
    <div
      className={`relative p-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${
        !notification.read ? 'bg-violet-500/5' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" />
      )}

      <div className={`${!notification.read ? 'ml-4' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-white text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-slate-400 text-sm line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-slate-500 mt-1">{timeAgo}</p>
          </div>

          {/* Action buttons */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex gap-1"
              >
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      onMarkAsRead(notification.id);
                    }}
                    className="w-8 h-8 hover:bg-slate-700"
                    title="Okundu işaretle"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(notification.id);
                  }}
                  className="w-8 h-8 hover:bg-red-500/20"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return notification.link ? (
    <Link href={notification.link} onClick={() => !notification.read && onMarkAsRead(notification.id)}>
      {content}
    </Link>
  ) : (
    content
  );
}

// =============================================
// HELPER: TIME AGO
// =============================================

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' yıl önce';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' ay önce';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' gün önce';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' saat önce';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' dakika önce';

  return 'Az önce';
}
