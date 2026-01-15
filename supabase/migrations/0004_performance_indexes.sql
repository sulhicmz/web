-- ==========================================================================
-- Performance Optimization - Database Indexes and Functions
-- Adds missing indexes and atomic functions to improve query performance
-- ==========================================================================

-- Atomic rate limit check and increment function
-- Reduces database queries from 2-3 per check to 1 atomic operation
create or replace function public.check_and_increment_rate_limit(
  p_key text,
  p_window_ms integer,
  p_max_requests integer,
  p_reset_at timestamptz
) returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
) language plpgsql as $$
declare
  v_record record;
  v_count integer;
  v_reset_at timestamptz;
  v_allowed boolean;
  v_now timestamptz := now();
begin
  select * into v_record
  from public.rate_limits
  where key = p_key
  for update;

  if v_record is null or v_record.reset_at < v_now then
    v_count := 0;
    v_reset_at := p_reset_at;
  else
    v_count := v_record.count;
    v_reset_at := v_record.reset_at;
  end if;

  v_allowed := v_count < p_max_requests;

  if v_allowed then
    v_count := v_count + 1;

    insert into public.rate_limits (key, count, reset_at)
    values (p_key, v_count, v_reset_at)
    on conflict (key)
    do update set
      count = excluded.count,
      reset_at = excluded.reset_at,
      updated_at = now();
  end if;

  return query select v_allowed, p_max_requests - v_count, v_reset_at;
end;
$$;

-- Index for projects.slug - used in getBySlug queries
create index if not exists projects_slug_idx on public.projects(slug);

-- Index for projects.status - used in getActive queries
create index if not exists projects_status_idx on public.projects(status);

-- Index for invoices.status - used in getByStatus queries
create index if not exists invoices_status_idx on public.invoices(status);

-- Index for invoices.due_date - used in getOverdue queries
create index if not exists invoices_due_date_idx on public.invoices(due_date);

-- Partial index for projects with deleted_at IS NULL (active records)
create index if not exists projects_active_idx on public.projects(client_id, status) where deleted_at is null;

-- Partial index for invoices with deleted_at IS NULL (active records)
create index if not exists invoices_active_idx on public.invoices(client_id, status) where deleted_at is null;

-- Partial index for invoices overdue query (status + due_date + not deleted)
create index if not exists invoices_overdue_idx on public.invoices(due_date) where status in ('pending', 'overdue') and deleted_at is null;

-- Partial index for subscriptions with deleted_at IS NULL (active records)
create index if not exists subscriptions_active_idx on public.subscriptions(client_id, status) where deleted_at is null;

-- Partial index for tickets with deleted_at IS NULL (active records)
create index if not exists tickets_active_idx on public.tickets(client_id, status) where deleted_at is null;

-- Partial index for projects active query
create index if not exists projects_active_status_idx on public.projects(status) where deleted_at is null and status = 'active';

-- Comment documentation
comment on index public.projects_slug_idx is 'Index for projects.slug lookups in getBySlug queries';
comment on index public.projects_status_idx is 'Index for projects.status filters in getActive queries';
comment on index public.invoices_status_idx is 'Index for invoices.status filters in getByStatus queries';
comment on index public.invoices_due_date_idx is 'Index for invoices.due_date comparisons in getOverdue queries';
comment on index public.projects_active_idx is 'Partial index for active (not deleted) projects by client and status';
comment on index public.invoices_active_idx is 'Partial index for active invoices by client and status';
comment on index public.invoices_overdue_idx is 'Partial index for overdue invoice queries (pending/overdue status with due_date check)';
comment on index public.subscriptions_active_idx is 'Partial index for active subscriptions by client and status';
comment on index public.tickets_active_idx is 'Partial index for active tickets by client and status';
comment on index public.projects_active_status_idx is 'Partial index for active projects (status = active)';
