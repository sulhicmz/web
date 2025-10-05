-- Supabase core schema & RLS baseline
create extension if not exists "uuid-ossp";

-- Core entities
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  industry text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.users (
  id uuid primary key,
  client_id uuid references public.clients(id),
  email text unique not null,
  full_name text,
  role text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists users_client_id_idx on public.users(client_id);

create table if not exists public.packages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  code text unique not null,
  description text,
  price_monthly numeric(12,2),
  price_setup numeric(12,2),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  package_id uuid references public.packages(id),
  name text not null,
  type text not null,
  metadata jsonb default '{}'::jsonb,
  price numeric(12,2),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists products_package_id_idx on public.products(package_id);

create table if not exists public.addons (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  name text not null,
  price numeric(12,2),
  is_recurring boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists addons_client_id_idx on public.addons(client_id);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id),
  package_id uuid references public.packages(id),
  name text not null,
  slug text,
  staging_url text,
  production_url text,
  status text default 'planning',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists projects_client_id_idx on public.projects(client_id);

create table if not exists public.websites (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id),
  client_id uuid references public.clients(id),
  domain text,
  provider text,
  go_live_at timestamptz,
  monitoring_status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists websites_project_id_idx on public.websites(project_id);

create table if not exists public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  package_id uuid references public.packages(id),
  status text not null,
  billing_cycle text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  canceled_at timestamptz,
  deleted_at timestamptz
);

create index if not exists subscriptions_client_id_idx on public.subscriptions(client_id);

create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  subscription_id uuid references public.subscriptions(id),
  total numeric(12,2) not null,
  currency text default 'IDR',
  status text default 'draft',
  due_date date,
  issued_at timestamptz default now(),
  metadata jsonb default '{}'::jsonb,
  deleted_at timestamptz
);

create index if not exists invoices_client_id_idx on public.invoices(client_id);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id),
  client_id uuid references public.clients(id),
  provider text,
  provider_reference text,
  amount numeric(12,2),
  status text,
  paid_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists payments_invoice_id_idx on public.payments(invoice_id);

create table if not exists public.tickets (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  project_id uuid references public.projects(id),
  created_by uuid references public.users(id),
  subject text not null,
  category text,
  priority text,
  status text default 'open',
  sla_due timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create index if not exists tickets_client_id_idx on public.tickets(client_id);

create table if not exists public.docs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  title text not null,
  slug text not null,
  content_md text,
  visibility text default 'public',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create unique index if not exists docs_client_slug_idx on public.docs(client_id, slug);

create table if not exists public.tutorials (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  title text,
  video_url text,
  steps jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists public.kb_categories (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  name text not null,
  slug text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create unique index if not exists kb_categories_client_slug_idx on public.kb_categories(client_id, slug);

create table if not exists public.activity_events (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id),
  actor_id uuid references public.users(id),
  entity_type text,
  entity_id uuid,
  action text,
  payload jsonb,
  occurred_at timestamptz default now()
);

create index if not exists activity_events_client_id_idx on public.activity_events(client_id);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.users(id),
  client_id uuid references public.clients(id),
  action text not null,
  context jsonb,
  ip_address inet,
  created_at timestamptz default now()
);

create index if not exists audit_logs_client_id_idx on public.audit_logs(client_id);

-- Supabase auth-linked profile table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null check (role in ('owner','staff','client','viewer')),
  client_id uuid references public.clients(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.tickets enable row level security;
alter table public.docs enable row level security;
alter table public.tutorials enable row level security;
alter table public.kb_categories enable row level security;
alter table public.activity_events enable row level security;
alter table public.audit_logs enable row level security;

-- Shared policy helpers
create or replace function public.current_role() returns text language sql stable as $$
  select coalesce(nullif(auth.jwt() ->> 'role', ''), 'anonymous');
$$;

create or replace function public.current_client_id() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'client_id', '')::uuid;
$$;

-- User profile policies
drop policy if exists "owner staff manage profiles" on public.user_profiles;
create policy "owner staff manage profiles" on public.user_profiles
  for all
  using (public.current_role() in ('owner','staff'))
  with check (public.current_role() in ('owner','staff'));

drop policy if exists "client self view" on public.user_profiles;
create policy "client self view" on public.user_profiles
  for select using (
    public.current_role() in ('client','viewer')
    and auth.uid() = id
  );

-- Tenant read-only fallback for viewers
drop policy if exists "viewer no updates" on public.user_profiles;
create policy "viewer no updates" on public.user_profiles
  for update using (false) with check (false);

-- Generic tenant isolation policies
create or replace function public.allow_manage_for_owner_staff(target_client uuid)
returns boolean language sql stable as $$
  select public.current_role() in ('owner','staff')
         or (public.current_role() in ('client','viewer') and public.current_client_id() = target_client);
$$;

create or replace function public.allow_write_for_staff(target_client uuid)
returns boolean language sql stable as $$
  select public.current_role() in ('owner','staff')
         and (public.current_client_id() is null or public.current_client_id() = target_client);
$$;

-- Apply generic policies to client scoped tables
drop policy if exists "tenant read projects" on public.projects;
create policy "tenant read projects" on public.projects
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write projects" on public.projects;
create policy "tenant write projects" on public.projects
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read invoices" on public.invoices;
create policy "tenant read invoices" on public.invoices
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write invoices" on public.invoices;
create policy "tenant write invoices" on public.invoices
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read payments" on public.payments;
create policy "tenant read payments" on public.payments
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write payments" on public.payments;
create policy "tenant write payments" on public.payments
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read tickets" on public.tickets;
create policy "tenant read tickets" on public.tickets
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write tickets" on public.tickets;
create policy "tenant write tickets" on public.tickets
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read docs" on public.docs;
create policy "tenant read docs" on public.docs
  for select using (
    public.allow_manage_for_owner_staff(client_id)
    or (visibility = 'public')
  );
drop policy if exists "tenant write docs" on public.docs;
create policy "tenant write docs" on public.docs
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read tutorials" on public.tutorials;
create policy "tenant read tutorials" on public.tutorials
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write tutorials" on public.tutorials;
create policy "tenant write tutorials" on public.tutorials
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read kb categories" on public.kb_categories;
create policy "tenant read kb categories" on public.kb_categories
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write kb categories" on public.kb_categories;
create policy "tenant write kb categories" on public.kb_categories
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read activity" on public.activity_events;
create policy "tenant read activity" on public.activity_events
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write activity" on public.activity_events;
create policy "tenant write activity" on public.activity_events
  for all using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));

drop policy if exists "tenant read audit" on public.audit_logs;
create policy "tenant read audit" on public.audit_logs
  for select using (public.allow_manage_for_owner_staff(client_id));
drop policy if exists "tenant write audit" on public.audit_logs;
create policy "tenant write audit" on public.audit_logs
  for insert using (public.allow_write_for_staff(client_id))
  with check (public.allow_write_for_staff(client_id));
