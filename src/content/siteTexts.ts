// Textos e fotos da loja que a Mariah pode editar em "Conteúdo do Site".
// Os valores `default` são exatamente os que já estavam escritos nas páginas, então a loja
// continua igual até alguém mudar alguma coisa. Em textos, **assim** vira negrito.

export type FieldKind = 'text' | 'longtext' | 'image' | 'toggle';

export interface SiteField {
  key: string;
  page: string;
  group: string;
  label: string;
  kind: FieldKind;
  default: string;
  hint?: string;
}

const t = (page: string, group: string, key: string, label: string, def: string, kind: FieldKind = 'text', hint?: string): SiteField =>
  ({ key, page, group, label, kind, default: def, hint });

export const PAGES = ['Início', 'Sobre / Contato', 'Topo e Rodapé'] as const;

export const SITE_FIELDS: SiteField[] = [
  // ---------------- INÍCIO ----------------
  t('Início', 'Banner principal', 'home.hero.secondaryCta', 'Botão secundário', 'Nossa Garantia 1 Ano'),

  t('Início', 'Categorias', 'home.categories.eyebrow', 'Chamada pequena', 'Navegue por Categoria'),
  t('Início', 'Categorias', 'home.categories.title', 'Título', 'Joias Feitas Para Encantar'),

  t('Início', 'Destaques', 'home.featured.eyebrow', 'Chamada pequena', 'Coleção Especial'),
  t('Início', 'Destaques', 'home.featured.title', 'Título', 'Destaques da Joalheria'),
  t('Início', 'Destaques', 'home.featured.link', 'Link "ver todas"', 'Ver Todas as Peças'),

  t('Início', 'Manifesto da marca', 'home.manifesto.eyebrow', 'Chamada pequena', 'Manifesto da Marca'),
  t('Início', 'Manifesto da marca', 'home.manifesto.title', 'Título', 'O Ouro Que Te Acompanha Em Cada Conquista'),
  t(
    'Início', 'Manifesto da marca', 'home.manifesto.body', 'Texto',
    'Cada semijoia Citrino passa por um rigoroso processo de galvanoplastia em Limeira, polo joalheiro de excelência nacional. Aplicamos 10 milésimos de ouro 18k e selamento em nanotecnologia Diamond, garantindo que o brilho permaneça intacto por anos.',
    'longtext'
  ),
  t('Início', 'Manifesto da marca', 'home.manifesto.feature1', 'Diferencial 1', '100% Níquel Free'),
  t('Início', 'Manifesto da marca', 'home.manifesto.feature2', 'Diferencial 2', 'Cravação Joalheira'),
  t('Início', 'Manifesto da marca', 'home.manifesto.feature3', 'Diferencial 3', 'Verniz Antialérgico'),
  t('Início', 'Manifesto da marca', 'home.manifesto.feature4', 'Diferencial 4', 'Troca sem Custo'),
  t('Início', 'Manifesto da marca', 'home.manifesto.cta', 'Texto do botão', 'Quero Revender Citrino (B2B)'),
  t('Início', 'Manifesto da marca', 'home.brandcard.eyebrow', 'Cartão da marca: chamada', 'Identidade Visual Exclusiva'),
  t('Início', 'Manifesto da marca', 'home.brandcard.title', 'Cartão da marca: título', 'A Arte do Citrino Nobre'),
  t(
    'Início', 'Manifesto da marca', 'home.brandcard.text', 'Cartão da marca: texto',
    'Monograma dourado com esmaltação verde sálvia e pedra citrino lapidada em alta joalheria.',
    'longtext'
  ),
  t(
    'Início', 'Manifesto da marca', 'home.manifesto.image', 'Foto ao lado do cartão',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=800&auto=format&fit=crop',
    'image', 'Hoje é uma foto de banco de imagens. Troque por uma foto de vocês.'
  ),

  t('Início', 'Mais vendidas', 'home.best.eyebrow', 'Chamada pequena', 'As Mais Desejadas'),
  t('Início', 'Mais vendidas', 'home.best.title', 'Título', 'Favoritas das Nossas Clientes'),

  t(
    'Início', 'Depoimentos', 'home.testimonials.visible', 'Mostrar a seção de depoimentos', 'sim', 'toggle',
    'Os três depoimentos abaixo são exemplos. Só deixe visível com depoimentos de clientes reais, ou desligue a seção.'
  ),
  t('Início', 'Depoimentos', 'home.testimonials.eyebrow', 'Chamada pequena', 'Depoimentos Reais'),
  t('Início', 'Depoimentos', 'home.testimonials.title', 'Título', 'O Que Dizem Nossas Clientes'),
  t('Início', 'Depoimentos', 'home.testimonial1.text', 'Depoimento 1: texto', 'A Choker Riviera superou todas as minhas expectativas! O fecho é idêntico ao de uma joia maciça e o brilho das zircônias é surreal. Uso há 6 meses e continua como no dia que chegou.', 'longtext'),
  t('Início', 'Depoimentos', 'home.testimonial1.name', 'Depoimento 1: nome', 'Beatriz Alcantara'),
  t('Início', 'Depoimentos', 'home.testimonial1.place', 'Depoimento 1: cidade e tipo', 'São Paulo - SP • Compra Verificada'),
  t('Início', 'Depoimentos', 'home.testimonial2.text', 'Depoimento 2: texto', 'Sou revendedora há 2 anos e as semijoias da Citrino são as que mais vendem no meu showroom. A caixinha de veludo, a garantia de 1 ano e o acabamento impecável dão muita credibilidade.', 'longtext'),
  t('Início', 'Depoimentos', 'home.testimonial2.name', 'Depoimento 2: nome', 'Carla Menezes'),
  t('Início', 'Depoimentos', 'home.testimonial2.place', 'Depoimento 2: cidade e tipo', 'Belo Horizonte - MG • Revendedora B2B'),
  t('Início', 'Depoimentos', 'home.testimonial3.text', 'Depoimento 3: texto', 'Tenho muita alergia a níquel e nunca conseguia usar brincos por muito tempo. Os da Citrino foram os primeiros que não me causaram irritação alguma. Estou apaixonada!', 'longtext'),
  t('Início', 'Depoimentos', 'home.testimonial3.name', 'Depoimento 3: nome', 'Fernanda Guimarães'),
  t('Início', 'Depoimentos', 'home.testimonial3.place', 'Depoimento 3: cidade e tipo', 'Curitiba - PR • Compra Verificada'),

  // ---------------- SOBRE / CONTATO ----------------
  t('Sobre / Contato', 'Nossa história', 'about.hero.eyebrow', 'Chamada pequena', 'Sobre a Citrino Semijoias'),
  t('Sobre / Contato', 'Nossa história', 'about.hero.title', 'Título', 'Nascida da Paixão pelo Ouro e pela Joalheria Fina'),
  t(
    'Sobre / Contato', 'Nossa história', 'about.hero.p1', 'Parágrafo 1',
    'A **Citrino Semijoias** nasceu com o propósito de democratizar o luxo e a sofisticação da alta joalheria. Inspirada no brilho solar do citrino — pedra que simboliza prosperidade, energia e elegância atemporal —, nossa marca desenvolve coleções contemporâneas com padrão joalheiro de acabamento.',
    'longtext'
  ),
  t(
    'Sobre / Contato', 'Nossa história', 'about.hero.p2', 'Parágrafo 2',
    'Produzidas no renomado polo de Limeira (São Paulo), nossas peças recebem até 10 milésimos de ouro 18k, camada de ródio nobre e selamento com verniz nanotecnológico Diamond. O resultado são semijoias com o mesmo peso visual, brilho e textura do ouro maciço, 100% livres de níquel e hipoalergênicas.',
    'longtext'
  ),
  t('Sobre / Contato', 'Nossa história', 'about.hero.cta1', 'Botão 1', 'Conhecer Nossas Joias'),
  t('Sobre / Contato', 'Nossa história', 'about.hero.cta2', 'Botão 2 (abre o WhatsApp)', 'Falar no WhatsApp'),
  t('Sobre / Contato', 'Nossa história', 'about.brandcard.tag', 'Cartão da marca: etiqueta', 'Marca Registrada', 'text', 'Só mantenha "Marca Registrada" se a marca estiver registrada no INPI.'),
  t('Sobre / Contato', 'Nossa história', 'about.brandcard.name', 'Cartão da marca: nome', 'Citrino Semijoias Finas'),
  t(
    'Sobre / Contato', 'Nossa história', 'about.hero.image', 'Foto ao lado do cartão',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    'image', 'Hoje é uma foto de banco de imagens. Troque por uma foto de vocês.'
  ),

  t('Sobre / Contato', 'Padrão Citrino', 'about.pillars.eyebrow', 'Chamada pequena', 'O Padrão Citrino'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillars.title', 'Título', '4 Pilares de Excelência'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar1.title', 'Pilar 1: título', 'Banho 10 Milésimos'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar1.text', 'Pilar 1: texto', 'Ouro 18k legítimo aplicado em múltiplas camadas térmicas para resistência real ao uso cotidiano.', 'longtext'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar2.title', 'Pilar 2: título', '100% Antialérgico'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar2.text', 'Pilar 2: texto', 'Processo produtivo sem adição de níquel ou cádmio, testado para peles extremamente sensíveis.', 'longtext'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar3.title', 'Pilar 3: título', 'Pedrarias 5A'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar3.text', 'Pilar 3: texto', 'Zircônias cúbicas em lapidação brilhante e pedras fusion com transparência e refração de diamante.', 'longtext'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar4.title', 'Pilar 4: título', 'Garantia 1 Ano'),
  t('Sobre / Contato', 'Padrão Citrino', 'about.pillar4.text', 'Pilar 4: texto', 'Certificado oficial assinado com cobertura total sobre o banho de ouro e assistência ágil.', 'longtext'),

  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq.eyebrow', 'Chamada pequena', 'Dúvidas Frequentes'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq.title', 'Título', 'Perguntas & Respostas'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq1.q', 'Pergunta 1', 'As semijoias da Citrino escurecem com o tempo?'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq1.a', 'Resposta 1', 'Nossas semijoias contam com 10 milésimos de ouro 18k e banho protetor Diamond, o que impede a oxidação prematura. Seguindo as recomendações simples de cuidados (evitar perfumes diretos e produtos químicos), suas peças mantêm o brilho original por anos.', 'longtext'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq2.q', 'Pergunta 2', 'Qual é o prazo de envio e de entrega?'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq2.a', 'Resposta 2', 'Após a aprovação do pagamento, seu pedido é cuidadosamente embalado no nosso estojo de veludo e postado em até 24 horas úteis. O prazo dos Correios varia de 2 a 5 dias úteis para a maior parte do Brasil.', 'longtext'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq3.q', 'Pergunta 3', 'Como funciona a garantia de 1 ano?'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq3.a', 'Resposta 3', 'Todas as peças acompanham um certificado nominal. Caso ocorra desprendimento do banho ou defeito de fabricação no período de 12 meses, você tem direito ao rebanho gratuito ou substituição da semijoia.', 'longtext'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq4.q', 'Pergunta 4', 'Posso comprar no atacado para revenda?'),
  t('Sobre / Contato', 'Perguntas frequentes', 'about.faq4.a', 'Resposta 4', 'Sim! Temos condições exclusivas para revendedoras com descontos de até 35%, faturamento facilitado para CNPJ e kit completo de mostruário e embalagens.', 'longtext'),

  t('Sobre / Contato', 'Fale conosco', 'about.contact.eyebrow', 'Chamada pequena', 'Fale Conosco'),
  t('Sobre / Contato', 'Fale conosco', 'about.contact.title', 'Título', 'Atendimento Exclusivo'),
  t('Sobre / Contato', 'Fale conosco', 'about.contact.intro', 'Texto', 'Nossa equipe de consultoras está pronta para te atender de segunda a sexta, das 09h às 18h.', 'longtext'),

  // ---------------- TOPO E RODAPÉ ----------------
  t('Topo e Rodapé', 'Barra do topo', 'navbar.promo1', 'Aviso 1', 'Frete Grátis acima de R$ 299'),
  t('Topo e Rodapé', 'Barra do topo', 'navbar.promo2', 'Aviso 2', '10x Sem Juros no Cartão'),
  t('Topo e Rodapé', 'Barra do topo', 'navbar.promo3', 'Aviso 3', '1 Ano de Garantia no Banho'),
  t('Topo e Rodapé', 'Barra do topo', 'navbar.promo4', 'Aviso 4 (à direita)', 'Semijoias Finas Banhadas a Ouro 18k'),

  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip1.title', 'Item 1: título', 'Banho Nobre 10 Milésimos'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip1.text', 'Item 1: texto', 'Tripla camada de ouro 18k e verniz Diamond para brilho espelhado e durabilidade máxima.', 'longtext'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip2.title', 'Item 2: título', '1 Ano de Garantia'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip2.text', 'Item 2: texto', 'Certificado oficial acompanha todas as peças com garantia no banho e cravação.', 'longtext'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip3.title', 'Item 3: título', 'Envio Seguro para o Brasil'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip3.text', 'Item 3: texto', 'Frete grátis para compras acima de R$ 299 com seguro postal incluso e rastreamento.', 'longtext'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip4.title', 'Item 4: título', 'Primeira Troca Grátis'),
  t('Topo e Rodapé', 'Faixa de garantias do rodapé', 'footer.strip4.text', 'Item 4: texto', 'Até 7 dias após o recebimento para troca fácil ou devolução sem complicações.', 'longtext'),
  t(
    'Topo e Rodapé', 'Rodapé', 'footer.about', 'Texto da marca',
    'Criamos semijoias atemporais inspiradas na alta joalheria mundial. Cada detalhe é concebido para exaltar a elegância feminina com qualidade premium e acabamento artesanal em Limeira/SP.',
    'longtext'
  ),
  t('Topo e Rodapé', 'Botão do WhatsApp', 'whatsapp.tooltip', 'Texto do balãozinho', 'Dúvidas? Fale com a Consultora'),
];

export const TEXT_DEFAULTS: Record<string, string> = Object.fromEntries(
  SITE_FIELDS.map((f) => [f.key, f.default])
);
