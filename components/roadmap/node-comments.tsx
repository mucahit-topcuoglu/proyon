'use client';

/**
 * 💬 Node Comments Component
 * 
 * Node-level yorum sistemi:
 * - Yorum listesi
 * - Threaded replies (cevaplar)
 * - Yorum ekleme/düzenleme/silme
 * - Reactions (👍 ❤️ 🎉 🤔 👎)
 * - @mentions
 * - Real-time updates
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Edit2,
  Trash2,
  Reply,
  X,
  Smile,
  Check,
} from 'lucide-react';
import { Comment } from '@/types';
import {
  createComment,
  getNodeComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleReaction,
} from '@/actions/nodeComments';
import { extractMentions } from '@/lib/deadline-utils';
import { supabase } from '@/lib/supabase/client';

interface NodeCommentsProps {
  nodeId: string;
  projectId: string;
  userId?: string;
  projectMembers?: any[];
  className?: string;
}

const REACTIONS = ['👍', '❤️', '🎉', '🤔', '👎'];

export default function NodeComments({
  nodeId,
  projectId,
  userId,
  projectMembers = [],
  className = '',
}: NodeCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // Load comments
  const loadComments = async () => {
    setLoading(true);
    const result = await getNodeComments(nodeId);
    if (result.success && result.comments) {
      setComments(result.comments);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadComments();
  }, [nodeId]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`node_comments:${nodeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'node_comments',
          filter: `node_id=eq.${nodeId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nodeId]);

  // Submit comment
  const handleSubmit = async () => {
    if (!newComment.trim() || !userId) return;

    setSubmitting(true);

    // Extract mentions
    const mentionedUsers = extractMentions(newComment, projectMembers);

    const result = await createComment({
      node_id: nodeId,
      user_id: userId,
      parent_comment_id: replyingTo || undefined,
      content: newComment,
      mentioned_users: mentionedUsers,
    });

    if (result.success) {
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
    }

    setSubmitting(false);
  };

  // Update comment
  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim()) return;

    setSubmitting(true);

    const mentionedUsers = extractMentions(editContent, projectMembers);

    const result = await updateComment(commentId, {
      content: editContent,
      mentioned_users: mentionedUsers,
    });

    if (result.success) {
      setEditingComment(null);
      setEditContent('');
      await loadComments();
    }

    setSubmitting(false);
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    const result = await deleteComment(commentId);
    if (result.success) {
      await loadComments();
    }
  };

  // Toggle reaction
  const handleReaction = async (commentId: string, emoji: string) => {
    if (!userId) return;
    await toggleReaction(commentId, userId, emoji);
    setShowReactionPicker(null);
    await loadComments();
  };

  // Time ago
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Az önce';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} dakika önce`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} saat önce`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  // Comment component
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const isOwner = comment.user_id === userId;
    const isEditing = editingComment === comment.id;
    const reactions = comment.reactions || {};
    const reactionCounts = Object.entries(reactions).reduce((acc, [userId, emoji]) => {
      acc[emoji] = (acc[emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isReply ? 'ml-12 mt-2' : 'mt-4'}`}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-medium">
            {comment.user_name?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{comment.user_name || 'Kullanıcı'}</span>
            <span className="text-xs text-slate-500">{timeAgo(comment.created_at)}</span>
            {comment.edited && <span className="text-xs text-slate-600">(düzenlendi)</span>}
          </div>

          {/* Comment content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
                placeholder="Yorumunuzu düzenleyin..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(comment.id)}
                  disabled={submitting}
                  className="px-3 py-1 bg-violet-500 text-white text-sm rounded-lg hover:bg-violet-600 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{comment.content}</p>
          )}

          {/* Reactions */}
          {Object.keys(reactionCounts).length > 0 && (
            <div className="flex gap-2 mt-2">
              {Object.entries(reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                    reactions[userId!] === emoji
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-3 mt-2">
              {!isReply && (
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
                >
                  <Reply className="w-3 h-3" />
                  Yanıtla
                </button>
              )}

              <button
                onClick={() => setShowReactionPicker(comment.id)}
                className="text-xs text-slate-400 hover:text-violet-400 flex items-center gap-1"
              >
                <Smile className="w-3 h-3" />
                Reaction
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      setEditingComment(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Düzenle
                  </button>

                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Sil
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reaction picker */}
          {showReactionPicker === comment.id && (
            <div className="flex gap-2 mt-2 p-2 bg-slate-800 rounded-lg border border-slate-700">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className="hover:scale-125 transition-transform text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Show replies */}
          {!isReply && comment.reply_count! > 0 && (
            <button
              onClick={() => {
                const newExpanded = new Set(expandedReplies);
                if (newExpanded.has(comment.id)) {
                  newExpanded.delete(comment.id);
                } else {
                  newExpanded.add(comment.id);
                }
                setExpandedReplies(newExpanded);
              }}
              className="text-xs text-violet-400 hover:text-violet-300 mt-2"
            >
              {expandedReplies.has(comment.id)
                ? `Yanıtları gizle (${comment.reply_count})`
                : `${comment.reply_count} yanıtı göster`}
            </button>
          )}

          {/* Replies */}
          {expandedReplies.has(comment.id) && (
            <RepliesList parentCommentId={comment.id} />
          )}
        </div>
      </motion.div>
    );
  };

  // Replies list component
  const RepliesList = ({ parentCommentId }: { parentCommentId: string }) => {
    const [replies, setReplies] = useState<Comment[]>([]);

    useEffect(() => {
      getCommentReplies(parentCommentId).then((result) => {
        if (result.success && result.replies) {
          setReplies(result.replies);
        }
      });
    }, [parentCommentId]);

    return (
      <div>
        {replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} isReply />
        ))}
      </div>
    );
  };

  // Top-level comments (no parent)
  const topComments = comments.filter((c) => !c.parent_comment_id);

  return (
    <div className={`bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">
          Yorumlar ({topComments.length})
        </h3>
      </div>

      {/* New comment input */}
      <div className="mb-6">
        {replyingTo && (
          <div className="flex items-center gap-2 mb-2 text-sm text-slate-400">
            <Reply className="w-4 h-4" />
            <span>Yanıtlanıyor...</span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorum ekleyin... (@kullanıcı ile mention yapabilirsiniz)"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          rows={3}
        />

        <div className="flex justify-end mt-2">
          <button
            onClick={handleSubmit}
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-lg hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Gönderiliyor...' : replyingTo ? 'Yanıtla' : 'Gönder'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-800"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-800 rounded w-1/4"></div>
                <div className="h-12 bg-slate-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : topComments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Henüz yorum yok</p>
          <p className="text-xs">İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
