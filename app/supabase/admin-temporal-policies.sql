-- POLÍTICAS TEMPORALES PARA DESARROLLO
-- Permiten que el panel actual, protegido solo por un PIN en el navegador,
-- pueda leer, aprobar, rechazar y eliminar propiedades.
--
-- IMPORTANTE:
-- Estas políticas NO son seguras para producción.
-- Más adelante deben reemplazarse por Supabase Auth y políticas para usuarios administradores.

grant select, update, delete
on table public.properties
to anon, authenticated;

drop policy if exists "Temporary admin can read all properties"
on public.properties;

create policy "Temporary admin can read all properties"
on public.properties
for select
to anon, authenticated
using (true);

drop policy if exists "Temporary admin can update properties"
on public.properties;

create policy "Temporary admin can update properties"
on public.properties
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Temporary admin can delete properties"
on public.properties;

create policy "Temporary admin can delete properties"
on public.properties
for delete
to anon, authenticated
using (true);
