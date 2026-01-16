-- User Tier System Migration
-- Implements Free/Premium tier architecture for AI access control

-- Create tier enum type
CREATE TYPE user_tier AS ENUM ('free', 'premium');

-- Add tier column to profiles table
ALTER TABLE profiles 
ADD COLUMN tier user_tier DEFAULT 'free' NOT NULL;

-- Create tier_upgrades tracking table
CREATE TABLE IF NOT EXISTS tier_upgrades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_tier user_tier NOT NULL,
  to_tier user_tier NOT NULL,
  upgraded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_id TEXT,
  payment_amount DECIMAL(10, 2),
  payment_currency TEXT DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create index for faster user tier lookups
CREATE INDEX idx_profiles_tier ON profiles(tier);
CREATE INDEX idx_tier_upgrades_user_id ON tier_upgrades(user_id);
CREATE INDEX idx_tier_upgrades_upgraded_at ON tier_upgrades(upgraded_at);

-- Enable RLS on tier_upgrades
ALTER TABLE tier_upgrades ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own tier upgrade history
CREATE POLICY "Users can view own tier upgrades"
  ON tier_upgrades
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Only service role can insert tier upgrades
CREATE POLICY "Service role can insert tier upgrades"
  ON tier_upgrades
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Function to get user tier
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS user_tier
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier user_tier;
BEGIN
  SELECT tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_tier, 'free'::user_tier);
END;
$$;

-- Function to upgrade user tier
CREATE OR REPLACE FUNCTION upgrade_user_tier(
  p_user_id UUID,
  p_to_tier user_tier,
  p_payment_id TEXT DEFAULT NULL,
  p_payment_amount DECIMAL DEFAULT NULL,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_from_tier user_tier;
BEGIN
  -- Get current tier
  SELECT tier INTO v_from_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- Update tier
  UPDATE profiles
  SET tier = p_to_tier,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record upgrade
  INSERT INTO tier_upgrades (
    user_id,
    from_tier,
    to_tier,
    payment_id,
    payment_amount,
    expires_at
  ) VALUES (
    p_user_id,
    v_from_tier,
    p_to_tier,
    p_payment_id,
    p_payment_amount,
    p_expires_at
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_tier(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upgrade_user_tier(UUID, user_tier, TEXT, DECIMAL, TIMESTAMP WITH TIME ZONE) TO service_role;

-- Add comments
COMMENT ON COLUMN profiles.tier IS 'User tier for AI access: free (Gemini), premium (DeepSeek)';
COMMENT ON TABLE tier_upgrades IS 'Tracks user tier upgrade history and payments';
COMMENT ON FUNCTION get_user_tier IS 'Safely retrieves user tier with default fallback';
COMMENT ON FUNCTION upgrade_user_tier IS 'Upgrades user tier and records transaction';
