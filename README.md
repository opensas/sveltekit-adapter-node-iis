# sveltekit-adapter-node-iis

An adapter for SvelteKit that expands the node-adapter for IIS.
It is based on [this StackOverflow answer](https://stackoverflow.com/a/76883862).

Forked from (https://github.com/Vuferen/sveltekit-adapter-node-iis)[https://github.com/Vuferen/sveltekit-adapter-node-iis]

## Usage

Install the adapter

```shell
npm install -D @opensas/sveltekit-adapter-node-iis
```

Use it in 'svelte.config.js'

```js
import adapter from "@opensas/sveltekit-adapter-node-iis";
export default {
  kit: {
    adapter: adapter(),
  },
};
```

## Options

The adapter has the same options as @sveltekit/node-adapter, as well as the following additional options
| Option | Default | Description |
| :----- | :------ | :---------- |
| includePackage | true | Copies package.json and package-lock.json to the output directory. |
| buildNodeModules | false | Builds node_modules in the output directory (npm ci --omit dev). Requires includePackage to be true. |
| transferEnv | false | Copies .env to the output directory. |

Example using options

```js
import adapter from "@opensas/sveltekit-adapter-node-iis";
export default {
  kit: {
    adapter: adapter({ buildNodeModules: true }),
  },
};
```
