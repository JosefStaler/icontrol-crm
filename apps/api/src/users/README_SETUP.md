# Setup rápido de usuário para teste

1. Gere um hash de senha (Argon2):
   ```bash
   pnpm --filter @icontrol/api exec ts-node src/scripts/hash-password.ts suaSenhaForte
   ```

2. Insira o usuário na tabela legada (`LEGACY_USER_TABLE`, default `Users`). Ajuste os nomes de colunas se necessário:
   ```sql
   INSERT INTO Users (Email, PasswordHash, Role, Active)
   VALUES ('admin@example.com', '<COLE_AQUI_O_HASH>', 'admin', 1);
   ```

3. Faça login na API:
   ```bash
   curl -X POST http://localhost:3001/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"suaSenhaForte"}'
   ```

4. Use o accessToken nas chamadas protegidas:
   ```bash
   curl http://localhost:3001/users -H "Authorization: Bearer <ACCESS_TOKEN>"
   ```






