# Massas Sao Jose Front

Aplicação web para operação comercial e financeira da Massas Sao Jose.

O projeto cobre fluxo de clientes, pedidos, produção, rotas, despesas e dashboard financeiro, com interface React, roteamento tipado e cache de dados via React Query.

## Visão Geral

Este frontend foi construído para uso diário da operação:

- Cadastro e gestão de clientes
- Criação e edição de pedidos
- Controle de pagamento (pago/pendente)
- Planejamento de produção por dia/rota
- Controle de despesas
- Dashboard financeiro e exportação de PDF

## Stack Técnica

- React 19
- TypeScript
- Vite
- TanStack Router
- TanStack React Query
- Tailwind CSS
- Axios
- Recharts
- jsPDF + jspdf-autotable
- Radix UI (Alert Dialog)

## Estrutura Principal

```text
src/
	components/        # Componentes reutilizáveis de UI
	contexts/          # Contextos globais
	lib/
		api.ts           # Cliente HTTP Axios
		hooks/           # Hooks de dados (clients, orders, expenses, products)
		types/           # Tipagens compartilhadas
		make-pdf.ts      # Geração de relatórios PDF
		utils.ts         # Helpers gerais
	pages/             # Paginas da Aplicação
	routes/            # Definição de rotas TanStack Router
	routeTree.gen.ts   # Arvore de rotas gerada
```

## Requisitos

- Node.js 20+
- pnpm 9+ (recomendado)
- API backend rodando (padrão: http://localhost:3333)

## Como Rodar Localmente

1. Instale as dependências:

```bash
pnpm install
```

2. Configure variáveis de ambiente:

Crie um arquivo `.env` na raiz:

```env
VITE_API_URL="http://localhost:3333"
```

Observação:
- O frontend usa `${VITE_API_URL}/api` como base.
- Se `VITE_API_URL` nao for definido, cai no fallback `http://localhost:3333/api`.

3. Inicie o servidor de desenvolvimento:

```bash
pnpm dev
```

## Scripts

- `pnpm dev`: sobe ambiente de desenvolvimento
- `pnpm build`: compila TypeScript e gera build de produção
- `pnpm preview`: serve build local para validacao

## Integração com API

Os hooks de dados esperam endpoints REST em `/api`, por exemplo:

- `GET /clients`
- `GET /clients/:id`
- `GET /clients/:id/orders`
- `POST /clients`
- `PUT /clients/:id`
- `DELETE /clients/:id`
- `GET /products`
- `POST /products`
- `PUT /products/:id`
- `GET /orders`
- `POST /orders`
- `PUT /orders/:id`
- `GET /expenses`
- `POST /expenses`
- `DELETE /expenses/:id`

## Funcionalidades Implementadas

- Tela de clientes com filtros (todos, pessoa, empresa)
- Formulário de cliente reutilizável com validação via Zod
- Fluxo de novo pedido com seletor de cliente em modal
- edição de pedido por rota dedicada
- Tela de pedidos com filtros simples e avançados
- produção por dia com ajuste de quantidades
- Rotas de entrega com conclusão de pedido no ato
- Despesas com filtro por categoria e periodo
- Dashboard financeiro com gráficos e periodo customizado
- exportação de PDF para fechamento e dashboard

## Qualidade e Debug

- React Query Devtools habilitado em runtime
- TanStack Router Devtools ativo no app
- Cache de consultas com `staleTime` de 5 minutos

## Build e Deploy

Para gerar build:

```bash
pnpm build
```

Para testar o build localmente:

```bash
pnpm preview
```

