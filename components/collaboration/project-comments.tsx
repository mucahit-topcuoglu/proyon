'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/proyon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2, User, Clock } from 'lucide-react';
import { getProjectComments, addComment, addAnonymousComment } from '@/actions/comments';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface CommentsProps {
  projectId: string;
  shareId: string;
  allowComments: boolean;
}

export default function ProjectComments({ projectId, shareId, allowComments }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Anonymous user fields
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  useEffect(() => {
    loadComments();
    checkUser();
  }, [projectId]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function loadComments() {
    setLoading(true);
    const result = await getProjectComments(projectId);
    if (result.success) {
      setComments(result.comments);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    console.log('Comment submit started', { projectId, shareId, user: user?.id });
    
    if (!content.trim()) {
      toast.error('Yorum boş olamaz');
      return;
    }

    setSubmitting(true);

    try {
      let result;
      if (user) {
        // Authenticated comment
        console.log('Submitting authenticated comment');
        result = await addComment({
          projectId,
          shareId,
          userId: user.id,
          content,
        });
      } else {
        // Anonymous comment
        if (!authorName.trim() || !authorEmail.trim()) {
          toast.error('İsim ve email gerekli');
          setSubmitting(false);
          return;
        }

        console.log('Submitting anonymous comment');
        result = await addAnonymousComment({
          projectId,
          shareId,
          authorName,
          authorEmail,
          content,
        });
      }

      console.log('Comment result:', result);

      if (result.success) {
        toast.success('Yorum eklendi!');
        setContent('');
        setAuthorName('');
        setAuthorEmail('');
        await loadComments();
      } else {
        console.error('Comment error:', result.error);
        toast.error(result.error || 'Yorum eklenemedi');
      }
    } catch (error: any) {
      console.error('Comment submission exception:', error);
      toast.error(error.message || 'Bir hata oluştu');
    }

    setSubmitting(false);
  }

  if (!allowComments) {
    return (
      <GlassCard className="text-center py-8">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Yorumlar bu proje için devre dışı</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Yorum Yap</h3>
          </div>

          {!user && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Adınız"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
              />
            </div>
          )}

          <Textarea
            placeholder="Yorumunuzu yazın..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="neon-glow">
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Gönder
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">
            Yorumlar ({comments.length})
          </h3>
        </div>

        {loading ? (
          <GlassCard className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          </GlassCard>
        ) : comments.length === 0 ? (
          <GlassCard className="text-center py-8">
            <p className="text-muted-foreground">Henüz yorum yok. İlk yorumu siz yapın!</p>
          </GlassCard>
        ) : (
          comments.map((comment) => (
            <GlassCard key={comment.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {comment.author_name || 'Kullanıcı'}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                    </Badge>
                    {comment.is_edited && (
                      <Badge variant="secondary" className="text-xs">
                        Düzenlendi
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
