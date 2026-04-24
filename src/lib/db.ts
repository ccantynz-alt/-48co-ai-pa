import { neon } from '@neondatabase/serverless';

// Lazily initialized so build passes without DATABASE_URL
let _sql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

// Convenience proxy for tagged-template usage: sql`SELECT ...`
export const sql = new Proxy(
  ((...args: Parameters<ReturnType<typeof neon>>) => getSql()(...args)) as ReturnType<typeof neon>,
  {
    get(_target, prop: string | symbol) {
      return (getSql() as unknown as Record<string | symbol, unknown>)[prop];
    },
  }
);

export async function initDb() {
  const db = getSql();

  await db`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      business_name TEXT,
      phone TEXT,
      address TEXT,
      abn TEXT,
      logo_url TEXT,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending','scheduled','in_progress','completed','cancelled')),
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
      scheduled_start TIMESTAMPTZ,
      scheduled_end TIMESTAMPTZ,
      actual_start TIMESTAMPTZ,
      actual_end TIMESTAMPTZ,
      location TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS quotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
      job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
      quote_number TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      line_items JSONB DEFAULT '[]',
      subtotal NUMERIC(10,2) DEFAULT 0,
      tax_rate NUMERIC(5,2) DEFAULT 15,
      tax_amount NUMERIC(10,2) DEFAULT 0,
      total NUMERIC(10,2) DEFAULT 0,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired')),
      valid_until DATE,
      notes TEXT,
      ai_generated BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
      job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
      quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
      invoice_number TEXT NOT NULL,
      title TEXT NOT NULL,
      line_items JSONB DEFAULT '[]',
      subtotal NUMERIC(10,2) DEFAULT 0,
      tax_rate NUMERIC(5,2) DEFAULT 15,
      tax_amount NUMERIC(10,2) DEFAULT 0,
      total NUMERIC(10,2) DEFAULT 0,
      amount_paid NUMERIC(10,2) DEFAULT 0,
      status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','partial','paid','overdue','cancelled')),
      due_date DATE,
      paid_at TIMESTAMPTZ,
      stripe_payment_intent_id TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await db`CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id)`;

  return { ok: true };
}
