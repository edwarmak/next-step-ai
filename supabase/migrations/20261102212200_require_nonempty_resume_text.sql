do $$
begin
  if exists (
    select 1
    from public.resumes
    where length(
      regexp_replace(extracted_text, '^[[:space:]]+|[[:space:]]+$', '', 'g')
    ) not between 1 and 100000
  ) then
    raise exception
      'Cannot add resumes_extracted_text_length_check: existing resumes contain blank or oversized extracted text. Correct those rows and rerun this migration.';
  end if;
end;
$$;

alter table public.resumes
  add constraint resumes_extracted_text_length_check
  check (
    length(
      regexp_replace(extracted_text, '^[[:space:]]+|[[:space:]]+$', '', 'g')
    ) between 1 and 100000
  );
