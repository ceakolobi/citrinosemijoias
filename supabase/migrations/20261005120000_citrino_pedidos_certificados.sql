-- Citrino: pedidos reais (InfinitePay) + certificados de garantia nominais
-- Projeto Supabase: vlqfwdpgdqusugwebfwx ("alma"). Não altera nenhuma tabela existente.
create extension if not exists pgcrypto with schema extensions;

-- ===================== PEDIDOS =====================
create table if not exists public.citrino_pedidos (
  id uuid primary key default gen_random_uuid(),
  order_nsu text not null unique,
  status text not null default 'aguardando'
    check (status in ('aguardando','pago','separacao','enviado','entregue','cancelado')),
  customer jsonb not null,
  address jsonb not null,
  shipping jsonb not null,
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  subtotal_cents integer not null check (subtotal_cents > 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  total_cents integer not null check (total_cents > 0),
  checkout_url text,
  payment jsonb,
  paid_at timestamptz,
  tracking_code text check (tracking_code is null or char_length(tracking_code) <= 40),
  notes text check (notes is null or char_length(notes) <= 500),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists citrino_pedidos_created_idx on public.citrino_pedidos (created_at desc);
create index if not exists citrino_pedidos_ip_idx on public.citrino_pedidos (ip_hash, created_at);

-- A equipe só altera status/rastreio/observação. Valores e pagamento: só o servidor.
create or replace function public.citrino_pedidos_guard()
returns trigger language plpgsql set search_path = public as $$
begin
  if coalesce(auth.role(), '') <> 'service_role' then
    new.order_nsu := old.order_nsu;  new.customer := old.customer;  new.address := old.address;
    new.shipping := old.shipping;    new.items := old.items;
    new.subtotal_cents := old.subtotal_cents; new.shipping_cents := old.shipping_cents;
    new.total_cents := old.total_cents; new.checkout_url := old.checkout_url;
    new.payment := old.payment; new.paid_at := old.paid_at; new.ip_hash := old.ip_hash;
    new.created_at := old.created_at;
    if new.status = 'pago' and old.paid_at is null then
      raise exception 'Pagamento só é confirmado pela InfinitePay';
    end if;
    if new.status in ('separacao','enviado','entregue') and old.paid_at is null then
      raise exception 'Pedido ainda não foi pago';
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists citrino_pedidos_guard on public.citrino_pedidos;
create trigger citrino_pedidos_guard before update on public.citrino_pedidos
for each row execute function public.citrino_pedidos_guard();

alter table public.citrino_pedidos enable row level security;
revoke all on public.citrino_pedidos from anon;
drop policy if exists "pedidos equipe le" on public.citrino_pedidos;
create policy "pedidos equipe le" on public.citrino_pedidos for select to authenticated
  using (public.citrino_is_admin());
drop policy if exists "pedidos equipe atualiza" on public.citrino_pedidos;
create policy "pedidos equipe atualiza" on public.citrino_pedidos for update to authenticated
  using (public.citrino_admin_role() in ('admin','operador'))
  with check (public.citrino_admin_role() in ('admin','operador'));

-- ===================== CERTIFICADOS =====================
-- Código curto sem caracteres ambíguos (sem 0/O/1/I/L): 10 posições ≈ 49 bits
create or replace function public.citrino_new_cert_code()
returns text language plpgsql volatile set search_path = public, extensions as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  b bytea := extensions.gen_random_bytes(10);
  out text := '';
  i int;
begin
  for i in 0..9 loop
    out := out || substr(alphabet, (get_byte(b, i) % length(alphabet)) + 1, 1);
  end loop;
  return 'CIT-' || substr(out,1,5) || '-' || substr(out,6,5);
end $$;

create table if not exists public.citrino_certificados (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default public.citrino_new_cert_code(),
  pedido_id uuid references public.citrino_pedidos(id) on delete restrict,
  customer_name text not null check (char_length(btrim(customer_name)) between 2 and 120),
  customer_phone text check (customer_phone is null or customer_phone ~ '^[0-9]{10,13}$'),
  order_ref text check (order_ref is null or char_length(order_ref) <= 40),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 30),
  warranty text not null check (warranty in ('6 meses','1 ano')),
  purchase_date date not null check (purchase_date between date '2020-01-01' and (current_date + 1)),
  valid_until date not null,
  notes text check (notes is null or char_length(notes) <= 500),
  revoked boolean not null default false,
  revoked_at timestamptz,
  issued_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pedido_id, warranty)
);

-- Servidor decide validade, código e autor (o navegador não consegue forjar)
create or replace function public.citrino_cert_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  new.customer_name := btrim(new.customer_name);
  new.valid_until := new.purchase_date + case when new.warranty = '1 ano' then interval '12 months' else interval '6 months' end;
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.issued_by := auth.uid();
    new.created_at := now();
    new.code := public.citrino_new_cert_code();
    new.revoked := false;
    new.revoked_at := null;
    if coalesce(auth.role(), '') <> 'service_role' then new.pedido_id := null; end if;
  else
    new.code := old.code; new.issued_by := old.issued_by; new.created_at := old.created_at;
    new.pedido_id := old.pedido_id;
    if new.revoked and not old.revoked then new.revoked_at := now(); end if;
    if not new.revoked then new.revoked_at := null; end if;
  end if;
  return new;
end $$;
drop trigger if exists citrino_cert_before_write on public.citrino_certificados;
create trigger citrino_cert_before_write before insert or update on public.citrino_certificados
for each row execute function public.citrino_cert_before_write();

alter table public.citrino_certificados enable row level security;
revoke all on public.citrino_certificados from anon;
drop policy if exists "cert equipe le" on public.citrino_certificados;
create policy "cert equipe le" on public.citrino_certificados for select to authenticated
  using (public.citrino_is_admin());
drop policy if exists "cert equipe emite" on public.citrino_certificados;
create policy "cert equipe emite" on public.citrino_certificados for insert to authenticated
  with check (public.citrino_admin_role() in ('admin','operador'));
drop policy if exists "cert equipe altera" on public.citrino_certificados;
create policy "cert equipe altera" on public.citrino_certificados for update to authenticated
  using (public.citrino_admin_role() in ('admin','operador'))
  with check (public.citrino_admin_role() in ('admin','operador'));
drop policy if exists "cert admin apaga" on public.citrino_certificados;
create policy "cert admin apaga" on public.citrino_certificados for delete to authenticated
  using (public.citrino_admin_role() = 'admin');

-- ===================== CONFIRMAÇÃO DE PAGAMENTO (só servidor) =====================
-- Chamada pela função citrino-pagamento DEPOIS de conferir na API da InfinitePay.
-- Idempotente: rodar 2x não duplica baixa de estoque nem certificado.
create or replace function public.citrino_confirmar_pagamento(p_order_nsu text, p_payment jsonb, p_paid_cents integer)
returns table(order_nsu text, status text, codigos text[])
language plpgsql security definer set search_path = public as $$
declare
  o public.citrino_pedidos%rowtype;
  it jsonb;
  w text;
begin
  select * into o from public.citrino_pedidos p where p.order_nsu = p_order_nsu for update;
  if not found then raise exception 'pedido inexistente'; end if;

  if o.paid_at is null then
    if p_paid_cents is null or p_paid_cents < o.total_cents then
      raise exception 'valor pago (%) menor que o total (%)', p_paid_cents, o.total_cents;
    end if;
    update public.citrino_pedidos
       set status = 'pago', paid_at = now(), payment = p_payment
     where id = o.id;

    -- baixa de estoque
    for it in select * from jsonb_array_elements(o.items) loop
      update public.citrino_docs d
         set data = jsonb_set(d.data, '{stock}',
                    to_jsonb(greatest(0, coalesce((d.data->>'stock')::numeric::int, 0) - (it->>'quantity')::int)))
       where d.collection = 'products' and d.id = it->>'productId';
    end loop;

    -- um certificado por tipo de garantia do pedido
    for w in select distinct coalesce(e->>'warranty','6 meses') from jsonb_array_elements(o.items) e loop
      insert into public.citrino_certificados (pedido_id, customer_name, customer_phone, order_ref, items, warranty, purchase_date)
      values (
        o.id,
        o.customer->>'name',
        nullif(regexp_replace(coalesce(o.customer->>'phone',''), '\D', '', 'g'), ''),
        o.order_nsu,
        (select jsonb_agg(jsonb_build_object('name', e->>'name', 'sku', e->>'sku', 'variation', e->>'variation', 'quantity', (e->>'quantity')::int))
           from jsonb_array_elements(o.items) e where coalesce(e->>'warranty','6 meses') = w),
        w,
        (now() at time zone 'America/Sao_Paulo')::date
      )
      on conflict (pedido_id, warranty) do nothing;
    end loop;
  end if;

  return query
    select o.order_nsu, (select p.status from public.citrino_pedidos p where p.id = o.id),
           array(select c.code from public.citrino_certificados c where c.pedido_id = o.id order by c.warranty);
end $$;
revoke all on function public.citrino_confirmar_pagamento(text, jsonb, integer) from public, anon, authenticated;
grant execute on function public.citrino_confirmar_pagamento(text, jsonb, integer) to service_role;

-- ===================== VERIFICAÇÃO PÚBLICA =====================
-- Só dados não sensíveis: primeiro nome + inicial, peças, validade e situação.
create or replace function public.citrino_verificar_certificado(p_code text)
returns table(code text, cliente text, itens text[], garantia text, data_compra date, valido_ate date, situacao text)
language sql stable security definer set search_path = public as $$
  select c.code,
         split_part(c.customer_name, ' ', 1) ||
           case when position(' ' in c.customer_name) > 0
                then ' ' || left(split_part(c.customer_name, ' ', array_length(string_to_array(c.customer_name,' '),1)), 1) || '.'
                else '' end,
         array(select coalesce(e->>'name','Peça') from jsonb_array_elements(c.items) e),
         c.warranty, c.purchase_date, c.valid_until,
         case when c.revoked then 'cancelado'
              when c.valid_until < current_date then 'expirado'
              else 'valido' end
  from public.citrino_certificados c
  where upper(btrim(p_code)) ~ '^CIT-[2-9A-HJ-NP-Z]{5}-[2-9A-HJ-NP-Z]{5}$'
    and c.code = upper(btrim(p_code))
  limit 1;
$$;
revoke all on function public.citrino_verificar_certificado(text) from public;
grant execute on function public.citrino_verificar_certificado(text) to anon, authenticated;
revoke all on function public.citrino_new_cert_code() from public, anon, authenticated;
