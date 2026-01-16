-- =====================================================
-- 📧 INVITATION EMAIL TRACKING MIGRATION
-- =====================================================
-- Add email tracking columns to project_invitations table
-- Features:
-- - Track email send status
-- - Track email open/click events
-- - Track invitation acceptance
-- - Add category-based access control
-- =====================================================

-- 1. Add email tracking columns
ALTER TABLE project_invitations
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS accepted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS category_ids TEXT[] DEFAULT '{}';

-- 2. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_email_sent 
ON project_invitations(email_sent_at) 
WHERE email_sent_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invitations_accepted 
ON project_invitations(accepted_at) 
WHERE accepted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invitations_token 
ON project_invitations(token);

-- 3. Add comments for documentation
COMMENT ON COLUMN project_invitations.email_sent_at IS 'Email gönderim zamanı';
COMMENT ON COLUMN project_invitations.email_opened_at IS 'Email ilk açılma zamanı';
COMMENT ON COLUMN project_invitations.email_click_count IS 'Link tıklama sayısı';
COMMENT ON COLUMN project_invitations.accepted_at IS 'Davet kabul edilme zamanı';
COMMENT ON COLUMN project_invitations.accepted_by IS 'Daveti kabul eden kullanıcı';
COMMENT ON COLUMN project_invitations.category_ids IS 'Erişim kısıtlaması olan kategoriler (boşsa tüm kategoriler)';

-- 4. Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Email tracking migration completed successfully!';
  RAISE NOTICE '📊 New columns added:';
  RAISE NOTICE '   - email_sent_at: Track when email was sent';
  RAISE NOTICE '   - email_opened_at: Track when email was opened';
  RAISE NOTICE '   - email_click_count: Track link clicks';
  RAISE NOTICE '   - accepted_at: Track when invitation was accepted';
  RAISE NOTICE '   - accepted_by: Track who accepted the invitation';
  RAISE NOTICE '   - category_ids: Category-based access control';
END $$;
