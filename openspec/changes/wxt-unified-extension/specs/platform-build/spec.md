## ADDED Requirements

### Requirement: WXT config with per-browser manifest

The `wxt.config.ts` SHALL define manifest customizations per browser target:
- Chrome target SHALL use `background.service_worker` (WXT default)
- Firefox target SHALL use `background.scripts` (WXT default for Firefox)
- Firefox target SHALL include `browser_specific_settings` with `gecko.id` and `strict_min_version: "109.0"`
- Both SHALL include permissions: `downloads`, `storage`, `activeTab`
- Both SHALL include host permissions: `https://*.reddit.com/*`, `https://*.redd.it/*`

#### Scenario: Chrome manifest generation
- **WHEN** `wxt -b chrome build` runs
- **THEN** the output `manifest.json` contains `"background": { "service_worker": ... }` and no `browser_specific_settings`

#### Scenario: Firefox manifest generation
- **WHEN** `wxt -b firefox build` runs
- **THEN** the output `manifest.json` contains `"background": { "scripts": [...] }` and `browser_specific_settings.gecko`

### Requirement: WXT entrypoint filtering per browser

The configuration SHALL use WXT's `include`/`exclude` mechanism on entrypoints where needed. Content script and background entrypoints SHALL be shared (included for both). If browser-specific entrypoints are needed, they SHALL use `include: ['chrome']` or `include: ['firefox']`.

#### Scenario: Shared entrypoint built for both
- **WHEN** building for either Chrome or Firefox
- **THEN** all shared entrypoints (content, background, options) are included in the output

### Requirement: Environment variable branching

The codebase SHALL use WXT's built-in environment variables for platform-specific behavior:
- `import.meta.env.CHROME` / `import.meta.env.FIREFOX` — boolean shorthands
- `import.meta.env.BROWSER` — string `'chrome'` or `'firefox'`
- `import.meta.env.MANIFEST_VERSION` — always `3`

#### Scenario: Firefox-specific code path
- **WHEN** `import.meta.env.FIREFOX` is true at build time
- **THEN** Firefox-specific code branches execute
