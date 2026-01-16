'use client';

/**
 * Deadline Picker Component
 * Node'lara deadline atama ve görüntüleme
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, X, AlertCircle, CheckCircle } from 'lucide-react';
import { setNodeDeadline } from '@/actions/deadlines';
import { getDeadlineStatus, getDeadlineBadge, formatDeadline } from '@/lib/deadline-utils';
import { cn } from '@/lib/utils';

interface DeadlinePickerProps {
  nodeId: string;
  currentDeadline?: string | null;
  nodeStatus: string;
  userId?: string;
  onUpdate?: () => void;
}

export function DeadlinePicker({ nodeId, currentDeadline, nodeStatus, userId, onUpdate }: DeadlinePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [loading, setLoading] = useState(false);
  const [deadline, setDeadline] = useState<string | null>(currentDeadline || null);

  useEffect(() => {
    setDeadline(currentDeadline || null);
  }, [currentDeadline]);

  const handleSave = async () => {
    if (!selectedDate || !userId) return;

    setLoading(true);
    const deadlineString = `${selectedDate}T${selectedTime}:00`;
    const result = await setNodeDeadline(nodeId, deadlineString, userId);
    
    if (result.success) {
      setDeadline(deadlineString);
      setIsOpen(false);
      onUpdate?.();
    }
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!userId) return;
    setLoading(true);
    const result = await setNodeDeadline(nodeId, null, userId);
    
    if (result.success) {
      setDeadline(null);
      setIsOpen(false);
      onUpdate?.();
    }
    setLoading(false);
  };

  const deadlineStatus = deadline ? getDeadlineStatus(deadline, nodeStatus) : 'no_deadline';
  const badge = getDeadlineBadge(deadlineStatus);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative">
      {/* Deadline Badge/Button */}
      {deadline ? (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            'border backdrop-blur-sm',
            badge.color === 'red' && 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
            badge.color === 'orange' && 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
            badge.color === 'yellow' && 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20',
            badge.color === 'green' && 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20',
            badge.color === 'blue' && 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20',
          )}
        >
          <span className="text-sm">{badge.icon}</span>
          <span>{formatDeadline(deadline)}</span>
          <Clock className="w-3 h-3" />
        </motion.button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2 text-slate-400 hover:text-white"
        >
          <Calendar className="w-4 h-4" />
          Deadline Ekle
        </Button>
      )}

      {/* Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Deadline Belirle</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Date Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Tarih
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Time Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Saat
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Current Deadline Info */}
              {deadline && (
                <div className="flex items-start gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
                  <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="text-slate-400">Mevcut deadline:</p>
                    <p className="text-white font-medium mt-1">
                      {new Date(deadline).toLocaleString('tr-TR', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={!selectedDate || loading}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white border-0"
                >
                  {loading ? 'Kaydediliyor...' : deadline ? 'Güncelle' : 'Kaydet'}
                </Button>
                
                {deadline && (
                  <Button
                    onClick={handleRemove}
                    disabled={loading}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50">
              <p className="text-xs text-slate-500 mb-2">Hızlı Seçim:</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                >
                  Yarın
                </button>
                <button
                  onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    setSelectedDate(nextWeek.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                >
                  1 Hafta
                </button>
                <button
                  onClick={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setSelectedDate(nextMonth.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-1 text-xs bg-slate-800/50 hover:bg-slate-800 text-slate-300 rounded transition-colors"
                >
                  1 Ay
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
