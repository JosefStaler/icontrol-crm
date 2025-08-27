import * as argon2 from 'argon2';

async function main() {
  const pwd = process.argv[2];
  if (!pwd) {
    // eslint-disable-next-line no-console
    console.error('Uso: ts-node src/scripts/hash-password.ts <senha>');
    process.exit(1);
  }
  const hash = await argon2.hash(pwd);
  // eslint-disable-next-line no-console
  console.log(hash);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});






