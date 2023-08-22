import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import node_adapter from '@sveltejs/adapter-node'
import child_process from 'node:child_process';


const files = fileURLToPath(new URL('./files', import.meta.url).href);

/** @type {import('.').default} */
export default function (opts = {}) {
	const { out = 'build', precompress, envPrefix = '', polyfill = true, includePackage = true, buildNodeModules = false, transferEnv = false } = opts;

  /** @type {import('@sveltejs/kit').Adapter} */
  const na = node_adapter({out, precompress, envPrefix, polyfill});

	return {
		name: 'sveltekit-adapter-node-iis',

		async adapt(builder) {
      console.info("Running @sveltejs/adapter-node");
      await na.adapt(builder);
      console.info("Finished @sveltejs/adapter-node");

      console.info("Running sveltekit-adapter-node-iis");

      copyFileSync(`${files}\\server.cjs`, `${out}\\server.cjs`);
      copyFileSync(`${files}\\web.config`, `${out}\\web.config`);

      if (includePackage) {
        copyFileSync(`package.json`, `${out}\\package.json`);
        copyFileSync(`package-lock.json`, `${out}\\package-lock.json`);

        if (buildNodeModules) {
          console.info("Building node_modules")
          child_process.execSync(`cd ${out} && npm ci --omit dev`,{stdio:[0,1,2]});
        }
      }

      if (transferEnv) {
        copyFileSync(`.env`, `${out}\\.env`);
      }

      console.info("Finished sveltekit-adapter-node-iis");
    }
  }
}