# ✅ MULTI-ROADMAP SYSTEM - Kurulum Tamamlandı!

## 🎉 Yapılanlar

1. ✅ SQL Migration çalıştırıldı
2. ✅ Types güncellendi
3. ✅ Server Actions hazır
4. ✅ AI Roadmap Generator oluşturuldu

---

## 📋 Şimdi Ne Yapmalısın?

### ADIM 1: Veritabanını Test Et

Supabase SQL Editor'da çalıştır:

```sql
-- Test query'leri çalıştır
-- Dosya: supabase/test-multi-roadmap.sql

-- 1. Yeni tabloları kontrol et
SELECT COUNT(*) FROM roadmap_categories;
SELECT COUNT(*) FROM project_member_categories;

-- 2. roadmap_nodes'da category_id kolonu var mı?
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'roadmap_nodes' AND column_name = 'category_id';
```

**Beklenen:** Her sorgu başarılı olmalı.

---

### ADIM 2: İlk Test - Manuel Roadmap

Bir proje oluştur ve kategorileri test et:

```typescript
// Test kodu (console'da veya API route'da çalıştır)
import { generateMultiRoadmap } from '@/actions/generateRoadmapMulti';
import { RoadmapCreationMode, CategoryInputMode } from '@/types';

const result = await generateMultiRoadmap({
  userId: 'KULLANICI-ID-BURAYA', // Kendi user ID'n
  projectText: 'Test Projesi',
  mode: RoadmapCreationMode.MANUAL,
  categoryInput: {
    mode: CategoryInputMode.MANUAL_NAMES,
    names: ['Backend', 'Frontend', 'Database'],
  },
});

console.log(result);
// Beklenen: { success: true, categoryCount: 3, ... }
```

---

### ADIM 3: AI Test - Tam Otomatik (Opsiyonel)

AI ile roadmap oluşturmayı test et:

```typescript
const aiResult = await generateMultiRoadmap({
  userId: 'KULLANICI-ID',
  projectText: 'Next.js ve Express ile blog sitesi. Kullanıcı girişi, yazı oluşturma, yorum sistemi olacak.',
  mode: RoadmapCreationMode.AI_AUTO,
  categoryInput: {
    mode: CategoryInputMode.AI_AUTO, // AI her şeyi belirler
  },
});

console.log(aiResult);
// Beklenen: Kategoriler + çok sayıda node oluşturulmalı
```

**Not:** Bu SambaNova API çağrısı yapacak, biraz zaman alabilir (10-30 saniye).

---

### ADIM 4: UI Bileşenleri Ekle (Sıradaki)

Şimdi kullanıcı arayüzü oluşturmamız gerekiyor:

#### 4.1 Category Tabs Component
```tsx
// components/roadmap/category-tabs.tsx
// Her kategoriyi tab olarak göster
```

#### 4.2 Create Project Wizard
```tsx
// components/project/create-project-wizard.tsx
// 5 adımlı proje oluşturma sihirbazı:
// 1. Proje Bilgileri
// 2. Roadmap Modu Seç (Manuel / AI)
// 3. Kategori Ayarları
// 4. Önizleme
// 5. Oluştur
```

#### 4.3 Category Permission Manager
```tsx
// components/collaboration/category-permissions.tsx
// Team member davet ederken hangi kategorileri göreceğini seç
```

---

## 🚀 Hızlı Başlangıç - Şu An Test Etmek İçin

### Console'da Test Et

1. Tarayıcı console'unu aç (F12)
2. Şunu çalıştır:

```javascript
// Manuel kategori oluşturma testi
fetch('/api/test-roadmap', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    test: 'manual_categories'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📂 Dosya Özeti

| Dosya | Açıklama | Durum |
|-------|----------|-------|
| `supabase/multi-roadmap-categories.sql` | Migration | ✅ Çalıştırıldı |
| `types/index.ts` | TypeScript types | ✅ Güncellendi |
| `actions/roadmapCategories.ts` | Kategori CRUD | ✅ Hazır |
| `actions/generateRoadmapMulti.ts` | AI roadmap (5 mod) | ✅ Hazır |
| `lib/ai/multi-roadmap-prompts.ts` | AI prompts | ✅ Hazır |
| `tests/multi-roadmap.test.ts` | Test script | ✅ Hazır |
| `components/roadmap/*` | UI components | ⏳ Yapılacak |
| `app/projects/new/page.tsx` | Create wizard | ⏳ Yapılacak |

---

## ❓ Sıkça Sorulan Sorular

### S: Mevcut projelere nasıl kategori eklerim?

```typescript
import { createCategory } from '@/actions/roadmapCategories';

await createCategory({
  project_id: 'MEVCUT-PROJE-ID',
  name: 'Backend',
  description: 'Backend development',
  color: '#ef4444',
  icon: 'server',
  order_index: 0,
  ai_generated: false,
});
```

### S: Bir kullanıcıya kategori yetkisi nasıl verilir?

```typescript
import { grantCategoryAccess } from '@/actions/roadmapCategories';

await grantCategoryAccess({
  project_id: 'PROJE-ID',
  user_id: 'KULLANICI-ID',
  category_id: 'KATEGORI-ID',
  can_edit: true,
  can_delete: false,
  can_manage: false,
});
```

### S: AI roadmap oluşturmak ne kadar sürer?

- **Manuel mod:** Anında (0.1 saniye)
- **AI mode:** 10-30 saniye (SambaNova API çağrısı)

---

## 🐛 Hata Ayıklama

### Hata: "roadmap_categories tablosu bulunamadı"
**Çözüm:** SQL migration'ı tekrar çalıştır.

### Hata: "category_id column doesn't exist"
**Çözüm:** 
```sql
ALTER TABLE roadmap_nodes 
ADD COLUMN category_id UUID REFERENCES roadmap_categories(id);
```

### Hata: "SambaNova API error: 410"
**Çözüm:** Model adı yanlış olabilir, `DeepSeek-R1-0528` kullanıldığından emin ol.

---

## 📞 Yardım İhtiyacın Olursa

1. **SQL hataları:** `supabase/test-multi-roadmap.sql` dosyasını çalıştır
2. **TypeScript hataları:** `npm run type-check`
3. **AI hataları:** Console'daki detaylı log'lara bak

---

**Hazır mısın?** Şimdi UI component'lerini oluşturalım mı? 🚀
