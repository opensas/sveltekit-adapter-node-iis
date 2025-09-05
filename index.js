import node_adapter from "@sveltejs/adapter-node";
import { join, dirname, basename } from "node:path";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  lstatSync,
  readdirSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const filesFolder = fileURLToPath(new URL("./files", import.meta.url));

/** @type {import('.').default} */
export default function (opts = {}) {
  const {
    out = "build",
    precompress,
    envPrefix = "",
    polyfill = true,
    includePackage = true,
    buildNodeModules = false,
    buildCommand = "",
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

      copyFileSync(join(filesFolder, "server.cjs"), join(out, "server.cjs"));
      copyFileSync(join(filesFolder, "web.config"), join(out, "web.config"));

      if (copyFiles.length > 0) {
        console.info(`Copying ${copyFiles.length} additional file(s)`);
        copyBuildFiles(copyFiles, out);
        console.log();
      }

      if (includePackage || buildNodeModules) {
        copyBuildFiles("package.json", out);
        console.log();

        const { lock, command } = installInfo(packageManager);
        if (!existsSync(lock)) {
          throw new Error(
            `Lock for ${packageManager} not found: ${lock}. Run '${packageManager} install' to generate it.`
          );
        }

        console.info(`Copying ${packageManager} lock file`);
        copyBuildFiles(lock, out);
        console.log();

        if (buildNodeModules) {
          const buildCmd = buildCommand || command;
          console.info(`Building node_modules using ${packageManager}`);
          console.info(`Running: cd ${out} && ${buildCmd}\r\n`);
          execSync(`cd ${out} && ${buildCmd}`, { stdio: [0, 1, 2] });
        }
      }

      console.info("✅ Finished @opensas/sveltekit-adapter-node-iis");
    },
  };
}

const INSTALL_INFO = {
  npm: { lock: "package-lock.json", command: "npm ci --omit dev" },
  pnpm: {
    lock: "pnpm-lock.yaml",
    // use node-linker=hoisted to avoid Windows/IIS symlink issues
    command: "pnpm install --production --config.node-linker=hoisted",
  },
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

/**
 * Copy files or folders to an output folder.
 *
 * @param {string | {src:string,dest?:string} | Array<string|{src:string,dest?:string}>} items
 * @param {string} out - output folder
 * @param {boolean} dryRun - if true, just log, don't copy
 *
 * copyFile(items, out, dryRun) is a utility function to copy files and folders
 * from a source project to a build or output folder.
 *
 * It supports:
 * - Copying single files
 * - Copying folders (all files inside, non-recursively)
 * - Optional destination override (dest) for flexibility
 *
 * Example Usage
 *
 * copyBuildFiles([
 *   '/config.env',             // single file → preserves structure: config.env => build/config/.env
 *   'iis',                     // folder → copies all files inside, preserves structure: iis/* => build/iis/*
 *   { src: 'iis', dest: '.' }, // folder → copied directly into output root, iis/* => build/*
 *   { src: 'c/file.txt', dest: 'x/new.txt' } // file → renamed in output, c/file.txt => build/x/new.txt
 * ], 'build');
 *
 * By default, files/folders are copied as-is into build
 *
 * Use dest to move or rename files/folders in the output
 *
 */
export function copyBuildFiles(items, out, dryRun = false) {
  const itemsArray = Array.isArray(items) ? items : [items];
  for (const item of itemsArray) {
    const src = typeof item === "string" ? item : item.src;
    const dest = typeof item === "string" ? "" : item.dest || "";

    if (!existsSync(src)) {
      console.warn(`Source not found, skipping: ${src}`);
      continue;
    }

    const stat = lstatSync(src);
    const isSrcFolder = stat.isDirectory();
    const isSrcFile = stat.isFile();

    let matches = [];

    if (isSrcFolder) {
      // Folder → all files inside (non-recursive)
      matches = readdirSync(src)
        .filter((f) => lstatSync(join(src, f)).isFile())
        .map((f) => join(src, f));
    } else if (isSrcFile) {
      matches = [src];
    } else {
      console.warn(`Skipping non-file/non-folder: ${src}`);
      continue;
    }

    for (const srcFilePath of matches) {
      let destFilePath;
      const srcFileName = basename(srcFilePath);

      if (isSrcFolder) {
        // Folder → dest must be folder
        destFilePath = dest
          ? join(out, dest, srcFileName) // copy into dest folder
          : join(out, srcFilePath); // by default, preserve structure
      } else {
        // File → heuristic: dest ends with / or . → folder, else treat as file
        if (!dest) {
          destFilePath = join(out, srcFilePath); // by default, preserve structure
        } else if (dest.endsWith("/") || dest === ".") {
          destFilePath = join(out, dest, srcFileName); // treat dest as folder
        } else {
          destFilePath = join(out, dest); // treat dest as file
        }
      }

      if (dryRun) {
        console.log(`[dry-run] Would copy: ${srcFilePath} → ${destFilePath}`);
      } else {
        const destDir = dirname(destFilePath);
        if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
        copyFileSync(srcFilePath, destFilePath);
        console.log(`✓ Copied: ${srcFilePath} → ${destFilePath}`);
      }
    }
  }
}
