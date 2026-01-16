# 🗄️ Proyon Veritabanı Şeması Dokümantasyonu

## 📋 Genel Bakış

Bu Supabase PostgreSQL şeması, "Git for Projects" konseptine göre tasarlanmış güvenli ve performanslı bir yapıdır.

### Temel Özellikler

✅ **Row Level Security (RLS)** - Tüm tablolarda aktif
✅ **pgvector Extension** - AI RAG için hazır
✅ **Performans İndeksleri** - Hızlı sorgular için optimize edilmiş
✅ **Otomatik Trigger'lar** - Zaman damgaları ve durum yönetimi
✅ **Bağımlılık Grafiği** - DAG yapısında node bağımlılıkları

## 📊 Veri Modeli

### 1. **profiles** (Kullanıcı Profilleri)

```sql
profiles (
  id UUID PRIMARY KEY,              -- auth.users ile ilişkili
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Roller:**
- `user` - Normal kullanıcı
- `admin` - Yönetici
- `mentor` - Mentor (gelecek için)

### 2. **projects** (Projeler)

```sql
projects (
  id UUID PRIMARY KEY,
  user_id UUID,                     -- Proje sahibi
  title TEXT NOT NULL,
  abstract_text TEXT,               -- Kısa özet
  description TEXT,                 -- Detaylı açıklama
  status project_status,            -- planning, active, on_hold, completed, archived
  domain_type domain_type,          -- software, hardware, construction, research
  tags TEXT[],                      -- Etiketler
  is_public BOOLEAN,                -- Herkes görebilir mi?
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Durum Türleri:**
- `planning` - Planlama aşamasında
- `active` - Aktif çalışılıyor
- `on_hold` - Beklemede
- `completed` - Tamamlandı
- `archived` - Arşivlendi

**Alan Türleri:**
- `software` - Yazılım projesi
- `hardware` - Donanım projesi
- `construction` - İnşaat/Mimari proje
- `research` - Araştırma projesi

### 3. **roadmap_nodes** (Yol Haritası Düğümleri)

Git commit'leri gibi çalışır - her node bir milestone/adım.

```sql
roadmap_nodes (
  id UUID PRIMARY KEY,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  technical_requirements TEXT,      -- Teknik gereksinimler
  rationale TEXT,                   -- Bu adımın mantığı/gerekçesi
  status node_status,               -- pending, in_progress, done
  parent_node_id UUID,              -- Bağımlılık (DAG)
  order_index INTEGER,              -- Sıralama
  priority INTEGER,                 -- 0: normal, 1: yüksek, 2: kritik
  estimated_duration INTEGER,       -- Tahmini süre (dakika)
  actual_duration INTEGER,          -- Gerçekleşen süre (dakika)
  started_at TIMESTAMPTZ,           -- Başlangıç
  completed_at TIMESTAMPTZ,         -- Bitiş
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Node Bağımlılıkları:**
- `parent_node_id`: Bu node'un bağlı olduğu ana node
- DAG (Directed Acyclic Graph) yapısı - döngüsel bağımlılık yok

**Otomatik Zaman Yönetimi:**
- Status `in_progress` olursa → `started_at` otomatik ayarlanır
- Status `done` olursa → `completed_at` ve `actual_duration` hesaplanır

### 4. **mentor_logs** (AI Mentor Sohbet Kayıtları)

Her node için AI mentor ile yapılan konuşmaları saklar.

```sql
mentor_logs (
  id UUID PRIMARY KEY,
  project_id UUID,
  node_id UUID,                     -- Hangi node için konuşuluyor
  sender message_sender,            -- user veya ai
  message TEXT NOT NULL,
  embedding vector(1536),           -- AI RAG için embedding
  tokens_used INTEGER,              -- API kullanım takibi
  model_version TEXT,               -- Hangi AI model kullanıldı
  created_at TIMESTAMPTZ
)
```

**RAG (Retrieval Augmented Generation):**
- `embedding` alanı OpenAI ada-002 formatında (1536 boyut)
- Vector similarity search için ivfflat index

## 🔒 Güvenlik (RLS Policies)

### Temel Prensipler

1. ✅ **Tüm tablolarda RLS aktif**
2. ✅ **Kullanıcılar sadece kendi verilerine erişebilir**
3. ✅ **auth.uid() ile doğrulama**
4. ✅ **Public projeler herkese açık**

### Policy Örnekleri

#### Profiles (Profiller)

```sql
-- Kullanıcı kendi profilini görebilir
POLICY "Users can view their own profile"
  USING (auth.uid() = id)

-- Kullanıcı kendi profilini güncelleyebilir  
POLICY "Users can update their own profile"
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id)
```

#### Projects (Projeler)

```sql
-- Kullanıcı sadece kendi projelerini görebilir
POLICY "Users can view their own projects"
  USING (auth.uid() = user_id)

-- Public projeler herkes tarafından görülebilir
POLICY "Public projects are viewable by everyone"
  USING (is_public = true)
```

#### Roadmap Nodes

```sql
-- Kullanıcı sadece kendi projelerinin node'larını görebilir
POLICY "Users can view nodes of their own projects"
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = roadmap_nodes.project_id 
      AND projects.user_id = auth.uid()
    )
  )
```

#### Mentor Logs

```sql
-- Kullanıcı sadece kendi projelerinin loglarını görebilir
POLICY "Users can view mentor logs of their own projects"
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = mentor_logs.project_id 
      AND projects.user_id = auth.uid()
    )
  )
```

## ⚡ Performans Optimizasyonları

### İndeksler

#### Projects
- `user_id` - Kullanıcının tüm projeleri
- `status` - Durum filtreleme
- `domain_type` - Alan filtreleme
- `created_at` - Tarih sıralama
- `(user_id, status)` - Composite index

#### Roadmap Nodes
- `project_id` - Proje node'ları
- `parent_node_id` - Bağımlılık sorguları
- `status` - Durum filtreleme
- `(project_id, status)` - Composite index
- `(project_id, order_index)` - Sıralama

#### Mentor Logs
- `project_id` - Proje logları
- `node_id` - Node konuşmaları
- `created_at` - Zaman sıralama
- `embedding` - Vector similarity (ivfflat)

### Vector Search (AI RAG)

```sql
-- Similarity search için özel index
CREATE INDEX idx_mentor_logs_embedding ON mentor_logs 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

## 🛠️ Yardımcı Fonksiyonlar

### 1. Proje İstatistikleri

```sql
SELECT get_project_stats('project-uuid-here');
```

**Döndürdüğü Veriler:**
```json
{
  "total_nodes": 10,
  "pending_nodes": 3,
  "in_progress_nodes": 2,
  "completed_nodes": 5,
  "completion_percentage": 50.00
}
```

### 2. Node Bağımlılık Zinciri

```sql
SELECT * FROM get_node_dependencies('node-uuid-here');
```

Parent node'lardan başlayarak tüm bağımlılık ağacını gösterir.

## 🔄 Otomatik Trigger'lar

### 1. Profil Otomatik Oluşturma

Yeni kullanıcı kayıt olduğunda otomatik profil oluşturulur:

```sql
-- auth.users → profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2. Zaman Damgası Güncellemesi

Her UPDATE'te `updated_at` otomatik güncellenir:

```sql
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. Node Durum Zamanları

Node durumu değiştiğinde tarihler otomatik ayarlanır:

```sql
-- in_progress → started_at ayarlanır
-- done → completed_at ve actual_duration hesaplanır
CREATE TRIGGER update_node_status_timestamps
  BEFORE UPDATE ON roadmap_nodes
  FOR EACH ROW
  EXECUTE FUNCTION update_node_timestamps();
```

## 📥 Kurulum

### 1. Supabase Projesinde Çalıştırma

1. Supabase Dashboard → SQL Editor
2. `20251218000001_initial_schema.sql` dosyasını yapıştır
3. "Run" butonuna tıkla

### 2. Yerel Geliştirme (Supabase CLI)

```bash
# Supabase CLI kur (eğer yoksa)
npm install -g supabase

# Projeyi başlat
supabase init

# Migration'ı çalıştır
supabase db reset

# Veya sadece migration'ı uygula
supabase db push
```

## 🧪 Test Sorguları

### Proje Oluşturma

```sql
INSERT INTO projects (user_id, title, abstract_text, domain_type, status)
VALUES (
  auth.uid(),
  'E-Ticaret Platformu',
  'Modern ve ölçeklenebilir bir e-ticaret çözümü',
  'software',
  'planning'
);
```

### Node Ekleme

```sql
INSERT INTO roadmap_nodes (project_id, title, description, status, order_index)
VALUES (
  'project-uuid',
  'Veritabanı Tasarımı',
  'PostgreSQL şeması oluşturulacak',
  'pending',
  1
);
```

### Mentor Log Ekleme

```sql
INSERT INTO mentor_logs (project_id, node_id, sender, message)
VALUES (
  'project-uuid',
  'node-uuid',
  'user',
  'Bu adım için teknik gereksinimleri belirlemem gerekiyor'
);
```

## 🔍 Örnek Sorgular

### Kullanıcının Tüm Projeleri

```sql
SELECT * FROM projects 
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Aktif Projelerin Node'ları

```sql
SELECT rn.* 
FROM roadmap_nodes rn
JOIN projects p ON p.id = rn.project_id
WHERE p.user_id = auth.uid() 
  AND p.status = 'active'
ORDER BY rn.order_index;
```

### Node Bağımlılıkları ile

```sql
SELECT 
  child.id,
  child.title,
  child.status,
  parent.title as parent_title
FROM roadmap_nodes child
LEFT JOIN roadmap_nodes parent ON child.parent_node_id = parent.id
WHERE child.project_id = 'project-uuid'
ORDER BY child.order_index;
```

### Tamamlanma Oranı

```sql
SELECT 
  p.title,
  COUNT(rn.id) as total_nodes,
  COUNT(rn.id) FILTER (WHERE rn.status = 'done') as completed,
  ROUND(
    (COUNT(rn.id) FILTER (WHERE rn.status = 'done')::NUMERIC / 
     NULLIF(COUNT(rn.id), 0)::NUMERIC) * 100, 
    2
  ) as completion_percentage
FROM projects p
LEFT JOIN roadmap_nodes rn ON rn.project_id = p.id
WHERE p.user_id = auth.uid()
GROUP BY p.id, p.title;
```

## 🚀 İleri Seviye Özellikler

### Vector Search (AI RAG)

```sql
-- En benzer konuşmaları bul
SELECT 
  message,
  embedding <=> '[0.1, 0.2, ...]'::vector as distance
FROM mentor_logs
WHERE project_id = 'project-uuid'
ORDER BY distance
LIMIT 5;
```

### Proje Timeline

```sql
SELECT 
  date_trunc('day', created_at) as day,
  COUNT(*) as nodes_created
FROM roadmap_nodes
WHERE project_id = 'project-uuid'
GROUP BY day
ORDER BY day;
```

## 📊 Veri İlişkileri

```
auth.users (Supabase Auth)
    ↓
profiles (1:1)
    ↓
projects (1:N)
    ↓
roadmap_nodes (1:N, DAG yapısı)
    ↑ ↓
mentor_logs (N:1)
```

## ⚠️ Önemli Notlar

1. **RLS Aktif**: Tüm tablolarda RLS etkin - güvenlik sağlandı ✅
2. **CASCADE Silme**: Proje silinirse tüm node'lar ve loglar da silinir
3. **Döngüsel Bağımlılık**: Node'lar kendine referans edemez (constraint ile engellenmiş)
4. **Embedding Boyutu**: OpenAI ada-002 için 1536, diğer modeller için ayarlayın
5. **Token Tracking**: AI API kullanımı `tokens_used` ile takip edilebilir

## 🔧 Bakım ve Yönetim

### Migration Oluşturma

```bash
# Yeni migration dosyası
supabase migration new my_change_name
```

### Backup

```bash
# Database dump
pg_dump -h db.xxx.supabase.co -U postgres > backup.sql
```

### İstatistikler

```sql
-- Tablo boyutları
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**Şema Versiyonu:** 1.0.0  
**Tarih:** 18 Aralık 2025  
**Durum:** Production Ready ✅
