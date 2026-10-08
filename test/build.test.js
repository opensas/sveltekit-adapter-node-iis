// Builds test/app with the adapter and serves it through server.cjs, the way iisnode does:
// iisnode passes a named pipe in PORT and server.cjs moves it to SOCKET_PATH.
import { execSync, spawn } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const APP = fileURLToPath(new URL('./app', import.meta.url));
const OUT = join(APP, 'build');
const SOCKET = join(tmpdir(), `adapter-iis-test-${process.pid}.sock`);
const SERVER_READY_TIMEOUT_MS = 10_000;
const POLL_MS = 100;

/** @type {import('node:child_process').ChildProcess} */
let server;

before(() => {
	execSync('pnpm install --ignore-workspace', { cwd: APP, stdio: 'inherit' });
	execSync('pnpm build', { cwd: APP, stdio: 'inherit' });
});

after(() => {
	server?.kill();
	rmSync(SOCKET, { force: true });
});

test('generates the adapter-node output', () => {
	for (const file of ['index.js', 'handler.js', 'adapter-node.js', 'server/adapter-index.js']) {
		assert.ok(existsSync(join(OUT, file)), `missing build/${file}`);
	}
});

test('adds the IIS files', () => {
	for (const file of ['server.cjs', 'web.config', 'package.json', 'pnpm-lock.yaml']) {
		assert.ok(existsSync(join(OUT, file)), `missing build/${file}`);
	}
});

test('copies copyFiles entries', () => {
	assert.ok(existsSync(join(OUT, 'extra/iis.txt')));
});

test('server.cjs serves the app on the socket passed in PORT', async () => {
	rmSync(SOCKET, { force: true });
	server = spawn(process.execPath, ['server.cjs'], {
		cwd: OUT,
		env: { ...process.env, PORT: SOCKET },
		stdio: 'inherit'
	});

	const deadline = Date.now() + SERVER_READY_TIMEOUT_MS;
	while (!existsSync(SOCKET)) {
		assert.ok(Date.now() < deadline, 'server did not open the socket');
		await new Promise((resolve) => setTimeout(resolve, POLL_MS));
	}

	const { status, body } = await new Promise((resolve, reject) => {
		const req = request({ socketPath: SOCKET, path: '/', headers: { host: 'localhost' } }, (res) => {
			let body = '';
			res.on('data', (chunk) => (body += chunk));
			res.on('end', () => resolve({ status: res.statusCode, body }));
		});
		req.on('error', reject);
		req.end();
	});

	assert.equal(status, 200);
	assert.match(body, /hello from iis/);
});
