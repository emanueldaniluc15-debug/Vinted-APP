-- Esquema inicial de Vinted Studio (deducido del código de la Edge Function).
-- Reversible con: drop table "Generation","Image","Product","Settings" cascade; delete from storage.buckets where id='photos';
create table public."Settings" (
  id integer primary key,
  provider text,
  model text,
  "apiKeyEnc" text,
  "isValid" boolean not null default false,
  "validatedAt" timestamptz
);

create table public."Product" (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  style text not null,
  "createdAt" timestamptz not null default now()
);

create table public."Image" (
  id uuid primary key default gen_random_uuid(),
  "productId" uuid not null references public."Product"(id) on delete cascade,
  "originalUrl" text not null default '',
  position integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create table public."Generation" (
  id uuid primary key default gen_random_uuid(),
  "imageId" uuid not null references public."Image"(id) on delete cascade,
  prompt text not null,
  refinement text,
  status text not null default 'PENDING',
  "resultUrl" text,
  error text,
  "isCurrent" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create index on public."Image" ("productId");
create index on public."Generation" ("imageId");

alter table public."Settings" enable row level security;
alter table public."Product" enable row level security;
alter table public."Image" enable row level security;
alter table public."Generation" enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 20971520, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
