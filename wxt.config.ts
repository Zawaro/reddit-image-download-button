import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  suppressWarnings: {
    firefoxDataCollection: true,
  },
  manifest: ({ browser }) => {
    const base: Record<string, unknown> = {
      name: 'Reddit Image Download',
      version: '1.0.0',
      description:
        'Download Reddit images in their original format and full resolution, bypassing WebP compression.',
      permissions: ['downloads', 'storage', 'activeTab'],
      host_permissions: [
        'https://*.reddit.com/*',
        'https://*.redd.it/*',
      ],
      icons: {
        48: 'icons/icon-48.png',
        96: 'icons/icon-96.png',
      },
      action: {
        default_icon: {
          48: 'icons/icon-48.png',
          96: 'icons/icon-96.png',
        },
        default_title: 'Reddit Image Download',
      },
    };

    if (browser === 'firefox') {
      Object.assign(base, {
        browser_specific_settings: {
          gecko: {
            id: 'reddit-image-download@example.com',
            strict_min_version: '109.0',
          },
        },
      });
    }

    return base;
  },
});
