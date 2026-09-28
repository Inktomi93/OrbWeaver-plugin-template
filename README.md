# Orbweaver server plugin starter

This is a source-first starter repository. Install released `*.orb-plugin.zip` assets; direct Git installation is not supported. `dist/` is generated and intentionally untracked.

## Develop

1. Install Node 26 and pnpm 10.17.1.
2. Run `pnpm install` (the lockfile will be committed when the public 0.1.0 packages are published).
3. Edit the source and its `manifest.json`.
4. Run `pnpm check`, then `pnpm pack`; archives appear in `dist/`.
5. Install the archive from Orbweaver's Plugins screen and grant only the capabilities declared by the manifest.

`host-v1.d.ts` is the public authoring contract copied beside each guest entry. It documents every supported hook, surface anchor, command placement and capability. Keep it in sync when upgrading the Orbweaver SDK.

The default example is a server guest in `src/main.ts`. It demonstrates registered commands and host-mediated outcomes without custom browser code.
