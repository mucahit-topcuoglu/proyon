'use client';

/**
 * Add Node Modal
 * Manuel olarak roadmap adımı ekleme
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus, Loader2 } from 'lucide-react';
import { NodeStatus } from '@/types';
import { supabase } from '@/lib/supabase/client';

interface AddNodeModalProps {
  categoryId: string;
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddNodeModal({ categoryId, projectId, onClose, onSuccess }: AddNodeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Başlık gerekli');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Get max order_index for this category
      const { data: existingNodes }: { data: any } = await supabase
        .from('roadmap_nodes')
        .select('order_index')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: false })
        .limit(1);

      const maxOrder = existingNodes && existingNodes.length > 0 
        ? existingNodes[0].order_index 
        : -1;

      // Insert new node
      const { error: insertError } = await supabase
        .from('roadmap_nodes')
        // @ts-ignore - Supabase type issue
        .insert({
          project_id: projectId,
          category_id: categoryId,
          title: title.trim(),
          description: description.trim() || null,
          status: NodeStatus.PENDING,
          order_index: maxOrder + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Add node error:', err);
      setError(err.message || 'Adım eklenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Yeni Adım Ekle</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Adım Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: API endpoint'leri oluştur"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu adımda ne yapılacak?"
              rows={4}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-slate-400">
            💡 Adım "Bekliyor" durumunda oluşturulacak. Daha sonra "Başla" butonuyla başlatabilirsiniz.
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              İptal
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adım Ekle
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
