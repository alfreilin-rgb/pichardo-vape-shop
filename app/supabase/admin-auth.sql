-- AUTENTICACIÓN REAL PARA EL ADMINISTRADOR DE PUNTAHOGAR
-- Ejecuta este archivo en Supabase > SQL Editor.

create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

grant select
on table public.admin_users
to authenticated;

drop policy if exists "Admins can read own admin record"
on public.admin_users;

create policy "Admins can read own admin record"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute
on function public.is_admin()
to anon, authenticated;

-- Elimina las políticas temporales inseguras de administración.
drop policy if exists "Temporary admin can read all properties"
on public.properties;

drop policy if exists "Temporary admin can update properties"
on public.properties;

drop policy if exists "Temporary admin can delete properties"
on public.properties;

drop policy if exists "Temporary read all properties"
on public.properties;

drop policy if exists "Temporary update properties"
on public.properties;

drop policy if exists "Temporary delete properties"
on public.properties;

-- Mantiene lectura pública de propiedades aprobadas.
drop policy if exists "Public can read approved properties"
on public.properties;

create policy "Public can read approved properties"
on public.properties
for select
to anon, authenticated
using (
  status = 'Aprobada'
  or public.is_admin()
);

-- Mantiene el envío público de propiedades pendientes.
drop policy if exists "Public can submit pending properties"
on public.properties;

drop policy if exists "Temporary insert properties"
on public.properties;

create policy "Public can submit pending properties"
on public.properties
for insert
to anon, authenticated
with check (status = 'Pendiente');

-- Solo administradores autenticados pueden actualizar.
drop policy if exists "Admins can update properties"
on public.properties;

create policy "Admins can update properties"
on public.properties
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Solo administradores autenticados pueden eliminar.
drop policy if exists "Admins can delete properties"
on public.properties;

create policy "Admins can delete properties"
on public.properties
for delete
to authenticated
using (public.is_admin());

grant select, insert
on table public.properties
to anon, authenticated;

grant update, delete
on table public.properties
to authenticated;

-- PASO MANUAL:
-- 1. Crea el usuario administrador en Authentication > Users.
-- 2. Copia su UUID.
-- 3. Ejecuta:
--
-- insert into public.admin_users (user_id)
-- values ('PEGA_AQUI_EL_UUID_DEL_USUARIO');
