import node_adapter from "@sveltejs/adapter-node";
import { join, dirname } from "node:path";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
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
    packageManager = "npm",
    copyFiles = [],
  } = opts;

  /** @type {import('@sveltejs/kit').Adapter} */
  const na = node_adapter({ out, precompress, envPrefix, polyfill });

  return {
    name: "@opensas/sveltekit-adapter-node-iis",

    async adapt(builder) {
      console.info("Running @sveltejs/adapter-node");
      await na.adapt(builder);
      console.info("Finished @sveltejs/adapter-node\r\n");

      console.info("Running @opensas/sveltekit-adapter-node-iis\r\n");

      copyFileSync(join(files, "server.cjs"), join(out, "server.cjs"));
      copyFileSync(join(files, "web.config"), join(out, "web.config"));

      if (copyFiles.length > 0) {
        console.info(`Copying ${copyFiles.length} additional file(s)`);
        for (const file of copyFiles) copyFile(file, out);
        console.log();
      }

      if (includePackage || buildNodeModules) {
        copyFile("package.json", out);
        console.log();

        const { lock, command } = installInfo(packageManager);
        if (!existsSync(lock)) {
          throw new Error(
            `Lock for ${packageManager} not found: ${lock}. Run '${packageManager} install' to generate it.`
          );
        }

        console.info(`Copying ${packageManager} lock file`);
        copyFile(lock, out);
        console.log();

        if (buildNodeModules) {
          console.info(`Building node_modules using ${packageManager}`);
          console.info(`Running: cd ${out} && ${command}\r\n`);
          execSync(`cd ${out} && ${command}`, { stdio: [0, 1, 2] });
        }
      }

      console.info("✅ Finished @opensas/sveltekit-adapter-node-iis");
    },
  };
}

const INSTALL_INFO = {
  npm: { lock: "package-lock.json", command: "npm ci --omit dev" },
  pnpm: { lock: "pnpm-lock.yaml", command: "pnpm install --production" },
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
    return INSTALL_INFO["bun (text lock file)"];
  }
  const info = INSTALL_INFO[packageManager];
  if (!info) throw new Error(`Unknown packageManager: ${packageManager}`);
  return info;
}

function copyFile(file, out) {
  try {
    if (!existsSync(file)) {
      console.warn(`File not found, skipping: ${file}`);
      return;
    }

    const dest = join(out, file);
    const destDir = dirname(dest);

    // Create destination directory recursively
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

    copyFileSync(file, dest);
    console.log(`✓ Copied: ${file} → ${dest}`);
  } catch (error) {
    console.error(`Failed to copy ${file}:`, error.message);
  }
}
