## Context

Two separate browser extension repositories exist at `../reddit-image-download-firefox/` and `../reddit-image-download-chrome/`. They share ~90% identical code but diverge in:

- **API namespace**: Firefox uses `browser.*` (native Promises); Chrome uses `chrome.*` (callbacks wrapped in Promises via `wrapCallback`)
- **Image probing**: Firefox has `transformUrl()` in content script with no HTTP probing; Chrome has `probeImages()` in background service worker
- **Button states**: Firefox has 4 states (loading, success, error, idle); Chrome has 7 (loading, probing, downloading, success, notfound, error, idle)
- **Download mode label**: Firefox calls it "Silent"; Chrome calls it "Auto"
- **Fallback polling**: Firefox has `setInterval(processPosts, 3000)`; Chrome does not

Both projects use plain JavaScript with no build tooling, no TypeScript, no package.json.

## Goals / Non-Goals

**Goals:**
- Single TypeScript codebase that builds both Chrome and Firefox extensions
- Use WXT framework for cross-browser build support, unified browser API, and TypeScript
- Extract all pure-logic functions into shared modules usable by content script, background script, and options page
- Unify the button state machine to the richer 7-state version for both browsers
- Enable background image probing for both browsers (was Chrome-only)
- Add the `setInterval` polling fallback for both browsers (was Firefox-only)
- Match all existing functionality — no regressions in download behavior, URL extraction, or settings

**Non-Goals:**
- No new features or behavioral changes beyond what exists in either project
- No UI redesign of options page or button
- No React/Vue/Svelte or other frontend framework — vanilla TypeScript
- No automated testing framework (manual testing only for this migration)
- No CI/CD or automated publishing pipeline

## Decisions

### Decision 1: WXT over CRXJS or Webpack

WXT provides the best cross-browser extension DX in 2025: built-in `browser` API unification, per-browser manifest generation, entrypoint filtering, TypeScript support via Vite, and HMR in dev mode. CRXJS has no API abstractions (requires manual `chrome.*`/`browser.*` handling) and has had maintenance reliability concerns. Webpack requires more manual configuration for the same result.

### Decision 2: Background probing for both browsers

Chrome requires probing in the background service worker (CORS is blocked in content scripts since Chrome 85). Firefox's content scripts are also subject to CORS. Both browsers' background scripts/service workers can bypass CORS via `host_permissions`. Enabling probing for Firefox adds a HEAD request per image but catches 404s early. The performance cost is negligible (~50ms per HEAD request).

### Decision 3: `transformUrl()` as a shared module

Currently duplicated: Firefox has it in `content.js`, Chrome has it in `background.js`. It's a pure string-manipulation function with no DOM or API dependency. By extracting it to `shared/transformUrl.ts`, both content and background entrypoints can import it. The content script calls it before sending URLs to background (for display purposes); the background calls it to confirm the correct URL is probed/downloaded.

### Decision 4: WXT's built-in `browser` API over `webextension-polyfill`

WXT's `browser` export auto-detects whether the runtime provides `browser` (Firefox) or `chrome` (Chrome) and exports accordingly: `const browser = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome`. This is simpler than installing Mozilla's `webextension-polyfill` as a separate dependency and provides identical Promise-based semantics.

### Decision 5: Firefox's async/await pattern for background orchestration

Firefox's `background.js` uses `async/await` throughout (`downloadImages()` is a `for` loop with `await`). Chrome's uses Promise chains (`.then()`). Since the unified codebase uses WXT's Promise-based `browser` API, async/await is more readable and consistent with the rest of the codebase.

### Decision 6: Single options HTML with dynamic label

Rather than maintaining separate HTML files for each browser's download mode label ("Silent" vs "Auto"), use `import.meta.env.BROWSER` in the options TypeScript to set the label text dynamically after page load. This keeps the HTML as a single source of truth.

### Decision 7: Version 2.0.0

This is an architectural rewrite (pure JS → TypeScript, build system introduced, new toolchain). Semver major bump to 2.0.0 communicates the magnitude of change to users and future developers.

### Decision 8: Firefox's more defensive `injectButton` logic

Firefox's `injectButton()` has a re-processing path that removes `PROCESSED_ATTR` when the button isn't found in shadow DOM, handling Reddit SPA re-renders. Firefox's approach is more robust and should be used for both browsers.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| WXT API compatibility with older Firefox versions | Set `strict_min_version: "109.0"` in Firefox manifest (same as current) |
| Chrome service worker wake-up latency causes missed messages | Use `sendMessageWithRetry` wrapper with 1 retry, 200ms delay |
| Reddit DOM changes break URL extraction | The extraction uses multiple fallback patterns; guard with try/catch; log failures |
| TypeScript compilation introduces new bugs | Build and load unpacked in both browsers; test gallery, single image, and text-body image posts |
| WXT version 0.x API changes | Pin WXT version in package.json; review changelog before updates |

## Open Questions

- Should we archive old repos or leave them as-is? (Proposal says obsolete — delete or `.archived` tag?)
- Version 2.0.0 for both, or keep Chrome at 1.0.0 and Firefox at 1.0.2 until the first feature release?
