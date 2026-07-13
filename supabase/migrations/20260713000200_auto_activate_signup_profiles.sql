alter table public.profiles
  alter column is_active set default true;

create or replace function public.create_profile_for_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, is_active)
  values (
    new.id,
    nullif(
      btrim(
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          ''
        )
      ),
      ''
    ),
    'staff',
    true
  )
  on conflict (id) do update
  set
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = coalesce(public.profiles.role, excluded.role),
    is_active = true;

  return new;
end;
$$;

drop trigger if exists create_profile_after_auth_signup on auth.users;

create trigger create_profile_after_auth_signup
after insert on auth.users
for each row
execute function public.create_profile_for_new_auth_user();

insert into public.profiles (id, full_name, role, is_active)
select
  users.id,
  nullif(
    btrim(
      coalesce(
        users.raw_user_meta_data ->> 'full_name',
        users.raw_user_meta_data ->> 'name',
        ''
      )
    ),
    ''
  ) as full_name,
  'staff' as role,
  true as is_active
from auth.users
left join public.profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do update
set
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = coalesce(public.profiles.role, excluded.role),
  is_active = true;

update public.profiles
set is_active = true
where is_active = false;
