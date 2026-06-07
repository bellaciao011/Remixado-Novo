# Panini FIFA World Cup 2026 Store

Loja online para venda de produtos oficiais Panini da Copa do Mundo FIFA 2026, com checkout via Stripe, suporte a múltiplos idiomas e painel administrativo.

---

## ⚠️ CONFIGURAÇÃO OBRIGATÓRIA — CHAVES STRIPE

**Este projeto requer suas próprias chaves da Stripe para funcionar.**
As chaves do proprietário anterior foram removidas. Você precisa configurar as suas antes de usar.

### Secrets obrigatórios (configurar em Secrets → + New Secret)

| Secret | Onde obter |
|--------|-----------|
| `STRIPE_SECRET_KEY` | [Dashboard Stripe](https://dashboard.stripe.com/apikeys) → Secret key (`sk_live_...` ou `sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | [Dashboard Stripe](https://dashboard.stripe.com/apikeys) → Publishable key (`pk_live_...` ou `pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | Criado automaticamente na primeira inicialização do servidor — **deixe em branco por enquanto**. Após o servidor iniciar, copie o valor que aparece nos logs e salve aqui para evitar recriação a cada restart. |
| `SESSION_SECRET` | Qualquer string aleatória longa (ex: gere com `openssl rand -hex 32`) |

### Passos para configurar

1. Abra a aba **Secrets** no painel lateral do Replit (ícone de cadeado 🔒)
2. Adicione os secrets `STRIPE_SECRET_KEY` e `STRIPE_PUBLISHABLE_KEY` com suas chaves
3. Adicione `SESSION_SECRET` com uma string aleatória
4. Clique em **Run** — o servidor vai iniciar e criar automaticamente o webhook na Stripe
5. Nos logs do servidor, procure a linha com `TIP: Set STRIPE_WEBHOOK_SECRET` — copie o valor e salve como secret `STRIPE_WEBHOOK_SECRET`

> **Nota:** O `STRIPE_WEBHOOK_SECRET` é opcional mas recomendado para produção. Sem ele, um novo webhook é criado na Stripe a cada reinício do servidor.

---

## Run & Operate

- Servidor API: inicia automaticamente com o workflow configurado
- `pnpm run typecheck` — typecheck completo
- `pnpm --filter @workspace/db run push` — aplicar mudanças de schema no banco (só dev)
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks da API a partir do spec OpenAPI

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter, i18next (pt-BR, en, de, fr, it, es)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Pagamentos: Stripe (Payment Intents)
- Build: esbuild

## Estrutura do projeto

```
artifacts/
  panini-wc2026/     # Frontend React (loja)
  api-server/        # Backend Express (API + webhooks Stripe)
lib/
  db/                # Schema Drizzle + cliente PostgreSQL
  api-spec/          # Spec OpenAPI + hooks gerados (Orval)
```

## Arquitetura

- Preços armazenados em **centavos** (inteiro) em `productData.ts`; frontend divide por 100 para exibir
- Payment Intent criado no step 2 do checkout (após validação de envio)
- Webhook Stripe registrado automaticamente no startup via API; segredo armazenado em memória (ou em `STRIPE_WEBHOOK_SECRET`)
- Imagens de produtos em `attached_assets/` servidas via `/assets` pelo Express

## User preferences

- Não usar emojis desnecessários no código
- Manter estrutura de arquivos existente
