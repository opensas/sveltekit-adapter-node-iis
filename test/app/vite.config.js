import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@opensas/sveltekit-adapter-node-iis';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter({
				packageManager: 'pnpm',
				copyFiles: [{ src: 'iis.txt', dest: 'extra/iis.txt' }]
			})
		})
	]
});
