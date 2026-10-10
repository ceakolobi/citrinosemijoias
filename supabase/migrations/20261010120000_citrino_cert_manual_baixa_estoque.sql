-- Citrino: certificado emitido a mao pela equipe (venda fora do site) da baixa no estoque.
-- Vendas pagas pelo site ja baixam em citrino_confirmar_pagamento (service_role) e NAO passam por aqui.
create or replace function public.citrino_cert_baixa_estoque()
returns trigger language plpgsql security definer set search_path = public as $$
declare it jsonb; q int;
begin
  if coalesce(auth.role(), '') = 'service_role' then return new; end if;
  for it in select * from jsonb_array_elements(new.items) loop
    continue when coalesce(it->>'sku','') = '';
    q := greatest(1, coalesce((it->>'quantity')::int, 1));
    update public.citrino_docs d
       set data = jsonb_set(d.data, '{stock}',
                  to_jsonb(greatest(0, coalesce((d.data->>'stock')::numeric::int, 0) - q)))
     where d.collection = 'products' and d.data->>'sku' = it->>'sku';
  end loop;
  return new;
end $$;
revoke all on function public.citrino_cert_baixa_estoque() from public, anon, authenticated;
drop trigger if exists citrino_cert_baixa_estoque on public.citrino_certificados;
create trigger citrino_cert_baixa_estoque after insert on public.citrino_certificados
for each row execute function public.citrino_cert_baixa_estoque();