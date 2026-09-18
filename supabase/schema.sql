-- ======================================================================
-- CITRINO SEMIJOIAS - SCHEMA COMPLETO SUPABASE / POSTGRESQL
-- Inclui tabelas, relacionamentos, constraints, RLS e Storage Buckets
-- ======================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS DE DOMÍNIO
CREATE TYPE status_pedido AS ENUM ('aguardando', 'pago', 'separacao', 'enviado', 'entregue', 'cancelado');
CREATE TYPE forma_pagamento AS ENUM ('pix', 'cartao', 'boleto');
CREATE TYPE tipo_cliente AS ENUM ('PF', 'PJ');
CREATE TYPE cargo_admin AS ENUM ('admin', 'financeiro', 'operador');

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(120) NOT NULL UNIQUE,
  icone VARCHAR(50),
  imagem_url TEXT,
  ordem INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE COLEÇÕES
CREATE TABLE IF NOT EXISTS colecoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  descricao TEXT,
  imagem_url TEXT,
  banner_url TEXT,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(280) UNIQUE NOT NULL,
  descricao TEXT NOT NULL,
  detalhes JSONB DEFAULT '[]'::jsonb,
  preco NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  preco_promocional NUMERIC(10, 2) CHECK (preco_promocional >= 0),
  estoque INT NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  colecao_id UUID REFERENCES colecoes(id) ON DELETE SET NULL,
  material VARCHAR(50) NOT NULL DEFAULT 'Ouro 18k',
  pedra VARCHAR(50) DEFAULT 'Zircônia Cristal',
  banho VARCHAR(100) DEFAULT '10 milésimos de Ouro 18k com Verniz Diamond',
  garantia VARCHAR(100) DEFAULT '1 ano de garantia no banho',
  imagens TEXT[] NOT NULL DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,
  lancamento BOOLEAN DEFAULT false,
  mais_vendido BOOLEAN DEFAULT false,
  avaliacao NUMERIC(2,1) DEFAULT 5.0,
  qtd_avaliacoes INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE VARIAÇÕES DE PRODUTO (aros, comprimentos)
CREATE TABLE IF NOT EXISTS produto_variacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  nome VARCHAR(50) NOT NULL, -- Ex: "Aro 16", "Aro 18", "45cm"
  estoque INT NOT NULL DEFAULT 0,
  sku_variacao VARCHAR(60),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE CLIENTES (PF e PJ / Revendedoras)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo tipo_cliente NOT NULL DEFAULT 'PF',
  nome VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  documento VARCHAR(20) NOT NULL UNIQUE, -- CPF ou CNPJ
  inscricao_estadual VARCHAR(30),
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(25),
  whatsapp VARCHAR(25),
  cep VARCHAR(10),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  revendedor_b2b BOOLEAN DEFAULT false,
  desconto_b2b_pct NUMERIC(5,2) DEFAULT 0,
  limite_credito NUMERIC(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABELA DE CUPONS DE DESCONTO
CREATE TABLE IF NOT EXISTS cupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo VARCHAR(50) NOT NULL UNIQUE,
  desconto_pct NUMERIC(5,2),
  desconto_valor NUMERIC(10,2),
  compra_minima NUMERIC(10,2) DEFAULT 0,
  validade TIMESTAMPTZ NOT NULL,
  ativo BOOLEAN DEFAULT true,
  uso_max INT DEFAULT 100,
  uso_atual INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_pedido VARCHAR(30) NOT NULL UNIQUE, -- Ex: CIT-8201
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nome VARCHAR(255) NOT NULL,
  cliente_email VARCHAR(255) NOT NULL,
  cliente_telefone VARCHAR(25),
  cliente_cpf VARCHAR(20),
  subtotal NUMERIC(10,2) NOT NULL,
  frete_valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  metodo_frete VARCHAR(100) DEFAULT 'Correios PAC',
  desconto_valor NUMERIC(10,2) DEFAULT 0,
  cupom_id UUID REFERENCES cupons(id) ON DELETE SET NULL,
  total NUMERIC(10,2) NOT NULL,
  status status_pedido NOT NULL DEFAULT 'aguardando',
  forma_pagamento forma_pagamento NOT NULL,
  parcelas INT DEFAULT 1,
  dados_pagamento JSONB DEFAULT '{}'::jsonb, -- MP payment_id, status, qr_code
  codigo_rastreio VARCHAR(50),
  endereco_entrega JSONB NOT NULL,
  notas_internas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ITENS DO PEDIDO
CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  sku VARCHAR(50),
  imagem TEXT,
  variacao VARCHAR(50),
  quantidade INT NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FINANCEIRO: CONTAS A RECEBER
CREATE TABLE IF NOT EXISTS contas_receber (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  cliente_nome VARCHAR(255) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  forma_pagamento forma_pagamento NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FINANCEIRO: CONTAS A PAGAR
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL, -- Fornecedor Banho, Embalagens, etc.
  favorecido VARCHAR(255) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  comprovante_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. BANNERS E MARKETING
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(150) NOT NULL,
  subtitulo TEXT,
  cta_texto VARCHAR(50) DEFAULT 'Conhecer Coleção',
  cta_link VARCHAR(255) DEFAULT '/catalogo',
  imagem_url TEXT NOT NULL,
  tag VARCHAR(50) DEFAULT 'DESTAQUE',
  ativo BOOLEAN DEFAULT true,
  ordem INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. USUÁRIOS DO PAINEL DE GESTÃO (Back-office)
CREATE TABLE IF NOT EXISTS usuarios_painel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  cargo cargo_admin NOT NULL DEFAULT 'operador',
  ativo BOOLEAN DEFAULT true,
  ultimo_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. DEVOLUÇÕES E TROCAS
CREATE TABLE IF NOT EXISTS devolucoes_trocas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  numero_pedido VARCHAR(30) NOT NULL,
  cliente_nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- Troca ou Devolução
  motivo TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Pendente',
  data_solicitacao TIMESTAMPTZ DEFAULT NOW()
);

-- ======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================================
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE colecoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_variacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Catálogo: visualização pública para todos os visitantes
CREATE POLICY "Public Read Categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Public Read Colecoes" ON colecoes FOR SELECT USING (true);
CREATE POLICY "Public Read Produtos" ON produtos FOR SELECT USING (ativo = true);
CREATE POLICY "Public Read Variacoes" ON produto_variacoes FOR SELECT USING (true);
CREATE POLICY "Public Read Banners" ON banners FOR SELECT USING (ativo = true);
CREATE POLICY "Public Read Cupons" ON cupons FOR SELECT USING (ativo = true AND validade >= NOW());

-- Clientes: usuário autenticado só visualiza e edita seus próprios dados
CREATE POLICY "User Read Own Customer" ON clientes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Update Own Customer" ON clientes FOR UPDATE USING (auth.uid() = user_id);

-- Pedidos: cliente autenticado visualiza apenas seus pedidos
CREATE POLICY "User Read Own Orders" ON pedidos FOR SELECT USING (
  cliente_id IN (SELECT id FROM clientes WHERE user_id = auth.uid())
);
CREATE POLICY "Public Insert Order" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Order Items" ON pedido_itens FOR INSERT WITH CHECK (true);

-- Admins têm acesso irrestrito a todas as tabelas
CREATE POLICY "Admin Full Access Produtos" ON produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios_painel WHERE email = auth.jwt() ->> 'email' AND ativo = true)
);
CREATE POLICY "Admin Full Access Pedidos" ON pedidos FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios_painel WHERE email = auth.jwt() ->> 'email' AND ativo = true)
);
CREATE POLICY "Admin Full Access Financeiro Receber" ON contas_receber FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios_painel WHERE email = auth.jwt() ->> 'email' AND ativo = true)
);
CREATE POLICY "Admin Full Access Financeiro Pagar" ON contas_pagar FOR ALL USING (
  EXISTS (SELECT 1 FROM usuarios_painel WHERE email = auth.jwt() ->> 'email' AND ativo = true)
);

-- ======================================================================
-- STORAGE BUCKETS SETUP
-- ======================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('produtos-fotos', 'produtos-fotos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes', 'comprovantes', false);
