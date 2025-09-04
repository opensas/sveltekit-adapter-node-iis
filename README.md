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

| **Option**         | **Default** | **Description**                                                                                                  |
| :----------------- | :---------- | :--------------------------------------------------------------------------------------------------------------- |
| `includePackage`   | `true`      | Copies `package.json` and `package-lock.json` to the output directory.                                           |
| `buildNodeModules` | `false`     | Builds `node_modules` in the output directory. Asumes `includePackage` to be `true`.                             |
| `buildNodeCommand` | `"npm"`     | Allows to override the command used to build `node_modules`.                                                     |
| `packageManger`    | `npm`       | Package manager to use. Options `npm` `pnpm` `yarn` `bun` `deno`                                                 |
| `copyFiles`        | `[]`        | Array of additional files to copy to the output directory (e.g., `["prisma/schema.prisma", ".env.production"]`). |

Default build command for each package manager:

| **Package Manager** | **Command**                     |
| ------------------- | ------------------------------- |
| `npm`               | `npm ci --omit dev`             |
| `pnpm`              | `pnpm install --production`     |
| `yarn`              | `yarn install --production`     |
| `bun`               | `bun install --production`      |
| `deno`              | `deno cache --node-modules-dir` |

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
