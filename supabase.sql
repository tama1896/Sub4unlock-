-- Jalankan di Supabase Dashboard > SQL Editor.
create table if not exists public.links (
  id text primary key check (id ~ '^[a-f0-9]{10}$'),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.links enable row level security;

-- Browser users must not read or write this table directly.
revoke all on table public.links from anon, authenticated;
grant all on table public.links to service_role;

create index if not exists links_created_at_idx on public.links (created_at desc);
