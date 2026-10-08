# Changelog

All notable changes to `@opensas/sveltekit-adapter-node-iis` will be documented in this file.

## [0.5.0] - 2026-10-07

SvelteKit 3 support. Use `0.4.x` for SvelteKit 2 (see the compatibility table in the README).

### Changed

- **BREAKING:** requires `@sveltejs/kit` 3 and Node 22.17+. Depends on `@sveltejs/adapter-node` 6.
- The adapter is configured in the `sveltekit()` options of `vite.config.js` (SvelteKit 3 no longer
  reads `svelte.config.js`).
- `ORIGIN` is gone in adapter-node 6: use `paths.origin` in the SvelteKit config.
- `polyfill` is deprecated and ignored.

### Fixed

- The SvelteKit 3 build: the adapter now keeps the Vite plugin adapter-node 6 returns, which adds
  the server entrypoints to the build. Without it `build/index.js` imported a missing
  `server/adapter-index.js` (same `...na` fix as `0.4.2`).

### Added

- `pnpm test`: builds a minimal SvelteKit app with the adapter and serves it through `server.cjs`
  on the socket passed in `PORT`, as iisnode does.

## [0.4.2] - 2026-10-07

Last planned release for SvelteKit 2. From `0.5.0` on the adapter targets SvelteKit 3; fixes for
SvelteKit 2 are released from the `v0.4.x` branch (see [RELEASING.md](RELEASING.md)).

### Fixed

- The adapter returned only `name` and `adapt`, dropping everything else `@sveltejs/adapter-node`
  returns. With SvelteKit 2 that lost `supports`, so SvelteKit reported that the adapter did not
  support `read` from `$app/server` nor instrumentation.
- `package.json` repository, homepage and bugs point to GitLab.

## [0.4.1] - 2026-07-02

### Fixed

- Added `--ignore-workspace` to the default pnpm build command. Without it, if the
  consuming project has a `pnpm-workspace.yaml` at its root (e.g. just to configure
  `allowBuilds` under pnpm ≥11, with no actual multi-package workspace), pnpm treats
  the nested output folder as part of that same workspace when walking up the
  directory tree. That silently absorbs the `pnpm install --production` step into the
  parent scope — it reports "Already up to date" but installs nothing at all, not even
  production dependencies, shipping a broken `node_modules` to production.

## [0.4.0] - 2025-09-04

### Added

- NEW `copyFiles` now supports folders and { src, target } items
- NEW `buildCommand` option: Allows to override the command used to build `node_modules`
- Fixed file names to make them compatible with Linux and Windows
- Updated default build command for pnpm:
  `pnpm install --production --config.node-linker=hoisted`
  to avoid Windows/IIS symlink issues

## [0.3.0] - 2025-09-02

### Added

- NEW `copyFiles` option: Array of additional files to copy to the output directory
- Fixed file names to make them compatible with Linux and Windows

## [0.2.0] - 2025-09-02

- Initial release
