begin;

create table public.campaign_saves_equipment (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  revision integer not null default 1 check (revision > 0)
);

alter table public.campaign_saves_equipment enable row level security;
revoke all on table public.campaign_saves_equipment from public, anon, authenticated;
grant select, insert, update on table public.campaign_saves_equipment to authenticated;

create policy "Read own equipment edition campaign"
on public.campaign_saves_equipment for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Create own equipment edition campaign"
on public.campaign_saves_equipment for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Update own equipment edition campaign"
on public.campaign_saves_equipment for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

commit;
