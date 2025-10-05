# 13. Sistem Tiket Dukungan

## Skema Tambahan
```sql
create table if not exists public.ticket_comments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  author_id uuid references public.users(id),
  body text not null,
  visibility text default 'client',
  created_at timestamptz default now()
);

create table if not exists public.ticket_attachments (
  id uuid primary key default uuid_generate_v4(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  file_name text,
  file_size int check (file_size <= 10485760),
  storage_path text,
  created_at timestamptz default now(),
  deleted_at timestamptz
);
```

## Status & SLA
- Status: `open` → `in_progress` → `waiting_client` → `resolved` → `closed` (auto-close 5 hari setelah resolved jika tidak ada respon).
- Prioritas: `low` (SLA 48 jam), `medium` (24 jam), `high` (8 jam), `critical` (2 jam, notifikasi WA opsional).
- SLA dihitung dari `created_at` ke respon pertama staff.

## Alur Operasional
1. Klien membuat tiket via portal atau email parsing.
2. Notifikasi email + WA ke tim support jika prioritas ≥ high.
3. Staff update status, menambahkan komentar internal (visibility = 'internal').
4. Semua perubahan tersimpan di `activity_events` + `audit_logs`.
5. Lampiran disimpan di Supabase Storage bucket `ticket-attachments` dengan rule RLS per client_id.
6. Penutupan tiket memerlukan alasan resolusi dan survey kepuasan opsional.

## Audit Trail
- `audit_logs` menyimpan aksi: create_ticket, update_status, add_comment, add_attachment.
- Simpan metadata IP dan user-agent untuk setiap aksi sensitif.
