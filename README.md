# THEKKY - Sistema de Gestao de Ocorrencias

Sistema multiempresa para registro de ocorrencias e acoes corretivas.

## Stack

- **Next.js 14** + TypeScript
- **TailwindCSS**
- **Supabase** (Auth + Postgres)
- **Vercel** (Deploy)

## Fluxo

1. Registrar ocorrencia
2. Analisar causa
3. Criar acao (Corretiva, Preventiva, Melhoria, Imediata)
4. Marcar como resolvida

## Setup Local

```bash
# Instalar dependencias
npm install

# Copiar variaveis de ambiente
cp .env.example .env.local

# Preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

# Rodar o schema SQL no Supabase (supabase/schema.sql)

# Iniciar dev server
npm run dev
```

## Variaveis de Ambiente

| Variavel | Descricao |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon do Supabase |

## Banco de Dados

- **companies** - Empresas
- **profiles** - Usuarios (vinculado ao auth.users)
- **occurrences** - Ocorrencias
- **actions** - Acoes corretivas/preventivas

Todas as tabelas possuem RLS habilitado para isolamento multiempresa via `company_id`.

## Deploy

Conectado automaticamente ao Vercel via GitHub.
