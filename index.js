import node_adapter from "@sveltejs/adapter-node";
import { join } from "node:path";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const files = fileURLToPath(new URL("./files", import.meta.url));

/** @type {import('.').default} */
export default function (opts = {}) {
  const {
    out = "build",
    precompress,
    envPrefix = "",
    polyfill = true,
    includePackage = true,
    buildNodeModules = false,
    transferEnv = false,
  } = opts;

  /** @type {import('@sveltejs/kit').Adapter} */
  const na = node_adapter({ out, precompress, envPrefix, polyfill });

  return {
    name: "sveltekit-adapter-node-iis",

    async adapt(builder) {
      console.info("!!! v3*** Running local version using pnpm link!!!");
      console.info("Running @sveltejs/adapter-node");
      await na.adapt(builder);
      console.info("Finished @sveltejs/adapter-node");

      console.info("Running @opensas/sveltekit-adapter-node-iis");

      copyFileSync(join(files, "server.cjs"), join(out, "server.cjs"));
      copyFileSync(join(files, "web.config"), join(out, "web.config"));

      if (includePackage) {
        copyFileSync("package.json", join(out, "package.json"));
        copyFileSync("package-lock.json", join(out, "package-lock.json"));

        if (buildNodeModules) {
          console.info("Building node_modules");
          execSync(`cd ${out} && npm ci --omit dev`, { stdio: [0, 1, 2] });
        }
      }

      if (transferEnv) copyFileSync(".env", join(out, ".env"));

      console.info("Finished @opensas/sveltekit-adapter-node-iis");
    },
  };
}
