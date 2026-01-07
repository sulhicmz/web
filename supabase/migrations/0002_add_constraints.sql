-- Migration: Add database constraints for data integrity
-- This migration adds check constraints, improved indexes, and cascading rules

-- Add check constraints for status fields
alter table public.clients add constraint clients_status_check 
  check (status in ('active', 'inactive', 'suspended', 'pending'));

alter table public.packages add constraint packages_is_active_check 
  check (is_active in (true, false));

alter table public.addons add constraint addons_is_recurring_check 
  check (is_recurring in (true, false));

alter table public.projects add constraint projects_status_check 
  check (status in ('planning', 'active', 'on-hold', 'completed', 'cancelled'));

alter table public.websites add constraint websites_monitoring_status_check 
  check (monitoring_status is null or monitoring_status in ('up', 'down', 'degraded', 'pending'));

alter table public.subscriptions add constraint subscriptions_status_check 
  check (status in ('active', 'past_due', 'cancelled', 'unpaid', 'trialing'))
  , add constraint subscriptions_billing_cycle_check 
  check (billing_cycle is null or billing_cycle in ('monthly', 'quarterly', 'annual'));

alter table public.invoices add constraint invoices_status_check 
  check (status in ('draft', 'pending', 'paid', 'overdue', 'cancelled', 'refunded'));

alter table public.payments add constraint payments_status_check 
  check (status is null or status in ('pending', 'processing', 'succeeded', 'failed', 'refunded'));

alter table public.tickets add constraint tickets_status_check 
  check (status in ('open', 'in-progress', 'resolved', 'closed', 'on-hold'))
  , add constraint tickets_priority_check 
  check (priority is null or priority in ('low', 'medium', 'high', 'critical'));

alter table public.docs add constraint docs_visibility_check 
  check (visibility in ('public', 'private', 'internal'));

alter table public.user_profiles add constraint user_profiles_role_check 
  check (role in ('owner', 'staff', 'client', 'viewer'));

-- Add numeric range constraints
alter table public.invoices add constraint invoices_total_positive 
  check (total >= 0);

alter table public.payments add constraint payments_amount_positive 
  check (amount is null or amount >= 0);

alter table public.packages add constraint packages_prices_positive 
  check ((price_monthly is null or price_monthly >= 0) 
    and (price_setup is null or price_setup >= 0));

alter table public.products add constraint products_price_positive 
  check (price is null or price >= 0);

alter table public.addons add constraint addons_price_positive 
  check (price is null or price >= 0);

-- Add cascading delete rules where appropriate
alter table public.products drop constraint if exists products_package_id_fkey;
alter table public.products add constraint products_package_id_fkey 
  foreign key (package_id) references public.packages(id) on delete set null on update cascade;

alter table public.addons drop constraint if exists addons_client_id_fkey;
alter table public.addons add constraint addons_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.projects drop constraint if exists projects_client_id_fkey;
alter table public.projects add constraint projects_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.projects drop constraint if exists projects_package_id_fkey;
alter table public.projects add constraint projects_package_id_fkey 
  foreign key (package_id) references public.packages(id) on delete set null on update cascade;

alter table public.websites drop constraint if exists websites_project_id_fkey;
alter table public.websites add constraint websites_project_id_fkey 
  foreign key (project_id) references public.projects(id) on delete cascade on update cascade;

alter table public.subscriptions drop constraint if exists subscriptions_client_id_fkey;
alter table public.subscriptions add constraint subscriptions_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.subscriptions drop constraint if exists subscriptions_package_id_fkey;
alter table public.subscriptions add constraint subscriptions_package_id_fkey 
  foreign key (package_id) references public.packages(id) on delete set null on update cascade;

alter table public.invoices drop constraint if exists invoices_client_id_fkey;
alter table public.invoices add constraint invoices_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.invoices drop constraint if exists invoices_subscription_id_fkey;
alter table public.invoices add constraint invoices_subscription_id_fkey 
  foreign key (subscription_id) references public.subscriptions(id) on delete set null on update cascade;

alter table public.payments drop constraint if exists payments_invoice_id_fkey;
alter table public.payments add constraint payments_invoice_id_fkey 
  foreign key (invoice_id) references public.invoices(id) on delete cascade on update cascade;

alter table public.payments drop constraint if exists payments_client_id_fkey;
alter table public.payments add constraint payments_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.tickets drop constraint if exists tickets_client_id_fkey;
alter table public.tickets add constraint tickets_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.tickets drop constraint if exists tickets_project_id_fkey;
alter table public.tickets add constraint tickets_project_id_fkey 
  foreign key (project_id) references public.projects(id) on delete set null on update cascade;

alter table public.tickets drop constraint if exists tickets_created_by_fkey;
alter table public.tickets add constraint tickets_created_by_fkey 
  foreign key (created_by) references public.user_profiles(id) on delete set null on update cascade;

alter table public.docs drop constraint if exists docs_client_id_fkey;
alter table public.docs add constraint docs_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.tutorials drop constraint if exists tutorials_client_id_fkey;
alter table public.tutorials add constraint tutorials_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.kb_categories drop constraint if exists kb_categories_client_id_fkey;
alter table public.kb_categories add constraint kb_categories_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.activity_events drop constraint if exists activity_events_client_id_fkey;
alter table public.activity_events add constraint activity_events_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.activity_events drop constraint if exists activity_events_actor_id_fkey;
alter table public.activity_events add constraint activity_events_actor_id_fkey 
  foreign key (actor_id) references public.user_profiles(id) on delete set null on update cascade;

alter table public.audit_logs drop constraint if exists audit_logs_client_id_fkey;
alter table public.audit_logs add constraint audit_logs_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete cascade on update cascade;

alter table public.audit_logs drop constraint if exists audit_logs_actor_id_fkey;
alter table public.audit_logs add constraint audit_logs_actor_id_fkey 
  foreign key (actor_id) references public.user_profiles(id) on delete set null on update cascade;

alter table public.user_profiles drop constraint if exists user_profiles_client_id_fkey;
alter table public.user_profiles add constraint user_profiles_client_id_fkey 
  foreign key (client_id) references public.clients(id) on delete set null on update cascade;

-- Add compound indexes for common query patterns
create index if not exists projects_client_status_idx on public.projects(client_id, status) 
  where deleted_at is null;

create index if not exists projects_client_package_idx on public.projects(client_id, package_id) 
  where deleted_at is null;

create index if not exists subscriptions_client_status_idx on public.subscriptions(client_id, status) 
  where deleted_at is null;

create index if not exists invoices_client_status_idx on public.invoices(client_id, status) 
  where deleted_at is null;

create index if not exists invoices_client_due_date_idx on public.invoices(client_id, due_date) 
  where deleted_at is null and status in ('pending', 'overdue');

create index if not exists payments_invoice_status_idx on public.payments(invoice_id, status) 
  where deleted_at is null;

create index if not exists payments_client_status_idx on public.payments(client_id, status) 
  where deleted_at is null;

create index if not exists tickets_client_status_idx on public.tickets(client_id, status) 
  where deleted_at is null;

create index if not exists tickets_project_status_idx on public.tickets(project_id, status) 
  where deleted_at is null;

create index if not exists user_profiles_client_role_idx on public.user_profiles(client_id, role);

create index if not exists docs_client_visibility_idx on public.docs(client_id, visibility) 
  where deleted_at is null;

create index if not exists activity_events_client_occurred_idx on public.activity_events(client_id, occurred_at);

create index if not exists audit_logs_client_created_idx on public.audit_logs(client_id, created_at);

-- Add unique constraints for business rules
alter table public.clients add constraint clients_name_unique 
  exclude (name with =) where (deleted_at is null);

alter table public.projects add constraint projects_client_name_unique 
  exclude (client_id with =, name with =) where (deleted_at is null);
