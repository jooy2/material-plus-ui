/** Runs the Vite dev server and opens Electron on it. */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer } from 'vite';

const server = await createServer();

await server.listen();

const url = server.resolvedUrls.local[0];
const electron = createRequire(import.meta.url)('electron');
const app = spawn(electron, ['.'], {
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
  stdio: 'inherit'
});

app.on('close', async (code) => {
  await server.close();
  process.exit(code ?? 0);
});
