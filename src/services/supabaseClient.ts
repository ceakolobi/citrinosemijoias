// Supabase client initialization helper
// Permite sincronização com Supabase real quando configurado em .env,
// e garante funcionamento pleno e instantâneo no preview local.

export const SUPABASE_CONFIG = {
  url: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://sua-empresa.supabase.co',
  anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sua-chave-publica-anon',
  hasCredentials: Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && 
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  )
};

export const isSupabaseConnected = () => SUPABASE_CONFIG.hasCredentials;
