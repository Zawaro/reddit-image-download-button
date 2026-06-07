## Why

Two separate browser extension codebases (Firefox and Chrome) share ~90% identical logic but diverge in API namespace (`browser.*` vs `chrome.*`) and architectural choices (where probing happens, what states the button shows). Maintaining both in parallel creates duplication risk — a bug fix in one must be manually ported to the other. Consolidating into a single TypeScript repository using WXT eliminates the duplication, enables shared modules, and provides a foundation for future features.

## What Changes

- **New repository**: Initialize the current empty directory as a WXT-based TypeScript project
- **Unified codebase**: Merge both extensions into a single `src/` tree with shared TypeScript modules
- **WXT build system**: Use WXT's cross-browser build support — `wxt -b chrome` and `wxt -b firefox` produce separate extension bundles
- **Unified browser API**: Replace `chrome.*` callbacks and `browser.*` Promises with WXT's unified `browser` API (Promise-based everywhere)
- **Background probing for both**: Move image probing (HEAD request) to the background service worker for both browsers (was Chrome-only; Firefox gained this)
- **Richer button states**: Firefox gains the full 7-state button machine (loading → probing → downloading → success/notfound/error → idle)
- **Firefox reliability improvements**: Chrome gains the `setInterval(processPosts, 3000)` fallback for Reddit SPA DOM changes
- **Version bump**: Both become 2.0.0 (architectural change)
- **Old repos obsolete**: `../reddit-image-download-firefox/` and `../reddit-image-download-chrome/` archived

## Capabilities

### New Capabilities

- `wxt-project-setup`: Scaffold WXT project with TypeScript, configure cross-browser builds for Chrome and Firefox
- `shared-modules`: Extract pure-logic functions (URL transformation, filename formatting, folder patterns, settings defaults) into shared TypeScript modules importable by all entrypoints
- `platform-build`: Configure WXT manifest generation per browser (`background.service_worker` vs `background.scripts`, `browser_specific_settings`), entrypoint filtering, and environment variable branching

### Modified Capabilities

- `button-injection`: Content script rewritten in TypeScript, uses unified `browser` API, full 7-state machine shared by both browsers, `setInterval` fallback
- `image-url-extraction`: DOM parsing functions remain in content script but import `transformUrl()` from shared modules; `transformUrl()` lives in shared module used by both content and background
- `image-download`: Background handler rewritten in TypeScript with unified API; probing enabled for both browsers; download orchestration uses consistent async/await (Firefox's pattern)
- `settings-panel`: Options page rewritten in TypeScript with WXT's `browser.storage.local`; only platform branch is the download mode label ("Silent" vs "Auto")

## Impact

- **Source control**: New git repo at `reddit-image-download-button/`; old repos archived
- **Build dependencies**: Node.js, WXT, TypeScript, Vite — replaces zero-dependency pure JS approach
- **Development workflow**: `wxt -b chrome dev` and `wxt -b firefox dev` for dev servers; `wxt build` for production
- **Testing**: Both Chrome and Firefox dev versions can be loaded unpacked from `dist/` directories
- **API surface**: All `chrome.*` callbacks replaced by Promise-based `browser.*` via WXT
