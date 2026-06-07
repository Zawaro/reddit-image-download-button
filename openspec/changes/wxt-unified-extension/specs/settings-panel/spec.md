## MODIFIED Requirements

### Requirement: Settings panel access

Unchanged — accessible via toolbar icon right-click > Options and from extensions management page.

### Requirement: Download mode configuration — MODIFIED

The download mode radio options SHALL be "Save As dialog" (value: `saveAs`) and a dynamic label set via TypeScript: `import.meta.env.FIREFOX ? "Silent download" : "Auto"` (value: `silent` for Firefox, `auto` for Chrome). The Firefox label reads "Download directly to configured folder without dialog". The Chrome label reads "Automatically downloads to configured folder. May show Save As dialog in some cases."

#### Scenario: Firefox settings displays "Silent"
- **WHEN** options page loads and `import.meta.env.FIREFOX` is true
- **THEN** the second radio button label reads "Silent download"

#### Scenario: Chrome settings displays "Auto"
- **WHEN** options page loads and `import.meta.env.FIREFOX` is false
- **THEN** the second radio button label reads "Auto"

### Requirement: Folder pattern configuration

Unchanged behavior and UI.

### Requirement: Filename format selection

Unchanged behavior and UI.

### Requirement: Debug logging toggle

Unchanged behavior and UI.

### Requirement: Settings persistence — MODIFIED

The options page SHALL use `browser.storage.local` (from `wxt/browser`) for all storage operations. No `wrapCallback` wrapper is needed. Default values are unchanged: `saveAs` mode, `RedditImages` base folder, `{base}/{year}-{month}` pattern, `title` format, `50` max title length, `false` debug logging.

#### Scenario: Settings saved
- **WHEN** user clicks "Save Settings" after changing folder pattern
- **THEN** `browser.storage.local.set({ settings })` is called with updated values

#### Scenario: Settings loaded
- **WHEN** options page loads
- **THEN** `browser.storage.local.get('settings')` is called and form fields are populated

### Requirement: Default settings

The `DEFAULT_SETTINGS` constant SHALL be defined in `shared/storage.ts` and imported by both background and options entrypoints. Values are unchanged from the previous implementations (Firefox defaults).

#### Scenario: Settings imported from shared module
- **WHEN** options page and background both need default settings
- **THEN** they import from `shared/storage.ts`
