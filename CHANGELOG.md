# Changelog

All notable changes to `@opensas/sveltekit-adapter-node-iis` will be documented in this file.

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
