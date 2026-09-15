-- TopoGTP - Database condiviso Supabase
-- Eseguire questo script nel SQL Editor del progetto Supabase.

create extension if not exists pgcrypto;

create table if not exists public.knowledge_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  category text not null default 'Altro',
  author_name text not null default 'Collega',
  tags text[] not null default '{}',
  body text not null check (char_length(body) between 1 and 20000),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists knowledge_entries_updated_at_idx
  on public.knowledge_entries(updated_at desc);

create index if not exists knowledge_entries_category_idx
  on public.knowledge_entries(category);

create index if not exists knowledge_entries_tags_gin_idx
  on public.knowledge_entries using gin(tags);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists knowledge_entries_set_updated_at on public.knowledge_entries;
create trigger knowledge_entries_set_updated_at
before update on public.knowledge_entries
for each row execute function public.set_updated_at();

alter table public.knowledge_entries enable row level security;

drop policy if exists "authenticated users can read knowledge" on public.knowledge_entries;
create policy "authenticated users can read knowledge"
on public.knowledge_entries
for select
to authenticated
using (true);

drop policy if exists "authenticated users can add knowledge" on public.knowledge_entries;
create policy "authenticated users can add knowledge"
on public.knowledge_entries
for insert
to authenticated
with check (auth.uid() = created_by);

drop policy if exists "authenticated users can update knowledge" on public.knowledge_entries;
create policy "authenticated users can update knowledge"
on public.knowledge_entries
for update
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated users can delete knowledge" on public.knowledge_entries;
create policy "authenticated users can delete knowledge"
on public.knowledge_entries
for delete
to authenticated
using (true);

-- Realtime: prova ad aggiungere la tabella alla publication Supabase.
do $$
begin
  alter publication supabase_realtime add table public.knowledge_entries;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- Conoscenze iniziali: vengono inserite solo se la tabella e' vuota.
insert into public.knowledge_entries(title, category, author_name, tags, body)
select * from (
  values
    ('Controllo base prima di un rilievo','Topografia','TopoGTP',array['controlli','rilievo'],
     'Prima di iniziare: verifica sistema di riferimento, unità, altezza strumento/palina, orientamento, capisaldi disponibili e tolleranze richieste. Esegui sempre almeno una misura di controllo indipendente.'),
    ('Buona pratica GNSS RTK','GNSS','TopoGTP',array['rtk','gnss'],
     'Con RTK attendi soluzione FIX stabile, controlla numero satelliti e qualità della soluzione e ripeti i punti importanti in tempi diversi. Per capisaldi e punti di controllo usa occupazioni più lunghe e una seconda misura indipendente.'),
    ('GCP in fotogrammetria','Fotogrammetria','TopoGTP',array['gcp','drone'],
     'Distribuisci i GCP sul perimetro e all’interno dell’area, evitando di concentrarli tutti al centro. Mantieni alcuni punti separati come check point per valutare realmente l’accuratezza del modello.')
) as seed(title, category, author_name, tags, body)
where not exists (select 1 from public.knowledge_entries limit 1);
