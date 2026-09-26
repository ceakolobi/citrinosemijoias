import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, X, Star, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { uploadImage } from '../../services/remote';

interface ImageUploaderProps {
  /** URLs atuais. A primeira é a foto principal. */
  value: string[];
  onChange: (urls: string[]) => void;
  folder: 'produtos' | 'banners' | 'categorias' | 'site';
  /** Quantas fotos no máximo (1 = campo de foto única). */
  max?: number;
  /** Maior lado da imagem depois de reduzida, em pixels. */
  maxSide?: number;
  /** Aceita Ctrl+V em qualquer lugar da tela enquanto o campo estiver aberto. */
  globalPaste?: boolean;
  label?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

function loadBitmap(file: Blob): Promise<{ width: number; height: number; draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void; close: () => void }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
        close: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não consegui abrir esta imagem. Use uma foto JPG, PNG ou WEBP.'));
    };
    img.src = url;
  });
}

/** Reduz e comprime a foto no próprio navegador (fotos de celular têm 5–12 MB). */
async function prepareImage(file: File, maxSide: number): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Este arquivo não é uma imagem.');
  if (file.type === 'image/gif') {
    if (file.size > MAX_BYTES) throw new Error('O GIF passa de 5 MB.');
    return file;
  }
  const bmp = await loadBitmap(file);
  try {
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    let w = Math.max(1, Math.round(bmp.width * scale));
    let h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement('canvas');
    const toBlob = (q: number) =>
      new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/jpeg', q));

    for (const quality of [0.86, 0.75, 0.62]) {
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Seu navegador não conseguiu preparar a imagem.');
      ctx.fillStyle = '#ffffff'; // PNG transparente vira fundo branco
      ctx.fillRect(0, 0, w, h);
      bmp.draw(ctx, w, h);
      const blob = await toBlob(quality);
      if (blob && blob.size <= MAX_BYTES) return blob;
      w = Math.round(w * 0.8);
      h = Math.round(h * 0.8);
    }
    throw new Error('A imagem continua grande demais mesmo reduzida. Tente outra foto.');
  } finally {
    bmp.close();
  }
}

interface Pending {
  key: string;
  name: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder,
  max = 8,
  maxSide = 1600,
  globalPaste = false,
  label,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [linkText, setLinkText] = useState('');

  // Sempre a lista mais recente, mesmo com várias fotos subindo em sequência.
  const valueRef = useRef(value);
  valueRef.current = value;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const single = max === 1;

  const addUrls = useCallback(
    (urls: string[]) => {
      const merged = single ? urls.slice(-1) : [...valueRef.current, ...urls].slice(0, max);
      valueRef.current = merged;
      onChangeRef.current(merged);
    },
    [max, single]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith('image/'));
      if (!images.length) {
        setError('Escolha arquivos de imagem (JPG, PNG ou WEBP).');
        return;
      }
      const room = single ? 1 : Math.max(0, max - valueRef.current.length);
      if (room === 0) {
        setError(`Limite de ${max} fotos. Remova alguma para adicionar outra.`);
        return;
      }
      setError(null);
      for (const file of images.slice(0, room)) {
        const key = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        setPending((p) => [...p, { key, name: file.name || 'imagem' }]);
        try {
          const blob = await prepareImage(file, maxSide);
          const res = await uploadImage(blob, folder);
          if (res.ok === true) {
            addUrls([res.url]);
          } else {
            setError((res as { error: string }).error);
          }
        } catch (e: any) {
          setError(e?.message || 'Não foi possível enviar a foto.');
        } finally {
          setPending((p) => p.filter((x) => x.key !== key));
        }
      }
    },
    [addUrls, folder, max, maxSide, single]
  );

  const filesFromClipboard = (e: ClipboardEvent | React.ClipboardEvent): File[] => {
    const items = e.clipboardData?.items;
    const out: File[] = [];
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        if (it.kind === 'file' && it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) out.push(f);
        }
      }
    }
    return out;
  };

  useEffect(() => {
    if (!globalPaste) return;
    const onPaste = (e: ClipboardEvent) => {
      const files = filesFromClipboard(e);
      if (files.length) {
        e.preventDefault();
        handleFiles(files);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [globalPaste, handleFiles]);

  const addLink = () => {
    const url = linkText.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) {
      setError('Cole um link que comece com http:// ou https://');
      return;
    }
    setError(null);
    addUrls([url]);
    setLinkText('');
  };

  const makeMain = (idx: number) => {
    const next = [...value];
    const [moved] = next.splice(idx, 1);
    next.unshift(moved);
    onChange(next);
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  const busy = pending.length > 0;

  return (
    <div className="space-y-2">
      {label && <label className="text-[11px] font-semibold text-gray-600 block">{label}</label>}

      {(value.length > 0 || busy) && (
        <div className={`grid gap-2 ${single ? 'grid-cols-1' : 'grid-cols-3 sm:grid-cols-4'}`}>
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={`relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 ${single ? 'aspect-[16/7]' : 'aspect-square'}`}
            >
              <img
                src={url}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.25';
                }}
              />
              {!single && idx === 0 && (
                <span className="absolute top-1 left-1 bg-[#E97527] text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              {!single && idx > 0 && (
                <button
                  type="button"
                  onClick={() => makeMain(idx)}
                  title="Tornar principal"
                  className="absolute bottom-1 left-1 bg-white/95 hover:bg-white text-[#1C1C1C] text-[9px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 shadow"
                >
                  <Star className="w-3 h-3" /> Principal
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(idx)}
                title="Remover foto"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {pending.map((p) => (
            <div
              key={p.key}
              className={`rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-[10px] text-gray-500 gap-1 ${single ? 'aspect-[16/7]' : 'aspect-square'}`}
            >
              <Loader2 className="w-4 h-4 animate-spin text-[#E97527]" />
              Enviando...
            </div>
          ))}
        </div>
      )}

      {(single ? value.length === 0 && !busy : value.length < max) && (
        <div
          ref={zoneRef}
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onPaste={(e) => {
            const files = filesFromClipboard(e);
            if (files.length) {
              e.preventDefault();
              e.stopPropagation();
              handleFiles(files);
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(Array.from(e.dataTransfer.files || []));
          }}
          className={`cursor-pointer rounded-lg border-2 border-dashed px-3 py-4 text-center transition focus:outline-none focus:border-[#E97527] ${
            dragOver ? 'border-[#E97527] bg-orange-50' : 'border-gray-300 bg-[#F8F9FA] hover:border-[#E97527]'
          }`}
        >
          <ImagePlus className="w-6 h-6 mx-auto text-[#E97527]" />
          <p className="text-xs font-semibold text-[#1C1C1C] mt-1">
            Toque para escolher {single ? 'a foto' : 'as fotos'} ou arraste até aqui
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            No computador, também dá para copiar uma imagem e colar aqui com Ctrl+V
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          if (files.length) handleFiles(files);
        }}
      />

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="url"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="ou cole o link de uma imagem da internet"
            className="w-full bg-white border border-gray-200 rounded-lg text-[11px] py-2 pl-8 pr-2 focus:outline-none focus:border-[#E97527]"
          />
        </div>
        <button
          type="button"
          onClick={addLink}
          className="text-[11px] font-semibold border border-gray-200 hover:border-[#E97527] hover:text-[#E97527] rounded-lg px-3 py-2 transition"
        >
          Usar link
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
