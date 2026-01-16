-- ============================================================================
-- PROYON - Test Verisi (Seed Data)
-- Kullanım: SQL Editor'de çalıştırın
-- ============================================================================

-- 1. Test kullanıcısı oluştur (Manuel - Auth kullanmadan)
-- ============================================================================

-- Önce mevcut test kullanıcısını temizle (varsa)
DELETE FROM auth.users WHERE email = 'test@proyon.dev';

-- Yeni test kullanıcısı oluştur
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@proyon.dev',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Kullanıcı"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Oluşturulan kullanıcının ID'sini al
DO $$
DECLARE
  test_user_id UUID;
  test_project_id UUID;
  node1_id UUID;
  node2_id UUID;
  node3_id UUID;
BEGIN
  -- Test kullanıcısının ID'sini bul
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@proyon.dev';

  RAISE NOTICE 'Test User ID: %', test_user_id;

  -- Profile oluştur (trigger çalışmazsa manuel)
  INSERT INTO profiles (id, full_name, role, bio)
  VALUES (
    test_user_id,
    'Test Kullanıcı',
    'user',
    'Proyon test hesabı - Modern projeler için yol haritası oluşturucu'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = 'Test Kullanıcı',
      bio = 'Proyon test hesabı - Modern projeler için yol haritası oluşturucu';

  -- Test projesi 1: E-Ticaret Platformu
  INSERT INTO projects (
    id,
    user_id,
    title,
    abstract_text,
    description,
    status,
    domain_type,
    tags,
    is_public
  ) VALUES (
    gen_random_uuid(),
    test_user_id,
    'Modern E-Ticaret Platformu',
    'Next.js 15, TypeScript, Stripe ve Supabase kullanarak sıfırdan profesyonel bir e-ticaret sitesi oluşturma projesi.',
    'Bu proje, modern web teknolojileri kullanarak tam özellikli bir e-ticaret platformu geliştirmeyi amaçlamaktadır. Kullanıcı deneyimi, performans ve güvenlik odaklı bir yaklaşım benimsenmiştir.',
    'active',
    'software',
    ARRAY['Next.js', 'TypeScript', 'E-commerce', 'Stripe', 'Supabase'],
    true
  )
  RETURNING id INTO test_project_id;

  RAISE NOTICE 'Test Project ID: %', test_project_id;

  -- Roadmap Node 1: Proje Yapısı (TAMAMLANDI)
  INSERT INTO roadmap_nodes (
    id,
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    order_index,
    priority,
    estimated_duration,
    started_at,
    completed_at
  ) VALUES (
    gen_random_uuid(),
    test_project_id,
    'Proje Yapısını Oluştur',
    'Next.js projesi başlat, TypeScript yapılandırması yap, temel klasör yapısını kur.',
    '• Next.js 15.x (App Router)
• TypeScript 5.x
• Tailwind CSS 4.x
• ESLint + Prettier
• Git repository',
    'Sağlam bir proje temeli, gelecekteki geliştirmeleri kolaylaştırır ve kod kalitesini artırır.',
    'done',
    1,
    2,
    60,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO node1_id;

  -- Roadmap Node 2: Supabase Kurulumu (DEVAM EDİYOR)
  INSERT INTO roadmap_nodes (
    id,
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    parent_node_id,
    order_index,
    priority,
    estimated_duration,
    started_at
  ) VALUES (
    gen_random_uuid(),
    test_project_id,
    'Supabase Backend Kurulumu',
    'Database schema oluştur, Row Level Security (RLS) politikaları ekle, migrations hazırla.',
    '• Supabase PostgreSQL
• RLS Policies
• Database Migrations
• TypeScript types generation',
    'Güvenli ve ölçeklenebilir backend altyapısı, veri bütünlüğünü sağlar.',
    'in_progress',
    node1_id,
    2,
    2,
    120,
    NOW() - INTERVAL '4 hours'
  )
  RETURNING id INTO node2_id;

  -- Roadmap Node 3: Authentication Sistemi (BEKLİYOR)
  INSERT INTO roadmap_nodes (
    id,
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    parent_node_id,
    order_index,
    priority,
    estimated_duration
  ) VALUES (
    gen_random_uuid(),
    test_project_id,
    'Kullanıcı Authentication Sistemi',
    'Email/password girişi, OAuth (Google, GitHub), session yönetimi, protected routes.',
    '• Supabase Auth
• NextAuth.js (opsiyonel)
• JWT token yönetimi
• Middleware protection',
    'Güvenli kullanıcı yönetimi, platformun temel gereksinimidir.',
    'pending',
    node2_id,
    3,
    2,
    180
  )
  RETURNING id INTO node3_id;

  -- Roadmap Node 4: Ürün Kataloğu (BEKLİYOR)
  INSERT INTO roadmap_nodes (
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    parent_node_id,
    order_index,
    priority,
    estimated_duration
  ) VALUES (
    test_project_id,
    'Ürün Kataloğu ve Yönetimi',
    'Ürün CRUD işlemleri, kategoriler, filtreleme, arama, görsel yönetimi.',
    '• PostgreSQL schema (products, categories)
• Image upload (Supabase Storage)
• Search & filtering
• Admin panel',
    'E-ticaret platformunun kalbi, kullanıcıların ürünleri keşfetmesini sağlar.',
    'pending',
    node3_id,
    4,
    1,
    240
  );

  -- Roadmap Node 5: Sepet ve Checkout (BEKLİYOR)
  INSERT INTO roadmap_nodes (
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    parent_node_id,
    order_index,
    priority,
    estimated_duration
  ) VALUES (
    test_project_id,
    'Sepet Sistemi ve Ödeme Entegrasyonu',
    'Sepet yönetimi, Stripe Checkout entegrasyonu, sipariş takibi.',
    '• Cart state management (Zustand/Jotai)
• Stripe Payment Intent API
• Order tracking
• Email notifications',
    'Ödeme işlemlerinin güvenli ve kullanıcı dostu olması kritiktir.',
    'pending',
    node3_id,
    5,
    2,
    300
  );

  -- Roadmap Node 6: Dashboard ve Analytics (BEKLİYOR)
  INSERT INTO roadmap_nodes (
    project_id,
    title,
    description,
    technical_requirements,
    rationale,
    status,
    parent_node_id,
    order_index,
    priority,
    estimated_duration
  ) VALUES (
    test_project_id,
    'Admin Dashboard ve Analytics',
    'Satış grafikleri, kullanıcı istatistikleri, envanter yönetimi.',
    '• Chart.js / Recharts
• Real-time dashboard
• Export reports
• Inventory management',
    'İşletme kararları için veri analitiği gereklidir.',
    'pending',
    node3_id,
    6,
    0,
    180
  );

  -- AI Mentor mesajları
  INSERT INTO mentor_logs (project_id, sender, message, created_at)
  VALUES 
    (test_project_id, 'ai', 'Merhaba! E-ticaret projenize hoş geldiniz! 🚀 Size nasıl yardımcı olabilirim?', NOW() - INTERVAL '1 day'),
    (test_project_id, 'user', 'Supabase kurulumunda takıldım, RLS policies nasıl çalışıyor?', NOW() - INTERVAL '23 hours'),
    (test_project_id, 'ai', 'Row Level Security (RLS), PostgreSQL''in kullanıcı bazlı veri erişim kontrol mekanizmasıdır. Her tablo için politikalar tanımlayarak, kullanıcıların sadece kendi verilerine erişmesini sağlarsınız. 

Örnek:
```sql
CREATE POLICY "Users view own data"
ON products FOR SELECT
USING (auth.uid() = user_id);
```

Bu sayede her kullanıcı sadece kendi ürünlerini görebilir. Başka bir konuda yardımcı olabilir miyim?', NOW() - INTERVAL '22 hours 50 minutes'),
    (test_project_id, 'user', 'Teşekkürler! Şimdi authentication''a geçiyorum.', NOW() - INTERVAL '22 hours 30 minutes');

  RAISE NOTICE '✅ Test verisi başarıyla oluşturuldu!';
  RAISE NOTICE '📧 Email: test@proyon.dev';
  RAISE NOTICE '🔑 Password: Test123456!';
  RAISE NOTICE '🆔 User ID: %', test_user_id;
  RAISE NOTICE '📁 Project ID: %', test_project_id;
  RAISE NOTICE '🔗 Dashboard URL: http://localhost:3000/dashboard/projects/%', test_project_id;
END $$;
