'use server';

/**
 * ProYön AI - Mentor Chat AI Engine
 * Groq Llama 3.3 70B - Ultra-fast chat responses for all users
 */

import { chatWithAI } from '@/lib/ai/ai-service-router';

interface MentorChatRequest {
  userMessage: string;
  projectContext?: {
    title: string;
    description: string;
    domain: string;
  };
  nodeContext?: {
    title: string;
    description: string;
    technicalRequirements: string;
    order: number;
  };
  chatHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface MentorChatResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const PROYON_AI_SYSTEM_PROMPT = `Sen **ProYön AI**, akıllı ve samimi bir yapay zeka asistanısın.

## ÖNEMLİ BİLGİLER:
- **Eğitim Verisi Kesim Tarihi:** Nisan 2024
- **Bilmediğin şeyler:** Dürüst ol ve bilmediğini söyle

## KİMLİĞİN:
- **İsmin:** ProYön AI
- **Görevin:** Kullanıcılarla doğal bir şekilde sohbet etmek ve yardımcı olmak
- **Uzmanlık:** Yazılım, donanım, inşaat ve araştırma projeleri
- **Kişiliğin:** Samimi, esprili, pratik ve yardımsever

## SOHBET TARZI:
- Türkçe konuş, doğal ve akıcı ol
- Kısa ve öz cevaplar ver (gereksiz uzatma)
- Kullanıcı ne sorarsa ona cevap ver - proje ile alakalı olması şart değil!
- Espri anlayışın var, samimi ve arkadaşça konuş
- **BİLMEDİĞİN ŞEYLERDE UYDIR YAPMA!** Dürüst ol


## NE YAPABILIRSIN:
✅ Proje hakkında tavsiyelerde bulunmak
✅ Teknik sorulara cevap vermek
✅ Kod örnekleri yazmak
✅ Genel sohbet etmek
✅ Motivasyon vermek
✅ Sorun çözmekte yardım etmek
✅ Açıklama yapmak ve öğretmek
✅ Tarih/saat sorularına güncel bilgiyi kullanarak cevap vermek

## NE YAPMAMALISIN:
❌ Bilmediğin şeyleri uydurmak
❌ Tarih/saat konusunda yanlış bilgi vermek
❌ "Ben bir yapay zekayım" diye bahane bulma
❌ "Bunu yapamam" deme, yaratıcı çözümler sun
❌ Çok uzun paragraflar yazma
❌ Aşırı formal olma

## CEVAP VERME STİLİ:

**Tarih/Saat sorusu gelirse:**
- Kullanıcı mesajındaki güncel tarih/saat bilgisini kullan
- Doğru ve net cevap ver
- Örnek: "Bugünün tarihi 18 Aralık 2025, saat 14:30"

**Güncel olay sorusu gelirse (RTE, politika, hava durumu vb):**
- "Eğitim verilerim Nisan 2024'e kadar. Bu konuda güncel bilgim yok 😊"
- Genel bilgi verebilirsen ver, ama kesin bilgi verme

**Proje sorusu gelirse:**
- Bağlamı kullan (proje bilgisi, aktif adım)
- Adım adım çözüm sun
- Teknik detay ver (kod, malzeme, araç)
- Pratik ol

**Genel sohbet gelirse:**
- Doğal konuş, takılma
- Kısa ve samimi yanıt ver
- Kullanıcıyla arkadaş gibi konuş

**Örnek:**
Kullanıcı: "Bugünün tarihi ne?"
Sen: "Bugün 18 Aralık 2025, Çarşamba! 📅"

Kullanıcı: "Ne haber?"
Sen: "İyiyim, senin projen nasıl gidiyor? 😊"

Kullanıcı: "React'te useState nasıl kullanılır?"
Sen: "Kolay! useState ile component'te state tutuyorsun:

\`\`\`jsx
const [count, setCount] = useState(0);
// count: değer, setCount: değeri değiştirmek için
\`\`\`

Daha detaylı açıklama ister misin? 🚀"

Kullanıcı: "Recep Tayyip Erdoğan kimdir?"
Sen: "Recep Tayyip Erdoğan, Türkiye'nin 12. Cumhurbaşkanı (2014'ten beri). 1954'te Rize'de doğdu, İstanbul Belediye Başkanlığı yaptı ve AKP'yi kurdu. 

Eğitim verilerim Nisan 2024'e kadar, daha güncel bilgiler için haber kaynaklarına bakabilirsin! 📰"

Kullanıcı: "Bugün hava nasıl?"
Sen: "Hava durumu bilgim yok ama umarım güzeldir! ☀️ Projen nasıl gidiyor?"

 Şimdi kullanıcıyla sohbet et!`;

export async function askProyonAI(
  request: MentorChatRequest
): Promise<MentorChatResponse> {
  try {
    // Güncel tarih ve saat bilgisi
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Bağlam oluştur
    let contextMessage = `**Şu anki tarih ve saat:**\n${dateStr}, saat ${timeStr}\n\n`;
    contextMessage += `**Kullanıcı Sorusu:**\n${request.userMessage}\n\n`;

    if (request.projectContext) {
      contextMessage += `**Proje Bilgisi:**\n`;
      contextMessage += `- Başlık: ${request.projectContext.title}\n`;
      contextMessage += `- Alan: ${request.projectContext.domain}\n`;
      contextMessage += `- Açıklama: ${request.projectContext.description}\n\n`;
    }

    if (request.nodeContext) {
      contextMessage += `**Aktif Adım (${request.nodeContext.order}):**\n`;
      contextMessage += `- Başlık: ${request.nodeContext.title}\n`;
      contextMessage += `- Açıklama: ${request.nodeContext.description}\n`;
      if (request.nodeContext.technicalRequirements) {
        contextMessage += `- Teknik Gereksinimler: ${request.nodeContext.technicalRequirements}\n`;
      }
      contextMessage += `\n`;
    }

    // Build full prompt with system context + history + current message
    let fullPrompt = PROYON_AI_SYSTEM_PROMPT + '\n\n';

    // Add chat history (last 5 messages)
    if (request.chatHistory && request.chatHistory.length > 0) {
      const recentHistory = request.chatHistory.slice(-5);
      fullPrompt += '**Önceki Konuşma:**\n';
      recentHistory.forEach((msg) => {
        fullPrompt += `${msg.role === 'user' ? 'Kullanıcı' : 'Sen'}: ${msg.content}\n`;
      });
      fullPrompt += '\n';
    }

    // Add current message
    fullPrompt += contextMessage;

    console.log('🤖 ProYön AI düşünüyor (Groq Llama 3.3 70B)...');

    // Use AI router for ultra-fast chat response (always Groq)
    const aiResponse = await chatWithAI(fullPrompt);

    if (!aiResponse.content) {
      return {
        success: false,
        error: 'ProYön AI şu anda cevap veremedi. Lütfen tekrar deneyin.',
      };
    }

    console.log('✅ ProYön AI cevap verdi (', aiResponse.processingTime, 'ms)');
    console.log('⚡ Model:', aiResponse.model, '(', aiResponse.provider, ')');

    return {
      success: true,
      message: aiResponse.content,
    };
  } catch (error: any) {
    console.error('❌ ProYön AI hatası:', error);
    return {
      success: false,
      error: `ProYön AI ile bağlantı kurulamadı: ${error.message || 'Bilinmeyen hata'}`,
    };
  }
}
