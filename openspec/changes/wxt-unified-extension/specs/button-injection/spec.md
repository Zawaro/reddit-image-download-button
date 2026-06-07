## MODIFIED Requirements

### Requirement: Only process post pages

The content script SHALL only inject download buttons when the URL contains `/comments/`. It SHALL skip feed views (`/r/*`, `/`, etc.). This requirement is unchanged from the previous implementation.

#### Scenario: Post page detected
- **WHEN** URL contains `/comments/`
- **THEN** content script initializes and starts processing posts

#### Scenario: Feed page skipped
- **WHEN** URL does not contain `/comments/`
- **THEN** content script logs that it's not a post page and returns

### Requirement: Inject download button into post action bar — MODIFIED

The button injection logic SHALL use Firefox's more defensive approach: if a post already has `data-rd-download-processed` attribute but no button exists in its shadow root, the attribute SHALL be removed and injection re-attempted. This handles Reddit SPA re-renders.

#### Scenario: Post re-rendered by Reddit SPA
- **WHEN** a post has `data-rd-download-processed` but its shadow root has no download button
- **THEN** the attribute is removed and injection is re-attempted

### Requirement: Button styling matches Reddit design

Unchanged from previous implementation.

### Requirement: Button shows image count for galleries

Unchanged from previous implementation.

### Requirement: Button shows download progress — MODIFIED

The button state machine SHALL use the 7-state version (previously Chrome-only): `loading` → `probing` → `downloading` → `success` / `notfound` / `error` → `idle` (after 2s auto-reset). Firefox previously had only 4 states; the `probing` (text: "Checking..."), `downloading` (text: "Downloading..."), and `notfound` (text: "Image Not Found") states are now included for both browsers.

#### Scenario: Probing state displayed
- **WHEN** URL extraction completes and probing begins
- **THEN** button shows "Checking..." with spinner icon, button is disabled

#### Scenario: Downloading state displayed
- **WHEN** probing succeeds and download begins
- **THEN** button shows "Downloading..." with spinner icon, button is disabled

#### Scenario: Not found state displayed
- **WHEN** probing finds no available images
- **THEN** button shows "Image Not Found" and resets to idle after 2 seconds

### Requirement: MutationObserver for dynamic content — MODIFIED

The content script SHALL use both a `MutationObserver` on `document.body` with `childList: true, subtree: true` AND a `setInterval(processPosts, 3000)` fallback (previously Firefox-only). The interval ensures dynamic content is captured even if the MutationObserver misses some mutations.

#### Scenario: New post loaded via infinite scroll
- **WHEN** Reddit loads a new `shreddit-post` element via AJAX
- **THEN** either the MutationObserver or the 3-second interval detects it and injects a button

### Requirement: Message passing via WXT's browser API — MODIFIED

The content script SHALL use `browser.runtime.sendMessage()` (from `wxt/browser`) instead of `chrome.runtime.sendMessage()` or `browser.runtime.sendMessage()` directly. The `sendMessageWithRetry` wrapper from `shared/message.ts` SHALL be used for messages to the background (to handle Chrome service worker wake-up latency).

#### Scenario: Download message sent
- **WHEN** user clicks download button and image URLs are extracted
- **THEN** content script sends `{ action: 'probe', urls }` message to background via `sendMessageWithRetry`
