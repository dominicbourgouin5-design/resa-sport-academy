-- Ajoute les colonnes de paiement à training_requests
ALTER TABLE training_requests
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payment_provider_id text,
  ADD COLUMN IF NOT EXISTS payment_token text,
  ADD COLUMN IF NOT EXISTS payment_reference text,
  ADD COLUMN IF NOT EXISTS payment_amount integer,
  ADD COLUMN IF NOT EXISTS payment_currency text DEFAULT 'XOF',
  ADD COLUMN IF NOT EXISTS payment_link_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS success_email_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_email_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_training_requests_payment_provider
  ON training_requests(payment_provider_id)
  WHERE payment_provider_id IS NOT NULL;

-- payment_status : 'none' | 'pending' | 'paid' | 'failed'
COMMENT ON COLUMN training_requests.payment_status IS 'none = pas de lien envoyé, pending = lien envoyé en attente, paid = payé, failed = refusé/annulé';