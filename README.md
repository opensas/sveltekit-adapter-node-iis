# @opensas/sveltekit-adapter-node-iis

An adapter for SvelteKit that expands the node-adapter for IIS hosting.
Based on [this StackOverflow answer](https://stackoverflow.com/a/76883862).

Forked from [Vuferen/sveltekit-adapter-node-iis](https://github.com/Vuferen/sveltekit-adapter-node-iis)

## 🚀 What This Adapter Does

This adapter extends `@sveltejs/adapter-node` with IIS-specific functionality:

- **IIS Configuration**: Generates a `web.config` file for IIS Node.js hosting
- **Server Entry Point**: Provides a `server.cjs` file optimized for IIS
- **Production Ready**: Copies necessary files and can install production dependencies
- **Flexible File Copying**: Optionally copies additional files needed for deployment
- **Multi-Package Manager Support**: Works with npm, pnpm, yarn, bun, and deno

## 📦 Installation

```shell
npm install -D @opensas/sveltekit-adapter-node-iis
```

## 🧩 Compatibility

| **Adapter** | **SvelteKit** | **`@sveltejs/adapter-node`** | **Node**  |
| :---------- | :------------ | :--------------------------- | :-------- |
| `0.5.x`     | `3.x`         | `6.x`                        | `>=22.17` |
| `0.4.x`     | `2.x`         | `5.x`                        | `>=18`    |

`@sveltejs/adapter-node` is installed as a dependency of this adapter, so there is nothing else to install.
Being `0.x`, a `^0.4.1` range never resolves to `0.5.0`: SvelteKit 2 projects stay on `0.4.x`.
To install the SvelteKit 2 line explicitly: `npm install -D @opensas/sveltekit-adapter-node-iis@kit2`.

## ⚙️ Usage

In your svelte.config.js:

```js
import adapter from "@opensas/sveltekit-adapter-node-iis";

export default {
  kit: {
    adapter: adapter({
      // your options here
    }),
  },
};
```

## Options

| **Option**         | **Default**                  | **Description**                                                                                   |
| :----------------- | :--------------------------- | :------------------------------------------------------------------------------------------------ |
| `includePackage`   | `true`                       | Copies `package.json` and the lock file for the selected package manager to the output directory. |
| `buildNodeModules` | `false`                      | Builds `node_modules` in the output directory. Assumes `includePackage` to be `true`.             |
| `buildCommand`     | `(package manager specific)` | Allows overriding the command used to build `node_modules`.                                       |
| `packageManager`   | `npm`                        | Package manager to use. Options `npm` `pnpm` `yarn` `bun` `deno`                                  |
| `copyFiles`        | `[]`                         | Array of additional files, folders, or { src, dest } objects to copy to the output directory.     |

### `copyFiles` option

The `copyFiles` setting accepts a mix of file paths, folder paths, or objects.  
Each object must have a `src` property (source path) and may optionally include a `dest` property (destination path inside the output folder).

By default, `copyFiles` reproduces the structure of the source directory under the output folder.  
If you want to rename or relocate a file/folder in the build output, provide a `dest` property.

> When copying folders, only files directly inside are copied (non-recursive).

#### Example

```js
adapter = iisAdapter({
  includePackage: true,
  buildNodeModules: true,
  copyFiles: [
    "prisma/schema.prisma", // single file → preserved: build/prisma/schema.prisma
    "iis", // folder → copies all files inside: build/iis/*
    { src: "iis", dest: "." }, // folder → copied into output root: build/*
    { src: "a/b.txt", dest: "c/d.txt" }, // file → renamed in output: build/c/d.txt
  ],
});
```

Default build command for each package manager:

| **Package Manager** | **Command**                                                 |
| ------------------- | ----------------------------------------------------------- |
| `npm`               | `npm ci --omit dev`                                         |
| `pnpm`              | `pnpm install --production --config.node-linker=hoisted --ignore-workspace` \* |
| `yarn`              | `yarn install --production`                                 |
| `bun`               | `bun install --production`                                  |
| `deno`              | `deno cache --node-modules-dir`                             |

> `*` Using `--config.node-linker=hoisted` creates a flat `node_modules` layout (like npm/yarn), avoiding symlink issues on Windows/IIS and ensuring compatibility.

## 💡 Example Configuration

```js
import adapter from "@opensas/sveltekit-adapter-node-iis";

export default {
  kit: {
    adapter: adapter({
      includePackage: true,
      buildNodeModules: true,
      packageManager: "pnpm",
      copyFiles: [
        ".env.production",
        "prisma/schema.prisma",
        "config/production.json",
      ],
    }),
  },
};
```

## 🏗️ How It Works

- Runs Standard Node Adapter: First uses @sveltejs/adapter-node to create the base build

- Adds IIS Support: Copies web.config and server.cjs files optimized for IIS

- Handles Dependencies: Optionally copies package files and installs production dependencies

- Copies Additional Files: Includes any extra files specified in copyFiles option

- Ready for Deployment: Outputs a complete, self-contained build folder ready for IIS

## 🛠️ Development

```shell
# Clone the repository
git clone https://github.com/opensas/sveltekit-adapter-node-iis.git

# Install dependencies
pnpm install

# Link locally for testing
pnpm link
```

## 📝 License

GPL-3.0-or-later - see [LICENSE](LICENSE) for details.
