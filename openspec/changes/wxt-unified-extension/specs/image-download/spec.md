## MODIFIED Requirements

### Requirement: Download single image

Unchanged behavior.

### Requirement: Download multiple gallery images — MODIFIED

Images SHALL be downloaded sequentially (one at a time) with a 100ms delay between downloads. This behavior is unchanged but the implementation SHALL use async/await (Firefox's pattern) rather than Promise chains (Chrome's old pattern).

#### Scenario: Sequential gallery download
- **WHEN** 3 gallery images are requested
- **THEN** they are downloaded one at a time with 100ms delay between each

### Requirement: Use background script for downloads

Unchanged — downloads SHALL be handled by the background entrypoint via `browser.downloads.download()`.

### Requirement: Image probing via HEAD requests — MODIFIED

Image probing SHALL be enabled for both Chrome and Firefox (previously Chrome-only). The background SHALL receive a `{ action: 'probe', urls }` message, call `transformUrl()` from shared module on each URL, issue a HEAD `fetch()` to each, and return availability results.

#### Scenario: Image probing succeeds
- **WHEN** probe message is received with 3 URLs
- **THEN** background issues HEAD requests to all 3 and returns `{ results: [{ available: true, url: ... }, ...] }`

### Requirement: CORS bypass via host_permissions

Both Chrome and Firefox SHALL use `host_permissions: ["https://*.reddit.com/*", "https://*.redd.it/*"]` to enable cross-origin requests from the background. The probing `fetch()` requests SHALL originate from the background script/service worker.

### Requirement: Image URL transformation in background

The background SHALL import `transformUrl()` from `shared/transformUrl.ts` and apply it during probing. This ensures the correct origin URL is used regardless of what the content script sends.

### Requirement: Unified browser API — MODIFIED

The background SHALL use WXT's `browser` API instead of `chrome.downloads.download()` or `browser.downloads.download()` directly. All storage access SHALL use `browser.storage.local`. No `wrapCallback` wrapper is needed — WXT's `browser` API is Promise-based.

#### Scenario: Download initiated via browser.downloads
- **WHEN** background receives `{ action: 'download', urls, metadata }` message
- **THEN** it calls `browser.downloads.download()` for each image sequentially

### Requirement: Service worker lifecycle awareness

Chrome's service worker SHALL re-read settings from storage on each message (no in-memory cache). This is unchanged from the Chrome implementation. Firefox's persistent background SHALL use the same pattern for consistency.

### Requirement: Sequential download orchestration

Unchanged — 100ms delay between sequential downloads.

### Requirement: Message handler for probe/download requests — MODIFIED

The background SHALL handle three message actions:
- `{ action: 'probe', urls }` → probe and return availability (both browsers, was Chrome-only)
- `{ action: 'download', urls, metadata }` → orchestrate download (both browsers)
- `{ action: 'getSettings' }` → return current settings (both browsers)

All message handling SHALL use `browser.runtime.onMessage.addListener` with `return true` for async responses.

#### Scenario: Probe message handled
- **WHEN** background receives `{ action: 'probe', urls: [...] }`
- **THEN** it probes all URLs and responds with results

#### Scenario: Download message handled
- **WHEN** background receives `{ action: 'download', urls, metadata }`
- **THEN** it loads settings, downloads each image sequentially, and responds with results

#### Scenario: GetSettings message handled
- **WHEN** background receives `{ action: 'getSettings' }`
- **THEN** it loads settings from storage and responds
