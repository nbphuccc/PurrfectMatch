import { spawn } from 'child_process';
import path from 'path';

let serverProcess: any;
const serverRoot = path.resolve(__dirname, '../../../../server');

export async function startServer() {
    if (serverProcess) return 'http://127.0.0.1:3000';

    serverProcess = spawn('node', ['dist/server.js'], {
        cwd: serverRoot,
        env: { ...process.env, NODE_ENV: 'test', DB_PATH: ':memory:' },
        stdio: 'inherit',
    });

    // naive wait for server to boot — in CI you'd probe the port
    await new Promise((r) => setTimeout(r, 800));
    return 'http://127.0.0.1:3000';
}

export async function stopServer() {
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
    }
}
