# 🔧 Multi-Roadmap Sistem Düzeltmeleri

## ✅ TAMAMLANANLAR

### 1. Başla/Tamamla Butonları İşlevsel Hale Getirildi
**Dosya:** `components/roadmap/category-tabs.tsx`

**Eklenenler:**
- ✅ `updateNodeStatus()` fonksiyonu
- ✅ Supabase ile status güncelleme
- ✅ Local state sync
- ✅ "Başla" butonu → `NodeStatus.IN_PROGRESS`
- ✅ "Tamamla" butonu → `NodeStatus.DONE`

**Kullanım:**
```typescript
const updateNodeStatus = async (nodeId: string, newStatus: NodeStatus) => {
  const { error } = await supabase
    .from('roadmap_nodes')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', nodeId);
    
  setNodes((prev) =>
    prev.map((node) =>
      node.id === nodeId ? { ...node, status: newStatus } : node
    )
  );
};
```

---

## ⏳ YAPILACAKLAR

### 2. Manuel Kategorilerin Tümünü Gösterme
**Sorun:** Sadece ilk kategori gözüküyor, diğerleri kaybolmuş
**Sebep:** CategoryTabs veya getProjectCategories sınırlama yapıyor olabilir

**Çözüm Adımları:**
1. `getProjectCategories` fonksiyonunu kontrol et (limit var mı?)
2. CategoryTabs'da `categories.map()` doğru çalışıyor mu?
3. Console.log ile kategorilerin yüklendiğini doğrula

### 3. Public Paylaşımda Kategorileri Gösterme
**Dosya:** Muhtemelen `app/p/[shareId]/page.tsx` veya benzeri

**Gerekli:**
- Public share component'ine CategoryTabs ekle
- Permission check bypass (public için)
- Read-only mode

### 4. Ekip Yönetiminde Kategori Bazlı Yetkilendirme
**Dosya:** `components/collaboration/team-management.tsx`

**Gerekli:**
- `project_member_categories` tablosu kullanımı
- Her team member için kategori checkboxları
- `can_edit`, `can_delete`, `can_manage` toggle'ları
- CategoryTabs'da permission kontrolü

---

## 📋 DETAYLI PLAN

### Adım 1: Manuel Kategori Sorunu DEBUG
```sql
-- Test query
SELECT * FROM roadmap_categories WHERE project_id = 'PROJECT_ID';
-- Tüm kategoriler döndü mü?
```

```typescript
// components/roadmap/category-tabs.tsx
const loadCategories = async () => {
  const result = await getProjectCategories(projectId);
  console.log('📦 Yüklenen kategoriler:', result.categories);
  // Kaç tane kategori var?
};
```

### Adım 2: Public Share Düzenleme
**TO DO:**
1. Public share page'i bul
2. CategoryTabs import et
3. `isOwner={false}` ile render et
4. Action butonlarını gizle

### Adım 3: Permission Manager UI
**TO DO:**
1. TeamManagement component'inde:
   - Kategori listesi getir
   - Her member için kategori permission grid
   - "Grant All" shortcut
   - Save butonu

```typescript
interface CategoryPermissionRow {
  userId: string;
  userName: string;
  permissions: {
    [categoryId: string]: {
      can_edit: boolean;
      can_delete: boolean;
      can_manage: boolean;
    };
  };
}
```

### Adım 4: CategoryTabs Permission Kontrolü
**TO DO:**
```typescript
// CategoryTimeline içinde
const [userPermissions, setUserPermissions] = useState<CategoryPermission | null>(null);

useEffect(() => {
  if (!isOwner) {
    // Check user's permissions for this category
    checkCategoryAccess(userId, categoryId).then(setUserPermissions);
  }
}, [categoryId, userId]);

// Action buttons'da:
{userPermissions?.can_edit && (
  <Button onClick={() => updateNodeStatus(...)}>Başla</Button>
)}
```

---

## 🚀 ÖNCELİK SIRASI

1. **YÜKSEK**: Manuel kategorilerin görünmemesi (veri kaybı olabilir)
2. **ORTA**: Public share kategoriler
3. **ORTA**: Ekip yönetimi kategori yetkileri
4. **DÜŞÜK**: Takıldım butonu işlevselliği

---

## 🐛 MEVCUT SORUNLAR

### Sorun 1: "Manuel kısmında kategori kaç tane olursa olsun 1 tane gözüküyor"
**Hipotezler:**
- [ ] DB'ye kayıt olmuyor
- [ ] `getProjectCategories` yanlış query
- [ ] CategoryTabs yanlış render
- [ ] Browser cache

**Test:**
1. Supabase Dashboard'da manuel kontrol
2. Network tab'da API response kontrol
3. React DevTools'da state kontrol

### Sorun 2: "Public paylaşınca kategoriler gözükmüyor"
**Eksik:**
- Public view component'i CategoryTabs kullanmıyor

### Sorun 3: "Ekip yönetiminde kategori bazlı yetki"
**Eksik:**
- Permission UI yok
- CategoryTabs permission check yok

---

## 📝 NOTLAR

- `Başla` butonu artık çalışıyor ✅
- `project_member_categories` tablosu DB'de hazır
- `checkCategoryAccess` server action mevcut
- CategoryTabs TimelineView stilinde render ediliyor ✅

