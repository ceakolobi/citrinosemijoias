-- Citrino: cadastro de clientes no banco (antes ficava so no navegador da Mariah).
-- Projeto Supabase: vlqfwdpgdqusugwebfwx ("alma"). Tabela nova, nao altera nenhuma existente.
create table if not exists public.citrino_clientes (
  id text primary key,
  name text not null,
  document text,
  phone text,
  whatsapp text,
  email text,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists citrino_clientes_name_idx on public.citrino_clientes (lower(name));

create or replace function public.citrino_clientes_touch()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists citrino_clientes_touch on public.citrino_clientes;
create trigger citrino_clientes_touch before update on public.citrino_clientes
  for each row execute function public.citrino_clientes_touch();

alter table public.citrino_clientes enable row level security;

drop policy if exists "clientes equipe le" on public.citrino_clientes;
create policy "clientes equipe le" on public.citrino_clientes for select to authenticated
  using (public.citrino_is_admin());
drop policy if exists "clientes equipe grava" on public.citrino_clientes;
create policy "clientes equipe grava" on public.citrino_clientes for insert to authenticated
  with check (public.citrino_admin_role() in ('admin','operador'));
drop policy if exists "clientes equipe atualiza" on public.citrino_clientes;
create policy "clientes equipe atualiza" on public.citrino_clientes for update to authenticated
  using (public.citrino_admin_role() in ('admin','operador'))
  with check (public.citrino_admin_role() in ('admin','operador'));
