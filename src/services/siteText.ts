import React, { useCallback } from 'react';
import { useRemote } from './remote';
import { TEXT_DEFAULTS } from '../content/siteTexts';

/** Devolve t(chave): o texto editado pela Mariah, ou o texto original da página. */
export function useSiteText() {
  const { texts } = useRemote();
  return useCallback(
    (key: string): string => {
      const v = texts[key];
      return typeof v === 'string' && v.trim() !== '' ? v : TEXT_DEFAULTS[key] ?? '';
    },
    [texts]
  );
}

/** Texto com **negrito**. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return React.createElement(
    React.Fragment,
    null,
    ...parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? React.createElement('strong', { key: i }, part.slice(2, -2))
        : React.createElement(React.Fragment, { key: i }, part)
    )
  );
}
