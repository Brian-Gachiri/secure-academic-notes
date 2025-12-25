-- Prototype schema for the academic notes platform (custom credentials auth)
-- Run in Supabase SQL Editor.

-- Users are managed by this app (NOT Supabase Auth) for this prototype.
create table if not exists public.users (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('LECTURER','STUDENT')),
  "passwordHash" text not null,
  "passwordSalt" text not null
);

create table if not exists public.notes (
  id text primary key,
  title text not null,
  filename text not null,
  "storagePath" text not null,
  "uploadedBy" text not null references public.users(id) on delete restrict,
  "createdAt" timestamptz not null default now()
);

create table if not exists public.share_links (
  token text primary key,
  "noteId" text not null references public.notes(id) on delete cascade,
  "createdBy" text not null references public.users(id) on delete restrict,
  "createdAt" timestamptz not null default now(),
  "expiresAt" timestamptz null,
  "revokedAt" timestamptz null
);

create index if not exists share_links_note_id_idx on public.share_links("noteId");

create table if not exists public.access_logs (
  id bigserial primary key,
  "userId" text null references public.users(id) on delete set null,
  "noteId" text not null references public.notes(id) on delete cascade,
  "shareToken" text null references public.share_links(token) on delete set null,
  timestamp timestamptz not null default now()
);

create index if not exists access_logs_user_id_idx on public.access_logs("userId");
create index if not exists access_logs_note_id_idx on public.access_logs("noteId");
create index if not exists access_logs_share_token_idx on public.access_logs("shareToken");
