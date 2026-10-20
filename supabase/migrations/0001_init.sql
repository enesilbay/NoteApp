-- NoteApp başlangıç şeması (ROADMAP > Veri Modeli Taslağı)
-- Kullanıcılar Supabase Auth'un auth.users tablosunda tutulur.

create table public.folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users on delete cascade,
  name       text not null,
  color      text,
  parent_id  uuid references public.folders on delete cascade,
  created_at timestamptz not null default now()
);

create table public.categories (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name    text not null,
  color   text
);

create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  folder_id   uuid references public.folders on delete set null,
  title       text not null default '',
  type        text not null default 'text' check (type in ('text', 'checklist', 'drawing')),
  content     text not null default '',
  is_pinned   boolean not null default false,
  is_archived boolean not null default false,
  is_locked   boolean not null default false,
  color       text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index notes_user_id_idx on public.notes (user_id);

create table public.note_categories (
  note_id     uuid not null references public.notes on delete cascade,
  category_id uuid not null references public.categories on delete cascade,
  primary key (note_id, category_id)
);

create table public.checklist_items (
  id         uuid primary key default gen_random_uuid(),
  note_id    uuid not null references public.notes on delete cascade,
  text       text not null default '',
  is_checked boolean not null default false,
  position   integer not null default 0
);

create table public.attachments (
  id           uuid primary key default gen_random_uuid(),
  note_id      uuid not null references public.notes on delete cascade,
  kind         text not null check (kind in ('image', 'drawing')),
  storage_path text not null,
  created_at   timestamptz not null default now()
);

-- updated_at otomatik güncellensin
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Row Level Security: herkes yalnızca kendi verisini görür
alter table public.folders         enable row level security;
alter table public.categories      enable row level security;
alter table public.notes           enable row level security;
alter table public.note_categories enable row level security;
alter table public.checklist_items enable row level security;
alter table public.attachments     enable row level security;

create policy "own folders" on public.folders
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own categories" on public.categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own notes" on public.notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own note_categories" on public.note_categories
  for all using (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()))
  with check (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()));

create policy "own checklist_items" on public.checklist_items
  for all using (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()))
  with check (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()));

create policy "own attachments" on public.attachments
  for all using (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()))
  with check (exists (select 1 from public.notes n where n.id = note_id and n.user_id = auth.uid()));

-- Gerçek zamanlı senkron: notes değişiklikleri istemcilere yayınlansın
alter publication supabase_realtime add table public.notes;

-- Silme olaylarında eski satırın tamamı gelsin (user_id filtresi için gerekli)
alter table public.notes replica identity full;
