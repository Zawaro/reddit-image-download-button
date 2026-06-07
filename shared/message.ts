import { browser } from 'wxt/browser';

export function sendMessageWithRetry<T>(
  message: Record<string, unknown>,
  retries = 1,
): Promise<T> {
  return browser.runtime.sendMessage(message).catch((error: unknown) => {
    if (retries > 0) {
      return new Promise<T>((resolve) => setTimeout(resolve, 200)).then(() =>
        sendMessageWithRetry<T>(message, retries - 1),
      );
    }
    throw error;
  }) as Promise<T>;
}
