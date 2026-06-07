import { browser } from 'wxt/browser';

export interface Settings {
  downloadMode: string;
  baseFolder: string;
  folderPattern: string;
  filenameFormat: string;
  maxTitleLength: number;
  debugLogging: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  downloadMode: 'saveAs',
  baseFolder: 'RedditImages',
  folderPattern: '{base}/{year}-{month}',
  filenameFormat: 'title',
  maxTitleLength: 50,
  debugLogging: false,
};

export async function getSettings(): Promise<Settings> {
  try {
    const result = await browser.storage.local.get('settings');
    const settings = (result.settings as Partial<Settings>) ?? {};
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      baseFolder: settings.baseFolder || DEFAULT_SETTINGS.baseFolder,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ settings });
}

export async function resetSettings(): Promise<void> {
  await browser.storage.local.set({ settings: DEFAULT_SETTINGS });
}
