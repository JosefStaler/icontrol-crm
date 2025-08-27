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

## 🔧 Comandos Importantes - Solução de Problemas

### Encerrar Todas as Instâncias (Windows/PowerShell)

#### Parar Todos os Processos Node.js
```powershell
# Encerrar todas as instâncias Node.js (API e Web)
taskkill /f /im node.exe

# Verificar se ainda há processos Node.js rodando
Get-Process node -ErrorAction SilentlyContinue
```

#### Parar Processos por Porta
```powershell
# Liberar porta 3001 (API)
Get-NetTCPConnection -LocalPort 3001 | Select-Object -First 1 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Liberar porta 3000 (Web)
Get-NetTCPConnection -LocalPort 3000 | Select-Object -First 1 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Verificar portas em uso
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

### Reiniciar Serviços

#### Reiniciar API
```powershell
# Parar API
Ctrl + C (no terminal da API)

# Limpar cache e reiniciar
cd apps/api
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma
cd ../..
pnpm -F @icontrol/api dev

# OU se já estiver no diretório apps/api:
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma
cd ../..
pnpm -F @icontrol/api dev
```

#### Reiniciar Web
```powershell
# Parar Web
Ctrl + C (no terminal da Web)

# Limpar cache Next.js e reiniciar
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
pnpm -F @icontrol/web dev
```

#### Reiniciar Ambos (Limpeza Completa)
```powershell
# 1. Parar todos os processos
taskkill /f /im node.exe

# 2. Limpar caches
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
cd ../api
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma

# 3. Reinstalar dependências (se necessário)
cd ../..
pnpm store prune
pnpm install

# 4. Reiniciar serviços
pnpm -F @icontrol/api dev
# Em outro terminal:
pnpm -F @icontrol/web dev
```

### Problemas Comuns e Soluções

#### ⚠️ IMPORTANTE: Comandos do Prisma
```powershell
# ❌ ERRADO - Do diretório raiz:
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma

# ✅ CORRETO - Do diretório apps/api:
cd apps/api
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma

# ✅ CORRETO - Se já estiver em apps/api:
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma
```

#### Erro: "Module not found: Can't resolve '@icontrol/config'"
```powershell
# Verificar se o arquivo existe
ls packages/config/src/entities.example.ts

# Corrigir import em apps/web/lib/entities.ts
# Import correto: import { entities } from '@icontrol/config';

# Se o erro persistir, verificar se o pacote está instalado:
pnpm install

# Ou reinstalar dependências:
pnpm store prune
pnpm install
```

#### Erro: "PrismaClient did not initialize yet"
```powershell
# Comando correto (do diretório apps/api):
cd apps/api
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma

# Ou se já estiver no diretório apps/api:
pnpm dlx prisma@6.14.0 generate --schema prisma/schema.prisma
```

#### Erro: "Port already in use"
```powershell
# Verificar qual processo está usando a porta
netstat -ano | findstr :3001
netstat -ano | findstr :3000

# Encerrar o processo específico
taskkill /f /pid [PID_NUMBER]
```

#### Dados do Dashboard Zerando
```powershell
# Verificar se o refresh token está funcionando
# Olhar logs da API para padrão: 401 -> 200 (renovação automática)
# Se não estiver funcionando, reiniciar ambos os serviços
```

#### Erro: "Module not found: Can't resolve '@icontrol/config'" (Persistente)
```powershell
# 1. Verificar se o arquivo existe
ls packages/config/src/entities.example.ts

# 2. Verificar se o pacote está instalado no workspace web
pnpm -F @icontrol/web list @icontrol/config

# 3. Se não estiver instalado, adicionar ao package.json do web:
# Em apps/web/package.json, adicionar na seção "dependencies":
# "@icontrol/config": "workspace:*"

# 4. Verificar se o package.json do config está correto:
# packages/config/package.json deve ter:
# "main": "src/index.ts",
# "types": "src/index.ts"

# 5. Limpeza completa:
pnpm store prune
pnpm install

# 6. Limpar cache do Next.js
cd apps/web
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
cd ../..

# 7. Verificar se o import está correto em apps/web/lib/entities.ts:
# import { entities } from '@icontrol/config';
```

### Comandos Úteis de Desenvolvimento

#### Verificar Status dos Serviços
```powershell
# Verificar se API está rodando
curl http://localhost:3001/api/auth/me

# Verificar se Web está rodando
curl http://localhost:3000

# Verificar processos Node.js ativos
Get-Process node
```

#### Logs e Debug
```powershell
# Ver logs da API em tempo real
# (já está ativo no terminal da API)

# Ver logs da Web em tempo real
# (já está ativo no terminal da Web)

# Limpar logs do terminal
Clear-Host
```
