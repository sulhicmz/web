-- Roles reference
-- +-----------+------------------------------+
-- | role      | deskripsi                    |
-- +-----------+------------------------------+
-- | owner     | Tim internal, akses penuh    |
-- | staff     | Operasional, tanpa akses ke  |
-- |           | pengaturan kritikal          |
-- | client    | Pemilik akun klien           |
-- | viewer    | Anggota klien read-only      |
-- +-----------+------------------------------+

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null check (role in ('owner','staff','client','viewer')),
  client_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_profiles enable row level security;

-- Claim mapping example (Supabase JWT custom claims via Edge Function)
-- { "role": user_profiles.role, "client_id": user_profiles.client_id }

create policy "Owner staff full access" on public.user_profiles
  for all using (auth.jwt()->>'role' in ('owner','staff'));

create policy "Client self view" on public.user_profiles
  for select using (
    auth.jwt()->>'role' in ('client','viewer')
    and auth.uid() = id
  );

create policy "Viewer no updates" on public.user_profiles
  for update using (false) with check (false);

-- OAuth providers (enable di dashboard): Google, GitHub, LinkedIn.
-- 2FA: Gunakan Supabase Authenticator (TOTP) + email OTP fallback.

-- Secure sample policy for portal data (applies to tables with client_id column)
create policy "Tenant isolation" on public.projects
  for select using (
    auth.jwt()->>'role' in ('owner','staff')
    or (
      auth.jwt()->>'role' in ('client','viewer')
      and (auth.jwt()->>'client_id')::uuid = client_id
    )
  );
