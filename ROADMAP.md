# 🚀 PROYON - Sayfa Geliştirme Planı

## ✅ TAMAMLANAN SAYFALAR (Mevcut)

### 1. Authentication
- ✅ `/login` - Giriş sayfası
- ✅ `/signup` - Kayıt sayfası
- ✅ Test kullanıcısı ile hızlı giriş

### 2. Dashboard
- ✅ `/dashboard` - Ana dashboard (yönlendirme)
- ✅ `/dashboard/projects` - Proje listesi
- ✅ `/dashboard/projects/[id]` - Proje detay dashboard

### 3. Demo
- ✅ `/demo` - Demo dashboard (mock data)

### 4. Ana Sayfa
- ✅ `/` - Landing page (var ama basit)

---

## 🔨 YAPıLACAK SAYFALAR (Sıralı)

### PHASE 1: Proje Yönetimi (ÖNCELİK: YÜKSEK)
**Hedef:** Kullanıcı yeni proje oluşturabilmeli, düzenleyebilmeli

1. **`/projects/new` - Yeni Proje Oluşturma** ⭐⭐⭐
   - Form: Title, Description, Domain Type, Tags
   - AI Roadmap Generator entegrasyonu (Gemini)
   - Otomatik roadmap oluşturma
   - **Tahmini:** 30 dakika

2. **`/dashboard/projects/[id]/edit` - Proje Düzenleme**
   - Proje bilgilerini güncelleme
   - Tags ekleme/çıkarma
   - Status değiştirme
   - **Tahmini:** 20 dakika

3. **`/dashboard/projects/[id]/roadmap` - Roadmap Düzenleme**
   - Node ekleme/silme/düzenleme
   - Dependency yönetimi
   - Sürükle-bırak sıralama
   - **Tahmini:** 40 dakika

---

### PHASE 2: Kullanıcı Profili (ÖNCELİK: ORTA)
**Hedef:** Kullanıcı profilini yönetebilmeli

4. **`/profile` - Profil Sayfası**
   - Kullanıcı bilgileri görüntüleme
   - Avatar upload
   - Bio düzenleme
   - **Tahmini:** 25 dakika

5. **`/profile/edit` - Profil Düzenleme**
   - Ad/soyad güncelleme
   - Email değiştirme
   - Şifre değiştirme
   - **Tahmini:** 20 dakika

---

### PHASE 3: AI Özellikler (ÖNCELİK: ORTA)
**Hedef:** AI mentor tam çalışır hale gelmeli

6. **AI Roadmap Generator Entegrasyonu**
   - Gemini API key ekleme
   - Proje açıklamasından otomatik roadmap
   - Node'lar arası dependency çıkarımı
   - **Tahmini:** 30 dakika

7. **AI Chat İyileştirmeleri**
   - Gerçek AI yanıtları (Gemini)
   - Context-aware yanıtlar
   - Fotoğraf upload + analiz
   - **Tahmini:** 35 dakika

---

### PHASE 4: Görsel İyileştirmeler (ÖNCELİK: DÜŞÜK)
**Hedef:** UI/UX polish

8. **Ana Sayfa İyileştirme**
   - Hero section
   - Features section
   - CTA buttons
   - Animasyonlar
   - **Tahmini:** 30 dakika

9. **Dashboard Enhancements**
   - Statistics widgets
   - Recent activity
   - Progress charts
   - **Tahmini:** 25 dakika

---

### PHASE 5: Ekstra Özellikler (ÖNCELİK: DÜŞÜK)
**Hedef:** Bonus özellikler

10. **`/projects/public` - Public Projeler**
    - Diğer kullanıcıların public projelerini görüntüleme
    - Community features
    - **Tahmini:** 30 dakika

11. **`/settings` - Ayarlar**
    - Tema seçimi (dark/light)
    - Bildirim tercihleri
    - Gizlilik ayarları
    - **Tahmini:** 20 dakika

---

## 📊 TOPLAM TAHMİNİ SÜRE

- **Phase 1 (Kritik):** ~90 dakika
- **Phase 2 (Önemli):** ~45 dakika
- **Phase 3 (AI):** ~65 dakika
- **Phase 4 (Polish):** ~55 dakika
- **Phase 5 (Bonus):** ~50 dakika

**TOPLAM:** ~5 saat

---

## 🎯 ŞU AN HANGİSİNDEN BAŞLAMALIYIZ?

### Öneri 1: `/projects/new` (En Kritik)
**Neden?** Kullanıcı yeni proje oluşturabilmeli ki sistem kullanılabilir olsun.

**İçerik:**
- Form (title, description, domain, tags)
- AI roadmap generator
- Supabase'e kaydetme
- Dashboard'a yönlendirme

### Öneri 2: AI Roadmap Generator (Farklılaştırıcı)
**Neden?** Proyon'un ana özelliği budur.

**İçerik:**
- Gemini API entegrasyonu
- Proje açıklamasından node'lar oluşturma
- Dependency graph çıkarımı

---

## ❓ KARAR VER

Hangi sırayla ilerleyelim?

**Seçenek A:** `/projects/new` → Proje Düzenleme → Roadmap Düzenleme (Kullanıcı odaklı)

**Seçenek B:** AI Roadmap → `/projects/new` → AI Chat (AI odaklı)

**Seçenek C:** Ana sayfa → Profile → Settings (Temel özellikler)

**Seçenek D:** Senin önerilerin doğrultusunda

---

**Hangi sayfa/özellikten başlayalım?** 🚀
