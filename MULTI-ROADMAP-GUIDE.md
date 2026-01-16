# 🎯 MULTI-ROADMAP SYSTEM - Kullanım Kılavuzu

## 📋 Özellik Özeti

ProYön'de artık projeler **birden fazla roadmap kategorisine** sahip olabilir!

- **Backend**, **Frontend**, **Database** gibi kategoriler
- Her kategorinin kendi roadmap'i
- Kategori bazlı yetkilendirme (team members)
- 5 farklı roadmap oluşturma modu

---

## 🗂️ Veritabanı Yapısı

### Tablolar

#### 1. `roadmap_categories`
```sql
- id (UUID)
- project_id (UUID) → projects
- name (TEXT) - "Backend", "Frontend", etc.
- description (TEXT)
- color (TEXT) - Hex color (#ef4444)
- icon (TEXT) - Lucide icon name
- order_index (INTEGER)
- ai_generated (BOOLEAN)
- created_at, updated_at
```

#### 2. `roadmap_nodes` (Güncellendi)
```sql
-- YENİ ALAN:
+ category_id (UUID) → roadmap_categories

-- Mevcut alanlar:
- id, project_id, title, description...
- status, parent_node_id, order_index...
```

#### 3. `project_member_categories`
```sql
- id (UUID)
- project_id (UUID) → projects
- user_id (UUID) → profiles
- category_id (UUID) → roadmap_categories
- can_edit (BOOLEAN)
- can_delete (BOOLEAN)
- can_manage (BOOLEAN)
- created_at, updated_at
```

---

## 🚀 5 Roadmap Oluşturma Modu

### MODE 1: Manuel - Kategorisiz ❌
**Kullanıcı:** Roadmap'i tamamen kendisi oluşturur, kategori kullanmaz.

**Akış:**
1. Kullanıcı "Manuel Roadmap Oluştur" seçeneğini seçer
2. Sistem otomatik "General" kategorisi oluşturur
3. Kullanıcı adımları ekler (hepsi "General" kategorisinde)

**Kullanım:**
- Basit, küçük projeler
- Kategorize etmeye gerek yok

---

### MODE 2: Manuel - Kategorili ✅
**Kullanıcı:** Kategori isimlerini girer, roadmap'i kendisi oluşturur.

**Akış:**
1. Kullanıcı: "Manuel Roadmap" + "Kategorileri Belirt"
2. Girdi: `["Backend", "Frontend", "Mobile"]`
3. Sistem bu 3 kategoriyi oluşturur
4. Kullanıcı her kategoriye manuel node ekler

**Örnek:**
```
Backend:
  - [ ] API endpoint tasarla
  - [ ] Database bağlantısı yap
  
Frontend:
  - [ ] Login sayfası oluştur
  - [ ] Dashboard tasarla
  
Mobile:
  - [ ] React Native kurulumu
  - [ ] API entegrasyonu
```

**Kullanım:**
- Kullanıcı projeyi nasıl böleceğini biliyor
- Detaylı kontrol istiyor

---

### MODE 3: AI - Kategoriler Verildi 🤖
**Kullanıcı:** Kategori isimlerini verir, AI roadmap oluşturur.

**Akış:**
1. Kullanıcı: "AI ile Roadmap Oluştur" + "Kategorileri Belirt"
2. Girdi: `["Backend", "Frontend", "Database", "DevOps"]`
3. AI her kategoriye uygun adımlar oluşturur

**Örnek Proje:** E-Ticaret Sitesi

**Kullanıcı Girdisi:**
```
Kategoriler: Backend, Frontend, Database, DevOps
Açıklama: Next.js ve Node.js ile e-ticaret sitesi
```

**AI Çıktısı:**
```json
{
  "categories": [
    {
      "name": "Backend",
      "steps": [
        {
          "title": "Express API Kurulumu",
          "technical_details": "Express 4.x, TypeScript, nodemon...",
          "order": 1
        },
        {
          "title": "Ürün CRUD Endpoint'leri",
          "technical_details": "RESTful API, /api/products...",
          "order": 2
        }
      ]
    },
    {
      "name": "Frontend",
      "steps": [
        {
          "title": "Next.js 14 Kurulumu",
          "technical_details": "App Router, TypeScript, Tailwind...",
          "order": 1
        }
      ]
    }
  ]
}
```

**Kullanım:**
- Kategoriler belli ama adımları düşünmek zor
- AI'dan öneri almak

---

### MODE 4: AI - Kategori Sayısı Verildi 🤖📊
**Kullanıcı:** Sadece kategori sayısını verir, AI hem isimleri hem roadmap'i oluşturur.

**Akış:**
1. Kullanıcı: "AI ile Roadmap Oluştur" + "Kategori Sayısı: 4"
2. AI projeyi analiz eder
3. AI en uygun 4 kategoriyi belirler
4. Her kategoriye roadmap oluşturur

**Örnek Proje:** Mobil Fitness Uygulaması

**Kullanıcı Girdisi:**
```
Kategori Sayısı: 4
Açıklama: React Native ile kalori takibi ve egzersiz planlama uygulaması
```

**AI Analizi:**
- Proje tipi: Mobile + Backend
- En uygun bölümleme: Mobile App, Backend API, Database, Testing

**AI Çıktısı:**
```json
{
  "category_count": 4,
  "category_rationale": "Mobil uygulama için frontend-backend ayrımı, veri yönetimi ve kalite güvencesi gerekli.",
  "categories": [
    {"name": "Mobile App Development", "color": "#8b5cf6"},
    {"name": "Backend API", "color": "#ef4444"},
    {"name": "Database & Storage", "color": "#10b981"},
    {"name": "Testing & QA", "color": "#ec4899"}
  ]
}
```

**Kullanım:**
- Projeyi nasıl böleceğini bilmiyor
- AI'dan tam öneri istiyor

---

### MODE 5: Tam Otomatik AI 🤖✨
**Kullanıcı:** Hiçbir şey belirtmez, AI her şeyi belirler.

**Akış:**
1. Kullanıcı sadece proje açıklamasını girer
2. AI:
   - Kategori sayısını belirler (2-6 arası)
   - Kategori isimlerini belirler
   - Her kategoriye roadmap oluşturur

**Örnek Proje:** IoT Akıllı Ev Sistemi

**Kullanıcı Girdisi:**
```
Açıklama: ESP32 ile akıllı ev otomasyonu. Sıcaklık, nem, aydınlatma kontrolü. Web dashboard.
```

**AI Analizi:**
- Proje tipi: Hardware + Software + IoT
- Karmaşıklık: Orta-Yüksek
- Önerilen kategori sayısı: 5

**AI Çıktısı:**
```json
{
  "category_count": 5,
  "category_rationale": "IoT projesi için donanım, firmware, backend, frontend ve entegrasyon adımları gerekli.",
  "categories": [
    {
      "name": "Hardware & Circuit Design",
      "description": "ESP32, sensörler, röle devreleri",
      "color": "#8b5cf6",
      "steps": [...] // 8 adım
    },
    {
      "name": "Firmware Development",
      "description": "Arduino/ESP-IDF programlama",
      "color": "#ef4444",
      "steps": [...] // 10 adım
    },
    {
      "name": "Backend & MQTT",
      "description": "Mesaj broker ve API",
      "color": "#f59e0b",
      "steps": [...] // 6 adım
    },
    {
      "name": "Web Dashboard",
      "description": "React kontrol paneli",
      "color": "#3b82f6",
      "steps": [...] // 7 adım
    },
    {
      "name": "Integration & Testing",
      "description": "Sistem entegrasyonu",
      "color": "#10b981",
      "steps": [...] // 5 adım
    }
  ]
}
```

**Kullanım:**
- Hızlı başlamak isteyenler
- AI'dan maksimum yardım isteyenler

---

## 👥 Yetkilendirme Sistemi

### Senaryo 1: Proje Sahibi
```
✅ Tüm kategorilere tam erişim
✅ Yeni kategori ekleyebilir
✅ Kategorileri silebilir
✅ Team member ekleyebilir
```

### Senaryo 2: Team Member - Tek Kategori
```
Örnek: Backend Developer davet edildi

Yetki Verme:
✅ Backend kategorisine erişim
❌ Frontend kategorisine erişim YOK
❌ Database kategorisine erişim YOK

Sonuç:
- Sadece Backend roadmap'ini görür
- Backend node'larını düzenleyebilir
- Diğer kategoriler gözükmez
```

### Senaryo 3: Team Member - Birden Fazla Kategori
```
Örnek: Full-Stack Developer davet edildi

Yetki Verme:
✅ Backend kategorisi (edit: ✅, delete: ✅, manage: ✅)
✅ Frontend kategorisi (edit: ✅, delete: ✅, manage: ✅)
❌ DevOps kategorisi (erişim YOK)

Sonuç:
- Backend + Frontend roadmap'lerini görür
- İkisini de yönetebilir
- DevOps görmez
```

### Senaryo 4: Team Member - Tüm Kategoriler
```
Örnek: Project Manager davet edildi

Yetki Verme:
✅ Tüm kategorilere erişim
✅ Okuma + Düzenleme yetkisi
❌ Silme yetkisi YOK (sadece owner)

Sonuç:
- Tüm roadmap'leri görür
- Node ekleyebilir, düzenleyebilir
- Kategori silemez
```

---

## 🔧 Teknik Implementasyon

### Dosya Yapısı
```
proyon/
├── actions/
│   ├── roadmapCategories.ts      # Kategori CRUD
│   └── generateRoadmapMulti.ts   # AI roadmap (5 mod)
│
├── components/
│   ├── roadmap/
│   │   ├── category-selector.tsx
│   │   ├── category-tabs.tsx
│   │   └── multi-roadmap-view.tsx
│   └── project/
│       └── create-project-wizard.tsx  # Yeni 5-adımlı wizard
│
├── lib/
│   └── ai/
│       └── multi-roadmap-prompts.ts   # AI promptları
│
├── supabase/
│   └── multi-roadmap-categories.sql   # Migration
│
└── types/
    └── index.ts  # RoadmapCategory, CategoryInputMode
```

### API Kullanımı

#### Kategori Oluştur
```typescript
import { createCategory } from '@/actions/roadmapCategories';

const result = await createCategory({
  project_id: 'uuid',
  name: 'Backend',
  description: 'Backend geliştirme adımları',
  color: '#ef4444',
  icon: 'server',
  order_index: 0,
  ai_generated: false,
});
```

#### Kullanıcıya Yetki Ver
```typescript
import { grantCategoryAccess } from '@/actions/roadmapCategories';

await grantCategoryAccess({
  project_id: 'uuid',
  user_id: 'user-uuid',
  category_id: 'category-uuid',
  can_edit: true,
  can_delete: false,
  can_manage: false,
});
```

#### AI ile Multi-Roadmap Oluştur (MODE 5)
```typescript
import { generateMultiRoadmap } from '@/actions/generateRoadmapMulti';

const result = await generateMultiRoadmap({
  userId: 'uuid',
  projectText: 'IoT akıllı ev sistemi...',
  mode: RoadmapCreationMode.AI_AUTO,
  categoryInput: {
    mode: CategoryInputMode.AI_AUTO, // AI her şeyi belirler
  },
});

// Sonuç:
// - 1 proje oluşturuldu
// - 5 kategori oluşturuldu (AI belirledi)
// - 36 node oluşturuldu (kategori başına 5-8)
```

---

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: Startup MVP
```
Kullanıcı: "Hızlı bir MVP oluşturmak istiyorum"
Mod: MODE 5 (Tam Otomatik)
AI Kararı: 3 kategori
  - MVP Features (12 adım)
  - Infrastructure (6 adım)
  - Launch Prep (4 adım)
```

### Senaryo 2: Büyük Enterprise Projesi
```
Kullanıcı: "Microservices mimarisi ile e-ticaret platformu"
Mod: MODE 4 (Kategori Sayısı: 6)
AI Kararı: 6 kategori
  - User Service (10 adım)
  - Product Service (12 adım)
  - Order Service (11 adım)
  - Payment Service (9 adım)
  - API Gateway (7 adım)
  - DevOps & Monitoring (8 adım)
```

### Senaryo 3: Akademik Proje
```
Kullanıcı: Backend, Frontend, ML Model kategorilerini belirtti
Mod: MODE 3 (Kategoriler Verildi)
AI: Her kategoriye uygun akademik standartlarda adımlar oluşturdu
```

---

## ✅ Migration Adımları

1. **SQL Çalıştır:**
   ```bash
   # Supabase SQL Editor'da:
   supabase/multi-roadmap-categories.sql
   ```

2. **Type'ları Güncelle:**
   ```bash
   npm run supabase:types
   ```

3. **Test Et:**
   - Yeni proje oluştur
   - Kategorileri test et
   - Team member yetkilendirme test et

---

## 🎨 UI/UX Önerileri

### Category Tabs
```tsx
<Tabs defaultValue="backend">
  <TabsList>
    <TabsTrigger value="backend">
      <Server className="w-4 h-4" style={{color: '#ef4444'}} />
      Backend
    </TabsTrigger>
    <TabsTrigger value="frontend">
      <Layout className="w-4 h-4" style={{color: '#3b82f6'}} />
      Frontend
    </TabsTrigger>
  </TabsList>
</Tabs>
```

### Create Project Wizard
```
Step 1: Proje Bilgileri
Step 2: Roadmap Modu Seç
  ○ Manuel
  ○ AI Yardımıyla
  ○ Tam Otomatik AI
Step 3: Kategori Ayarları (mod'a göre değişir)
Step 4: Önizleme & Oluştur
```

---

## 🚀 Sonraki Adımlar

1. ✅ Migration oluşturuldu
2. ✅ Types eklendi
3. ✅ Category actions yazıldı
4. ✅ AI prompts hazırlandı
5. ⏳ generateRoadmapMulti.ts (TO DO)
6. ⏳ UI Components (TO DO)
7. ⏳ Create Project Wizard (TO DO)

---

**Hazırlayan:** GitHub Copilot  
**Tarih:** 21 Aralık 2025  
**Versiyon:** 1.0
