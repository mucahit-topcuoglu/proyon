-- =====================================================
-- SECURE PAYMENT SYSTEM
-- Production-Ready with RLS & Idempotency Support
-- Auth-First Checkout Flow
-- =====================================================

-- 1. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Provider info
  provider TEXT NOT NULL CHECK (provider IN ('shopier', 'lemon', 'free')),
  provider_subscription_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due', 'free_tier')),
  
  -- Period tracking
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Plan details (FREE, PLUS, PRO)
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'plus', 'pro')),
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'one_time')),
  
  -- Auto-renewal (Lemon only)
  is_auto_renew BOOLEAN DEFAULT false,
  
  -- Payment tracking
  amount_paid DECIMAL(10, 2),
  currency TEXT DEFAULT 'TRY' CHECK (currency IN ('TRY', 'USD')),
  
  -- Idempotency: Unique payment ID
  payment_id TEXT UNIQUE,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_active_subscription UNIQUE (user_id)
);

-- 2. Payment Transactions (Audit Log)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  
  provider TEXT NOT NULL CHECK (provider IN ('shopier', 'lemon', 'free')),
  provider_transaction_id TEXT,
  
  payment_id TEXT UNIQUE NOT NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('TRY', 'USD')),
  
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  
  plan_type TEXT NOT NULL,
  days_granted INTEGER,
  
  webhook_payload JSONB,
  
  paid_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Notifications Table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  
  action_url TEXT,
  action_label TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Legal Agreements Table
CREATE TABLE IF NOT EXISTS legal_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted BOOLEAN DEFAULT false,
  privacy_accepted_at TIMESTAMPTZ,
  kvkk_accepted BOOLEAN DEFAULT false,
  kvkk_accepted_at TIMESTAMPTZ,
  distance_sales_accepted BOOLEAN DEFAULT false,
  distance_sales_accepted_at TIMESTAMPTZ,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_user_agreements UNIQUE (user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment_id ON subscriptions(payment_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_id ON payment_transactions(payment_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_agreements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access subscriptions" ON subscriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access transactions" ON payment_transactions';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own notifications" ON notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own notifications" ON notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access notifications" ON notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own agreements" ON legal_agreements';
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert own agreements" ON legal_agreements';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own agreements" ON legal_agreements';
  EXECUTE 'DROP POLICY IF EXISTS "Service role full access legal" ON legal_agreements';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- User policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own agreements"
  ON legal_agreements FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agreements"
  ON legal_agreements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own agreements"
  ON legal_agreements FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access
CREATE POLICY "Service role full access subscriptions"
  ON subscriptions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access transactions"
  ON payment_transactions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access notifications"
  ON notifications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access legal"
  ON legal_agreements FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION has_active_plan(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = check_user_id
      AND status IN ('active', 'free_tier')
      AND current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_plan(check_user_id UUID)
RETURNS TABLE (
  id UUID,
  plan_type TEXT,
  status TEXT,
  provider TEXT,
  current_period_end TIMESTAMPTZ,
  days_remaining INTEGER,
  is_auto_renew BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan_type,
    s.status,
    s.provider,
    s.current_period_end,
    GREATEST(0, EXTRACT(DAY FROM s.current_period_end - now())::INTEGER),
    s.is_auto_renew
  FROM subscriptions s
  WHERE s.user_id = check_user_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_payment_exists(check_payment_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM payment_transactions WHERE payment_id = check_payment_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION expire_subscriptions()
RETURNS INTEGER AS $$
DECLARE expired_count INTEGER;
BEGIN
  UPDATE subscriptions
  SET status = 'expired', updated_at = now()
  WHERE status = 'active'
    AND current_period_end < now()
    AND is_auto_renew = false;
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_timestamp_trigger ON subscriptions;
CREATE TRIGGER update_subscription_timestamp_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscription_timestamp();

CREATE OR REPLACE FUNCTION update_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_read_at_trigger ON notifications;
CREATE TRIGGER update_notification_read_at_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_notification_read_at();
