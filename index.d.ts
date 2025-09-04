import { Adapter } from '@sveltejs/kit';

interface AdapterOptions {
	/** Output directory for the built binary (/build by default) */
	out?: string;
	/** Enables precompressing using gzip and brotli for assets and prerendered pages. It defaults to true. */
	precompress?: boolean;
	/** Specify a prefix to change the name of the environment variables used to configure the deployment */
	envPrefix?: string;
	polyfill?: boolean;
	/** Copies `package.json` and `package-lock.json` to the output directory. */
	includePackage?: boolean;
	/** Builds `node_modules` in the output directory. Asumes `includePackage` to be`true`. */
	buildNodeModules?: boolean;
	/** Allows to override the command used to build `node_modules`. */
	buildCommand?: string;
	/** Package manager to use.Options`npm` `pnpm` `yarn` `bun` `deno` */
	packageManager?: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'deno';
	/** Array of additional files to copy to the output directory (e.g., `["prisma/schema.prisma", ".env.production"]`). */
	copyFiles?: string[]
}

export default function plugin(options?: AdapterOptions): Adapter;