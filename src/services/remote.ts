// Camada de dados compartilhada com o Supabase (catálogo, banners, textos, login do painel).
//
// Por que existe: cada componente chama useCitrinoStore() e ganha sua própria cópia do estado.
// Os dados que precisam ser iguais para todo mundo (produtos, banners, textos e a sessão do
// painel) ficam aqui, num store único, para o site público e o painel enxergarem a mesma coisa.
import { useSyncExternalStore } from 'react';
import { supabase, MEDIA_BUCKET } from './supabaseClient';
import type { Product, Category, HomeBanner, AdminRole } from '../types';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface RemoteState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** Já temos algo para desenhar a loja (vindo do cache ou da rede). */
  hasData: boolean;
  products: Product[];
  categories: Category[];
  banners: HomeBanner[];
  company: Record<string, any>;
  texts: Record<string, string>;
  session: { status: 'loading' | 'anon' | 'admin'; user: SessionUser | null };
  /** O que está em products é a visão completa do admin (inclui inativos e preço de custo). */
  adminView: boolean;
  error: string | null;
}

export type Result = { ok: true } | { ok: false; error: string };

type Row = { collection: string; id: string; sort: number; data: any };

const CACHE_KEY = 'citrino_remote_cache_v2';

const sorts: Record<string, Record<string, number>> = {
  products: {},
  categories: {},
  banners: {},
  content: {},
};

function readCache(): Partial<RemoteState> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    if (!c || !Array.isArray(c.products) || !Array.isArray(c.banners) || !Array.isArray(c.categories)) return null;
    return {
      products: c.products,
      categories: c.categories,
      banners: c.banners,
      company: c.company || {},
      texts: c.texts || {},
    };
  } catch {
    return null;
  }
}

function writeCache(s: RemoteState) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        products: s.products,
        categories: s.categories,
        banners: s.banners,
        company: s.company,
        texts: s.texts,
      })
    );
  } catch {
    /* sem cache, tudo bem */
  }
}

const cached = typeof window !== 'undefined' ? readCache() : null;

let state: RemoteState = {
  status: 'idle',
  hasData: Boolean(cached),
  products: cached?.products || [],
  categories: cached?.categories || [],
  banners: cached?.banners || [],
  company: cached?.company || {},
  texts: cached?.texts || {},
  session: { status: 'loading', user: null },
  adminView: false,
  error: null,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<RemoteState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getRemoteState() {
  return state;
}

export function useRemote(): RemoteState {
  startRemote();
  return useSyncExternalStore(subscribe, getRemoteState, getRemoteState);
}

/* ------------------------------------------------------------------ */
/* Leitura                                                              */
/* ------------------------------------------------------------------ */

function friendly(e: any): string {
  const msg = String(e?.message || e || '');
  if (e?.code === '42501' || /row-level security|permission denied/i.test(msg)) {
    return 'Sem permissão para salvar. Saia e entre de novo no painel.';
  }
  if (/failed to fetch|network|load failed/i.test(msg)) {
    return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  }
  if (/exceeded the maximum allowed size|too large|payload/i.test(msg)) {
    return 'A imagem é grande demais. Use uma foto de até 5 MB.';
  }
  return msg || 'Erro inesperado.';
}

const fail = (e: any): Result => ({ ok: false, error: friendly(e) });

function applyRows(rows: Row[], adminView: boolean) {
  const bucket = (c: string) =>
    rows
      .filter((r) => r.collection === c)
      .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id));

  for (const c of Object.keys(sorts)) sorts[c] = {};
  rows.forEach((r) => {
    sorts[r.collection][r.id] = r.sort;
  });

  const content: Record<string, any> = {};
  bucket('content').forEach((r) => {
    content[r.id] = r.data;
  });

  setState({
    products: bucket('products').map((r) => ({ ...r.data, id: r.id }) as Product),
    categories: bucket('categories').map((r) => ({ ...r.data, id: r.id }) as Category),
    banners: bucket('banners').map((r) => ({ ...r.data, id: r.id }) as HomeBanner),
    company: content.company || {},
    texts: content.texts || {},
    adminView,
    hasData: true,
    status: 'ready',
    error: null,
  });
  if (!adminView) writeCache(state);
}

let loadVersion = 0;

export async function refreshCatalog(): Promise<void> {
  const version = ++loadVersion;
  const admin = state.session.status === 'admin';
  if (!state.hasData) setState({ status: 'loading' });
  try {
    let rows: Row[];
    if (admin) {
      const { data, error } = await supabase
        .from('citrino_docs')
        .select('collection,id,sort,data')
        .range(0, 4999);
      if (error) throw error;
      rows = (data || []) as Row[];
    } else {
      const { data, error } = await supabase.rpc('citrino_public_catalog');
      if (error) throw error;
      rows = (data || []) as Row[];
    }
    if (version !== loadVersion) return; // chegou resposta mais nova, descarta esta
    applyRows(rows, admin);
  } catch (e: any) {
    if (version !== loadVersion) return;
    setState({ status: 'error', error: friendly(e) });
  }
}

/* ------------------------------------------------------------------ */
/* Sessão do painel                                                     */
/* ------------------------------------------------------------------ */

let syncing: Promise<void> | null = null;
let catalogFor: 'public' | 'admin' | null = null;

async function syncSessionInner() {
  let next: RemoteState['session'] = { status: 'anon', user: null };
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const { data: row } = await supabase
        .from('citrino_admins')
        .select('email,name,role,active')
        .eq('user_id', data.session.user.id)
        .maybeSingle();
      if (row && row.active) {
        next = {
          status: 'admin',
          user: {
            id: data.session.user.id,
            email: row.email,
            name: row.name || row.email,
            role: row.role as AdminRole,
          },
        };
      }
    }
  } catch {
    /* mantém anon */
  }
  setState({ session: next });
  const want = next.status === 'admin' ? 'admin' : 'public';
  if (catalogFor !== want) {
    catalogFor = want;
    await refreshCatalog();
  }
}

export function syncSession(): Promise<void> {
  if (!syncing) {
    syncing = syncSessionInner().finally(() => {
      syncing = null;
    });
  }
  return syncing;
}

let started = false;
export function startRemote() {
  if (started || typeof window === 'undefined') return;
  started = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'TOKEN_REFRESHED') return;
    // Fora do callback para não travar o cliente de auth.
    setTimeout(() => {
      syncSession();
    }, 0);
  });
  syncSession();
}

export async function loginAdmin(email: string, password: string): Promise<Result> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, error: 'E-mail ou senha incorretos. Verifique suas credenciais.' };
  }
  const { data: row } = await supabase
    .from('citrino_admins')
    .select('active')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (!row || !row.active) {
    await supabase.auth.signOut();
    return { ok: false, error: 'Esta conta não tem acesso ao painel da Citrino.' };
  }
  await syncSession();
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await supabase.auth.signOut();
  setState({ session: { status: 'anon', user: null } });
  catalogFor = 'public';
  await refreshCatalog();
}

/* ------------------------------------------------------------------ */
/* Escrita (só admin; o RLS do banco é quem garante)                    */
/* ------------------------------------------------------------------ */

async function upsertRows(rows: Row[]): Promise<Result> {
  const { error } = await supabase
    .from('citrino_docs')
    .upsert(rows, { onConflict: 'collection,id' });
  if (error) return fail(error);
  rows.forEach((r) => {
    sorts[r.collection][r.id] = r.sort;
  });
  return { ok: true };
}

function nextTopSort(collection: string): number {
  const vals = Object.values(sorts[collection] || {});
  return vals.length ? Math.min(...vals) - 1 : 0;
}

/** Cria ou atualiza um produto. Produto novo entra no topo da lista. */
export async function saveProductDoc(product: Product): Promise<Result> {
  const sort = sorts.products[product.id] ?? nextTopSort('products');
  const { id, ...data } = product;
  const res = await upsertRows([{ collection: 'products', id, sort, data }]);
  if (!res.ok) return res;
  const exists = state.products.some((p) => p.id === id);
  setState({
    products: exists
      ? state.products.map((p) => (p.id === id ? product : p))
      : [product, ...state.products],
  });
  return { ok: true };
}

export async function deleteProductDoc(id: string): Promise<Result> {
  const { error } = await supabase
    .from('citrino_docs')
    .delete()
    .eq('collection', 'products')
    .eq('id', id);
  if (error) return fail(error);
  delete sorts.products[id];
  setState({ products: state.products.filter((p) => p.id !== id) });
  return { ok: true };
}

/** Salva a lista inteira de banners na ordem recebida e apaga os que saíram. */
export async function saveBannersDoc(list: HomeBanner[]): Promise<Result> {
  const rows: Row[] = list.map((b, i) => ({
    collection: 'banners',
    id: b.id,
    sort: i,
    data: (() => {
      const { id, ...rest } = { ...b, order: i + 1 };
      return rest;
    })(),
  }));
  const keep = new Set(list.map((b) => b.id));
  const removed = state.banners.filter((b) => !keep.has(b.id)).map((b) => b.id);
  if (rows.length) {
    const res = await upsertRows(rows);
    if (!res.ok) return res;
  }
  if (removed.length) {
    const { error } = await supabase
      .from('citrino_docs')
      .delete()
      .eq('collection', 'banners')
      .in('id', removed);
    if (error) return fail(error);
    removed.forEach((id) => delete sorts.banners[id]);
  }
  setState({ banners: list.map((b, i) => ({ ...b, order: i + 1 })) });
  return { ok: true };
}

export async function saveCategoryDoc(category: Category): Promise<Result> {
  const sort = sorts.categories[category.id] ?? Object.keys(sorts.categories).length;
  const { id, ...data } = category;
  const res = await upsertRows([{ collection: 'categories', id, sort, data }]);
  if (!res.ok) return res;
  setState({ categories: state.categories.map((c) => (c.id === id ? category : c)) });
  return { ok: true };
}

/** key = 'company' (dados de contato) ou 'texts' (textos das páginas). */
export async function saveContentDoc(key: 'company' | 'texts', value: Record<string, any>): Promise<Result> {
  const res = await upsertRows([{ collection: 'content', id: key, sort: 0, data: value }]);
  if (!res.ok) return res;
  setState(key === 'company' ? { company: value } : { texts: value as Record<string, string> });
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Fotos                                                                */
/* ------------------------------------------------------------------ */

export async function uploadImage(blob: Blob, folder: 'produtos' | 'banners' | 'categorias' | 'site'): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : blob.type === 'image/gif' ? 'gif' : 'jpg';
  const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${folder}/${name}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) return fail(error) as { ok: false; error: string };
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
