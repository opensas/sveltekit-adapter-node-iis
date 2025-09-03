import { Adapter } from '@sveltejs/kit';

interface AdapterOptions {
	out?: string;
	precompress?: boolean;
	envPrefix?: string;
	polyfill?: boolean;
	includePackage?: boolean;
	buildNodeModules?: boolean;
	packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'deno';
	copyFiles?: string[]
}

export default function plugin(options?: AdapterOptions): Adapter;