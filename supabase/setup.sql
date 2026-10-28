-- Run in the Supabase SQL Editor. Safe to rerun on this project's schema.
create table if not exists public.portfolio_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
grant select on public.portfolio_admins to authenticated;
drop policy if exists "Admins see own membership" on public.portfolio_admins;
create policy "Admins see own membership" on public.portfolio_admins for select to authenticated using (user_id=(select auth.uid()));

create table if not exists public.contact_messages (
 id uuid primary key default gen_random_uuid(),
 full_name text not null check (char_length(full_name) between 2 and 100),
 email text not null check (char_length(email) <= 254),
 subject text not null check (char_length(subject) between 3 and 160),
 message text not null check (char_length(message) between 10 and 5000),
 created_at timestamptz not null default now(),
 read_status boolean not null default false
);
create index if not exists contact_messages_created_at on public.contact_messages(created_at desc);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant select on public.contact_messages to authenticated;
grant update(read_status) on public.contact_messages to authenticated;
grant insert, select on public.contact_messages to service_role;
drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages" on public.contact_messages for select to authenticated using (exists(select 1 from public.portfolio_admins where user_id=(select auth.uid())));
drop policy if exists "Admins update read status" on public.contact_messages;
create policy "Admins update read status" on public.contact_messages for update to authenticated using (exists(select 1 from public.portfolio_admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.portfolio_admins where user_id=(select auth.uid())));

-- Shared, atomic rate limit: 5 attempts per IP hash per 15 minutes.
create table if not exists public.contact_rate_limits (key text primary key, count integer not null, reset_at timestamptz not null);
alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_rate_limits from anon, authenticated;
create or replace function public.consume_contact_limit(client_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare attempts integer;
begin
 delete from public.contact_rate_limits where reset_at < now();
 insert into public.contact_rate_limits as limits(key,count,reset_at) values(client_hash,1,now()+interval '15 minutes')
 on conflict(key) do update set count=case when limits.reset_at<now() then 1 else limits.count+1 end,
 reset_at=case when limits.reset_at<now() then now()+interval '15 minutes' else limits.reset_at end
 returning count into attempts;
 return attempts<=5;
end;
$$;
revoke all on function public.consume_contact_limit(text) from public, anon, authenticated;
grant execute on function public.consume_contact_limit(text) to service_role;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='contact_messages') then
 alter publication supabase_realtime add table public.contact_messages;
 end if;
end $$;
-- After creating your user in Authentication > Users, run with its actual UUID:
-- insert into public.portfolio_admins(user_id) values ('YOUR-AUTH-USER-UUID');
