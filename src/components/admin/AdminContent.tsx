import React, { useMemo, useState } from 'react';
import { Save, Loader2, RotateCcw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useRemote, saveContentDoc, saveCategoryDoc } from '../../services/remote';
import { PAGES, SITE_FIELDS, TEXT_DEFAULTS, SiteField } from '../../content/siteTexts';
import { ImageUploader } from './ImageUploader';
import { Category } from '../../types';

type Tab = (typeof PAGES)[number] | 'Categorias';

const inputCls =
  'w-full bg-[#F4F5F7] border border-gray-200 rounded-lg p-2.5 text-xs focus:border-[#E97527] focus:outline-none';

export const AdminContent: React.FC = () => {
  const remote = useRemote();
  const [tab, setTab] = useState<Tab>('Início');

  // Rascunho: o que está salvo por cima do texto original de cada campo.
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    SITE_FIELDS.forEach((f) => {
      const saved = remote.texts[f.key];
      d[f.key] = typeof saved === 'string' && saved.trim() !== '' ? saved : f.default;
    });
    return d;
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = useMemo(
    () =>
      SITE_FIELDS.some((f) => {
        const saved = remote.texts[f.key];
        const current = typeof saved === 'string' && saved.trim() !== '' ? saved : f.default;
        return draft[f.key] !== current;
      }),
    [draft, remote.texts]
  );

  const setField = (key: string, value: string) => {
    setOk(false);
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const save = async () => {
    setError(null);
    setOk(false);
    setSaving(true);
    try {
      // Só grava o que difere do texto original; o resto continua vindo da própria página.
      const overrides: Record<string, string> = {};
      SITE_FIELDS.forEach((f) => {
        const v = (draft[f.key] ?? '').trim();
        if (v !== '' && v !== f.default) overrides[f.key] = draft[f.key];
      });
      const res = await saveContentDoc('texts', overrides);
      if (res.ok === true) {
        setOk(true);
        setTimeout(() => setOk(false), 4000);
      } else {
        setError((res as { error: string }).error);
      }
    } catch (e: any) {
      setError(e?.message || 'Não foi possível salvar agora.');
    } finally {
      setSaving(false);
    }
  };

  const fields = SITE_FIELDS.filter((f) => f.page === tab);
  const groups = Array.from(new Set(fields.map((f) => f.group)));

  const renderField = (f: SiteField) => {
    const value = draft[f.key] ?? f.default;
    const changed = value !== f.default;
    return (
      <div key={f.key} className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <label className="font-semibold text-gray-700 text-xs">{f.label}</label>
          {changed && (
            <button
              type="button"
              onClick={() => setField(f.key, f.default)}
              className="text-[10px] text-gray-500 hover:text-[#E97527] flex items-center gap-1"
              title="Voltar ao texto original"
            >
              <RotateCcw className="w-3 h-3" /> Restaurar original
            </button>
          )}
        </div>

        {f.kind === 'text' && (
          <input type="text" value={value} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
        )}
        {f.kind === 'longtext' && (
          <textarea rows={3} value={value} onChange={(e) => setField(f.key, e.target.value)} className={inputCls} />
        )}
        {f.kind === 'toggle' && (
          <label className="flex items-center gap-2 bg-[#F4F5F7] border border-gray-200 rounded-lg px-3 py-2.5 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={value !== 'não'}
              onChange={(e) => setField(f.key, e.target.checked ? 'sim' : 'não')}
              className="accent-[#E97527] w-4 h-4"
            />
            <span className="text-xs font-semibold text-gray-700">{value !== 'não' ? 'Visível na loja' : 'Escondida da loja'}</span>
          </label>
        )}
        {f.kind === 'image' && (
          <ImageUploader
            value={value ? [value] : []}
            onChange={(urls) => setField(f.key, urls[0] || f.default)}
            folder="site"
            max={1}
            maxSide={1600}
          />
        )}
        {f.hint && <p className="text-[10px] text-amber-700">{f.hint}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Conteúdo do Site</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Edite os textos e as fotos das páginas da loja. Depois de salvar, já aparece para os clientes.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-[#E97527] hover:underline flex items-center gap-1"
        >
          Ver a loja <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap border-b border-gray-200 gap-4 text-xs font-semibold">
        {([...PAGES, 'Categorias'] as Tab[]).map((name) => (
          <button
            key={name}
            onClick={() => setTab(name)}
            className={`pb-3 border-b-2 uppercase tracking-wider transition ${
              tab === name
                ? 'border-[#E97527] text-[#E97527] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {tab === 'Categorias' ? (
        <CategoriesTab categories={remote.categories} />
      ) : (
        <>
          <div className="space-y-6 max-w-3xl">
            {groups.map((group) => (
              <div key={group} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{group}</h3>
                {fields.filter((f) => f.group === group).map(renderField)}
              </div>
            ))}
          </div>

          <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-[#F4F5F7]/95 backdrop-blur border-t sm:border border-gray-200 sm:rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 max-w-3xl">
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="bg-[#E97527] hover:bg-[#D5651B] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg transition flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
            {dirty && !saving && <span className="text-[11px] text-amber-700 font-semibold">Há alterações não salvas</span>}
            {ok && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Salvo! Já está na loja.
              </span>
            )}
            {error && (
              <span className="text-[11px] text-red-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {error}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

/** Foto de cada categoria da Home (o nome fica fixo porque os produtos usam esse nome). */
const CategoriesTab: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.image || '']))
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveOne = async (c: Category) => {
    setError(null);
    setBusy(c.id);
    try {
      const res = await saveCategoryDoc({ ...c, image: images[c.id] });
      if (res.ok === true) {
        setSaved(c.id);
        setTimeout(() => setSaved(null), 3000);
      } else {
        setError((res as { error: string }).error);
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <p className="text-xs text-gray-500">
        Foto quadrada que aparece em cada categoria na página inicial. O nome da categoria é usado nos cadastros de
        produto, por isso não é editável aqui.
      </p>
      {error && (
        <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {categories.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3 shadow-xs">
          <h3 className="text-sm font-bold text-gray-900">{c.name}</h3>
          <ImageUploader
            value={images[c.id] ? [images[c.id]] : []}
            onChange={(urls) => setImages((m) => ({ ...m, [c.id]: urls[0] || '' }))}
            folder="categorias"
            max={1}
            maxSide={1000}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => saveOne(c)}
              disabled={busy === c.id || images[c.id] === (c.image || '') || !images[c.id]}
              className="bg-[#E97527] hover:bg-[#D5651B] disabled:opacity-50 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {busy === c.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Salvar foto
            </button>
            {saved === c.id && (
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Salvo!
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
