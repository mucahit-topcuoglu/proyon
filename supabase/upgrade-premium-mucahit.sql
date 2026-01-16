-- =============================================
-- PREMIUM UPGRADE: mmucahittopcuoglu@gmail.com
-- =============================================
-- Manuel premium upgrade işlemi

-- 1. Önce kullanıcı ID'sini bul
DO $$
DECLARE
  v_user_id UUID;
  v_current_tier user_tier;
BEGIN
  -- Email'den user ID'yi al
  SELECT au.id, p.tier INTO v_user_id, v_current_tier
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE au.email = 'mmucahittopcuoglu@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ Kullanıcı bulunamadı: mmucahittopcuoglu@gmail.com';
    RETURN;
  END IF;

  RAISE NOTICE '✅ Kullanıcı bulundu: %', v_user_id;
  RAISE NOTICE '📊 Mevcut tier: %', COALESCE(v_current_tier::text, 'free');

  -- 2. Premium'a yükselt
  UPDATE profiles 
  SET tier = 'premium',
      updated_at = NOW()
  WHERE id = v_user_id;

  RAISE NOTICE '✅ Tier güncellendi: free → premium';

  -- 3. Upgrade kaydı oluştur
  INSERT INTO tier_upgrades (
    user_id,
    from_tier,
    to_tier,
    payment_id,
    payment_amount
  ) VALUES (
    v_user_id,
    COALESCE(v_current_tier, 'free'::user_tier),
    'premium'::user_tier,
    'MANUAL_UPGRADE_' || TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS'),
    0.00
  );

  RAISE NOTICE '✅ Upgrade kaydı oluşturuldu';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 İşlem tamamlandı!';
  RAISE NOTICE '👤 Email: mmucahittopcuoglu@gmail.com';
  RAISE NOTICE '👑 Yeni Tier: PREMIUM';
  RAISE NOTICE '⚡ AI Model: GitHub DeepSeek-V3';
  RAISE NOTICE '📊 Token Limit: 16.000 (2x artış)';
END $$;

-- Doğrulama sorgusu
SELECT 
  au.email,
  p.tier,
  p.updated_at,
  tu.upgraded_at,
  tu.payment_id
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
LEFT JOIN tier_upgrades tu ON tu.user_id = au.id
WHERE au.email = 'mmucahittopcuoglu@gmail.com'
ORDER BY tu.upgraded_at DESC
LIMIT 1;
