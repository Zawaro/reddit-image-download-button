export const DOWNLOAD_ICON = `<svg rpl="" aria-hidden="true" fill="currentColor" height="16" width="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0a10 10 0 1010 10A10.011 10.011 0 0010 0zm0 18a8 8 0 118-8 8.009 8.009 0 01-8 8zm1-13v6.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L9 11.586V5a1 1 0 012 0z"></path></svg>`;
export const CHECK_ICON = `<svg rpl="" aria-hidden="true" fill="currentColor" height="16" width="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm4.293 7.293l-4.5 6a.997.997 0 01-1.468.106l-2.5-2.5a.999.999 0 111.414-1.414l1.744 1.744 3.781-5.054a.999.999 0 111.54 1.118z"></path></svg>`;
export const SPINNER_ICON = `<svg rpl="" aria-hidden="true" fill="currentColor" height="16" width="16" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="rd-spinner"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="50" stroke-linecap="round"/></svg>`;

export const REDDIT_BUTTON_CLASSES =
  'button border-sm flex flex-row justify-center items-center h-xl font-semibold relative text-label-2 button-secondary inline-flex items-center px-sm py-xs';

export const SPIN_KEYFRAMES = `
  @keyframes rd-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export type ButtonState =
  | 'loading'
  | 'probing'
  | 'downloading'
  | 'success'
  | 'notfound'
  | 'error'
  | 'idle';

export function injectKeyframes(): void {
  if (document.getElementById('rd-keyframes')) return;
  const style = document.createElement('style');
  style.id = 'rd-keyframes';
  style.textContent = SPIN_KEYFRAMES;
  document.head.appendChild(style);
}

export function createDownloadButton(
  imageCount: number,
  postElement: HTMLElement,
  refAttr: string,
  clickHandler: (e: Event) => void,
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = REDDIT_BUTTON_CLASSES;
  btn.setAttribute('aria-label', 'Download images');
  btn.setAttribute('style', 'height: var(--size-button-sm-h);');

  const text = imageCount > 1 ? `Download (${imageCount})` : 'Download';
  btn.innerHTML = `
    <span class="flex items-center">
      <span class="flex text-body-1 me-2xs">${DOWNLOAD_ICON}</span>
      <span>${text}</span>
    </span>
    <faceplate-screen-reader-content>${text}</faceplate-screen-reader-content>
  `;

  (btn as unknown as Record<string, HTMLElement>)[refAttr] = postElement;
  btn.addEventListener('click', clickHandler);
  return btn;
}

export function setButtonState(btn: HTMLButtonElement, state: ButtonState): void {
  const iconContainer = btn.querySelector<HTMLElement>('.flex.text-body-1.me-2xs');
  const textContainer = btn.querySelector<HTMLElement>(
    '.flex.items-center > span:last-child',
  );
  const screenReader = btn.querySelector<HTMLElement>('faceplate-screen-reader-content');

  if (textContainer && !textContainer.dataset.originalText) {
    textContainer.dataset.originalText = textContainer.textContent ?? 'Download';
  }

  const originalText = textContainer?.dataset.originalText || 'Download';

  switch (state) {
    case 'loading':
      btn.disabled = true;
      if (iconContainer) iconContainer.innerHTML = SPINNER_ICON;
      if (textContainer) textContainer.textContent = 'Loading...';
      if (screenReader) screenReader.textContent = 'Loading...';
      break;
    case 'probing':
      btn.disabled = true;
      if (iconContainer) iconContainer.innerHTML = SPINNER_ICON;
      if (textContainer) textContainer.textContent = 'Checking...';
      if (screenReader) screenReader.textContent = 'Checking images...';
      break;
    case 'downloading':
      btn.disabled = true;
      if (iconContainer) iconContainer.innerHTML = SPINNER_ICON;
      if (textContainer) textContainer.textContent = 'Downloading...';
      if (screenReader) screenReader.textContent = 'Downloading...';
      break;
    case 'success':
      btn.disabled = true;
      if (iconContainer) iconContainer.innerHTML = CHECK_ICON;
      if (textContainer) textContainer.textContent = 'Downloaded';
      if (screenReader) screenReader.textContent = 'Downloaded';
      setTimeout(() => setButtonState(btn, 'idle'), 2000);
      break;
    case 'notfound':
      btn.disabled = true;
      if (textContainer) textContainer.textContent = 'Image Not Found';
      if (screenReader) screenReader.textContent = 'Image not found';
      setTimeout(() => setButtonState(btn, 'idle'), 2000);
      break;
    case 'error':
      btn.disabled = true;
      if (textContainer) textContainer.textContent = 'Failed';
      if (screenReader) screenReader.textContent = 'Failed';
      setTimeout(() => setButtonState(btn, 'idle'), 2000);
      break;
    case 'idle':
    default:
      btn.disabled = false;
      if (iconContainer) iconContainer.innerHTML = DOWNLOAD_ICON;
      if (textContainer) textContainer.textContent = originalText;
      if (screenReader) screenReader.textContent = originalText;
      break;
  }
}
