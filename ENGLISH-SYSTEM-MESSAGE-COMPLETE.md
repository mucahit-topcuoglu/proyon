# 🎯 AI Roadmap - İngilizce System Message & Sub-Steps

## 📅 Tarih: 27 Aralık 2025

## ✨ Yapılan Değişiklikler

### 1. 🤖 AI Prompt - İngilizce System Message

**Dosya**: `actions/generateRoadmapMulti.ts`

#### Değişiklikler:
- **Tamamen yeniden yazıldı** - İngilizce system message
- **Daha detaylı kurallar** - Sub-steps mandatory
- **Educational tone** - Mentor gibi yaklaşım
- **JSON schema örneği** - AI için net format

#### Neden İngilizce?
> "Promptu İngilizce yazmak (çıktıyı Türkçe istesen bile) modelin mantık kurma becerisini artırır."

AI modelleri İngilizce ile eğitildiği için, İngilizce promptlar ile daha iyi reasoning yaparlar.

### 2. 📋 Sub-Steps (Alt Adımlar)

#### Type Definition:
```typescript
// types/index.ts
export interface SubStep {
  task: string;        // Kısa görev adı
  detail: string;      // Detaylı açıklama, komutlar
  completed?: boolean; // Tamamlandı mı? (checklist için)
}

export interface RoadmapNode {
  // ... diğer fieldlar
  sub_steps?: SubStep[] | null; // NEW!
}
```

#### Database:
```sql
-- supabase/add-sub-steps-column.sql
ALTER TABLE roadmap_nodes 
ADD COLUMN IF NOT EXISTS sub_steps JSONB DEFAULT NULL;
```

#### JSON Örneği:
```json
{
  "sub_steps": [
    {
      "task": "Proje başlat",
      "detail": "Terminal aç, `cd project` → `npm init -y` çalıştır",
      "completed": false
    },
    {
      "task": "Dependencies kur",
      "detail": "`npm install express typescript` → package.json kontrol et",
      "completed": false
    }
  ]
}
```

### 3. 📚 Yeni AI Prompt Yapısı

#### ROLE
Senior Full-Stack Developer with 15+ years experience

#### CRITICAL GUIDELINES

**1. HIERARCHICAL STRUCTURE**
- Logical stages (Backend, Frontend, Database, etc.)
- 5-8 steps per category
- Max 6 categories

**2. SUB-STEPS (MANDATORY)**
- **Every step MUST have 3-8 sub-steps**
- Think like teaching a beginner
- Exact commands, file paths, what to click

**BAD:**
```
"Setup Express server"
```

**GOOD:**
```
1. Initialize: `npm init -y`
2. Install: `npm install express@4.18.2 typescript`
3. Create folders: `src/routes/`, `src/middleware/`
4. Setup tsconfig.json
5. Create server.ts
6. Test: `curl localhost:3000/health`
```

**3. TECHNICAL DEPTH**
- Specific CLI commands with versions
- File paths (src/server.ts, not "create file")
- Config file contents
- Documentation links [Tool](URL)
- Common errors and solutions

**4. EDUCATIONAL TONE**
- Explain WHY
- "You will...", "This enables..."
- Encouraging mentor-like

**5. LANGUAGE**
- Prompt: English (better reasoning)
- Output: Turkish (all fields)

### 4. 🎨 UI Changes (TODO)

#### Checklist Component:
```tsx
{node.sub_steps && node.sub_steps.length > 0 && (
  <div className="space-y-2">
    <h4>Yapılacaklar Listesi ({completed}/{total})</h4>
    {node.sub_steps.map((subStep, idx) => (
      <label key={idx} className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={subStep.completed}
          onChange={() => updateSubStep(node.id, idx)}
        />
        <div>
          <div className="font-medium">{subStep.task}</div>
          <div className="text-sm text-muted">{subStep.detail}</div>
        </div>
      </label>
    ))}
  </div>
)}
```

#### Görünüm:
```
✓ Proje başlat
  Terminal aç, `cd project` → `npm init -y` çalıştır
  
□ TypeScript kur
  `npm install -D typescript @types/node` → tsconfig.json oluştur
  
□ Express kur
  `npm install express@4.18.2` → package.json kontrol et
```

### 5. 📊 JSON Schema

```json
{
  "project_name": "Modern E-Ticaret API",
  "categories": [
    {
      "name": "Backend Development",
      "description": "RESTful API with Node.js",
      "color": "#3b82f6",
      "icon": "Server",
      "steps": [
        {
          "title": "Express.js + TypeScript Kurulumu",
          "description": "Modern ve ölçeklenebilir backend altyapısı",
          "technical_requirements": "🔧 ARAÇLAR:\n• Node.js 18+\n• npm 9+\n\n📦 KURULUM:\n```bash\nnpm install express typescript\n```",
          "rationale": "TypeScript ile tip güvenliği, Express production-ready",
          "sub_steps": [
            {
              "task": "Proje başlat",
              "detail": "Terminal aç: `cd project` → `npm init -y`"
            },
            {
              "task": "TypeScript kur",
              "detail": "`npm install -D typescript` → tsconfig.json oluştur"
            },
            {
              "task": "Express kur",
              "detail": "`npm install express@4.18.2` → package.json kontrol"
            },
            {
              "task": "Klasör yapısı",
              "detail": "`mkdir src src/routes src/middleware`"
            },
            {
              "task": "server.ts yaz",
              "detail": "Express app başlat, CORS ekle, port 3000"
            },
            {
              "task": "Test et",
              "detail": "`npm start` → localhost:3000 → 'Server running' görmeli"
            }
          ],
          "priority": 2,
          "estimated_duration": 90
        }
      ]
    }
  ]
}
```

## 🎯 Avantajlar

### 1. Daha İyi AI Reasoning
- İngilizce prompt → Daha akıllı çıktı
- System message formatı → Tutarlı sonuçlar
- Detaylı guidelines → Standardizasyon

### 2. Beginner-Friendly
- Her adım 3-8 sub-step'e bölünmüş
- Exact commands (`npm install`, `mkdir`)
- File paths (src/server.ts)
- Test komutları
- Common errors

### 3. Checklist UX
- Kullanıcı her sub-step'i tikleyebilir
- Progress tracking (3/6 tamamlandı)
- Tamamlama hissi
- Daha yönetilebilir

### 4. Profesyonel Görünüm
- Strukturlu JSON
- Code blocks
- Documentation links
- Error handling
- Test steps

## 📝 Migration

### 1. Database:
```bash
# Supabase SQL Editor'de çalıştır:
c:\Users\Fatih\Desktop\proyon-master\supabase\add-sub-steps-column.sql
```

### 2. Yeni Proje Oluştur:
1. `/projects/new` → Proje bilgilerini gir
2. AI artık **İngilizce system message** ile çalışacak
3. Her adım **3-8 sub-step** içerecek
4. Daha **detaylı ve actionable** roadmap

### 3. UI Güncellemesi (TODO):
- Timeline view'da sub-steps checklist
- Category tabs'da sub-steps checklist  
- Sub-step update fonksiyonu
- Progress indicator

## 🔗 İlgili Dosyalar

- `actions/generateRoadmapMulti.ts` - İngilizce system message (güncellendi)
- `types/index.ts` - SubStep interface (eklendi)
- `supabase/add-sub-steps-column.sql` - Migration (yeni)
- `components/dashboard/timeline-view.tsx` - UI (güncellenecek)
- `components/roadmap/category-tabs.tsx` - UI (güncellenecek)

## ✅ Sonuç

Artık AI:
- ✅ İngilizce prompt ile **daha iyi reasoning** yapıyor
- ✅ Her adım **3-8 sub-step** içeriyor
- ✅ **Exact commands** veriyor (`npm install`, `mkdir`)
- ✅ **File paths** gösteriyor (src/server.ts)
- ✅ **Test komutları** ekliyor
- ✅ **Error solutions** sağlıyor
- ✅ **Educational tone** kullanıyor

**Kullanıcı artık her adımı KOMUT KOMUT takip edebilir!** 🎉

---

**Son Güncelleme**: 27 Aralık 2025  
**Durum**: ✅ Backend Ready - UI Update Needed  
**Migration**: supabase/add-sub-steps-column.sql (çalıştırılmalı)
