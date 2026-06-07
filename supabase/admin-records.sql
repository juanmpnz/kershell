create table if not exists public.admin_records (
  owner_email text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.admin_records enable row level security;

drop policy if exists "admin_records_block_client_access" on public.admin_records;

create policy "admin_records_block_client_access"
  on public.admin_records
  for all
  using (false)
  with check (false);
