# sveltekit-adapter-node-iis

An adapter for SvelteKit that expands the node-adapter for IIS. 
It is based on [this StackOverflow answer](https://stackoverflow.com/a/76883862). 

## Usage

Install the adapter
```
npm i -D sveltekit-adapter-node-iis
```

Use it in 'svelte.config.js'
```js
import adapter from "sveltekit-adapter-node-iis";
 
export default {
  kit: {
    adapter: adapter()
  }
};
```
## Options

The adapter has the same options as @sveltekit/node-adapter, as well as the following additional options
| Option | Default | Describtion |
| :----- | :------ | :---------- |
| includePackage | true | Copies package.json and package-lock.json to the output directory. |
| buildNodeModules | false | Builds node_modules in the output directory (npm ci --omit dev). Requires includePackage to be true. |
| transferEnv | false | Copies .env to the output directory. |

Example using options
```js
import adapter from "sveltekit-adapter-node-iis";
 
export default {
  kit: {
    adapter: adapter({buildNodeModules: true})
  }
};
```
