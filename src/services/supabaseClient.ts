// Cliente Supabase da loja Citrino.
// A chave "publishable" é pública por desenho (fica no navegador); quem protege os
// dados é o RLS do banco. Pode ser sobrescrita por VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
import { createClient } from '@supabase/supabase-js';

const env = ((import.meta as any).env || {}) as Record<string, string | undefined>;

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://vlqfwdpgdqusugwebfwx.supabase.co';
export const SUPABASE_ANON_KEY =
  env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G9JhPOfn-rPV93AgBFM0ig_UNvAXiMf';

export const MEDIA_BUCKET = 'citrino-media';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'citrino-admin-auth',
  },
});

export const isSupabaseConnected = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
