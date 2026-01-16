'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createIssue } from '@/actions/issues';
import { toast } from 'sonner';

interface CreateIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  userId: string;
  onSuccess: () => void;
}

export function CreateIssueDialog({
  open,
  onOpenChange,
  projectId,
  userId,
  onSuccess,
}: CreateIssueDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    issueType: 'bug' as 'bug' | 'feature' | 'improvement' | 'task' | 'question',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    severity: undefined as 'minor' | 'major' | 'blocker' | undefined,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Başlık gerekli');
      return;
    }
    
    setLoading(true);
    
    const result = await createIssue({
      projectId,
      title: formData.title,
      description: formData.description,
      issueType: formData.issueType,
      priority: formData.priority,
      severity: formData.severity,
      reporterId: userId,
    });
    
    setLoading(false);
    
    if (result.success) {
      toast.success('Issue oluşturuldu');
      setFormData({
        title: '',
        description: '',
        issueType: 'bug',
        priority: 'medium',
        severity: undefined,
      });
      onOpenChange(false);
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yeni Issue Oluştur</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Başlık *</Label>
            <Input
              placeholder="Issue başlığı..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label>Açıklama</Label>
            <Textarea
              placeholder="Detaylı açıklama..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tip *</Label>
              <Select
                value={formData.issueType}
                onValueChange={(value: any) => setFormData({ ...formData, issueType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="feature">✨ Feature Request</SelectItem>
                  <SelectItem value="improvement">🔧 Improvement</SelectItem>
                  <SelectItem value="task">✓ Task</SelectItem>
                  <SelectItem value="question">❓ Question</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Öncelik *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="critical">🚨 Kritik</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formData.issueType === 'bug' && (
            <div>
              <Label>Ciddiyet</Label>
              <Select
                value={formData.severity}
                onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçiniz..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor - Küçük sorun</SelectItem>
                  <SelectItem value="major">Major - Önemli sorun</SelectItem>
                  <SelectItem value="blocker">Blocker - Engelleyici</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Issue Oluştur'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
