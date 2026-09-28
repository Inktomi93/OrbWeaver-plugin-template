"use strict";
// This file runs in the server QuickJS guest. It has no Node, DOM, fetch, or module loader.
const host = orb.host(1);
if (host.grants.includes("tools.register")) {
    host.tools.register({
        name: "greet",
        description: "Greet a character by name",
        parameters: {
            type: "object",
            properties: { name: { type: "string" } },
            additionalProperties: false,
        },
        handler: async (args) => {
            const name = typeof args === "object" && args !== null && "name" in args && typeof args.name === "string"
                ? args.name.trim().slice(0, 48)
                : "traveler";
            return `Hello, ${name || "traveler"}.`;
        },
    });
}
if (host.grants.includes("ui.surface")) {
    host.ui.register({
        id: "welcome",
        anchor: "settings",
        title: "Server starter",
        tier: "static",
        spec: {
            kind: "stack",
            gap: "field",
            children: [
                { kind: "image", bundleAsset: "ui/assets/starter-mark.png", alt: "Violet checkerboard starter mark", aspect: "square" },
                { kind: "text", value: "This panel and its shipped image are rendered by Orbweaver from plugin data.", voice: "gloss" },
            ],
        },
    });
    host.ui.registerCommand({
        name: "hello",
        describe: "Show a greeting",
        args: [{ name: "name", type: "string", describe: "Who should be greeted?" }],
        placements: [{ target: "composer-action", label: "Say hello" }],
        onRun: async ({ values }) => {
            const name = typeof values.name === "string" ? values.name.trim().slice(0, 48) : "traveler";
            await host.ui.toast("info", `Hello, ${name || "traveler"}.`);
        },
    });
}
host.log.info("server starter registered");
