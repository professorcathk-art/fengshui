grant insert on public.reports to authenticated;

drop policy if exists reports_insert_own on public.reports;

create policy reports_insert_own
  on public.reports
  for insert
  to authenticated
  with check (
    is_unlocked = false
    and compass_school_json is null
    and remedy_text is null
    and exists (
      select 1
      from public.audits
      where audits.id = reports.audit_id
        and audits.user_id = (select auth.uid())
    )
  );
