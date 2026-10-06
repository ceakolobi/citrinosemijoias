// Gera o certificado de garantia em uma janela própria, pronta para imprimir ou "Salvar como PDF".
// Todo texto vindo do banco é escapado antes de entrar no HTML (proteção contra XSS).
import QRCode from 'qrcode';
import { certificateUrl, formatBRL, formatDateBR } from './checkout';

export interface CertificateData {
  code: string;
  customerName: string;
  items: { name: string; variation?: string | null; quantity?: number; image?: string | null; unit_cents?: number | null }[];
  warranty: string;
  purchaseDate: string; // AAAA-MM-DD
  validUntil: string; // AAAA-MM-DD
  orderRef?: string | null;
  revoked?: boolean;
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

// Só aceita foto https, caminho do próprio site ou imagem embutida; qualquer outra coisa (ex.: javascript:) é descartada.
const safeImg = (u: unknown) => {
  const v = String(u ?? '').trim();
  return /^(https:\/\/|\/[^/]|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(v) && v.length < 600000 ? v : '';
};

export async function buildCertificateHtml(c: CertificateData): Promise<string> {
  const verifyUrl = certificateUrl(c.code);
  const qr = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 220, color: { dark: '#1C1C1C', light: '#FFFFFF' } });
  const money = (cents: unknown) => (typeof cents === 'number' && cents > 0 ? formatBRL(cents / 100) : '');
  const items = c.items
    .map((it) => {
      const img = safeImg(it.image);
      const qty = it.quantity && it.quantity > 1 ? it.quantity : 1;
      const unit = money(it.unit_cents);
      const line = unit ? (qty > 1 ? `${qty} × ${unit} = ${money((it.unit_cents as number) * qty)}` : unit) : '';
      return `<div class="it">${img ? `<img class="ph" src="${esc(img)}" alt="${esc(it.name)}">` : '<div class="ph none"></div>'}` +
        `<div class="tx"><div class="nm">${qty > 1 ? `${esc(qty)}× ` : ''}${esc(it.name)}${it.variation ? ` <span class="var">(${esc(it.variation)})</span>` : ''}</div>` +
        `${line ? `<div class="pr">${esc(line)}</div>` : ''}</div></div>`;
    })
    .join('');
  const total = c.items.reduce((sum, it) => sum + (typeof it.unit_cents === 'number' ? it.unit_cents * (it.quantity || 1) : 0), 0);
  const totalHtml = total > 0 && c.items.length > 1 ? `<div class="tot">Total das peças: <strong>${esc(formatBRL(total / 100))}</strong></div>` : '';
  const months = c.warranty === '1 ano' ? '12 meses (Garantia Estendida)' : '6 meses (Garantia Oficial)';

  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Certificado de Garantia ${esc(c.code)} - Citrino Semijoias</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #1C1C1C; background: #f3efe6; }
  .sheet { max-width: 1000px; margin: 24px auto; background: #FAF8F4; padding: 14px; }
  .frame { border: 2px solid #C9A84C; outline: 1px solid #C9A84C; outline-offset: -8px; padding: 36px 44px; position: relative; }
  .brand { text-align: center; }
  .brand img { width: 74px; height: 74px; object-fit: contain; border-radius: 10px; }
  .brand h1 { margin: 8px 0 0; letter-spacing: 4px; font-size: 26px; color: #C9A84C; }
  .brand p { margin: 4px 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #777; }
  h2 { text-align: center; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; margin: 22px 0 18px; }
  .grid { display: grid; grid-template-columns: 1fr 210px; gap: 28px; align-items: start; }
  .row { display: flex; gap: 10px; border-bottom: 1px dotted #d5cfbf; padding: 7px 0; font-size: 14px; }
  .row b { min-width: 170px; color: #666; font-weight: normal; }
  .var { color: #777; } .items { flex: 1; }
  .it { display: flex; gap: 12px; align-items: center; margin: 4px 0 8px; }
  .ph { width: 72px; height: 72px; object-fit: cover; border-radius: 8px; border: 1px solid #e8e4dc; background: #fff; flex: none; }
  .ph.none { background: #efe9da; }
  .nm { font-size: 14px; } .pr { font-size: 13px; color: #8a6d1d; font-weight: bold; margin-top: 2px; font-family: Arial, sans-serif; }
  .tot { margin-top: 4px; font-size: 13px; text-align: right; font-family: Arial, sans-serif; }
  .qr { text-align: center; font-family: Arial, sans-serif; font-size: 10px; color: #666; }
  .qr img { width: 180px; height: 180px; border: 1px solid #e8e4dc; background: #fff; padding: 4px; }
  .code { font-family: 'Courier New', monospace; font-size: 15px; letter-spacing: 1px; color: #1C1C1C; margin-top: 6px; font-weight: bold; }
  .terms { margin-top: 22px; font-size: 11px; line-height: 1.5; color: #555; font-family: Arial, sans-serif; }
  .sign { margin-top: 26px; display: flex; justify-content: space-between; align-items: end; font-size: 12px; color: #666; font-family: Arial, sans-serif; }
  .sign .line { border-top: 1px solid #999; padding-top: 4px; width: 260px; text-align: center; }
  .void { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 90px; color: rgba(200,0,0,.18); transform: rotate(-18deg); font-family: Arial, sans-serif; font-weight: bold; pointer-events: none; }
  .actions { text-align: center; margin: 16px; font-family: Arial, sans-serif; }
  .actions button { background: #1C1C1C; color: #fff; border: 0; padding: 12px 22px; border-radius: 8px; font-weight: bold; cursor: pointer; letter-spacing: 1px; }
  @media print { body { background: #fff; } .sheet { margin: 0; max-width: none; } .actions { display: none; } }
  @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } .frame { padding: 22px 18px; } .row { flex-direction: column; gap: 2px; } }
</style></head><body>
<div class="actions"><button onclick="window.print()">IMPRIMIR / SALVAR EM PDF</button></div>
<div class="sheet"><div class="frame">
  ${c.revoked ? '<div class="void">CANCELADO</div>' : ''}
  <div class="brand">
    <img src="${esc(window.location.origin)}/citrino-logo.jpg" alt="Citrino Semijoias">
    <h1>CITRINO SEMIJOIAS</h1>
    <p>Joalheria contemporânea</p>
  </div>
  <h2>Certificado Oficial de Garantia &amp; Autenticidade</h2>
  <div class="grid">
    <div>
      <div class="row"><b>Cliente</b><span>${esc(c.customerName)}</span></div>
      <div class="row"><b>Peça(s)</b><div class="items">${items}${totalHtml}</div></div>
      <div class="row"><b>Data da compra</b><span>${esc(formatDateBR(c.purchaseDate))}</span></div>
      <div class="row"><b>Garantia</b><span>${esc(months)}</span></div>
      <div class="row"><b>Válida até</b><span><strong>${esc(formatDateBR(c.validUntil))}</strong></span></div>
      ${c.orderRef ? `<div class="row"><b>Pedido</b><span>${esc(c.orderRef)}</span></div>` : ''}
    </div>
    <div class="qr">
      <img src="${qr}" alt="QR code de verificação">
      <div>Aponte a câmera para verificar a autenticidade</div>
      <div class="code">${esc(c.code)}</div>
    </div>
  </div>
  <div class="terms">
    A garantia cobre defeitos de fabricação e desgaste prematuro do banho dentro do prazo acima, mediante apresentação deste certificado.
    Não se aplica a peças raspadas em superfícies ásperas, amassadas, arrebentadas por tração, expostas a produtos químicos abrasivos
    (perfume, cloro, álcool, produtos de limpeza) ou com perda de pedras por impacto.
    Para acionar, fale com a Citrino informando o código do certificado.
  </div>
  <div class="sign">
    <span>Verificação: ${esc(verifyUrl)}</span>
    <span class="line">Citrino Semijoias</span>
  </div>
</div></div>
</body></html>`;
}

/** Abre o certificado numa aba nova. A aba é aberta já no clique para não ser bloqueada. */
export async function openCertificate(c: CertificateData) {
  const w = window.open('', '_blank');
  if (!w) {
    alert('O navegador bloqueou a janela do certificado. Permita pop-ups para este site e tente de novo.');
    return;
  }
  w.document.write('<p style="font-family:Arial;padding:24px">Gerando certificado...</p>');
  try {
    const html = await buildCertificateHtml(c);
    w.document.open();
    w.document.write(html);
    w.document.close();
  } catch {
    w.document.body.innerHTML = '<p style="font-family:Arial;padding:24px">Não foi possível gerar o certificado.</p>';
  }
}
