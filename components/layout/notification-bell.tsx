'use client';

/**
 * 🔔 Notification Bell Component
 * Real-time bildirim dropdown
 */

import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification as deleteNotif,
  getUnreadCount
} from '@/actions/notifications';
import type { Notification } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function NotificationBell({ userId }: { userId: string }) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications
  async function loadNotifications() {
    const result = await getNotifications(userId, 20);
    if (result.success && result.notifications) {
      setNotifications(result.notifications);
    }
  }

  // Load unread count
  async function loadUnreadCount() {
    const result = await getUnreadCount(userId);
    if (result.success) {
      setUnreadCount(result.count);
    }
  }

  // Initial load
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          loadNotifications();
          loadUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Mark as read
  async function handleMarkAsRead(notificationId: string) {
    await markAsRead(notificationId);
    loadNotifications();
    loadUnreadCount();
  }

  // Mark all as read
  async function handleMarkAllAsRead() {
    setLoading(true);
    await markAllAsRead(userId);
    await loadNotifications();
    await loadUnreadCount();
    setLoading(false);
  }

  // Delete notification
  async function handleDelete(notificationId: string) {
    await deleteNotif(notificationId);
    loadNotifications();
    loadUnreadCount();
  }

  // Navigate to link
  function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  }

  // Get notification icon
  function getNotificationIcon(type: string) {
    switch (type) {
      case 'invitation_received':
        return '📨';
      case 'invitation_accepted':
        return '✅';
      case 'member_added':
        return '👥';
      case 'node_completed':
        return '🎉';
      case 'comment_added':
        return '💬';
      case 'deadline_approaching':
        return '⏰';
      case 'deadline_overdue':
        return '🚨';
      default:
        return '🔔';
    }
  }

  // Format time ago
  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins}dk önce`;
    if (diffHours < 24) return `${diffHours}sa önce`;
    if (diffDays < 7) return `${diffDays}g önce`;
    return date.toLocaleDateString('tr-TR');
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">Bildirimler</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-slate-400">{unreadCount} okunmamış</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loading}
                      className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                      title="Tümünü okundu işaretle"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">Henüz bildirim yok</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group relative ${
                          !notification.read ? 'bg-violet-950/20' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-white text-sm">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                                title="Okundu işaretle"
                              >
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-800 text-center">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/dashboard/notifications');
                    }}
                    className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Tüm bildirimleri gör →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
