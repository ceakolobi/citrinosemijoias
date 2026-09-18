# ✨ Citrino Semijoias — E-commerce & Sistema de Gestão Joalheira (ERP Citrino)

<p align="center">
  <img src="public/citrino-logo.jpg" alt="Citrino Semijoias" width="180" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />
</p>

<p align="center">
  <strong>Plataforma Completa de E-commerce de Luxo & ERP Integrado para Indústria e Comércio de Semijoias Finas</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Mercado_Pago-Brasil-009EE3?style=for-the-badge&logo=mercadopago&logoColor=white" alt="Mercado Pago" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Arquitetura & Stack Tecnológica](#-arquitetura--stack-tecnológica)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Funcionalidades Principais](#-funcionalidades-principais)
  - [1. Loja Virtual (E-commerce B2C)](#1-loja-virtual-e-commerce-b2c)
  - [2. Certificado Oficial de Garantia](#2-certificado-oficial-de-garantia)
  - [3. Portal B2B & Programa de Revenda](#3-portal-b2b--programa-de-revenda)
  - [4. Painel Administrativo & ERP Joalheiro](#4-painel-administrativo--erp-joalheiro)
- [Integração de Pagamentos (Mercado Pago)](#-integração-de-pagamentos-mercado-pago)
- [Instalação & Execução Local](#-instalação--execução-local)
- [Configuração do Banco de Dados (Supabase / PostgreSQL)](#-configuração-do-banco-de-dados-supabase--postgresql)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Deploy em Produção](#-deploy-em-produção)
- [Licença & Contato](#-licença--contato)

---

## 💎 Visão Geral

O **Citrino Semijoias** é uma solução full-stack desenvolvida sob medida para marcas de semijoias finas, joalherias folheadas e atacadistas de Limeira-SP e todo o Brasil. 

A plataforma reúne em uma única base de código:
1. **Loja Virtual B2C de Alto Padrão**: Com estética editorial luxuosa, paleta dourada (`#C9A84C`), off-white e grafite escuro, tipografia refinada, alta performance e checkout transparente.
2. **Canal Atacadista B2B para Consultoras/Revendedoras**: Com desconto automático de atacado, kits de mostruário e condições especiais.
3. **ERP Joalheiro Completo**: Com controle de estoque por variação e banho galvânico (10 milésimos ouro 18k), expedição com etiquetas dos Correios/Jadlog, CRM de clientes com integração ao WhatsApp, módulo financeiro com DRE gerencial, Curva ABC de produtos e relatórios de vendas.

---

## 🛠️ Arquitetura & Stack Tecnológica

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Front-end** | **React 19 + TypeScript** | Componentização modular com Hooks customizados e tipagem estrita |
| **Estilização** | **Tailwind CSS v4** | Design responsivo, temas claro/escuro e microinterações |
| **Animações** | **Motion (`motion/react`)** | Transições de tela fluidas e animações de gaveta e modais |
| **Ícones** | **Lucide React** | Biblioteca unificada de ícones SVG vetorizados |
| **Efeitos Visuais**| **Canvas Confetti** | Celebração de pedido concluído e interações |
| **Back-end** | **Node.js + Express** | Servidor API RESTful para proxy seguro de chaves e webhooks |
| **Pagamentos** | **Mercado Pago SDK Brasil** | PIX instantâneo (QR Code + Copia e Cola), Cartão e Boleto |
| **Banco de Dados** | **PostgreSQL / Supabase** | Schema relacional completo para produtos, pedidos, clientes e finanças |
| **Bundler / Dev** | **Vite 6 + tsx + esbuild** | Compilação ultra-rápida e empacotamento CJS otimizado para produção |

---

## 📂 Estrutura de Pastas

```text
citrino-semijoias/
├── public/                    # Logotipos, ícones e assets estáticos
│   ├── citrino-logo.jpg       # Brasão oficial da marca
│   ├── citrino-icon.jpg       # Favicon e ícones
│   └── favicon.png            # Ícone de aba do navegador
├── src/
│   ├── components/
│   │   ├── admin/             # Painel Administrativo & ERP
│   │   │   ├── AdminDashboard.tsx   # Visão geral executiva e métricas
│   │   │   ├── AdminProducts.tsx    # CRUD de produtos, banhos e estoque
│   │   │   ├── AdminOrders.tsx      # Gestão de pedidos e etiquetas
│   │   │   ├── AdminCustomers.tsx   # CRM de clientes e WhatsApp direto
│   │   │   ├── AdminFinance.tsx     # Contas a pagar/receber e DRE
│   │   │   ├── AdminMarketing.tsx   # Cupons e recuperação de carrinhos
│   │   │   ├── AdminReports.tsx     # Curva ABC e exportação CSV
│   │   │   ├── AdminSettings.tsx    # Configurações de frete, API e loja
│   │   │   └── AdminLayout.tsx      # Sidebar e navegação do ERP
│   │   └── ecommerce/         # Loja Virtual & Experiência do Cliente
│   │       ├── Navbar.tsx           # Barra de navegação com categorias e busca
│   │       ├── Footer.tsx           # Rodapé institucional com selos
│   │       ├── HomeView.tsx         # Vitrine principal, banners e coleções
│   │       ├── CatalogView.tsx      # Catálogo com filtros avançados
│   │       ├── RingsView.tsx        # Página temática de Anéis e Aros
│   │       ├── NecklacesView.tsx    # Página temática de Colares e Chokers
│   │       ├── ProductDetailView.tsx # Detalhes da peça, medidas e certificado
│   │       ├── CartDrawer.tsx       # Gaveta lateral do carrinho
│   │       ├── CheckoutView.tsx     # Checkout transparente Mercado Pago
│   │       ├── AccountView.tsx      # Minha Conta, Rastreio e Pedidos
│   │       ├── ResellerView.tsx     # Portal Atacadista da Revendedora
│   │       └── AboutContactView.tsx # Institucional, Fábrica e Atendimento
│   ├── data/
│   │   └── mockData.ts        # Dados iniciais, produtos e categorias
│   ├── services/
│   │   └── store.ts           # Gerenciamento de estado global e persistência
│   ├── types.ts               # Interfaces e definições TypeScript
│   ├── App.tsx                # Roteador e controlador de visualização
│   ├── main.tsx               # Ponto de entrada React
│   └── index.css              # Configuração global do Tailwind CSS
├── supabase/
│   └── schema.sql             # Script SQL de criação de tabelas e índices
├── server.ts                  # Servidor Express com rotas de API Mercado Pago
├── .env.example               # Modelo de variáveis de ambiente
├── package.json               # Dependências e scripts de execução
├── tsconfig.json              # Configuração do compilador TypeScript
├── vite.config.ts             # Configuração do Vite e plugins
└── README.md                  # Documentação do projeto
```

---

## 🌟 Funcionalidades Principais

### 1. Loja Virtual (E-commerce B2C)
- **Design Editorial de Joalheria de Luxo**: Layout visual de alta joalheria, banner carrossel institucional e vitrines segmentadas.
- **Filtros e Busca em Tempo Real**: Filtro simultâneo por categoria, tipo de banho (Ouro 18k, Ródio Branco, Ródio Negro), tipo de pedra (Zircônias, Citrino Natural, Pérola Shell), faixa de preço e ordenação.
- **Página de Produto (PDP) de Alta Conversão**:
  - Zoom e galeria de fotos com tratamento *fallback* em caso de falha de carregamento.
  - Guia interativo de medidas de anéis (Aros 12 ao 24).
  - Cálculo de frete dinâmico via CEP com estimativa de prazo para PAC e SEDEX.
  - Seleção de variação de tamanho/aro e cálculo de parcelamento em até 10x sem juros.
- **Carrinho Interativo**: Gaveta lateral com cálculo automático de subtotal, aplicação de cupom promocional e barra de progresso para frete grátis (> R$ 299,00).

---

### 2. Certificado Oficial de Garantia
- **Garantia Oficial de 6 Meses ou Estendida de 1 Ano**: A cliente seleciona a modalidade de garantia desejada diretamente na página do produto.
- **Espelho Timbrado do Certificado**: Modal interativo com o certificado oficial Citrino contendo:
  - Brasão e identidade visual da marca.
  - Nome do produto e código de referência (SKU).
  - Especificação do banho nobre (10 milésimos ouro 18k) e tecnologia hipoalergênica (*Nickel Free* com verniz Diamond).
  - Termos de cobertura contra desprendimento do banho e defeito de fabricação.
  - Botão para **Imprimir ou Salvar em PDF**.

---

### 3. Portal B2B & Programa de Revenda
- **Seção Exclusiva de Atacado**: Apresentação de modelo de lucros para revendedoras com margem de até 100%.
- **Desconto Automático de Revenda**: Aplicação de 35% de desconto em todo o pedido para compras com pedido mínimo de atacado.
- **Kits de Entrada para Consultoras**: Opção de compra de kits completos com mostruário executivo de veludo preto e certificados de garantia impressos prontos para carimbo.

---

### 4. Painel Administrativo & ERP Joalheiro
- **Dashboard Executivo**:
  - Indicadores em tempo real: Vendas do Dia, Faturamento do Mês, Ticket Médio, Pedidos a Despachar e Alertas de Estoque Crítico.
  - Gráfico de evolução de vendas e listagem de pedidos recentes.
- **Catálogo & Gestão de Estoque**:
  - Cadastro de novos produtos com upload de fotos, definição de SKU, preço de custo, preço de venda, cálculo de margem e markup.
  - Definição do banho galvânico (Ouro 18k, Ródio) e espessura em milésimos.
  - Controle de estoque por variação de tamanho/aro com baixa automática após venda.
- **Gestão de Pedidos & Expedição**:
  - Pipeline de status: *Pendente, Pago, Em Separação, Enviado, Entregue, Cancelado*.
  - Alteração de status com 1 clique e inserção de código de rastreio Correios/Melhor Envio.
  - Emissão e impressão de etiqueta de despacho padrão transportadora.
- **CRM de Clientes**:
  - Listagem completa de clientes PF e consultoras PJ.
  - Histórico de pedidos por cliente e cálculo de Lifetime Value (LTV).
  - **Botão Direto de WhatsApp**: Abre a conversa com mensagem personalizada pré-formatada com o primeiro nome do cliente e número do pedido.
- **Módulo Financeiro & DRE**:
  - Registro de Contas a Pagar e a Receber (fornecedores de galvanoplastia, embalagens, fretes e insumos).
  - Conciliação automática de taxas de cartão e antecipações.
  - Demonstrativo de Resultados do Exercício (DRE) com apuração de lucro líquido.
- **Marketing & Relatórios**:
  - Criação de cupons promocionais (percentual ou fixo) com regras de valor mínimo.
  - Recuperação de carrinhos abandonados com disparo de mensagem no WhatsApp.
  - Relatório de **Curva ABC de Produtos** (identificação dos itens responsáveis por 80% do faturamento).
  - Exportação de relatórios em arquivo `.CSV`.
- **Configurações Gerais**:
  - Cadastro da empresa (Showroom em Limeira-SP, CNPJ, dados de contato e chave Pix).
  - Regras de Frete Grátis e taxas de parcelamento.
  - Gerenciamento de equipe e perfis de acesso administrativo.

---

## 💳 Integração de Pagamentos (Mercado Pago)

O sistema conta com endpoints nativos no backend Express (`server.ts`) para comunicação direta com a API do Mercado Pago Brasil:

1. **PIX Dinâmico Instantâneo**:
   - Geração de QR Code em imagem via API e linha digitável Pix Copia e Cola.
   - Aplicação automática de 5% de desconto no valor total.
2. **Cartão de Crédito**:
   - Tokenização e processamento com validação de bandeiras e parcelamento de 1x a 10x.
3. **Boleto Bancário**:
   - Geração de linha digitável e código de barras com vencimento em 3 dias úteis.
4. **Webhook de Notificação**:
   - Rota `POST /api/mercadopago/webhook` para recebimento de notificações IPN de confirmação de pagamento e atualização do pedido.

---

## 🚀 Instalação & Execução Local

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18.x, 20.x ou superior.
- Gerenciador de pacotes `npm`, `yarn` ou `bun`.

### Passo a Passo

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/citrino-semijoias.git
cd citrino-semijoias
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:
```env
# URL da Aplicação
APP_URL=http://localhost:3000

# Chave opcional do Gemini AI (se aplicável)
GEMINI_API_KEY=

# Credenciais Mercado Pago (Obtenha em: https://www.mercadopago.com.br/developers)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-seu-token-de-acesso
MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-chave-publica
```

4. **Inicie o Servidor de Desenvolvimento:**
```bash
npm run dev
```

Abra no navegador em: [`http://localhost:3000`](http://localhost:3000)

---

## 🗄️ Configuração do Banco de Dados (Supabase / PostgreSQL)

O projeto inclui o script de criação do banco de dados relacional completo em `supabase/schema.sql`.

Para configurar:
1. Crie uma conta ou acesse um projeto no [Supabase](https://supabase.com) (ou qualquer servidor PostgreSQL).
2. Acesse o **SQL Editor** no painel do Supabase.
3. Cole o conteúdo de `supabase/schema.sql` e execute o script.
4. O schema criará as tabelas:
   - `products` (semijoias, fotos, banho, milésimos, dimensões, estoque)
   - `categories` e `collections`
   - `customers` (dados cadastrais, endereços, tipo de cliente)
   - `orders` e `order_items` (pedidos, valores, frete, status)
   - `coupons` (regras e descontos)
   - `financial_entries` (contas a pagar/receber e conciliação)
   - `home_banners` e `company_settings`

---

## 📜 Scripts Disponíveis

No arquivo `package.json` estão configurados os seguintes comandos:

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor backend com TypeScript (`tsx server.ts`) e o middleware Vite na porta 3000 |
| `npm run build` | Compila o front-end com `vite build` e empacota o backend Node.js em `dist/server.cjs` via `esbuild` |
| `npm start` | Executa o bundle CommonJS compilado para produção (`node dist/server.cjs`) |
| `npm run lint` | Executa a verificação estática de tipos do TypeScript (`tsc --noEmit`) |
| `npm run preview`| Visualiza a versão compilada do Vite localmente |

---

## 🌐 Deploy em Produção

### Opção 1: Vercel / Netlify (Deploy Frontend SPA)
1. Conecte o repositório GitHub à Vercel.
2. Defina o comando de build como `npm run build`.
3. Defina a pasta de saída (*Output Directory*) como `dist`.
4. Configure as variáveis de ambiente em **Project Settings > Environment Variables**.

### Opção 2: Container Docker / Google Cloud Run / Render / Railway
O projeto já conta com compilação unificada do servidor Express que serve tanto os endpoints de API quanto os arquivos estáticos compilados:

```bash
# 1. Compila o front-end e o backend
npm run build

# 2. Inicializa o servidor standalone
npm start
```
O servidor ouvirá na porta `3000` e responderá a todas as requisições web.

---

## 📄 Licença & Contato

Desenvolvido para **Citrino Semijoias** — Alta Joalheria Contemporânea.
Todos os direitos reservados.

- **Showroom**: Limeira - SP, Capital da Joia Folheada
- **Suporte / Atendimento**: `contato@citrinosemijoias.com.br`

---
<p align="center">
  <sub>Feito com dedicação e excelência em tecnologia para o mercado joalheiro brasileiro.</sub>
</p>
