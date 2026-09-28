# Authoring an Orbweaver server plugin

This repository is both source code and a directly installable plugin. You author `manifest.json` and
`src/main.ts`. `pnpm build` writes deterministic root `main.js`. Commit all three. Orbweaver fetches the
built root files from Git and never installs dependencies or runs build scripts from the repository.

The exact TypeScript contract comes from `@orb/plugin-sdk/main`. This guide explains how the pieces work and
where to look; the SDK remains the authority for function signatures and data shapes.

## The shortest complete workflow

1. Change the plugin identity and description in `manifest.json` before distributing your copy.
2. Edit `src/main.ts`.
3. Increase `manifest.json`'s `version` for every distributed behavior or asset change.
4. Run `pnpm build` once. It typechecks the main runtime and atomically refreshes root `main.js`.
5. Commit `manifest.json`, `src/main.ts`, and `main.js`, then push.
6. Paste the public repository URL into Orbweaver's Git install field. Review the requested capabilities and
   enable the plugin.

CI runs `pnpm check`. That command does not rewrite files; it fails when generated JavaScript is missing,
stale, or obsolete. `pnpm run pack` is optional and writes an ignored ZIP for manual upload or a bundle URL.

## Repository and install layout

```text
manifest.json       authored identity, version, capabilities, and entry declarations
src/main.ts         authored server-guest source
main.js             generated, committed install entry
ui/assets/          optional flat raster images shipped with the plugin
package.json        author-only build commands and pinned toolchain URLs
tsconfig.json       editor world for @orb/plugin-sdk/main
```

The install root admits `manifest.json`, `main.js`, optional `ui.js`, and flat raster images under
`ui/assets/`. TypeScript, package metadata, and documentation are author inputs rather than guest runtime
entries. The runtime has no module loader, so emitted entry files are self-contained scripts.

## Identity, versions, and updates

`manifest.json` controls the installed plugin:

- `id` is a lowercase slug, 2–20 characters, unique per installer. Changing it creates a separate plugin,
  separate grants, and separate private storage.
- `name` is the human label; `description` is shown beside the consent request.
- `version` is exactly `major.minor.patch`. Increase it whenever distributed bytes change. An existing install
  treats a greater version with the same `id` as an update and rejects downgrades.
- `hostVersion` is currently `1`; `entry` is exactly `main.js`.
- `capabilities` is the closed set the plugin asks for. Declaring a capability does not grant it.
- `netHosts` is required when asking for `net.fetch` or `net.fetch_asset`. It contains exact hostnames, at
  most 16; it is part of the consent display.
- `matchAutomationEvents` defaults to `false`. Set it only when event handlers should receive automation-
  caused facts as well as human-caused facts.
- Optional `builtAgainst` provenance is display information, not an install gate.

An update preserves plugin-private storage and grants that are still declared. Removing a capability removes
that reach. Adding a capability or network host disables the plugin until the installer reviews the wider
request. A running Orbweaver server can install, update, grant, and enable a prebuilt plugin without restart.
After pushing a greater manifest version and its generated entries to the same public Git source, use
**Check for updates** on the installed plugin and then **Update**. Keep the ID unchanged when the new commit
is meant to replace the existing install.

## Lifecycle and grant guards

Top-level `main.js` runs when the plugin activates. Register tools, events, transforms, macros, surfaces, and
commands there. Those registrations are resident only while the plugin is enabled; disabling or updating
tears them down, and enabling activates the new bundle again.

An ungranted host function throws. Guard every activation-time registration with the grant it needs:

```ts
const host = orb.host(1);

if (host.grants.includes("tools.register")) {
  host.tools.register({ /* ... */ });
}
```

The default example independently guards its tool and UI registrations, so granting one capability does not
make the other half crash. Use the same pattern when a feature needs several capabilities. A plugin with no
grants may log that it is dormant, but must otherwise remain harmless.

Invocation handlers can fail because a provider is down, a grant changed, a room handle is absent, a quota
was reached, or an operation became a confirmation request. Catch expected failures, log useful context, and
return a safe result. Three consecutive crashed invocations auto-disable a plugin. Every host call has a
five-second outer bound, at most 32 host calls may be in flight per invocation, and handlers have CPU and
settlement deadlines.

## The main runtime

`src/main.ts` runs in a server-side QuickJS guest. Its only application door is `orb.host(1)`.

Orbweaver has three separate author worlds. This starter intentionally uses only the first:

| World | Entry | Door | Purpose |
| --- | --- | --- | --- |
| Server guest | `main.js` | `orb.host(1)` | Effects, tools, events, static house UI, and commands |
| Scripted UI guest | optional `ui.js` | `orb.ui(1)` | Local house-tree computation without DOM access |
| Isolated frame script | embedded in `main.js` | DOM plus typed frame messages | Custom pixels inside an opaque-origin document |

Use the visual template before adding `ui.ts` or frame code: it already has separate compiler worlds,
matching manifests, and a frame injection example. Do not add DOM types to this main program.

Author runtime entries as TypeScript scripts without imports or exports. JSX is not an authoring boundary:
house UI uses typed object trees, while a custom frame supplies an HTML string and a separately checked DOM
script. The toolchain emits the self-contained JavaScript that Orbweaver installs.

Available deterministic seams:

- `host.clock.nowEpochMs()` for time
- `host.random.next()` for random numbers
- `host.ids.mint()` for new opaque identifiers
- `host.tokens.count(text)` for a deterministic token-count estimate
- `host.log.info`, `warn`, and `error`

Unavailable globals include Node APIs, `require`, imports, exports, DOM APIs, `fetch`, timers, `Date`,
`performance`, and `Math.random`. Use the host seam that owns the effect. Source files cannot import helpers;
keep the entry self-contained or bundle before the Orbweaver compiler stage.

Chat handles returned by `host.chat.current()` are opaque, invocation-scoped tokens. Pass them back during the
same invocation. Do not persist, compare, or invent them.

## Supported hooks

### Model tools

`host.tools.register` exposes a model-callable tool. The host prefixes its local name with the plugin slug.
The parameter object is JSON Schema, but handler input is still `unknown`; validate and clamp it before use.
The handler returns the exact string the model receives. Capability: `tools.register`.

### Event subscriptions

`host.events.on(type, handler)` subscribes during activation. Capability: `events.subscribe`.

The complete chat and domain event names are in [SUPPORT.md](SUPPORT.md#event-hooks); that generated map is checked by `pnpm check`.

Facts are prefiltered to what the installer may observe. Fields vary by event, so read optional payload arms
only after checking them. Domain facts may have no chat scope. Event delivery has no author-visible timer or
scheduler; time-driven behavior belongs in the application's automation system.

### Prompt and display transforms

`host.transforms.register` hooks `user_input` or `assembled_dynamic`. It may return rewritten text or
`{ abort: reason }`. The deadline is 250 ms, failures skip the transform, and it applies only in rooms the
installer hosts. `host.transforms.registerDisplay` rewrites only the installer's rendered view, before
markdown; it does not change chat canon. Capability: `chat.transform`.

### Value macros

`host.macros.register` resolves a no-argument value macro once per turn. Its public name is namespaced by the
plugin slug. Failure or timeout becomes an empty string. Capability: `chat.transform`.

### Private plugin events

`host.pubsub.emit(name, data)` publishes on this plugin's installer-private channel. `host.pubsub.on(slug,
name, handler)` listens to another plugin owned by the same installer. Subscribers have no implied chat
scope, so the payload must contain everything they need. Capability: `plugin_events`.

### Static house UI and actions

`host.ui.register` asks Orbweaver to render a typed house surface. Static surfaces carry a `spec`; state
bindings such as `{ $state: "count" }` resolve against the latest `host.ui.setState`. Passing a chat handle
to `setState` makes state room-specific; omitting it publishes plugin-wide state. `onAction` handles house
buttons and form submissions on the server side. Capability: `ui.surface`.

See [SUPPORT.md](SUPPORT.md#surface-mounts) for the exact anchor and tier matrix.

The house node vocabulary includes layout (`stack`, `row`, `section`), display (`text`, `badge`, `meter`,
`keyValue`, `list`, `image`, `markdown`, `icon`), controls (`textField`, `numberField`, `toggle`, `select`,
`tabs`, `slider`, `button`, `confirmButton`), and browse structures (`grid`, `masterDetail`, `searchBar`). The
SDK defines the allowed fields. A spec is limited to 32 KiB, 256 nodes, and depth 8. A message footer is
static-only and further limited to 8 nodes and depth 2.

### Commands and placements

`host.ui.registerCommand` creates `/plugin <slug> <name>`, a Plugins menu entry, and a command-palette entry.
Declare up to 16 typed arguments (`string`, `number`, `enum`, or `boolean`); `values` contains validated
values while `args` retains the raw remainder. Optional `group` organizes the attributed Plugins menu.

Composer targets are the closed, checked list in [SUPPORT.md](SUPPORT.md#composer-placements).

Each placement has a bounded label and a curated SDK icon. A target may appear at most once per command. The
host owns attribution, overflow, keyboard behavior, and invocation; plugins cannot create arbitrary chrome.

`host.ui.toast` is transient, plugin-attributed, limited to 200 characters, and rate-limited. Durable notices
use `host.notifications.post`. `host.ui.openDialog` can open only this plugin's registered `dialog` surface
and only as the result of a person-initiated round trip.

## Capabilities and host namespaces

[SUPPORT.md](SUPPORT.md#capabilities-and-host-calls) lists every capability and the calls each runtime can make.

Room-state writes have a separate authority check. `chat.applyVariableOps` and quick replies refuse when the
installer is not the room host. World-info writes, turn requests, and image generation become attributed
confirmation cards instead of silently acquiring authority. Installer-owned library writes and quiet model
calls do not require room-host authority.

Rate backstops include 360 `net.fetch` calls/hour, 1,200 `net.fetchAsset` calls/hour, 30 `llm.quiet`
calls/hour, and 120 `search.documents` calls/hour per plugin. Debounce event-driven work before spending.
Use `storage.compareAndSet` when the next stored value depends on the previous value.

## Assets

Runtime APIs return installer-owned asset IDs. Those IDs can feed supported house image fields and can be
read only with `assets.read`. `net.fetchAsset` downloads a validated allowlisted image and returns an ID;
`imagery.generatePicture` also returns an ID.

Put shipped PNG, JPEG, GIF, or WebP images directly under `ui/assets/`; nested directories are refused. Name
one from an image node, declared grid tile, or detail-stage hero with
`bundleAsset: "ui/assets/starter-mark.png"`. The path is a typed installed-asset name, not a URL or filesystem
location. Orbweaver maps it to this plugin's installer-owned asset at render time. Do not use arbitrary URLs
in image nodes, and do not put a bundle path into `assetId`.

The default settings panel renders `ui/assets/starter-mark.png`, so both Git installation and optional ZIP
packing exercise the same admitted asset path.

## Example map

The default plugin demonstrates three independent activation registrations:

- `greet` validates model-supplied `unknown` input and returns a model-readable string.
- `welcome` is a static `settings` surface rendered entirely by Orbweaver, including a shipped
  `bundleAsset` image.
- `hello` is a typed command also placed in `composer-action`; it returns feedback through a house toast.

Each registration is separately grant-guarded. Remove capabilities from the manifest when removing the
corresponding feature.

## Packaging and limits

`pnpm run pack` creates `dist/server-starter.orb-plugin.zip` from current TypeScript without changing root
`main.js`. Run `pnpm check` first if the repository itself is also a distribution source. Installation still
performs authoritative manifest, entry, size, and capability validation.

The manifest is limited to 64 KiB; `main.js` and optional `ui.js` are each limited to 1 MiB. Plugin slugs are
2–20 characters, names at most 80 characters, descriptions at most 500, and authors at most 120. The exact
limits and field shapes live in the installed SDK and Orbweaver's install validator.

## Troubleshooting

- If `pnpm check` reports stale or missing generated output, run `pnpm build` and commit `main.js` with the
  TypeScript and manifest change. Do not hand-edit generated JavaScript.
- If Git installation cannot find the plugin, confirm `manifest.json`, `main.js`, and every referenced flat
  raster under `ui/assets/` are committed at the repository root. Orbweaver does not build fetched source.
- If activation reports a refused host call, declare the matching capability, guard registration with
  `host.grants`, and have the installer review the request. Do not cast around the SDK contract.
- If an update is not offered, keep the installed ID, increase the three-part manifest version, commit all
  changed generated entries and assets, push that commit, and run **Check for updates** again.
- If an image is missing, use a committed flat `ui/assets/<name>` path in `bundleAsset`; do not pass a URL or
  an asset ID there.

The [showcase plugins](https://github.com/Inktomi93/orbweaver/tree/main/packages/showcase-plugins) provide
larger examples against the same SDK and toolchain. Use [SUPPORT.md](SUPPORT.md) for the checked capability,
hook, host-call, surface, and placement registry rather than inferring support from a declaration alone.
