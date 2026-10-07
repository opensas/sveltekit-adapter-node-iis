# Releasing

## Branches and versions

There is one release line per SvelteKit major, because `@sveltejs/adapter-node` (a dependency of
this adapter) has one major per SvelteKit major:

| **Line** | **SvelteKit** | **`@sveltejs/adapter-node`** | **Branch** | **npm dist-tag** |
| :------- | :------------ | :--------------------------- | :--------- | :--------------- |
| `0.5.x`  | `3.x`         | `6.x`                        | `main`     | `latest`         |
| `0.4.x`  | `2.x`         | `5.x`                        | `v0.4.x`   | `kit2`           |

- `main` holds the current line and is published as `latest`.
- `v0.4.x` was branched from the `v0.4.2` tag, the last `0.4.x` released from `main`. Fixes for
  SvelteKit 2 go there and are published with the `kit2` dist-tag, so they never replace `latest`.
- Every published version gets a `vX.Y.Z` tag.

Being `0.x`, `^0.4.1` does not accept `0.5.0`, so SvelteKit 2 projects keep getting `0.4.x` fixes
without jumping to SvelteKit 3 by accident.

## Release from `main` (`latest`)

```bash
git checkout main && git pull
# bump "version" in package.json and add the entry to CHANGELOG.md
pnpm test
git commit -am "X.Y.Z" && git tag vX.Y.Z
git push origin main vX.Y.Z && git push github main vX.Y.Z
npm publish
```

## Release a SvelteKit 2 fix (`v0.4.x`, `kit2`)

```bash
git checkout v0.4.x && git pull
# fix (or cherry-pick from main), bump to 0.4.N, add the entry to CHANGELOG.md
git commit -am "0.4.N" && git tag v0.4.N
git push origin v0.4.x v0.4.N && git push github v0.4.x v0.4.N
npm publish --tag kit2   # without --tag it would become `latest`
```

Add the entry to the `CHANGELOG.md` of `main` too, so the full history stays in one place.
