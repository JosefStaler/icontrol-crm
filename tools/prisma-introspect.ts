import { spawn } from 'node:child_process';
import path from 'node:path';

const cwd = path.resolve(process.cwd(), 'apps', 'api');

function run(cmd: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
  });
}

(async () => {
  console.log('[tools] prisma db pull...');
  await run('pnpm', ['prisma', 'db', 'pull']);
  console.log('[tools] prisma generate...');
  await run('pnpm', ['prisma', 'generate']);
  console.log('[tools] done.');
})().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});






