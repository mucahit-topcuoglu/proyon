'use client';

/**
 * 💬 Mentor Chat Demo - Works Without Supabase
 * 
 * Mock AI chat for demo purposes
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RoadmapNode } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

interface MentorChatDemoProps {
  projectId: string;
  selectedNode: RoadmapNode | null;
}

export function MentorChatDemo({ projectId, selectedNode }: MentorChatDemoProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      message: 'Merhaba! 👋 Ben ProYön AI. Projenizle ilgili sorularınızı yanıtlayabilirim. Nasıl yardımcı olabilirim?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-load message when node is selected via "I'm Stuck"
  useEffect(() => {
    if (selectedNode) {
      const preloadMessage = `Adım ${selectedNode.order_index} - "${selectedNode.title}" kısmında takıldım. Yardım edebilir misin?`;
      setInput(preloadMessage);
    }
  }, [selectedNode]);

  // Mock AI responses based on keywords
  const generateMockResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    
    if (lower.includes('supabase') || lower.includes('veritabanı')) {
      return `Supabase kurulumu için şu adımları izleyin:

1. **Supabase Projesi Oluştur**
   - [supabase.com](https://supabase.com) adresine gidin
   - "New Project" butonuna tıklayın
   - Proje adı ve şifre belirleyin

2. **Database Schema Oluştur**
   - SQL Editor'e gidin
   - \`users\`, \`products\`, \`orders\` tablolarını oluşturun
   - RLS (Row Level Security) politikalarını ekleyin

3. **API Keys Alın**
   - Project Settings → API'ye gidin
   - \`anon\` key'i kopyalayın
   - \`.env.local\` dosyasına ekleyin:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   \`\`\`

Daha detaylı yardım ister misiniz? 🚀`;
    }

    if (lower.includes('auth') || lower.includes('giriş') || lower.includes('kullanıcı')) {
      return `Authentication için NextAuth.js veya Supabase Auth kullanabilirsiniz:

**Supabase Auth (Önerilen):**
\`\`\`typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
\`\`\`

**Özellikler:**
✅ Email/Password login
✅ OAuth (Google, GitHub)
✅ Magic link
✅ Session management
✅ RLS entegrasyonu

Hangi yöntemi kullanmak istersiniz?`;
    }

    if (lower.includes('stripe') || lower.includes('ödeme')) {
      return `Stripe entegrasyonu için adım adım rehber:

1. **Stripe Hesabı**
   - [stripe.com](https://stripe.com) kayıt olun
   - Test mode API keys alın

2. **Stripe SDK Kurulumu**
\`\`\`bash
npm install stripe @stripe/stripe-js
\`\`\`

3. **Checkout Session Oluştur**
\`\`\`typescript
// app/api/checkout/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'try',
        product_data: { name: 'Ürün Adı' },
        unit_amount: 10000, // 100 TL (kuruş cinsinden)
      },
      quantity: 1,
    }],
    success_url: 'https://yourdomain.com/success',
    cancel_url: 'https://yourdomain.com/cancel',
  })
  
  return Response.json({ url: session.url })
}
\`\`\`

Test kartı: \`4242 4242 4242 4242\` 💳`;
    }

    if (lower.includes('takıldım') || lower.includes('hata') || lower.includes('sorun')) {
      return `Hangi adımda sorun yaşıyorsunuz? Size yardımcı olmak için:

1. **Hata mesajını paylaşın** - Console'da gördüğünüz hatayı kopyalayın
2. **Fotoğraf yükleyin** - Ekran görüntüsü veya kod screenshot'ı
3. **Detaylı anlatın** - Tam olarak ne yapmaya çalışıyorsunuz?

${selectedNode ? `\n**Aktif Adım:** ${selectedNode.title}\n**Teknik Detaylar:** ${selectedNode.technical_requirements || 'Belirtilmemiş'}` : ''}

Ben buradayım! 🤖💡`;
    }

    // Default response
    return `İlginç bir soru! ${selectedNode ? `"${selectedNode.title}" adımı ` : ''}hakkında size yardımcı olmak isterim.

**Demo Mode Notu:** Bu bir demo sürümüdür. Gerçek AI entegrasyonu için Google Gemini kullanılacak.

Şu konularda yardımcı olabilirim:
- 🗄️ Supabase ve veritabanı kurulumu
- 🔐 Authentication (NextAuth, Supabase Auth)
- 💳 Stripe ödeme entegrasyonu
- 🎨 UI/UX best practices
- 🐛 Hata ayıklama

Ne hakkında konuşmak istersiniz?`;
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock AI response
    const aiResponse = generateMockResponse(userMessage);
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      message: aiResponse,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
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
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-3 ${
                msg.sender === 'ai' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'ai'
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {msg.sender === 'ai' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`flex-1 space-y-1 max-w-[80%] ${
                  msg.sender === 'ai' ? 'text-left' : 'text-right'
                }`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 ${
                    msg.sender === 'ai'
                      ? 'bg-slate-800/50 text-slate-300'
                      : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
                <p className="text-xs text-slate-600 px-2">
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

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
            placeholder="Sorunuzu yazın..."
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
