import { browser } from 'wxt/browser';
import { transformUrl } from '../shared/transformUrl';
import { expandFolderPattern, toRelativePath } from '../shared/folderPattern';
import { computeFilename, getExtensionFromUrl } from '../shared/filenames';
import { logBg, initLogging } from '../shared/logger';
import { getSettings, type Settings } from '../shared/storage';

export default defineBackground(() => {
  initLogging();

  function probeImage(url: string) {
    const transformedUrl = transformUrl(url) ?? url;
    return fetch(transformedUrl, { method: 'HEAD' }).then(
      (response) => ({
        available: response.ok,
        url: transformedUrl,
        originalUrl: url,
        status: response.status,
      }),
      (error: Error) => ({
        available: false,
        url: transformedUrl,
        originalUrl: url,
        error: error.message,
      }),
    );
  }

  function probeImages(urls: string[]) {
    return Promise.all(urls.map(probeImage));
  }

  async function downloadImage(
    url: string,
    filename: string,
    saveAs: boolean,
  ) {
    try {
      const relativeFilename = toRelativePath(filename);
      const downloadOptions: Record<string, unknown> = {
        url,
      };

      if (saveAs) {
        downloadOptions.saveAs = true;
      } else {
        downloadOptions.filename = relativeFilename;
        downloadOptions.conflictAction = 'uniquify';
      }

      const downloadId = await browser.downloads.download(
        downloadOptions as Parameters<typeof browser.downloads.download>[0],
      );
      logBg.info(`Download started with ID: ${downloadId}`);
      return { success: true, downloadId };
    } catch (error) {
      logBg.error(`Download failed for ${filename}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async function downloadImages(
    urls: string[],
    metadata: Record<string, unknown>,
    settings: Settings,
  ) {
    const folderPath = expandFolderPattern(
      settings.folderPattern,
      settings.baseFolder,
      metadata as { subreddit?: string; author?: string },
    );

    const results: Array<{ success: boolean; downloadId?: number; error?: string }> = [];
    for (let i = 0; i < urls.length; i++) {
      const extension = getExtensionFromUrl(urls[i]);
      const filename = `${folderPath}/${computeFilename(
        settings.filenameFormat,
        {
          title: metadata.title as string,
          subreddit: metadata.subreddit as string,
          imageIds: metadata.imageIds as string[],
          maxTitleLength: settings.maxTitleLength,
        },
        i,
        urls.length,
        extension,
      )}`;

      const saveAs = settings.downloadMode === 'saveAs';
      const result = await downloadImage(urls[i], filename, saveAs);
      results.push(result);

      if (i < urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const msg = message as Record<string, unknown>;
    logBg.info('Received message:', msg.action);

    if (msg.action === 'probe') {
      logBg.info('Probe request for', (msg.urls as string[])?.length, 'images');
      probeImages(msg.urls as string[])
        .then((results) => {
          logBg.info('Probe results:', results);
          sendResponse({ results });
        })
        .catch((error: Error) => {
          logBg.error('Probe batch failed:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (msg.action === 'download') {
      logBg.info(
        'Download request for',
        (msg.urls as string[])?.length,
        'images',
      );
      getSettings()
        .then((settings) => {
          logBg.info('Settings:', settings.downloadMode);
          return downloadImages(
            msg.urls as string[],
            msg.metadata as Record<string, unknown>,
            settings,
          );
        })
        .then((results) => {
          logBg.info('Download results:', results);
          sendResponse({ results });
        })
        .catch((error: Error) => {
          logBg.error('Download batch failed:', error);
          sendResponse({ error: error.message });
        });
      return true;
    }

    if (msg.action === 'getSettings') {
      getSettings().then((settings) => {
        sendResponse({ settings });
      });
      return true;
    }
  });
});
