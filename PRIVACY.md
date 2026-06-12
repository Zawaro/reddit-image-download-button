# Privacy Policy

**Reddit Image Download** does not collect, store, transmit, or share any personal data.

## Data Handling

- **No data collection**: The extension does not collect any personal information, browsing history, or usage statistics.
- **Local storage only**: User settings (download mode, folder patterns, filename preferences) are stored locally in your browser's `browser.storage.local` and are never transmitted anywhere.
- **Image downloads**: When you click the Download button, the extension fetches the image URL from Reddit's CDN (`i.redd.it`) directly via the browser's download manager. No data passes through our servers — the extension has no backend.
- **Debug logging**: If enabled in settings, log output is written to your browser's local console only. It is never sent externally.
- **Network requests**: The extension makes HEAD requests to `i.redd.it` solely to verify image availability before downloading. These requests contain no user identifiers, cookies, or tracking parameters.

## Third-Party Services

The extension interacts with the following third-party services only in response to explicit user actions:

- **Reddit CDN (`i.redd.it`, `preview.redd.it`)**: Image URLs you click to download are fetched from Reddit's content delivery network. This is the same CDN Reddit itself uses to serve images in your browser.
- **Reddit website (`*.reddit.com`)**: The content script runs on Reddit post pages to inject the download button. No data is extracted beyond what is visible on the page (image URLs, post title, author, subreddit name).

## Contact

If you have questions about this privacy policy, please open an issue on the [GitHub repository](https://github.com/Zawaro/reddit-image-download-button).

---

*Last updated: June 2026*
