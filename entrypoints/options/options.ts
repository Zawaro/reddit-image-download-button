import { DEFAULT_SETTINGS, getSettings, saveSettings, resetSettings, type Settings } from '../../shared/storage';

function getEffectiveBaseFolder(): string {
  const input = (document.getElementById('baseFolder') as HTMLInputElement).value.trim();
  return input || DEFAULT_SETTINGS.baseFolder;
}

function updatePatternPreview(): void {
  const pattern =
    (document.getElementById('folderPattern') as HTMLInputElement).value ||
    DEFAULT_SETTINGS.folderPattern;
  const base = getEffectiveBaseFolder();

  let preview = pattern.replace(/\{base\}/g, base);
  const patternVars: Record<string, string> = {
    '{year}': new Date().getFullYear().toString(),
    '{month}': String(new Date().getMonth() + 1).padStart(2, '0'),
    '{day}': String(new Date().getDate()).padStart(2, '0'),
    '{subreddit}': 'subreddit',
    '{author}': 'author',
  };
  for (const [key, value] of Object.entries(patternVars)) {
    preview = preview.replace(new RegExp(`\\${key}`, 'g'), value);
  }

  document.getElementById('pattern-preview-text')!.textContent = preview;
}

async function loadSettings(): Promise<void> {
  try {
    const settings = await getSettings();

    (
      document.querySelector(
        `input[name="downloadMode"][value="${settings.downloadMode}"]`,
      ) as HTMLInputElement
    ).checked = true;
    (document.getElementById('baseFolder') as HTMLInputElement).value = settings.baseFolder;
    (document.getElementById('folderPattern') as HTMLInputElement).value = settings.folderPattern;
    (
      document.querySelector(
        `input[name="filenameFormat"][value="${settings.filenameFormat}"]`,
      ) as HTMLInputElement
    ).checked = true;
    (document.getElementById('maxTitleLength') as HTMLInputElement).value =
      String(settings.maxTitleLength);
    (document.getElementById('debugLogging') as HTMLInputElement).checked =
      settings.debugLogging;

    updatePatternPreview();
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

async function saveSettingsForm(): Promise<void> {
  const settings: Settings = {
    downloadMode: (
      document.querySelector('input[name="downloadMode"]:checked') as HTMLInputElement
    ).value,
    baseFolder:
      (document.getElementById('baseFolder') as HTMLInputElement).value.trim() ||
      DEFAULT_SETTINGS.baseFolder,
    folderPattern:
      (document.getElementById('folderPattern') as HTMLInputElement).value.trim() ||
      DEFAULT_SETTINGS.folderPattern,
    filenameFormat: (
      document.querySelector('input[name="filenameFormat"]:checked') as HTMLInputElement
    ).value,
    maxTitleLength:
      parseInt((document.getElementById('maxTitleLength') as HTMLInputElement).value, 10) ||
      DEFAULT_SETTINGS.maxTitleLength,
    debugLogging: (document.getElementById('debugLogging') as HTMLInputElement).checked,
  };

  try {
    await saveSettings(settings);
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Failed to save settings:', error);
    showStatus('Failed to save settings', 'error');
  }
}

async function resetSettingsForm(): Promise<void> {
  try {
    await resetSettings();
    (
      document.querySelector(
        `input[name="downloadMode"][value="${DEFAULT_SETTINGS.downloadMode}"]`,
      ) as HTMLInputElement
    ).checked = true;
    (document.getElementById('baseFolder') as HTMLInputElement).value =
      DEFAULT_SETTINGS.baseFolder;
    (document.getElementById('folderPattern') as HTMLInputElement).value =
      DEFAULT_SETTINGS.folderPattern;
    (
      document.querySelector(
        `input[name="filenameFormat"][value="${DEFAULT_SETTINGS.filenameFormat}"]`,
      ) as HTMLInputElement
    ).checked = true;
    (document.getElementById('maxTitleLength') as HTMLInputElement).value =
      String(DEFAULT_SETTINGS.maxTitleLength);
    (document.getElementById('debugLogging') as HTMLInputElement).checked =
      DEFAULT_SETTINGS.debugLogging;
    updatePatternPreview();
    showStatus('Settings reset to defaults', 'success');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showStatus('Failed to reset settings', 'error');
  }
}

function showStatus(message: string, type: string): void {
  const status = document.getElementById('status')!;
  status.textContent = message;
  status.className = `status ${type}`;
  setTimeout(() => {
    status.className = 'status hidden';
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  // Set platform-specific label for download mode
  const labelEl = document.getElementById('download-mode-label');
  const descEl = document.getElementById('download-mode-desc');
  const radioEl = document.getElementById('radio-auto') as HTMLInputElement;

  if (import.meta.env.FIREFOX) {
    if (labelEl) labelEl.textContent = 'Silent download';
    if (descEl)
      descEl.textContent =
        'Download directly to configured folder without dialog';
    if (radioEl) radioEl.value = 'silent';
  } else {
    // Chrome defaults: "Auto" (already in HTML)
  }

  const baseFolderInput = document.getElementById('baseFolder') as HTMLInputElement;
  baseFolderInput.placeholder = DEFAULT_SETTINGS.baseFolder;

  loadSettings();

  document.getElementById('settings-form')!.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettingsForm();
  });

  document.getElementById('reset-btn')!.addEventListener('click', resetSettingsForm);

  baseFolderInput.addEventListener('input', updatePatternPreview);
  document.getElementById('folderPattern')!.addEventListener('input', updatePatternPreview);
});
