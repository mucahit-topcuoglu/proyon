-- ============================================================================
-- FIX PROFILE RLS POLICIES
-- Profil oluşturma sorununu çöz
-- ============================================================================

-- Eski policy'leri sil
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Yeni policy'ler - Daha basit
CREATE POLICY "Enable insert for authentication"
  ON profiles FOR INSERT
  WITH CHECK (true); -- Trigger'dan eklenebilsin

CREATE POLICY "Enable read for users based on user_id"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR true); -- Herkes okuyabilir (public profile için)

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Trigger'ı yeniden oluştur (güncelle)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kullanıcı'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Hata olursa log'la ama user creation'ı durdurmayalım
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Confirm email'i disable et (Supabase config)
COMMENT ON TABLE profiles IS 'RLS fixed - profile creation enabled for all authenticated users';
