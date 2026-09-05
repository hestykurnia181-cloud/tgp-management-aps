/**
 * SQL DDL Schema for Supabase
 * You can execute this script directly in the Supabase SQL Editor:
 * Dashboard -> SQL Editor -> New Query -> Run
 */
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- TGP MANAGEMENT PLATFORM - SUPABASE SCHEMA & REALTIME SETUP
-- Paste and Run in Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Table: businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  business_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  active_modules JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at BIGINT NOT NULL
);

-- 2. Table: users
CREATE TABLE IF NOT EXISTS public.users (
  user_id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  owner_id TEXT,
  business_id TEXT,
  outlet_id TEXT,
  assigned_business_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  department TEXT,
  permissions JSONB,
  created_at BIGINT NOT NULL
);

-- 3. Table: items (Gudang & Produk)
CREATE TABLE IF NOT EXISTS public.items (
  item_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  min_stock_alert NUMERIC,
  location TEXT NOT NULL,
  recipe_bom TEXT,
  bom_ingredients JSONB,
  updated_at BIGINT NOT NULL
);

-- 4. Table: sales (Transaksi Kasir POS Realtime)
CREATE TABLE IF NOT EXISTS public.sales (
  sale_id TEXT PRIMARY KEY,
  receipt_number TEXT NOT NULL,
  business_id TEXT NOT NULL,
  business_name TEXT,
  outlet_id TEXT,
  outlet_name TEXT,
  cashier_name TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  change_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  items_summary TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  timestamp BIGINT NOT NULL
);

-- 5. Table: ledgers (Buku Kas & Jurnal Finansial)
CREATE TABLE IF NOT EXISTS public.ledgers (
  transaction_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  outlet_id TEXT,
  outlet_name TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- 6. Table: transfers (Transfer Antar Unit Bisnis)
CREATE TABLE IF NOT EXISTS public.transfers (
  transfer_id TEXT PRIMARY KEY,
  transfer_reference TEXT NOT NULL,
  owner_id TEXT,
  source_business_id TEXT NOT NULL,
  source_business_name TEXT NOT NULL,
  dest_business_id TEXT NOT NULL,
  dest_business_name TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_value NUMERIC NOT NULL,
  status TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  rejected_by TEXT,
  notes TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

-- 7. Table: damaged_goods (Barang Rusak & Kadaluarsa)
CREATE TABLE IF NOT EXISTS public.damaged_goods (
  report_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  loss_value NUMERIC NOT NULL,
  location TEXT NOT NULL,
  reason TEXT NOT NULL,
  reported_by TEXT NOT NULL,
  status TEXT NOT NULL,
  reviewed_by TEXT,
  timestamp BIGINT NOT NULL
);

-- 8. Table: attendances (Presensi Digital Karyawan)
CREATE TABLE IF NOT EXISTS public.attendances (
  attendance_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  type TEXT NOT NULL,
  note TEXT,
  timestamp BIGINT NOT NULL
);

-- 9. Table: outlets (Cabang / Stand / Gerai)
CREATE TABLE IF NOT EXISTS public.outlets (
  outlet_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT,
  assigned_staff_id TEXT,
  assigned_staff_name TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at BIGINT NOT NULL
);

-- 10. Table: outlet_stocks (Stok per Cabang)
CREATE TABLE IF NOT EXISTS public.outlet_stocks (
  stock_id TEXT PRIMARY KEY,
  outlet_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  cost_price NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  stock_quantity NUMERIC NOT NULL DEFAULT 0,
  updated_at BIGINT NOT NULL
);

-- 11. Table: stan_transfers (Distribusi Pasokan Stand)
CREATE TABLE IF NOT EXISTS public.stan_transfers (
  transfer_id TEXT PRIMARY KEY,
  transfer_reference TEXT NOT NULL,
  business_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  outlet_name TEXT NOT NULL,
  direction TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  timestamp BIGINT NOT NULL,
  performed_by TEXT NOT NULL,
  notes TEXT
);

-- 12. Table: stock_mutations (Log Mutasi Stok)
CREATE TABLE IF NOT EXISTS public.stock_mutations (
  mutation_id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  type TEXT NOT NULL,
  change_qty NUMERIC NOT NULL,
  final_qty NUMERIC NOT NULL,
  note TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- 13. Table: audit_logs (Jejak Keamanan)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  log_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL,
  business_id TEXT,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp BIGINT NOT NULL
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & OPEN FOR CLIENT ANON ACCESS
-- ==============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damaged_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outlet_stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stan_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_mutations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  CREATE POLICY "Allow public all on businesses" ON public.businesses FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on items" ON public.items FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on ledgers" ON public.ledgers FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on transfers" ON public.transfers FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on damaged_goods" ON public.damaged_goods FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on attendances" ON public.attendances FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on outlets" ON public.outlets FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on outlet_stocks" ON public.outlet_stocks FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on stan_transfers" ON public.stan_transfers FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on stock_mutations" ON public.stock_mutations FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow public all on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==============================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.businesses,
    public.users,
    public.items,
    public.sales,
    public.ledgers,
    public.transfers,
    public.damaged_goods,
    public.attendances,
    public.outlets,
    public.outlet_stocks,
    public.stan_transfers,
    public.stock_mutations,
    public.audit_logs;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
`;
