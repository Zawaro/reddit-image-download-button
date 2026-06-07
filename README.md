# Reddit Image Download

A cross-browser extension (Chrome + Firefox) that adds a **Download** button to Reddit post pages, saving original-quality images directly from `i.redd.it` — bypassing Reddit's preview WebP compression.

## Features

- **Original quality** — Downloads from `i.redd.it` instead of compressed `preview.redd.it` WebP
- **Gallery support** — Download all images from gallery posts in sequence
- **Image probing** — Checks image availability before downloading (catches deleted/expired images)
- **Native look** — Button styled to match Reddit's own UI, injected into the post action bar
- **Save As or Silent/Auto** — Choose between a save dialog per image or automatic download
- **Customizable filenames** — Formats: title, subreddit+title, or image ID
- **Folder organization** — Use `{base}`, `{year}`, `{month}`, `{day}`, `{subreddit}`, `{author}` in folder paths
- **Settings panel** — Toggle download mode, configure paths, enable debug logging

## Installation

<details>
<summary><b>Chrome</b></summary>

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select `.output/chrome-mv3/` from this repository

</details>

<details>
<summary><b>Firefox</b></summary>

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `.output/firefox-mv3/manifest.json` from this repository

</details>

## Usage

1. Navigate to any Reddit post page (`reddit.com/r/.../comments/...`)
2. Click the **Download** button in the post's action bar (next to Share, Save, etc.)
3. Images are saved based on your configured download mode

## Settings

| Setting | Description |
|---|---|
| **Download Mode** | `Save As` — prompts for location each image. `Silent` (Firefox) / `Auto` (Chrome) — downloads automatically to configured folder. |
| **Base Folder** | Relative path inside your browser's Downloads folder (default: `RedditImages`) |
| **Folder Pattern** | Structure using variables: `{base}`, `{year}`, `{month}`, `{day}`, `{subreddit}`, `{author}` |
| **Filename Format** | `Title` — `{truncated_title}_{index}.{ext}`, `Subreddit+Title` — `{subreddit}-{title}_{index}.{ext}`, `Image ID` — `{image_id}.{ext}` |
| **Max Title Length** | Truncate post titles longer than this value (default: 50) |
| **Debug Logging** | Toggle verbose console output (errors are always logged) |

### Default Folder Structure

```
~/Downloads/RedditImages/{year}-{month}/
```

### Folder Pattern Examples

| Pattern | Result |
|---|---|
| `{base}/{year}-{month}` | `RedditImages/2026-06/` |
| `{base}/{subreddit}/{author}` | `RedditImages/pics/username/` |
| `{base}/{year}-{month}/{subreddit}` | `RedditImages/2026-06/pics/` |

### Filename Examples

| Format | Single | Gallery |
|---|---|---|
| Title | `My Photo Title.jpg` | `My Photo Title_1.jpg`, `My Photo Title_2.png` |
| Subreddit+Title | `pics-My Photo Title.jpg` | `pics-My Photo Title_1.jpg` |
| Image ID | `abc123.jpg` | `abc123.jpg` |

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone git@github.com:Zawaro/reddit-image-download-button.git
cd reddit-image-download-button
npm install
```

### Build

```bash
npm run build:chrome    # Build for Chrome → .output/chrome-mv3/
npm run build:firefox   # Build for Firefox → .output/firefox-mv3/
npm run build           # Build for Chrome (default)
```

### Dev Server

```bash
npm run dev:chrome      # Dev server with HMR for Chrome
npm run dev:firefox     # Dev server with HMR for Firefox
npm run dev             # Dev server for Chrome (default)
```

The dev server opens the browser with the extension loaded automatically.

### Project Structure

```
├── entrypoints/
│   ├── background.ts       # Message handler, image probing, download orchestration
│   ├── content.ts          # Button injection, DOM extraction, click handler
│   └── options/
│       ├── index.html      # Settings page
│       ├── options.css
│       └── options.ts
├── shared/
│   ├── button.ts           # Button creation & 7-state machine
│   ├── constants.ts
│   ├── filenames.ts        # Filename sanitization & formatting
│   ├── folderPattern.ts    # Folder path expansion
│   ├── logger.ts           # Debug logging with storage toggle
│   ├── message.ts          # sendMessageWithRetry wrapper
│   ├── storage.ts          # Default settings & storage helpers
│   └── transformUrl.ts     # preview.redd.it → i.redd.it conversion
├── public/icons/
├── wxt.config.ts           # WXT cross-browser configuration
├── tsconfig.json
└── package.json
```

### Tech Stack

- **[WXT](https://wxt.dev/)** — Next-gen web extension framework (Vite + TypeScript)
- **TypeScript** — Strict mode
- **Vanilla DOM** — No UI framework (options page uses plain HTML/CSS/JS)
- **Manifest V3** — Both Chrome and Firefox

## License

MIT — see [LICENSE](LICENSE)

Copyright © Zawaro
