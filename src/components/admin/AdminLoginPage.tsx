import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToStore: () => void;
  onLogin: (email: string, password: string) => boolean;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToStore, onLogin }) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      const ok = onLogin(email.trim(), password);
      setLoading(false);
      if (ok) {
        onSuccess();
      } else {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#1C1C1C] flex flex-col items-center justify-center p-4">
      {/* Background decorative element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C9A84C]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#C9A84C]/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <ShieldCheck className="w-8 h-8 text-[#C9A84C]" />
            <div className="text-left">
              <p className="text-[#C9A84C] font-serif text-xl font-bold tracking-widest uppercase">CITRINO</p>
              <p className="text-gray-400 text-[10px] tracking-[0.3em] uppercase">ERP · Painel Administrativo</p>
            </div>
          </div>
          <h1 className="text-white text-2xl font-bold mt-2">Acesso Restrito</h1>
          <p className="text-gray-500 text-sm mt-1">Entre com suas credenciais de administrador</p>
        </div>

        {/* Card */}
        <div className="bg-[#242424] rounded-2xl border border-white/10 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  placeholder="seu@citrinosemijoias.com.br"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider block">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/50 focus:ring-1 focus:ring-[#C9A84C]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 rounded-lg p-3 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#B8973B] disabled:opacity-60 disabled:cursor-not-allowed text-[#1C1C1C] font-bold text-sm uppercase tracking-wider py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#1C1C1C]/30 border-t-[#1C1C1C] rounded-full animate-spin" />
                  <span>Verificando...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Entrar no Painel</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-gray-600 text-xs text-center mb-3">Credenciais de acesso:</p>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between bg-[#1C1C1C] rounded-lg px-3 py-2">
                <span className="text-gray-500">admin@citrinosemijoias.com.br</span>
                <span className="text-[#C9A84C]">citrino@2024</span>
              </div>
              <div className="flex justify-between bg-[#1C1C1C] rounded-lg px-3 py-2">
                <span className="text-gray-500">financeiro@citrinosemijoias.com.br</span>
                <span className="text-[#C9A84C]">fin@2024</span>
              </div>
              <div className="flex justify-between bg-[#1C1C1C] rounded-lg px-3 py-2">
                <span className="text-gray-500">operador@citrinosemijoias.com.br</span>
                <span className="text-[#C9A84C]">op@2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={onBackToStore}
            className="text-gray-600 hover:text-gray-400 text-sm transition"
          >
            ← Voltar para a loja
          </button>
        </div>
      </div>
    </div>
  );
};
