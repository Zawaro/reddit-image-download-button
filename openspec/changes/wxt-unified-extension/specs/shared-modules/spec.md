## ADDED Requirements

### Requirement: `shared/transformUrl.ts` — preview URL to original URL conversion

The module SHALL export a `transformUrl(url: string): string | null` function. It SHALL convert `preview.redd.it` URLs to `i.redd.it` originals using three regex patterns: versioned (`-v0-{id}.ext`), typed (`-t{num}-{id}.ext`), and simple (`/{id}.ext`). It SHALL pass through `i.redd.it`, `i.imgur.com`, and other URLs unchanged.

#### Scenario: Versioned preview URL transformed
- **WHEN** `transformUrl('https://preview.redd.it/slug-v0-abc123.png')` is called
- **THEN** it returns `'https://i.redd.it/abc123.png'`

#### Scenario: Already original URL passes through
- **WHEN** `transformUrl('https://i.redd.it/abc123.png')` is called
- **THEN** it returns `'https://i.redd.it/abc123.png'`

#### Scenario: Null or empty input
- **WHEN** `transformUrl(null)` or `transformUrl('')` is called
- **THEN** it returns `null`

### Requirement: `shared/filenames.ts` — filename computation utilities

The module SHALL export:
- `sanitizeFilename(str: string): string` — removes illegal characters, trims whitespace
- `truncateTitle(title: string, maxLength: number): string` — truncates with trim
- `computeFilename(format: string, metadata, index: number, total: number, extension: string): string` — computes filename based on format ("title", "subreddit-title", "imageId")
- `getExtensionFromUrl(url: string, fallback?: string): string` — extracts file extension from URL

#### Scenario: Filename computed with title format
- **WHEN** `computeFilename('title', { title: 'My Post', maxTitleLength: 50 }, 0, 2, '.jpg')` is called
- **THEN** it returns `'My Post_1.jpg'`

#### Scenario: Sanitize removes illegal characters
- **WHEN** `sanitizeFilename('file:name/test')` is called
- **THEN** it returns `'filename test'`

### Requirement: `shared/folderPattern.ts` — folder path expansion

The module SHALL export `expandFolderPattern(pattern: string, baseFolder: string, metadata): string`. It SHALL replace variables `{base}`, `{year}`, `{month}`, `{day}`, `{subreddit}`, `{author}` with their values. Also exports `normalizePath(path: string): string` and `toRelativePath(path: string): string`.

#### Scenario: Pattern with date variables
- **WHEN** `expandFolderPattern('{base}/{year}-{month}', 'RedditImages', {})` is called on June 7, 2026
- **THEN** it returns `'RedditImages/2026-06'`

### Requirement: `shared/logger.ts` — debug logging

The module SHALL export a `log` object with `info`, `warn`, and `error` methods. The `info` and `warn` methods SHALL only output when a `debugEnabled` flag is true. The module SHALL expose an `initLogging()` function that reads `debugLogging` from `browser.storage.local` and listens for storage changes.

#### Scenario: Debug logging enabled
- **WHEN** `debugEnabled` is true and `log.info('test')` is called
- **THEN** the message is written to console

#### Scenario: Debug logging disabled
- **WHEN** `debugEnabled` is false and `log.info('test')` is called
- **THEN** nothing is written to console

### Requirement: `shared/button.ts` — button creation and state machine

The module SHALL export SVG icon constants (`DOWNLOAD_ICON`, `CHECK_ICON`, `SPINNER_ICON`), the `REDDIT_BUTTON_CLASSES` string, `createDownloadButton(imageCount, postElement)`, and `setButtonState(btn, state)` with 7 states: `loading`, `probing`, `downloading`, `success`, `notfound`, `error`, `idle`.

#### Scenario: Button created with gallery count
- **WHEN** `createDownloadButton(3, postElement)` is called
- **THEN** a button element is returned with text "Download (3)"

#### Scenario: Button state set to success
- **WHEN** `setButtonState(btn, 'success')` is called
- **THEN** the button is disabled, shows check icon and "Downloaded" text, and resets to idle after 2 seconds

### Requirement: `shared/message.ts` — message passing with retry

The module SHALL export `sendMessageWithRetry(message, retries?)`. On Chrome, it SHALL retry once after 200ms if the service worker is dormant and the first message fails with `chrome.runtime.lastError`. On Firefox, the retry SHALL be a no-op pass-through since persistent background scripts are always active. The retry behavior SHALL be controlled by `import.meta.env.CHROME`.

#### Scenario: Chrome service worker wake-up
- **WHEN** `sendMessageWithRetry({ action: 'probe', urls })` is called and the service worker is dormant
- **THEN** it retries once after 200ms and succeeds on the second attempt
