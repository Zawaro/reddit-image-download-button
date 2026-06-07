import { browser } from 'wxt/browser';

let debugEnabled = false;

export const log = {
  info: (msg: string, ...args: unknown[]) =>
    debugEnabled && console.log(`[Reddit Image Download] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    debugEnabled && console.warn(`[Reddit Image Download] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[Reddit Image Download] ${msg}`, ...args),
};

export const logBg = {
  info: (msg: string, ...args: unknown[]) =>
    debugEnabled && console.log(`[Reddit Image Download BG] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    debugEnabled && console.warn(`[Reddit Image Download BG] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[Reddit Image Download BG] ${msg}`, ...args),
};

export async function initLogging(): Promise<void> {
  try {
    const result = await browser.storage.local.get('settings');
    debugEnabled = (result.settings as Record<string, unknown>)?.debugLogging === true;
  } catch {
    // Logging init must not block anything
  }

  browser.storage.onChanged.addListener((changes) => {
    const newSettings = changes.settings?.newValue as Record<string, unknown> | undefined;
    if (newSettings?.debugLogging !== undefined) {
      debugEnabled = newSettings.debugLogging === true;
    }
  });
}
