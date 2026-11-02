begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

lock table public.resumes in access exclusive mode;

do $$
begin
  if exists (
    select 1
    from public.resumes
    group by
      user_id,
      encode(
        extensions.digest(
          convert_to(
            normalize(replace(extracted_text, E'\r\n', E'\n'), NFC),
            'UTF8'
          ),
          'sha256'
        ),
        'hex'
      )
    having count(*) > 1
  ) then
    raise exception
      'Cannot add resume content fingerprints: duplicate resume content exists for at least one user.'
      using hint = 'Review and resolve same-user duplicate resumes without losing any referenced job analyses, then rerun this migration.';
  end if;
end;
$$;

alter table public.resumes
  add column content_fingerprint text;

update public.resumes
set content_fingerprint = encode(
  extensions.digest(
    convert_to(
      normalize(replace(extracted_text, E'\r\n', E'\n'), NFC),
      'UTF8'
    ),
    'sha256'
  ),
  'hex'
);

alter table public.resumes
  alter column content_fingerprint set not null,
  add constraint resumes_content_fingerprint_format_check
    check (content_fingerprint ~ '^[0-9a-f]{64}$'),
  add constraint resumes_user_content_fingerprint_key
    unique (user_id, content_fingerprint);

commit;
