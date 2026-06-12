import { defineConfig } from 'wxt';
import { execSync } from 'child_process';

export default defineConfig({
  manifestVersion: 3,
  suppressWarnings: {
    firefoxDataCollection: true,
  },
  hooks: {
    'build:manifestGenerated': (_ctx, manifest) => {
      if (manifest.browser_specific_settings?.gecko) return;
      try {
        const count = execSync('git rev-list --count HEAD', {
          encoding: 'utf-8',
        }).trim();
        manifest.version_name = `${manifest.version}+build.${count}`;
      } catch {
        // Not a git repo or git unavailable — leave version_name as-is
      }
    },
  },
  manifest: ({ browser }) => {
    const base: Record<string, unknown> = {
      name: 'Reddit Image Download',
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
            id: 'reddit-image-download@zawaro',
            strict_min_version: '140.0',
            data_collection_permissions: {
              required: ['none'],
            },
          },
          gecko_android: {
            strict_min_version: '142.0',
          },
        },
      });
    }

    return base;
  },
});
