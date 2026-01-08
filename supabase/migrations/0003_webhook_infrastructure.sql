-- ==========================================================================
-- Webhook Infrastructure - Deduplication and Retry Queues
-- Ensures at-least-once processing with deduplication
-- ==========================================================================

-- Payment webhook deduplication table
-- Prevents duplicate webhook processing based on webhook signature
create table if not exists public.payment_webhook_dedup (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null,
  provider text not null default 'midtrans',
  signature text not null,
  order_id text,
  processed_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(webhook_id, signature)
);

-- Index for efficient lookup
create index if not exists payment_webhook_dedup_webhook_id_idx on public.payment_webhook_dedup(webhook_id);

-- Index for cleanup of old records
create index if not exists payment_webhook_dedup_processed_at_idx on public.payment_webhook_dedup(processed_at);

-- Payment webhook retry queue
-- Queues failed webhooks for retry with exponential backoff
create table if not exists public.payment_webhook_retry_queue (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null,
  order_id text not null,
  payload jsonb not null,
  signature text not null,
  headers jsonb,
  attempt integer not null default 0,
  max_attempts integer not null default 5,
  status text not null default 'pending',
  error_message text,
  retry_after timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for finding webhooks ready to retry
create index if not exists payment_webhook_retry_queue_retry_after_idx on public.payment_webhook_retry_queue(retry_after, status);

-- Index for tracking webhooks by order_id
create index if not exists payment_webhook_retry_queue_order_id_idx on public.payment_webhook_retry_queue(order_id);

-- WhatsApp webhook events table
-- Logs all incoming WhatsApp webhook events
create table if not exists public.whatsapp_events (
  id text primary key,
  message_id text,
  recipient text,
  template text,
  status text,
  attempt integer,
  retry_after timestamptz,
  error_code text,
  error_title text,
  payload jsonb,
  created_at timestamptz
);

-- Index for querying events by recipient
create index if not exists whatsapp_events_recipient_idx on public.whatsapp_events(recipient);

-- Index for querying events by status
create index if not exists whatsapp_events_status_idx on public.whatsapp_events(status);

-- Index for querying events by message_id
create index if not exists whatsapp_events_message_id_idx on public.whatsapp_events(message_id);

-- WhatsApp webhook retry queue
-- Queues failed WhatsApp message sends for retry
create table if not exists public.whatsapp_retry_queue (
  id text primary key,
  message_id text,
  recipient text,
  attempt integer not null,
  retry_at timestamptz not null,
  payload jsonb,
  created_at timestamptz
);

-- Index for finding messages ready to retry
create index if not exists whatsapp_retry_queue_retry_at_idx on public.whatsapp_retry_queue(retry_at);

-- Index for tracking retries by message_id
create index if not exists whatsapp_retry_queue_message_id_idx on public.whatsapp_retry_queue(message_id);

-- Dead-letter queue for permanently failed webhooks
-- Stores webhooks that exceeded max retry attempts
create table if not exists public.webhook_dead_letter_queue (
  id uuid primary key default gen_random_uuid(),
  webhook_type text not null,
  webhook_id text not null,
  payload jsonb not null,
  headers jsonb,
  error_message text,
  attempt integer,
  processed boolean default false,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- Index for querying by webhook type
create index if not exists webhook_dead_letter_queue_webhook_type_idx on public.webhook_dead_letter_queue(webhook_type);

-- Index for querying by created_at (for cleanup)
create index if not exists webhook_dead_letter_queue_created_at_idx on public.webhook_dead_letter_queue(created_at);

-- Enable RLS
alter table public.payment_webhook_dedup enable row level security;
alter table public.payment_webhook_retry_queue enable row level security;
alter table public.whatsapp_events enable row level security;
alter table public.whatsapp_retry_queue enable row level security;
alter table public.webhook_dead_letter_queue enable row level security;

-- Policies for payment_webhook_dedup (service account only)
create policy "service read payment_webhook_dedup" on public.payment_webhook_dedup
  for select using (true);

create policy "service write payment_webhook_dedup" on public.payment_webhook_dedup
  for insert with check (true);

create policy "service delete payment_webhook_dedup" on public.payment_webhook_dedup
  for delete using (true);

-- Policies for payment_webhook_retry_queue (service account only)
create policy "service read payment_webhook_retry_queue" on public.payment_webhook_retry_queue
  for select using (true);

create policy "service write payment_webhook_retry_queue" on public.payment_webhook_retry_queue
  for insert with check (true);

create policy "service update payment_webhook_retry_queue" on public.payment_webhook_retry_queue
  for update using (true);

create policy "service delete payment_webhook_retry_queue" on public.payment_webhook_retry_queue
  for delete using (true);

-- Policies for whatsapp_events (service account only)
create policy "service read whatsapp_events" on public.whatsapp_events
  for select using (true);

create policy "service write whatsapp_events" on public.whatsapp_events
  for insert with check (true);

-- Policies for whatsapp_retry_queue (service account only)
create policy "service read whatsapp_retry_queue" on public.whatsapp_retry_queue
  for select using (true);

create policy "service write whatsapp_retry_queue" on public.whatsapp_retry_queue
  for insert with check (true);

create policy "service delete whatsapp_retry_queue" on public.whatsapp_retry_queue
  for delete using (true);

-- Policies for webhook_dead_letter_queue (service account only)
create policy "service read webhook_dead_letter_queue" on public.webhook_dead_letter_queue
  for select using (true);

create policy "service write webhook_dead_letter_queue" on public.webhook_dead_letter_queue
  for insert with check (true);

-- Function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at on payment_webhook_retry_queue
drop trigger if exists payment_webhook_retry_queue_updated_at on public.payment_webhook_retry_queue;
create trigger payment_webhook_retry_queue_updated_at
  before update on public.payment_webhook_retry_queue
  for each row
  execute function public.update_updated_at_column();

-- Rate limiting table for persistent rate limiting
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  count integer not null default 0,
  reset_at timestamptz not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for efficient key lookup
create index if not exists rate_limits_key_idx on public.rate_limits(key);

-- Index for cleanup of expired records
create index if not exists rate_limits_reset_at_idx on public.rate_limits(reset_at);

-- Enable RLS for rate_limits
alter table public.rate_limits enable row level security;

-- Policies for rate_limits (service account only)
create policy "service read rate_limits" on public.rate_limits
  for select using (true);

create policy "service write rate_limits" on public.rate_limits
  for insert with check (true);

create policy "service update rate_limits" on public.rate_limits
  for update using (true);

create policy "service delete rate_limits" on public.rate_limits
  for delete using (true);

-- Trigger to auto-update updated_at on rate_limits
drop trigger if exists rate_limits_updated_at on public.rate_limits;
create trigger rate_limits_updated_at
  before update on public.rate_limits
  for each row
  execute function public.update_updated_at_column();

-- Add comments for documentation
comment on table public.payment_webhook_dedup is 'Deduplication table for payment webhooks to prevent duplicate processing';
comment on table public.payment_webhook_retry_queue is 'Retry queue for failed payment webhooks with exponential backoff';
comment on table public.whatsapp_events is 'Log of all incoming WhatsApp webhook events';
comment on table public.whatsapp_retry_queue is 'Retry queue for failed WhatsApp message sends';
comment on table public.webhook_dead_letter_queue is 'Dead-letter queue for webhooks that exceeded max retry attempts';
