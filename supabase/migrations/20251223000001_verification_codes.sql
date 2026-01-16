-- ============================================================================
-- EMAIL VERIFICATION SYSTEM
-- Custom email verification with codes
-- Date: 2025-12-23
-- ============================================================================

-- Verification codes table
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL, -- 'signup', 'password_reset', 'email_change'
  
  -- Expiration
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  
  -- Metadata
  attempts INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT code_length CHECK (char_length(code) = 6),
  CONSTRAINT valid_type CHECK (type IN ('signup', 'password_reset', 'email_change'))
);

-- Indexes
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
CREATE INDEX idx_verification_codes_code ON verification_codes(code);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX idx_verification_codes_email_type ON verification_codes(email, type);

-- RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi email'lerine ait kodları görebilir
CREATE POLICY "Users can view their own verification codes"
  ON verification_codes FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Service role tam erişim (API'den kullanmak için)
CREATE POLICY "Service role has full access"
  ON verification_codes FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Cleanup function - expired codes silme (cronjob için)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE verification_codes IS 'Email doğrulama kodları - 6 haneli OTP sistemi';
