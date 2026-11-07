-- Citrino: consignação ("maleta"). Peças saem do estoque ao entregar a maleta, voltam ao ler as que sobraram,
-- e o que não voltou vira venda (valor a receber + comissão). Escritas só pelas funções abaixo (equipe admin/operador).
create table if not exists public.citrino_revendedoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  telefone text,
  comissao_percent numeric(5,2) not null default 0 check (comissao_percent between 0 and 100),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.citrino_consignacoes (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity,
  revendedora_id uuid references public.citrino_revendedoras(id),
  revendedora_nome text,
  comissao_percent numeric(5,2) not null default 0,
  status text not null default 'aberta' check (status in ('aberta','encerrada','cancelada')),
  obs text,
  saida_em timestamptz not null default now(),
  acerto_em timestamptz,
  total_levado_cents bigint not null default 0,
  total_vendido_cents bigint not null default 0,
  comissao_cents bigint not null default 0,
  a_receber_cents bigint not null default 0
);
create table if not exists public.citrino_consignacao_itens (
  id uuid primary key default gen_random_uuid(),
  consignacao_id uuid not null references public.citrino_consignacoes(id) on delete cascade,
  product_id text, sku text not null, nome text not null,
  unit_cents integer not null check (unit_cents >= 0),
  qtd_levada integer not null check (qtd_levada > 0),
  qtd_devolvida integer not null default 0 check (qtd_devolvida >= 0),
  codigos_saida jsonb not null default '[]',
  codigos_devolvidos jsonb not null default '[]'
);
create index if not exists citrino_consig_itens_idx on public.citrino_consignacao_itens(consignacao_id);

alter table public.citrino_revendedoras enable row level security;
alter table public.citrino_consignacoes enable row level security;
alter table public.citrino_consignacao_itens enable row level security;
revoke all on public.citrino_revendedoras, public.citrino_consignacoes, public.citrino_consignacao_itens from anon;
drop policy if exists "revend equipe le" on public.citrino_revendedoras;
create policy "revend equipe le" on public.citrino_revendedoras for select to authenticated using (public.citrino_is_admin());
drop policy if exists "revend equipe escreve" on public.citrino_revendedoras;
create policy "revend equipe escreve" on public.citrino_revendedoras for all to authenticated
  using (public.citrino_admin_role() in ('admin','operador')) with check (public.citrino_admin_role() in ('admin','operador'));
drop policy if exists "consig equipe le" on public.citrino_consignacoes;
create policy "consig equipe le" on public.citrino_consignacoes for select to authenticated using (public.citrino_is_admin());
drop policy if exists "consig itens equipe le" on public.citrino_consignacao_itens;
create policy "consig itens equipe le" on public.citrino_consignacao_itens for select to authenticated using (public.citrino_is_admin());

create or replace function public.citrino_consig_abrir(_rev uuid, _itens jsonb, _obs text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare cid uuid; it jsonb; d record; q int; pr int; total bigint := 0; rn text; rc numeric := 0;
begin
  if public.citrino_admin_role() not in ('admin','operador') then raise exception 'Sem permissão'; end if;
  if jsonb_typeof(_itens) <> 'array' or jsonb_array_length(_itens) = 0 then raise exception 'Maleta vazia'; end if;
  if _rev is not null then select nome, comissao_percent into rn, rc from public.citrino_revendedoras where id = _rev and ativo; if not found then raise exception 'Revendedora inválida'; end if; end if;
  insert into public.citrino_consignacoes (revendedora_id, revendedora_nome, comissao_percent, obs)
  values (_rev, rn, coalesce(rc, 0), nullif(trim(coalesce(_obs,'')), '')) returning id into cid;
  for it in select * from jsonb_array_elements(_itens) loop
    q := greatest(1, coalesce((it->>'qty')::int, 1));
    select * into d from public.citrino_docs where collection = 'products' and lower(data->>'sku') = lower(it->>'sku') for update;
    if not found then raise exception 'Peça não encontrada: %', it->>'sku'; end if;
    if coalesce((d.data->>'stock')::numeric::int, 0) < q then raise exception 'Estoque insuficiente de % (tem %, pediu %)', d.data->>'sku', coalesce(d.data->>'stock','0'), q; end if;
    pr := round(coalesce(nullif((d.data->>'promoPrice')::numeric, 0), (d.data->>'price')::numeric, 0) * 100);
    update public.citrino_docs set data = jsonb_set(data, '{stock}', to_jsonb(coalesce((data->>'stock')::numeric::int, 0) - q)) where collection = d.collection and id = d.id;
    insert into public.citrino_consignacao_itens (consignacao_id, product_id, sku, nome, unit_cents, qtd_levada, codigos_saida)
    values (cid, d.id, d.data->>'sku', d.data->>'name', pr, q, coalesce(it->'codes', '[]'::jsonb));
    total := total + pr::bigint * q;
  end loop;
  update public.citrino_consignacoes set total_levado_cents = total where id = cid;
  return cid;
end $$;

create or replace function public.citrino_consig_acertar(_id uuid, _devolvidos jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare c record; i record; dv jsonb; q int; codes jsonb; vend bigint := 0; comm bigint; x text;
begin
  if public.citrino_admin_role() not in ('admin','operador') then raise exception 'Sem permissão'; end if;
  select * into c from public.citrino_consignacoes where id = _id for update;
  if not found or c.status <> 'aberta' then raise exception 'Maleta não está aberta'; end if;
  if jsonb_typeof(_devolvidos) <> 'array' then raise exception 'Dados inválidos'; end if;
  for dv in select * from jsonb_array_elements(_devolvidos) loop
    if not exists (select 1 from public.citrino_consignacao_itens where consignacao_id = _id and lower(sku) = lower(dv->>'sku')) then
      raise exception 'Peça % não faz parte desta maleta', dv->>'sku'; end if;
  end loop;
  for i in select * from public.citrino_consignacao_itens where consignacao_id = _id for update loop
    select coalesce(sum(greatest(0, (e->>'qty')::int)), 0), coalesce(jsonb_agg(c2) filter (where c2 is not null), '[]'::jsonb)
      into q, codes from jsonb_array_elements(_devolvidos) e left join lateral jsonb_array_elements(coalesce(e->'codes','[]'::jsonb)) c2 on true
      where lower(e->>'sku') = lower(i.sku);
    if q > i.qtd_levada then raise exception 'Devolveu mais % do que levou (%)', i.sku, i.qtd_levada; end if;
    if jsonb_array_length(i.codigos_saida) > 0 then
      for x in select jsonb_array_elements_text(codes) loop
        if not (i.codigos_saida ? x) then raise exception 'Código % não saiu nesta maleta', x; end if;
      end loop;
      if (select count(distinct v) from jsonb_array_elements_text(codes) v) <> jsonb_array_length(codes) then raise exception 'Código repetido em %', i.sku; end if;
    end if;
    update public.citrino_consignacao_itens set qtd_devolvida = q, codigos_devolvidos = codes where id = i.id;
    update public.citrino_docs set data = jsonb_set(data, '{stock}', to_jsonb(coalesce((data->>'stock')::numeric::int, 0) + q))
      where collection = 'products' and id = i.product_id;
    vend := vend + i.unit_cents::bigint * (i.qtd_levada - q);
  end loop;
  comm := round(vend * c.comissao_percent / 100.0);
  update public.citrino_consignacoes set status = 'encerrada', acerto_em = now(), total_vendido_cents = vend,
    comissao_cents = comm, a_receber_cents = vend - comm where id = _id;
  return _id;
end $$;

create or replace function public.citrino_consig_cancelar(_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare c record; i record;
begin
  if public.citrino_admin_role() not in ('admin','operador') then raise exception 'Sem permissão'; end if;
  select * into c from public.citrino_consignacoes where id = _id for update;
  if not found or c.status <> 'aberta' then raise exception 'Só maleta aberta pode ser cancelada'; end if;
  for i in select * from public.citrino_consignacao_itens where consignacao_id = _id loop
    update public.citrino_docs set data = jsonb_set(data, '{stock}', to_jsonb(coalesce((data->>'stock')::numeric::int, 0) + i.qtd_levada))
      where collection = 'products' and id = i.product_id;
  end loop;
  update public.citrino_consignacoes set status = 'cancelada', acerto_em = now() where id = _id;
  return _id;
end $$;

revoke all on function public.citrino_consig_abrir(uuid, jsonb, text), public.citrino_consig_acertar(uuid, jsonb), public.citrino_consig_cancelar(uuid) from public, anon;
grant execute on function public.citrino_consig_abrir(uuid, jsonb, text), public.citrino_consig_acertar(uuid, jsonb), public.citrino_consig_cancelar(uuid) to authenticated;
