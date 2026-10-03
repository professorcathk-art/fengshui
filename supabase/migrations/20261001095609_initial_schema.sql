create type public.audit_type as enum ('map', 'floorplan', 'room');
create type public.audit_status as enum ('free', 'paid');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  stripe_customer_id text,
  subscription_status text not null default 'none',
  dob date,
  kua_number smallint check (kua_number between 1 and 9)
);

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  audit_type public.audit_type not null,
  image_url text,
  facing_degree numeric(6, 2) check (
    facing_degree is null
    or (facing_degree >= 0 and facing_degree < 360)
  ),
  year_built integer,
  status public.audit_status not null default 'free',
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  audit_id uuid not null references public.audits (id) on delete cascade,
  form_school_json jsonb,
  compass_school_json jsonb,
  remedy_text text,
  is_unlocked boolean not null default false
);

create index audits_user_id_idx on public.audits (user_id);
create index reports_audit_id_idx on public.reports (audit_id);

alter table public.users enable row level security;
alter table public.audits enable row level security;
alter table public.reports enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.audits from anon, authenticated;
revoke all on public.reports from anon, authenticated;

grant select, update on public.users to authenticated;
grant select, insert, update on public.audits to authenticated;
grant select on public.reports to authenticated;

create policy users_select_own
  on public.users
  for select
  to authenticated
  using (id = (select auth.uid()));

create policy users_update_own
  on public.users
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy audits_select_own
  on public.audits
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy audits_insert_own
  on public.audits
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy audits_update_own
  on public.audits
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy reports_select_own
  on public.reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = (select auth.uid())
    )
  );

create schema if not exists private;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

create or replace function private.protect_user_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.email is distinct from old.email
    or new.stripe_customer_id is distinct from old.stripe_customer_id
    or new.subscription_status is distinct from old.subscription_status
    or new.kua_number is distinct from old.kua_number
  then
    raise exception 'protected profile column';
  end if;

  return new;
end;
$$;

create trigger protect_user_columns
  before update on public.users
  for each row
  execute function private.protect_user_columns();

revoke all on function private.handle_new_user() from public, anon, authenticated;
grant execute on function private.handle_new_user() to supabase_auth_admin;

revoke all on function private.protect_user_columns() from public, anon;
grant execute on function private.protect_user_columns() to authenticated, service_role;
