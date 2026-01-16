'use client';

/**
 * Category Permission Manager
 * Ekip üyelerine kategori bazlı yetki verme
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProjectCategories, grantCategoryAccess, grantAllCategoriesAccess } from '@/actions/roadmapCategories';
import { checkCategoryAccess } from '@/actions/roadmapCategories';
import { Loader2, FolderKanban, Shield, CheckCircle2 } from 'lucide-react';
import type { RoadmapCategory } from '@/types';

interface CategoryPermissionManagerProps {
  projectId: string;
  userId: string; // Current user (owner)
  memberUserId: string; // Member to grant permissions to
  memberName: string;
  onClose: () => void;
}

export function CategoryPermissionManager({
  projectId,
  userId,
  memberUserId,
  memberName,
  onClose,
}: CategoryPermissionManagerProps) {
  const [categories, setCategories] = useState<RoadmapCategory[]>([]);
  const [permissions, setPermissions] = useState<Record<string, { can_edit: boolean; can_delete: boolean; can_manage: boolean }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [projectId, memberUserId]);

  const loadData = async () => {
    setLoading(true);
    
    // Load categories
    const categoriesResult = await getProjectCategories(projectId);
    if (categoriesResult.success && categoriesResult.categories) {
      setCategories(categoriesResult.categories);
      
      // Load existing permissions for each category
      const perms: Record<string, any> = {};
      for (const category of categoriesResult.categories) {
        const accessResult = await checkCategoryAccess(memberUserId, category.id);
        if (accessResult.success && accessResult.permissions) {
          perms[category.id] = {
            can_edit: accessResult.permissions.can_edit,
            can_delete: accessResult.permissions.can_delete,
            can_manage: accessResult.permissions.can_manage,
          };
        } else {
          perms[category.id] = {
            can_edit: false,
            can_delete: false,
            can_manage: false,
          };
        }
      }
      setPermissions(perms);
    }
    
    setLoading(false);
  };

  const togglePermission = (categoryId: string, permission: 'can_edit' | 'can_delete' | 'can_manage') => {
    setPermissions((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [permission]: !prev[categoryId]?.[permission],
      },
    }));
  };

  const handleGrantAll = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const result = await grantAllCategoriesAccess(projectId, memberUserId, true);
      if (result.success) {
        setMessage('✅ Tüm kategorilere erişim verildi');
        await loadData(); // Reload permissions
      } else {
        setMessage('❌ Hata: ' + result.error);
      }
    } catch (error) {
      setMessage('❌ Beklenmeyen bir hata oluştu');
    }
    
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Save permissions for each category
      let successCount = 0;
      for (const category of categories) {
        const perm = permissions[category.id];
        if (perm) {
          const result = await grantCategoryAccess({
            user_id: memberUserId,
            project_id: projectId,
            category_id: category.id,
            can_edit: perm.can_edit,
            can_delete: perm.can_delete,
            can_manage: perm.can_manage,
          });
          if (result.success) successCount++;
        }
      }
      
      setMessage(`✅ ${successCount} kategori için izinler kaydedildi`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage('❌ Bir hata oluştu');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Bu projede henüz kategori yok</p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Kapat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGrantAll}
          disabled={saving}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Tümüne İzin Ver
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.startsWith('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {message}
        </div>
      )}

      {/* Category Permission Grid */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="glass rounded-lg p-4 border border-slate-800"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h4 className="font-medium">{category.name}</h4>
              {category.ai_generated && (
                <Badge variant="secondary" className="text-xs">AI</Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Can Edit */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${category.id}-edit`}
                  checked={permissions[category.id]?.can_edit || false}
                  onChange={() => togglePermission(category.id, 'can_edit')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <label
                  htmlFor={`${category.id}-edit`}
                  className="text-sm cursor-pointer"
                >
                  Düzenleyebilir
                </label>
              </div>

              {/* Can Delete */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${category.id}-delete`}
                  checked={permissions[category.id]?.can_delete || false}
                  onChange={() => togglePermission(category.id, 'can_delete')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <label
                  htmlFor={`${category.id}-delete`}
                  className="text-sm cursor-pointer"
                >
                  Silebilir
                </label>
              </div>

              {/* Can Manage */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${category.id}-manage`}
                  checked={permissions[category.id]?.can_manage || false}
                  onChange={() => togglePermission(category.id, 'can_manage')}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <label
                  htmlFor={`${category.id}-manage`}
                  className="text-sm cursor-pointer"
                >
                  Yönetebilir
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={saving}
          className="flex-1"
        >
          İptal
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </div>
    </div>
  );
}
