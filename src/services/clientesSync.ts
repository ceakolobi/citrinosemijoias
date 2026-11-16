// Cadastro de clientes da Citrino: espelho no banco (tabela citrino_clientes).
// Antes os clientes ficavam so no navegador (localStorage), entao busca e preenchimento
// automatico (ex.: Emitir certificado) nao os enxergavam. So admin/operador logado le e grava (RLS).
import { supabase } from './supabaseClient';
import type { Customer } from '../types';

const PAGE = 1000; // o Supabase corta em 1000 linhas por consulta
let inflight: { at: number; p: Promise<Customer[] | null> } | null = null;

async function hasSession(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    return Boolean(data.session);
  } catch {
    return false;
  }
}

async function fetchAll(): Promise<Customer[] | null> {
  if (!(await hasSession())) return null;
  const out: Customer[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('citrino_clientes')
      .select('id, data')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) return null;
    for (const r of data || []) if (r?.data) out.push(r.data as Customer);
    if (!data || data.length < PAGE) break;
  }
  return out;
}

// Varias partes da tela usam o store ao mesmo tempo: divide a mesma busca por alguns segundos.
export function fetchRemoteCustomers(): Promise<Customer[] | null> {
  const now = Date.now();
  if (inflight && now - inflight.at < 8000) return inflight.p;
  const p = fetchAll();
  inflight = { at: now, p };
  return p;
}

export async function upsertCustomers(list: Customer[]): Promise<boolean> {
  if (list.length === 0) return true;
  if (!(await hasSession())) return false;
  for (let i = 0; i < list.length; i += 200) {
    const rows = list.slice(i, i + 200).map((c) => ({
      id: c.id,
      name: String(c.name || '').trim() || 'Sem nome',
      document: c.document || null,
      phone: c.phone || null,
      whatsapp: c.whatsapp || null,
      email: c.email || null,
      data: c,
    }));
    const { error } = await supabase.from('citrino_clientes').upsert(rows, { onConflict: 'id' });
    if (error) return false;
  }
  return true;
}

export type ClienteBusca = { id: string; name: string; phone: string; document: string };

export async function searchRemoteCustomers(term: string): Promise<ClienteBusca[]> {
  const s = term.replace(/[,()%*\\]/g, ' ').trim();
  if (s.length < 2) return [];
  const { data, error } = await supabase
    .from('citrino_clientes')
    .select('id, name, phone, whatsapp, document')
    .or(`name.ilike.%${s}%,document.ilike.%${s}%,phone.ilike.%${s}%,whatsapp.ilike.%${s}%`)
    .order('name')
    .limit(8);
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    phone: r.whatsapp || r.phone || '',
    document: r.document || '',
  }));
}
