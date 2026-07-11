ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_proof TEXT;
ALTER TABLE custom_requests ADD COLUMN IF NOT EXISTS payment_proof TEXT;
