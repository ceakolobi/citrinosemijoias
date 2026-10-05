# Auditoria de Segurança — Citrino Semijoias — 05/10/2026 — nível COMPLETO

**Escopo:** checkout real (InfinitePay), pedidos, certificados de garantia, painel "Vendas & Garantias".
**Banco:** Supabase `vlqfwdpgdqusugwebfwx` ("alma", compartilhado com Marina/NEXUS/Yafit).
**Status:** BLOQUEADO **somente** por configuração externa (ver A-00). Código: 0 CRÍTICO / 0 ALTO abertos.

## Notas por domínio (escopo Citrino)

| Domínio | Nota | Obs. |
|---|---|---|
| Segredos | 100 | nenhuma chave secreta no código, bundle ou git; `.env*` ignorado |
| Dependências | 100 | `npm audit --omit=dev`: 0 vulnerabilidades |
| Banco / RLS | 100 | RLS + políticas por papel nas 2 tabelas novas; anon sem acesso |
| Autorização | 100 | testes T1–T5, T13–T15 |
| API / Webhooks | 95 | sem assinatura no webhook InfinitePay (não oferecida); compensado por `payment_check` |
| Entrada / XSS | 100 | validação no servidor; HTML do certificado com escape |
| Integridade de pagamento | 100 | preço/total/estoque só no servidor; pago só via InfinitePay |
| LGPD | 90 | verificação pública mascara nome; CPF guardado (necessário p/ nota/entrega) |
| Monitoramento | 70 | logs das funções no Supabase; sem alerta automático ainda |

## Achados

**[CRÍTICO — CORRIGIDO] C-01 — Checkout de demonstração em produção**
- Onde: `src/services/store.ts`, `CheckoutView.tsx` (versão anterior)
- Risco: pedido salvo só no navegador do cliente; cartão marcado "pago" sem cobrança; código PIX falso. A loja recebia "vendas" que nunca chegavam à Mariah.
- Correção: checkout real via `citrino-checkout` + InfinitePay; pedido gravado no banco.
- Verificação: pedido de teste `CIT261005-U5X5JE` gravado com valores do servidor.

**[ALTO — CORRIGIDO NO DESENHO] A-01 — Preço/total controlados pelo navegador**
- Correção: servidor ignora preço enviado; recalcula com `citrino_docs`.
- Evidência (T-preço): enviado `price: 0.01`, `total: 0.01` → gravado `unit_cents=4200`, `total_cents=6490`.

**[ALTO — CORRIGIDO NO DESENHO] A-02 — Confirmação de pagamento forjável**
- Correção: `citrino-pagamento` confirma SEMPRE via `POST /payment_check` oficial; `citrino_confirmar_pagamento` só executável por `service_role`; trigger impede marcar "pago" manualmente.
- Evidência: T5 (anon → 401), T11 (pagamento falso → 404), T13 (update manual p/ "pago" → bloqueado).

**[BLOQUEIO EXTERNO] A-00 — Checkout Integrado desativado na conta InfinitePay**
- Evidência: API respondeu `external_checkout_not_enabled` (404).
- Ação: ativar em app.infinitepay.io → Checkout externo → Configurações (conta `$maria-daniel-4xs`).
- Até ativar, o checkout falha de forma segura (mensagem + WhatsApp da loja); nenhum pedido vira pago.

**[MÉDIO] M-01 — Webhook sem assinatura**
- A InfinitePay não oferece assinatura de webhook. Mitigado: o conteúdo do webhook nunca é confiado; só o resultado de `payment_check`.

**[INFO] I-01 — Arquivos legados não publicados:** `supabase/functions/enviar-email`, `mercadopago-webhook`, `supabase/schema.sql`, `server.ts`. Não estão no ar (site é estático). **Não publicar como estão** (CORS `*`, sem autenticação, HTML sem escape). Recomendo remover.

## Testes ativos executados (origem: citrinosemijoias.com.br, persona "estranho")

| # | Teste | Esperado | Resultado |
|---|---|---|---|
| T1 | anon lê `citrino_pedidos` | negar | 401 ✅ |
| T2 | anon lê `citrino_certificados` | negar | 401 ✅ |
| T3 | anon insere pedido "pago" | negar | 401 ✅ |
| T4 | anon emite certificado | negar | 401 ✅ |
| T5 | anon chama `citrino_confirmar_pagamento` | negar | 401 ✅ |
| T6 | verificar código inexistente | vazio | `[]` ✅ |
| T7 | verificar com injeção SQL | vazio | `[]` ✅ |
| T8 | checkout com CPF inválido | 400 | 400 ✅ |
| T9 | checkout acima do estoque | 400 | 400 ✅ |
| T10 | checkout produto inexistente | 400 | 400 ✅ |
| T11 | confirmar pagamento falso | negar | 404 ✅ |
| T12 | parâmetros maliciosos no pagamento | 400 | 400 ✅ |
| T-preço | preço adulterado (R$ 0,01) | servidor ignora | R$ 64,90 gravado ✅ |
| T13 | equipe marca "pago" manualmente | bloquear | exceção ✅ |
| T14 | equipe altera total | ignorar | total mantido ✅ |
| T15 | certificado com código/validade forjados | servidor sobrescreve | código e validade do servidor ✅ |

## Não verificado (precisa de ação)
- Fluxo completo com pagamento real (depende de A-00). Fazer 1 compra de teste de valor baixo após ativar.
- Persona "admin de outro sistema" (usuário logado da Marina/NEXUS tentando ler pedidos Citrino): coberto por `citrino_is_admin()`, mas sem conta de teste dedicada.

## Fora do escopo — achados no banco compartilhado (prioridade na auditoria da Marina)
- **ERRO:** `public.rag_selftest` sem RLS.
- **WARN:** funções `SECURITY DEFINER` executáveis por anônimos: `n8n_human_takeover*`, `n8n_inbound_por_instancia`, `fn_send_followup_marina`, `bia_criar_agendamento`, `submit_*`, entre outras — revisar uma a uma.
- **WARN:** 12 funções sem `search_path` fixo; extensões `vector`/`pg_net` no schema `public`; proteção contra senhas vazadas desligada no Auth.
