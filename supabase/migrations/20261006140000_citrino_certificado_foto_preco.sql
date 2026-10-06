-- Certificados novos guardam a foto da peça e o preço pago (unit_cents, vindo do pedido já conferido pelo servidor).
-- Só muda o jsonb dos itens; regras de segurança e idempotência continuam iguais.
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
        (select jsonb_agg(jsonb_build_object('name', e->>'name', 'sku', e->>'sku', 'variation', e->>'variation', 'quantity', (e->>'quantity')::int,
                                'unit_cents', (e->>'unit_cents')::int,
                                'image', case when e->>'image' ~ '^https://' and length(e->>'image') <= 500 then e->>'image' else null end))
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
