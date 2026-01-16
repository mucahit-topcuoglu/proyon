'use client';

/**
 * 💬 ProYön AI Mentor Chat - Right Drawer Component
 * 
 * Groq Llama 3.3 70B powered AI mentor for project guidance
 * Pre-loads context when "I'm Stuck" is clicked
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import type { RoadmapNode, MentorLog, Project } from '@/types';
import { MessageSender } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Sparkles, Zap } from 'lucide-react';
import { askProyonAI } from '@/lib/proyonAI';

interface MentorChatProps {
  projectId: string;
  selectedNode: RoadmapNode | null;
}

export function MentorChat({ projectId, selectedNode }: MentorChatProps) {
  const [messages, setMessages] = useState<MentorLog[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load project details
  useEffect(() => {
    async function loadProject() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (error) throw error;
        setProject(data);
      } catch (err) {
        console.error('Failed to load project:', err);
      }
    }

    loadProject();
  }, [projectId]);

  // Load chat history
  useEffect(() => {
    async function loadHistory() {
      try {
        setLoadingHistory(true);
        const { data, error } = await supabase
          .from('mentor_logs')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages((data as MentorLog[]) || []);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-load message when node is selected via "I'm Stuck"
  useEffect(() => {
    if (selectedNode) {
      const preloadMessage = `Adım ${selectedNode.order_index} - "${selectedNode.title}" kısmında takıldım. ${
        selectedNode.description || 'Yardım edebilir misin?'
      }`;
      setInput(preloadMessage);
    }
  }, [selectedNode]);

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Save user message
      const { data: userLog, error: userError } = await supabase
        .from('mentor_logs')        // @ts-ignore - Supabase type issue        // @ts-ignore - Supabase type issue
        .insert({
          project_id: projectId,
          node_id: selectedNode?.id || null,
          sender: MessageSender.USER,
          message: userMessage,
        })
        .select()
        .single();

      if (userError) throw userError;

      setMessages((prev) => [...prev, userLog as MentorLog]);

      // Prepare chat history for context
      const chatHistory = messages.slice(-5).map((msg) => ({
        role: msg.sender === MessageSender.USER ? ('user' as const) : ('assistant' as const),
        content: msg.message,
      }));

      // Call ProYön AI
      const aiResponse = await askProyonAI({
        userMessage,
        projectContext: project
          ? {
              title: project.title,
              description: project.description || '',
              domain: project.domain_type,
            }
          : undefined,
        nodeContext: selectedNode
          ? {
              title: selectedNode.title,
              description: selectedNode.description || '',
              technicalRequirements: selectedNode.technical_requirements || '',
              order: selectedNode.order_index,
            }
          : undefined,
        chatHistory,
      });

      if (!aiResponse.success) {
        throw new Error(aiResponse.error || 'ProYön AI yanıt veremedi');
      }

      // Save AI response
      const { data: aiLog, error: aiError } = await supabase
        .from('mentor_logs')
        // @ts-ignore - Supabase type issue
        .insert({
          project_id: projectId,
          node_id: selectedNode?.id || null,
          sender: MessageSender.AI,
          message: aiResponse.message || 'Bir hata oluştu.',
        })
        .select()
        .single();

      if (aiError) throw aiError;

      setMessages((prev) => [...prev, aiLog as MentorLog]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      
      // Show error message to user
      const errorMessage = err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      const { data: errorLog } = await supabase
        .from('mentor_logs')
        // @ts-ignore - Supabase type issue
        .insert({
          project_id: projectId,
          node_id: selectedNode?.id || null,
          sender: MessageSender.AI,
          message: `❌ **Hata:** ${errorMessage}`,
        })
        .select()
        .single();

      if (errorLog) {
        setMessages((prev) => [...prev, errorLog as MentorLog]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Context Badge (if node selected) */}
      {selectedNode && (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 bg-violet-500/10 border-b border-violet-500/20"
        >
          <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
            <Sparkles className="w-3 h-3 mr-1" />
            Adım {selectedNode.order_index}: {selectedNode.title}
          </Badge>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingHistory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-300">
                Merhaba! Ben ProYön AI �
              </h3>
              <p className="text-xs text-slate-500">
                Projenle ilgili soru sorabilir, takıldığın yerde yardım isteyebilir,<br />
                hatta sohbet bile edebiliriz!
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  Groq Powered
                </Badge>
                <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                  Ultra-Fast
                </Badge>
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${
                  msg.sender === MessageSender.AI ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === MessageSender.AI
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {msg.sender === MessageSender.AI ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex-1 space-y-1 max-w-[80%] ${
                    msg.sender === MessageSender.AI ? 'text-left' : 'text-right'
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg px-4 py-2 ${
                      msg.sender === MessageSender.AI
                        ? 'bg-slate-800/50 text-slate-300'
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 px-2">
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-violet-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-violet-400 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-violet-400 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Bir şey sor, takıldığın yerde yardım iste veya sohbet et..."
            disabled={loading}
            className="min-h-[60px] max-h-[120px] resize-none bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white px-4"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Enter ile gönder • Shift+Enter ile yeni satır
        </p>
      </div>
    </div>
  );
}
