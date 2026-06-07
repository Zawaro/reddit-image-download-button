## ADDED Requirements

### Requirement: WXT project scaffolded with TypeScript

The project SHALL be initialized using `npx wxt@latest init` with the vanilla TypeScript template. The initial scaffold SHALL include `package.json`, `tsconfig.json`, `wxt.config.ts`, and the `entrypoints/` directory structure.

#### Scenario: Project initialized
- **WHEN** `npx wxt@latest init .` runs with TypeScript template
- **THEN** the directory contains `package.json` with WXT dependency, `tsconfig.json`, `wxt.config.ts`, and `entrypoints/`

### Requirement: npm scripts for dev and build

The `package.json` SHALL define scripts for development and production builds for both Chrome and Firefox:
- `dev:chrome` → `wxt -b chrome`
- `dev:firefox` → `wxt -b firefox`
- `build:chrome` → `wxt -b chrome build`
- `build:firefox` → `wxt -b firefox build`
- `dev` → `wxt` (defaults to chrome)
- `build` → `wxt build`

#### Scenario: Chrome dev server starts
- **WHEN** `npm run dev:chrome` is executed
- **THEN** WXT dev server starts and builds for Chrome target

#### Scenario: Firefox dev server starts
- **WHEN** `npm run dev:firefox` is executed
- **THEN** WXT dev server starts and builds for Firefox target

### Requirement: TypeScript strict mode

The `tsconfig.json` SHALL have `strict: true` enabled. All source files SHALL be TypeScript (`.ts`). HTML and CSS files SHALL remain as-is.

#### Scenario: TypeScript compilation succeeds
- **WHEN** `npm run build:chrome` is executed
- **THEN** WXT compiles TypeScript without errors and produces output in `dist/chrome/`

### Requirement: dist/ output directories

The WXT build output SHALL go to `dist/chrome/` for Chrome builds and `dist/firefox/` for Firefox builds. Each contains a complete, loadable extension with manifest, compiled JS, HTML, CSS, and icons.

#### Scenario: Chrome build output
- **WHEN** `npm run build:chrome` completes
- **THEN** `dist/chrome/` contains `manifest.json`, JS files, and assets

#### Scenario: Firefox build output
- **WHEN** `npm run build:firefox` completes
- **THEN** `dist/firefox/` contains `manifest.json`, JS files, and assets
