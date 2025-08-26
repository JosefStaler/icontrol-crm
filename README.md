# icontrol-crm Monorepo

## Pré-requisitos
- Node 20+
- pnpm 9+
- SQL Server acessível (sem migrations)

## Setup rápido
1. Copie os arquivos `.env` de exemplo:
   - `apps/api/.env.example` -> `apps/api/.env`
   - `apps/web/.env.local.example` -> `apps/web/.env.local`
2. Instale dependências: `pnpm i`
3. Introspect Prisma (DB existente):
   - Global (atalho): `pnpm db:introspect`
   - Ou direto na API: `pnpm --filter @icontrol/api db:introspect`
4. Dev paralelizado: `pnpm -w dev`

## Workspaces
- apps/api: API NestJS + Prisma (SQL Server)
- apps/web: Next.js 14 (App Router)
- packages/config: Definições de entidades/colunas
- packages/ui: Componentes UI compartilhados
- tools: scripts utilitários

## Teste rápido
- Gere um hash de senha: `pnpm --filter @icontrol/api exec ts-node src/scripts/hash-password.ts SuaSenha123!`
- Insira usuário no SQL Server (tabela/colunas conforme seu legado)
- API em `http://localhost:3001`, Web em `http://localhost:3000`
- Login em `/login`, listas em `/app/data/Customers`, admin em `/app/admin/users`

### Iniciar e reiniciar (Windows/PowerShell)

#### API (NestJS)
- Iniciar (dev, porta padrão 3001):
  ```powershell
  pnpm -F @icontrol/api dev
  ```
- Parar: `Ctrl + C`
- Reiniciar: pare com `Ctrl + C` e rode o comando de iniciar novamente.
- Alterar porta (ex.: 3002):
  ```powershell
  $env:PORT=3002; pnpm -F @icontrol/api dev
  ```
- Porta ocupada (liberar 3001):
  ```powershell
  Get-NetTCPConnection -LocalPort 3001 | Select-Object -First 1 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

#### Web (Next.js)
- Configurar API no frontend (`apps/web/.env.local`):
  ```dotenv
  NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
  ```
- Iniciar (dev, porta padrão 3000):
  ```powershell
  pnpm -F @icontrol/web dev
  ```
- Parar: `Ctrl + C`
- Reiniciar: pare com `Ctrl + C` e rode o comando de iniciar novamente.
- Alterar porta (ex.: 3002):
  ```powershell
  pnpm -F @icontrol/web dev -- -p 3002
  ```

#### Dicas
- Mantenha API e Web em terminais separados para evitar parar um ao rodar o outro.
- Após mudar variáveis de ambiente (.env), é necessário parar e iniciar novamente o processo (o watcher não recarrega env).
