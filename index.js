import node_adapter from "@sveltejs/adapter-node";
import { join } from "node:path";
import { copyFileSync, existsSync } from "node:fs";
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
    packageManager = "npm",
  } = opts;

  /** @type {import('@sveltejs/kit').Adapter} */
  const na = node_adapter({ out, precompress, envPrefix, polyfill });

  return {
    name: "sveltekit-adapter-node-iis",

    async adapt(builder) {
      console.info("Running @sveltejs/adapter-node");
      await na.adapt(builder);
      console.info("Finished @sveltejs/adapter-node");

      console.info("Running @opensas/sveltekit-adapter-node-iis");

      copyFileSync(join(files, "server.cjs"), join(out, "server.cjs"));
      copyFileSync(join(files, "web.config"), join(out, "web.config"));

      if (includePackage) {
        copyFileSync("package.json", join(out, "package.json"));

        const { lock, command } = installInfo(packageManager);
        if (!existsSync(lock)) {
          throw new Error(
            `Lock lock not found: ${lock}. Required for packageManager: '${packageManager}'. Run '${packageManager} install' to generate it.`
          );
        }

        // copyFileSync("package-lock.json", join(out, "package-lock.json"));
        copyFileSync(lock, join(out, lock));
        console.log(`Copied ${packageManager} lock file ${lock}`);

        if (buildNodeModules) {
          console.info(`Building node_modules using ${packageManager}`);
          console.info(`About to run: cd ${out} && ${command}`);
          execSync(`cd ${out} && ${command}`, { stdio: [0, 1, 2] });
        }
      }

      if (transferEnv) copyFileSync(".env", join(out, ".env"));

      console.info("Finished @opensas/sveltekit-adapter-node-iis");
    },
  };
}

const INSTALL_INFO = {
  npm: { lock: "package-lock.json", command: "npm ci --omit dev" },
  pnpm: { lock: "pnpm-lock.yaml", command: "pnpm install --prod" },
  yarn: { lock: "yarn.lock", command: "yarn install --production" },
  bun: { lock: "bun.lockb", command: "bun install --production" },
  "bun (text lock file)": {
    lock: "bun.lock",
    command: "bun install --production",
  },
  deno: { lock: "deno.lock", command: "deno cache --node-modules-dir" },
};

function installInfo(packageManager) {
  if (packageManager === "bun") {
    if (existsSync(INSTALL_INFO["bun"].lock)) return INSTALL_INFO["bun"];
    INSTALL_INFO["bun (text lock file)"];
  }
  const info = INSTALL_INFO[packageManager];
  if (!info) throw new Error(`Unknown packageManager: ${packageManager}`);
  return info;
}
