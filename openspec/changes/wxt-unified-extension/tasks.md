## 1. Project Scaffold

- [x] 1.1 Create package.json, tsconfig.json, wxt.config.ts manually (openspec dir blocks wxt init)
- [x] 1.2 Verify package.json, tsconfig.json, entrypoints/ exist
- [x] 1.3 Add npm scripts for dev/build targets: `dev:chrome`, `dev:firefox`, `build:chrome`, `build:firefox`
- [x] 1.4 Enable `strict: true` in `tsconfig.json`

## 2. WXT Configuration

- [x] 2.1 Create `wxt.config.ts` with shared permissions (`downloads`, `storage`, `activeTab`) and host permissions (`*.reddit.com`, `*.redd.it`)
- [x] 2.2 Add Firefox-specific manifest block: `browser_specific_settings.gecko` with id and `strict_min_version: "109.0"`, conditional on `browser === 'firefox'`
- [x] 2.3 Add Chrome-specific manifest block: no `browser_specific_settings`, `background.service_worker` handled by WXT default
- [x] 2.4 Copy icon files from old repos to `public/icons/`
- [x] 2.5 Set version to `2.0.0` in both manifests

## 3. Shared TypeScript Modules

- [x] 3.1 Create `shared/constants.ts` — `PROCESSED_ATTR`, `POST_REF_ATTR`, `LOG_PREFIX`
- [x] 3.2 Create `shared/transformUrl.ts` — `transformUrl()` with 3 regex patterns (versioned, typed, simple) extracting from Firefox's content.js
- [x] 3.3 Create `shared/filenames.ts` — `sanitizeFilename()`, `truncateTitle()`, `computeFilename()`, `getExtensionFromUrl()` from Firefox's background.js
- [x] 3.4 Create `shared/folderPattern.ts` — `expandFolderPattern()`, `normalizePath()`, `toRelativePath()` from Firefox's background.js
- [x] 3.5 Create `shared/logger.ts` — `log` object with `initLogging()` reading `browser.storage.local` and listening for changes
- [x] 3.6 Create `shared/button.ts` — `DOWNLOAD_ICON`, `CHECK_ICON`, `SPINNER_ICON`, `REDDIT_BUTTON_CLASSES`, `SPIN_KEYFRAMES`, `createDownloadButton()`, `setButtonState()` with 7 states (loading/probing/downloading/success/notfound/error/idle) from Chrome's content.js
- [x] 3.7 Create `shared/storage.ts` — `DEFAULT_SETTINGS` object (Firefox defaults: saveAs, RedditImages, {base}/{year}-{month}, title, 50, false)
- [x] 3.8 Create `shared/message.ts` — `sendMessageWithRetry()` with `import.meta.env.CHROME` for conditional retry, wrapping `browser.runtime.sendMessage`

## 4. Background Entrypoint

- [x] 4.1 Create `entrypoints/background.ts` — import `transformUrl` from shared, probe images via HEAD `fetch()`, oracle `downloadImages()` with async/await sequential pattern, import `DEFAULT_SETTINGS` from shared storage
- [x] 4.2 Implement `probeImage(url)` and `probeImages(urls)` from Chrome's background.js
- [x] 4.3 Implement `downloadImage(url, filename, saveAs)` using `browser.downloads.download()` (WXT unified API)
- [x] 4.4 Implement `getSettings()` reading from `browser.storage.local.get('settings')` with fallback to defaults
- [x] 4.5 Implement `downloadImages(urls, metadata, settings)` — sequential with 100ms delay, async/await loop from Firefox's pattern
- [x] 4.6 Implement `browser.runtime.onMessage.addListener` handling `probe`, `download`, and `getSettings` actions
- [x] 4.7 Initialize debug logging on load via `initLogging()` from shared logger

## 5. Content Script Entrypoint

- [x] 5.1 Create `entrypoints/content.ts` — import `transformUrl`, button module, logger, message module, constants from shared
- [x] 5.2 Implement `findTextBodyHost(post)` with shadow DOM fallback (Firefox's more verbose logging)
- [x] 5.3 Implement `hasImages(post)` — check gallery, media image, text-body image, video exclusion
- [x] 5.4 Implement `getImageCount(post)` — count gallery items, single image, or text-body images
- [x] 5.5 Implement `extractImageUrl(img)` — read src/data-lazy-src/srcset, pass through `transformUrl()` from shared
- [x] 5.6 Implement `extractGalleryImages(post)`, `extractSingleImage(post)`, `extractTextBodyImages(post)`
- [x] 5.7 Implement `extractPostMetadata(post)` — extract title, author, subreddit, imageIds
- [x] 5.8 Implement `injectButton(post)` — Firefox's defensive re-processing logic, insert after share slot
- [x] 5.9 Implement `processPosts()` and `isPostPage()` — query `shreddit-post`, skip non-`/comments/` URLs
- [x] 5.10 Implement `init()` with MutationObserver + `setInterval(3000)` fallback for both browsers
- [x] 5.11 Wire up `handleDownloadClick` — extract URLs → send `probe` message → filter available → send `download` message → update button state through 7-state machine

## 6. Options Page

- [x] 6.1 Create `entrypoints/options/index.html` — copy from Firefox's `options.html`, update script src to WXT build output
- [x] 6.2 Create `entrypoints/options/options.css` — copy from existing (identical between both)
- [x] 6.3 Create `entrypoints/options/options.ts` — import `DEFAULT_SETTINGS` from shared storage, use `browser.storage.local` (WXT unified API)
- [x] 6.4 Implement dynamic download mode label: `import.meta.env.FIREFOX ? "Silent download" : "Auto"` with corresponding descriptions
- [x] 6.5 Implement `loadSettings()`, `saveSettings()`, `resetSettings()` with `browser.storage.local`
- [x] 6.6 Implement `updatePatternPreview()` with live folder pattern preview

## 7. Build & Verify

- [x] 7.1 Run `npm run build:chrome` — verify clean output in `.output/chrome-mv3/`
- [x] 7.2 Load `.output/chrome-mv3/` as unpacked extension in Chrome — test single image, gallery, and text-body image posts
- [x] 7.3 Run `npm run build:firefox` — verify clean output in `.output/firefox-mv3/`
- [x] 7.4 Load `.output/firefox-mv3/` as temporary addon in Firefox — test same scenarios
- [x] 7.5 Verify buttons appear on post pages, not on feed pages
- [x] 7.6 Verify "Save As" and "Silent"/"Auto" download modes work correctly
- [x] 7.7 Verify settings persist across browser restarts
- [x] 7.8 Verify debug logging toggle works in both browsers
- [x] 7.9 Verify probing catches unavailable images (test with deleted Reddit posts)

## 8. Git & Cleanup

- [x] 8.1 Initialize git repo: `git init && git add . && git commit -m "Initial commit: WXT unified extension v2.0.0"`
- [x] 8.2 Archive old repos: add `.archived` suffix or `mv` to backup location
