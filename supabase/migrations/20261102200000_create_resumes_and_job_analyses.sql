create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  display_name text not null,
  file_type text not null
    check (file_type in ('pdf', 'docx')),
  extracted_text text not null
    check (length(btrim(extracted_text)) <= 100000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resumes_display_name_not_empty
    check (length(btrim(display_name)) > 0),
  constraint resumes_id_user_id_unique unique (id, user_id)
);

create table public.job_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid,
  job_title text not null
    check (length(btrim(job_title)) > 0),
  company_name text not null
    check (length(btrim(company_name)) > 0),
  job_description text not null
    check (length(btrim(job_description)) > 0),
  analysis_results jsonb default null,
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_analyses_resume_owner_fk
    foreign key (resume_id, user_id)
    references public.resumes (id, user_id)
    on delete set null (resume_id)
);

create index resumes_user_created_at_idx
  on public.resumes (user_id, created_at desc);

create index job_analyses_user_created_at_idx
  on public.job_analyses (user_id, created_at desc);

create index job_analyses_resume_id_idx
  on public.job_analyses (resume_id)
  where resume_id is not null;

grant select, insert, update, delete
  on public.resumes, public.job_analyses
  to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

create trigger set_resumes_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

create trigger set_job_analyses_updated_at
before update on public.job_analyses
for each row
execute function public.set_updated_at();

alter table public.resumes enable row level security;
alter table public.job_analyses enable row level security;

create policy "Users can read their own resumes"
on public.resumes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own resumes"
on public.resumes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own resumes"
on public.resumes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own resumes"
on public.resumes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can read their own job analyses"
on public.job_analyses
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own job analyses"
on public.job_analyses
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own job analyses"
on public.job_analyses
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own job analyses"
on public.job_analyses
for delete
to authenticated
using ((select auth.uid()) = user_id);
