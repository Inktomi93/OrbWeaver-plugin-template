# Orbweaver plugin author support

This file is generated from Orbweaver's executable plugin contracts. Run `orb-plugin support --check <path>` to verify it.

## Runtime worlds

| World | Execution | SDK | Entry point | DOM | Host calls | Local helpers |
| - | - | - | - | - | - | - |
| `main` | `server-quickjs` | `@orb/plugin-sdk/main` | `orb.host(1)` | No | `chat.current`<br>`chat.listMessages`<br>`chat.getVariables`<br>`chat.listCharacters`<br>`chat.applyVariableOps`<br>`chat.surfaceQuickReply`<br>`chat.requestTurn`<br>`worldInfo.listBooks`<br>`worldInfo.listEntries`<br>`worldInfo.upsertEntry`<br>`assets.read`<br>`search.documents`<br>`variables.get`<br>`variables.set`<br>`variables.delete`<br>`storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list`<br>`notifications.post`<br>`imagery.generatePicture`<br>`llm.quiet`<br>`databank.ingest`<br>`character.ingest`<br>`character.ingestAsset`<br>`character.setCardData`<br>`character.getCardData`<br>`events.on`<br>`pubsub.emit`<br>`pubsub.on`<br>`tools.register`<br>`transforms.register`<br>`transforms.registerDisplay`<br>`macros.register`<br>`net.fetch`<br>`net.fetchAsset`<br>`ui.register`<br>`ui.setState`<br>`ui.registerCommand`<br>`ui.toast`<br>`ui.openDialog`<br>`ui.registerFrame` | `clock`<br>`random`<br>`ids`<br>`log`<br>`tokens` |
| `ui` | `browser-quickjs-worker` | `@orb/plugin-sdk/ui` | `orb.ui(1)` | No | `chat.listMessages`<br>`chat.getVariables`<br>`variables.get`<br>`variables.set`<br>`variables.delete`<br>`storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list` | `clock`<br>`random`<br>`log`<br>`tokens`<br>`render`<br>`onEvent` |
| `frame` | `isolated-browser-frame` | `@orb/plugin-sdk/frame` | `parent.postMessage` | Yes | `chat.listMessages`<br>`chat.getVariables`<br>`variables.get`<br>`variables.set`<br>`variables.delete`<br>`storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list` | `orbPluginAssetUrl` |

## Capabilities and host calls

| Capability | Main | Scripted UI | Frame bridge |
| - | - | - | - |
| `chat.read` | `chat.current`<br>`chat.listMessages`<br>`chat.getVariables`<br>`chat.listCharacters` | `chat.listMessages`<br>`chat.getVariables` | `chat.listMessages`<br>`chat.getVariables` |
| `chat.variables.write` | `chat.applyVariableOps` | None | None |
| `chat.quick_reply` | `chat.surfaceQuickReply` | None | None |
| `chat.transform` | `transforms.register`<br>`transforms.registerDisplay`<br>`macros.register` | None | None |
| `worldinfo.read` | `worldInfo.listBooks`<br>`worldInfo.listEntries` | None | None |
| `worldinfo.write` | `worldInfo.upsertEntry` | None | None |
| `global_vars` | `variables.get`<br>`variables.set`<br>`variables.delete` | `variables.get`<br>`variables.set`<br>`variables.delete` | `variables.get`<br>`variables.set`<br>`variables.delete` |
| `storage.kv` | `storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list` | `storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list` | `storage.get`<br>`storage.set`<br>`storage.delete`<br>`storage.compareAndSet`<br>`storage.list` |
| `assets.read` | `assets.read` | None | None |
| `search.query` | `search.documents` | None | None |
| `notify` | `notifications.post` | None | None |
| `ui.surface` | `ui.register`<br>`ui.setState`<br>`ui.registerCommand`<br>`ui.toast`<br>`ui.openDialog` | None | None |
| `ui.frame` | `ui.registerFrame` | None | None |
| `turn.trigger` | `chat.requestTurn` | None | None |
| `imagery.generate` | `imagery.generatePicture` | None | None |
| `llm.quiet` | `llm.quiet` | None | None |
| `databank.ingest` | `databank.ingest` | None | None |
| `character.ingest` | `character.ingest`<br>`character.ingestAsset` | None | None |
| `character.card_state` | `character.setCardData`<br>`character.getCardData` | None | None |
| `events.subscribe` | `events.on` | None | None |
| `plugin_events` | `pubsub.emit`<br>`pubsub.on` | None | None |
| `tools.register` | `tools.register` | None | None |
| `net.fetch` | `net.fetch` | None | None |
| `net.fetch_asset` | `net.fetchAsset` | None | None |

## Event hooks

| Bus | Hook | World |
| - | - | - |
| `chat` | `chatOpened` | `main` |
| `chat` | `messageCommitted` | `main` |
| `chat` | `messageEdited` | `main` |
| `chat` | `variantSelected` | `main` |
| `chat` | `turnStarted` | `main` |
| `chat` | `turnCompleted` | `main` |
| `chat` | `turnAborted` | `main` |
| `chat` | `worldInfoActivated` | `main` |
| `chat` | `personaSwitched` | `main` |
| `chat` | `chatCreated` | `main` |
| `chat` | `reactionsChanged` | `main` |
| `chat` | `messageHidden` | `main` |
| `chat` | `messagesDeleted` | `main` |
| `chat` | `chatUpdated` | `main` |
| `chat` | `wiEntryAttached` | `main` |
| `chat` | `wiEntryDetached` | `main` |
| `domain` | `character.updated` | `main` |
| `domain` | `asset.created` | `main` |
| `domain` | `persona.updated` | `main` |
| `domain` | `world-info.updated` | `main` |

## Prompt transform points

| Point | World |
| - | - |
| `user_input` | `main` |
| `assembled_dynamic` | `main` |

## Surface mounts

| Anchor | Allowed tiers | Registration world |
| - | - | - |
| `settings` | `static`<br>`scripted`<br>`frame` | `main` |
| `chat-flank` | `static`<br>`scripted`<br>`frame` | `main` |
| `chat-settings-section` | `static`<br>`scripted` | `main` |
| `tool-card` | `static`<br>`scripted`<br>`frame` | `main` |
| `message-footer` | `static` | `main` |
| `page` | `static`<br>`scripted`<br>`frame` | `main` |
| `dialog` | `static`<br>`scripted`<br>`frame` | `main` |

## Surface tiers

| Tier | Registrar | Registration world | Execution world |
| - | - | - | - |
| `static` | `ui.register` | `main` | `main` |
| `scripted` | `ui.register` | `main` | `ui` |
| `frame` | `ui.registerFrame` | `main` | `frame` |

## Composer placements

| Target | Registration world |
| - | - |
| `composer-action` | `main` |
| `composer-media` | `main` |
