# Orbweaver plugin starter

This starter has one authored TypeScript source and checked generated JavaScript. Orbweaver can install it directly from its Git URL.

## Make your plugin

1. Select **Use this template** to make your own repository.
2. Clone your repository. Install Node 26 and pnpm 12.6.0, then run `pnpm install --frozen-lockfile`.
3. Give the plugin its own ID, name, and version in `manifest.json`. Edit `src/main.ts`.
4. Run `pnpm build`, then commit the source, manifest, and generated `main.js` together and push.
5. Paste the public Git repository URL into Orbweaver's Plugins screen, review its requested capabilities, then enable it.

Orbweaver reads `manifest.json` and `main.js` from the Git repository. It never runs the repository's build
scripts. CI runs `pnpm check` and refuses missing, stale, or obsolete generated JavaScript without rewriting
it. The GitHub-pinned SDK and toolchain dependencies give your editor types without an Orbweaver installation.

> **Template publication prerequisite:** publish the `plugin-authoring-v0.1.0` GitHub Release with both
> `orb-plugin-sdk-0.1.0.tgz` and `orb-plugin-toolchain-0.1.0.tgz`. This checkout intentionally has no
> `pnpm-lock.yaml` until that one external prerequisite is complete. The template maintainer must then run
> `pnpm install`, commit the resulting lockfile, and keep CI on `--frozen-lockfile`. Until then, the install
> command in step 2 and CI are expected to stop. Do not replace the pinned URLs with local tarballs or commit
> a local-only lockfile.

## Upload an archive (optional)

Run `pnpm run pack` to make `dist/starter.orb-plugin.zip` for manual upload. The archive is generated and untracked.

The default example demonstrates a model tool, a host-rendered settings panel with a shipped image, and a
composer command. See [AUTHORING.md](AUTHORING.md) for lifecycle, hooks, placements, capabilities, runtime
limits, and update rules. [SUPPORT.md](SUPPORT.md) is the checked map of available hooks, host calls,
capabilities, and placement points; `pnpm check` also refuses a stale copy.

For larger working examples, browse Orbweaver's
[showcase plugins](https://github.com/Inktomi93/orbweaver/tree/main/packages/showcase-plugins).
