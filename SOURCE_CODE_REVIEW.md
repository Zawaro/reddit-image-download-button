# Source Code Review Guide

This document assists Mozilla reviewers in building and reviewing the **Reddit Image Download** Firefox extension.

## Build Instructions

### Prerequisites

- Node.js 18+
- npm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Build the extension
npm run build:firefox

# 3. Package for submission (creates extension zip + sources zip)
npm run zip:firefox
```

The built extension will be in `.output/firefox-mv3/`. The submission-ready ZIPs will be in `.output/`.

### Verify the Build

After building, load the extension temporarily in Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `.output/firefox-mv3/manifest.json`

## Project Structure

```
entrypoints/
├── background.ts       # Message handler, image probing, download orchestration
├── content.ts          # Button injection, DOM extraction, click handler
└── options/
    ├── index.html      # Settings page
    ├── options.css
    └── options.ts
shared/
├── button.ts           # Button creation & 7-state machine
├── constants.ts
├── filenames.ts        # Filename sanitization & formatting
├── folderPattern.ts    # Folder path expansion
├── logger.ts           # Debug logging with storage toggle
├── message.ts          # sendMessageWithRetry wrapper
├── storage.ts          # Default settings & storage helpers
└── transformUrl.ts     # preview.redd.it → i.redd.it conversion
public/icons/
wxt.config.ts           # WXT cross-browser configuration
```

## Dependencies

All dependencies are declared in `package.json` and are fetched from the official npm registry during `npm install`:

| Package | Version | License |
|---------|---------|---------|
| [wxt](https://wxt.dev/) | ^0.20.0 | MIT |
| [typescript](https://www.typescriptlang.org/) | ^5.7.0 | Apache 2.0 |
| [wxt/browser](https://wxt.dev/guide/essentials/extension-apis) | (bundled with wxt) | MIT |

No dependencies are modified from their published versions. Only release versions of third-party libraries are used.

## Code Readability

- Source code is written in TypeScript (not minified or obfuscated)
- Build output in `.output/firefox-mv3/` is transpiled + bundled by Vite/WXT for the browser
- The sources ZIP provided with this submission contains the original TypeScript source for review
