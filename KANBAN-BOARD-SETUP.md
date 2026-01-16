# 🎯 Kanban Board System - Jira-Style Task Management

## ✅ Kurulum Tamamlandı!

### 📦 Yüklenen Özellikler:

1. **Database Schema** (`supabase/migrations/add_kanban_system.sql`)
   - `task_columns` - Kolon yönetimi (Yapılacaklar, Devam Ediyor, Tamamlandı)
   - `tasks` - Görevler (Epic, Story, Task, Subtask)
   - `task_comments` - Görev yorumları
   - `task_activity` - Aktivite logu
   - **Auto-triggers**: Her yeni proje için otomatik 3 kolon oluşturulur

2. **Server Actions** (`actions/kanban.ts`)
   - `getProjectKanban()` - Tüm kolonlar ve görevler
   - `createTask()` - Yeni görev
   - `moveTask()` - Sürükle-bırak
   - `aiBreakdownTask()` - 🤖 AI ile alt görev oluşturma
   - `convertRoadmapNodeToTask()` - Roadmap → Task dönüşümü

3. **Components**
   - `KanbanBoard` - Ana board component (drag-drop)
   - `CreateTaskDialog` - Görev oluşturma formu
   - `TaskCard` - Görev kartı (subtask collapse, AI breakdown menu)

### 🚀 Kullanım

#### 1. SQL Migration'ı Çalıştır

Supabase Dashboard → SQL Editor:

```sql
-- supabase/migrations/add_kanban_system.sql dosyasını çalıştır
```

#### 2. Proje Sayfasına Ekle

`app/dashboard/projects/[id]/page.tsx`:

```tsx
import { KanbanBoard } from '@/components/kanban/kanban-board';

// Tab structure içinde:
<KanbanBoard projectId={projectId} userId={userId} />
```

### 🎨 Özellikler

#### Sürükle-Bırak (Drag & Drop)
- [@dnd-kit](https://dndkit.com/) kullanılıyor
- Kolonlar arası sorunsuz taşıma
- Smooth animasyonlar

#### AI Task Breakdown 🤖
```
Epic/Task → Sağ tık → "AI ile Alt Görevlere Böl"
↓
AI 6 alt göreve böler (otomatik)
```

#### Roadmap Entegrasyonu
```typescript
await convertRoadmapNodeToTask({
  nodeId: 'roadmap-node-id',
  projectId,
  userId
});
```

#### Task Tipleri
- 🎯 **Epic** - Büyük görevler
- 📖 **Story** - Kullanıcı hikayeleri  
- ✓ **Task** - Normal görevler
- └ **Subtask** - Alt görevler

#### Öncelik Seviyeleri
- 🔴 Urgent (Acil)
- 🟠 High (Yüksek)
- 🔵 Medium (Orta)
- ⚪ Low (Düşük)

### 📊 Örnek Kullanım

```tsx
// Kanban board'u göster
<KanbanBoard 
  projectId="uuid-here" 
  userId="user-uuid" 
/>

// Roadmap node'u task'a çevir
const result = await convertRoadmapNodeToTask({
  nodeId: node.id,
  projectId: project.id,
  userId: user.id
});

// AI ile breakdown
const breakdown = await aiBreakdownTask({
  taskId: epicTask.id,
  userId: user.id
});
// → 6 alt görev otomatik oluşur
```

### 🔧 Özelleştirme

#### Kolon Renkleri
`task_columns` tablosunda `color` field:
```sql
UPDATE task_columns 
SET color = '#10b981' 
WHERE name = 'Tamamlandı';
```

#### Default Kolonlar
`create_default_task_columns()` function'ı düzenle:
```sql
INSERT INTO task_columns (project_id, name, position, color) VALUES
  (NEW.id, 'Backlog', 0, '#6b7280'),
  (NEW.id, 'In Progress', 1, '#f59e0b'),
  (NEW.id, 'Done', 2, '#10b981');
```

### 🎯 Roadmap'ten Task Oluşturma

CategoryTabs component'inde her node için "Task Oluştur" butonu eklenebilir:

```tsx
<Button onClick={() => handleConvertToTask(node.id)}>
  <CheckCircle2 className="w-4 h-4 mr-2" />
  Task Oluştur
</Button>
```

### 🔐 Permissions

RLS Policies:
- **Owners**: Full access
- **Members**: Edit permission kontrolü
- **Service Role**: Bypass RLS (server actions için)

### 📱 Responsive

- Desktop: 3 kolon yan yana
- Tablet: 2 kolon + scroll
- Mobile: 1 kolon stack

### 🚦 Status

- ✅ Database schema ready
- ✅ Actions implemented
- ✅ Drag-drop working
- ✅ AI breakdown ready
- ✅ Subtasks support
- ⏳ UI integration needed (add to project page tabs)

### 🎨 Next Steps

1. Migration'ı çalıştır
2. Proje sayfasına kanban tab ekle
3. Roadmap'ten task oluşturma butonu ekle
4. Task details modal'ı genişlet

---

**Jira-style workflow, AI ile güçlendirildi! 🚀**
