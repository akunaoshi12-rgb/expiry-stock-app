alter table public.profiles
  alter column is_active set default false;

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
    false
  )
  on conflict (id) do nothing;

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
  false as is_active
from auth.users
left join public.profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;
