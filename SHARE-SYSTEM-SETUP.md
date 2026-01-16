# ProYön - Public Share Sistemi Kurulum Rehberi

## 🚀 Yapılması Gerekenler

### 1. Supabase Migration Çalıştırın

1. [Supabase Dashboard](https://supabase.com/dashboard) 'a gidin
2. Projenizi seçin
3. Sol menüden **SQL Editor** 'ı açın
4. **New Query** butonuna tıklayın
5. Aşağıdaki SQL kodunu yapıştırın ve **Run** 'a basın:

```sql
-- Add likes_count column to public_shares table
ALTER TABLE public_shares ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create public_share_likes table
CREATE TABLE IF NOT EXISTS public_share_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID NOT NULL REFERENCES public_shares(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(share_id, user_identifier)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_public_share_likes_share_id ON public_share_likes(share_id);
CREATE INDEX IF NOT EXISTS idx_public_share_likes_user_identifier ON public_share_likes(user_identifier);

-- Enable Row Level Security
ALTER TABLE public_share_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view likes" ON public_share_likes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can like" ON public_share_likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can unlike" ON public_share_likes
  FOR DELETE USING (true);
```

### 2. Migration'ı Doğrulayın

Bu URL'i ziyaret edin:
**https://y-beta-beryl.vercel.app/api/check-likes-system**

Sonuç:
- ✅ `"message": "✅ Beğeni sistemi kurulu"` görmeli siniz
- ⚠️ Hata mesajı görürseniz SQL'i tekrar çalıştırın

### 3. Özellikleri Test Edin

#### Public Projeler Sayfası
- https://y-beta-beryl.vercel.app/public-projects
- ✅ Beğeni sayıları (❤️) görünmeli
- ✅ Görüntülenme sayıları (👁️) görünmeli
- ✅ "En Çok Beğenilen" filtresi çalışmalı

#### Share Sayfası
Herhangi bir public projeye tıklayın:
- ✅ Navbar üstte görünmeli
- ✅ Thumbnail'li carousel slider
- ✅ Beğen butonu (❤️) çalışmalı
- ✅ Paylaş butonu (📋) kopyalama yapmalı
- ✅ İstatistikler: Görüntülenme + Beğeni + Tarih
- ✅ Lightbox (resimlere tıklayınca tam ekran)
- ✅ Yorumlar aktif (eğer açıksa)
- ✅ Footer en altta

## 🎨 Yeni Özellikler

### Share Sayfası
- **Modern Navbar**: Landing sayfası navbar'ı
- **Carousel Slider**: Thumbnail'li görsel galerisi
- **Beğeni Sistemi**: Anonymous kullanıcılar beğenebilir
- **Paylaşım**: Link kopyalama ve native share
- **Lightbox**: Resimleri tam ekranda görüntüleme
- **İstatistikler**: Görüntülenme, beğeni, tarih kartları
- **Animasyonlar**: Framer Motion ile yumuşak geçişler

### Public Projeler
- **Beğeni Sayıları**: Her proje kartında ❤️ ikonu
- **En Çok Beğenilen**: Yeni filtreleme seçeneği
- **Görüntülenme**: Gerçek zamanlı view count

## 📁 Değiştirilen Dosyalar

- ✅ `app/share/[token]/page.tsx` - Tamamen yeni tasarım
- ✅ `app/public-projects/client.tsx` - Beğeni sistemi
- ✅ `app/public-projects/page.tsx` - likes_count interface
- ✅ `actions/publicSharing.ts` - toggleLike, getLikeStatus
- ✅ `supabase/migrations/add_likes_system.sql` - Database schema

## 🐛 Sorun Giderme

### Beğeniler çalışmıyor
1. Supabase migration'ını çalıştırdınız mı?
2. `/api/check-likes-system` endpoint'ini kontrol edin
3. Browser console'da hata var mı?

### Görüntülenme sayıları artmıyor
- `recordShareView()` fonksiyonu zaten çalışıyor
- Her sayfa yüklendiğinde otomatik artar
- RLS politikalarını kontrol edin

### Navbar görünmüyor
- Hard refresh yapın (Ctrl + Shift + R)
- Cache temizleyin
- Vercel deployment tamamlandı mı?

## 🔗 Linkler

- **Production**: https://y-beta-beryl.vercel.app
- **Public Projeler**: https://y-beta-beryl.vercel.app/public-projects
- **Test Share**: Bir proje paylaşıp token'ı alın
- **API Check**: https://y-beta-beryl.vercel.app/api/check-likes-system

## ✨ Başarı!

Migration çalıştırdıktan sonra tüm özellikler aktif olmalı. 
Sorun yaşarsanız browser console'u kontrol edin.
