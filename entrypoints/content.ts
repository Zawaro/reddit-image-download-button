import { transformUrl } from '../shared/transformUrl';
import {
  log,
  initLogging,
} from '../shared/logger';
import {
  createDownloadButton,
  setButtonState,
  injectKeyframes,
  type ButtonState,
} from '../shared/button';
import { PROCESSED_ATTR, POST_REF_ATTR } from '../shared/constants';
import { sendMessageWithRetry } from '../shared/message';

export default defineContentScript({
  runAt: 'document_idle',
  matches: ['https://*.reddit.com/*'],
  main() {
    init();

    async function init() {
      await initLogging();

      if (!isPostPage()) {
        log.info(
          'Not a post page (URL:',
          window.location.href,
          '), skipping button injection',
        );
        return;
      }

      log.info('Post page detected, initializing content script');
      injectKeyframes();
      processPosts();

      const observer = new MutationObserver((mutations) => {
        let shouldProcess = false;
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            shouldProcess = true;
            break;
          }
        }
        if (shouldProcess) {
          processPosts();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      log.info('MutationObserver started');
      setInterval(processPosts, 3000);
    }

    function isPostPage(): boolean {
      return window.location.pathname.includes('/comments/');
    }

    function processPosts(): void {
      const posts = document.querySelectorAll('shreddit-post');
      log.info(`Processing ${posts.length} posts`);
      posts.forEach(injectButton);
    }

    function findTextBodyHost(post: Element): Element | null {
      let host = post.querySelector('shreddit-post-text-body');
      if (host) return host;
      const sr = post.shadowRoot;
      return sr ? sr.querySelector('shreddit-post-text-body') : null;
    }

    function hasImages(post: Element): boolean {
      const mediaContainer = post.querySelector('div[slot="post-media-container"]');
      const textBodyHost = findTextBodyHost(post);

      const hasGallery = mediaContainer?.querySelector('gallery-carousel');
      const hasMediaImage = mediaContainer?.querySelector(
        'shreddit-aspect-ratio img, img.media-lightbox-img',
      );
      const hasTextBodyImage = textBodyHost?.querySelector(
        "img[src*='preview.redd.it'], img[src*='i.redd.it']",
      );
      const hasVideo = mediaContainer?.querySelector(
        'shreddit-player, shreddit-player-2',
      );

      if (hasVideo && !hasGallery && !hasMediaImage && !hasTextBodyImage)
        return false;
      return !!(hasGallery || hasMediaImage || hasTextBodyImage);
    }

    function getImageCount(post: Element): number {
      const mediaContainer = post.querySelector('div[slot="post-media-container"]');
      const textBodyHost = findTextBodyHost(post);

      if (mediaContainer) {
        const gallery = mediaContainer.querySelector('gallery-carousel');
        if (gallery) {
          return gallery.querySelectorAll('li').length || 1;
        }

        const hasMediaImage = mediaContainer.querySelector(
          'shreddit-aspect-ratio img, img.media-lightbox-img',
        );
        if (hasMediaImage) return 1;
      }

      if (textBodyHost) {
        const textBodyImages = textBodyHost.querySelectorAll(
          "img[src*='preview.redd.it'], img[src*='i.redd.it']",
        );
        if (textBodyImages.length > 0) return textBodyImages.length;
      }

      return 0;
    }

    function extractImageUrl(img: HTMLImageElement): string | null {
      const src =
        img.src ||
        img.getAttribute('data-lazy-src') ||
        img.getAttribute('srcset')?.split(',')[0]?.trim()?.split(' ')[0];
      if (!src) {
        log.warn('No src found for image');
        return null;
      }
      log.info('extractImageUrl:', src);
      return src;
    }

    function extractGalleryImages(post: Element): string[] {
      const mediaContainer = post.querySelector('div[slot="post-media-container"]');
      if (!mediaContainer) return [];

      const gallery = mediaContainer.querySelector('gallery-carousel');
      if (!gallery) return [];

      const images: string[] = [];
      const listItems = gallery.querySelectorAll('li');
      log.info(`Found ${listItems.length} gallery items`);

      listItems.forEach((li, index) => {
        const img = li.querySelector<HTMLImageElement>('img.media-lightbox-img');
        if (img) {
          const url = extractImageUrl(img);
          if (url) {
            images.push(url);
            log.info(`Gallery item ${index} transformed:`, url);
          }
        } else {
          log.warn(`Gallery item ${index}: no img found`);
        }
      });

      return images;
    }

    function extractSingleImage(post: Element): string | null {
      const mediaContainer = post.querySelector('div[slot="post-media-container"]');
      if (!mediaContainer) return null;

      const img = mediaContainer.querySelector<HTMLImageElement>(
        'shreddit-aspect-ratio img, img.media-lightbox-img',
      );
      if (!img) return null;

      return extractImageUrl(img);
    }

    function extractTextBodyImages(post: Element): string[] {
      const textBodyHost = findTextBodyHost(post);
      if (!textBodyHost) return [];

      const imgs = textBodyHost.querySelectorAll<HTMLImageElement>(
        "img[src*='preview.redd.it'], img[src*='i.redd.it']",
      );

      const images: string[] = [];
      imgs.forEach((img) => {
        const url = extractImageUrl(img);
        if (url) images.push(url);
      });

      return images;
    }

    function extractPostMetadata(post: Element): {
      title: string;
      author: string;
      subreddit: string;
      imageIds: string[];
    } {
      const titleEl = post.querySelector(
        'h1[id^="post-title-"], a[id^="post-title-"]',
      );
      const title =
        titleEl?.textContent?.trim() ||
        post.getAttribute('post-title') ||
        'Untitled';

      const author = post.getAttribute('author') || 'unknown';
      const subreddit = post.getAttribute('subreddit-name') || 'unknown';

      const imageIds: string[] = [];
      const mediaContainer = post.querySelector('div[slot="post-media-container"]');
      if (mediaContainer) {
        const imgs = mediaContainer.querySelectorAll('img');
        imgs.forEach((img) => {
          const src = img.src || '';
          const pathOnly = src.split('?')[0];
          const versionMatch = pathOnly.match(
            /-v\d+-([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i,
          );
          if (versionMatch) {
            imageIds.push(versionMatch[1]);
          } else {
            const typeMatch = pathOnly.match(
              /-t\d+-([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i,
            );
            if (typeMatch) {
              imageIds.push(typeMatch[1]);
            } else {
              const simpleMatch = pathOnly.match(
                /\/([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i,
              );
              if (simpleMatch) imageIds.push(simpleMatch[1]);
            }
          }
        });
      }

      return { title, author, subreddit, imageIds };
    }

    function injectButton(post: Element): void {
      if (post.hasAttribute(PROCESSED_ATTR)) {
        const sr = post.shadowRoot;
        if (sr) {
          const existingBtn = sr.querySelector(
            'button[aria-label="Download images"]',
          );
          if (existingBtn) return;
        }
        post.removeAttribute(PROCESSED_ATTR);
      }
      if (!hasImages(post)) return;

      post.setAttribute(PROCESSED_ATTR, 'true');

      const shadowRoot = post.shadowRoot;
      if (!shadowRoot) {
        log.warn('No shadow root found for post:', post.id);
        return;
      }

      let actionContainer = shadowRoot.querySelector<HTMLElement>(
        'div.flex.flex-row.items-center.flex-nowrap.overflow-hidden.justify-start',
      );
      if (!actionContainer) {
        actionContainer =
          shadowRoot.querySelector<HTMLElement>('div.shreddit-post-container');
      }
      if (!actionContainer) {
        log.warn('No action container found for post:', post.id);
        return;
      }

      const imageCount = getImageCount(post);
      const btn = createDownloadButton(
        imageCount,
        post as HTMLElement,
        POST_REF_ATTR,
        handleDownloadClick,
      );

      const shareSlot = actionContainer.querySelector('slot[name="share-button"]');
      if (shareSlot) {
        shareSlot.parentNode!.insertBefore(btn, shareSlot.nextSibling);
        log.info('Button injected after share button for post:', post.id);
      } else {
        actionContainer.appendChild(btn);
        log.info('Button appended to action container for post:', post.id);
      }
    }

    async function handleDownloadClick(e: Event): Promise<void> {
      e.preventDefault();
      e.stopPropagation();

      const btn = e.currentTarget as HTMLButtonElement;
      const post = (btn as unknown as Record<string, Element>)[POST_REF_ATTR];

      if (!post) {
        log.error('No post reference found on button');
        return;
      }

      log.info('Download button clicked for post:', (post as Element).id);
      setButtonState(btn, 'loading');

      try {
        let urls: string[] = [];
        const galleryImages = extractGalleryImages(post);
        if (galleryImages.length > 0) {
          urls = galleryImages;
          log.info('Found gallery images:', urls.length);
        } else {
          const singleImage = extractSingleImage(post);
          if (singleImage) {
            urls = [singleImage];
            log.info('Found single image');
          }
        }

        if (urls.length === 0) {
          const textBodyImages = extractTextBodyImages(post);
          if (textBodyImages.length > 0) {
            urls = textBodyImages;
            log.info('Found text-body images:', urls.length);
          }
        }

        if (urls.length === 0) {
          log.warn('No images found in post');
          setButtonState(btn, 'error');
          return;
        }

        log.info('Image URLs:', urls);

        const metadata = extractPostMetadata(post);
        log.info('Post metadata:', metadata);

        // Transform URLs in content script (for display/logging accuracy),
        // but background also transforms during probing
        const transformedUrls = urls
          .map((u) => transformUrl(u))
          .filter((u): u is string => u !== null);

        setButtonState(btn, 'probing');

        const probeResponse = (await sendMessageWithRetry({
          action: 'probe',
          urls: transformedUrls,
        })) as { results?: Array<{ available: boolean; url: string }>; error?: string };

        log.info('Probe response:', probeResponse);

        if (probeResponse?.error) {
          setButtonState(btn, 'error');
          return;
        }

        const availableUrls =
          probeResponse.results
            ?.filter((r) => r.available)
            .map((r) => r.url) ?? [];

        log.info(
          'Available URLs:',
          availableUrls.length,
          'of',
          transformedUrls.length,
        );

        if (availableUrls.length === 0) {
          setButtonState(btn, 'notfound');
          return;
        }

        setButtonState(btn, 'downloading');

        const downloadResponse = (await sendMessageWithRetry({
          action: 'download',
          urls: availableUrls,
          metadata,
        })) as { results?: unknown; error?: string };

        log.info('Download response:', downloadResponse);

        if (downloadResponse?.error) {
          setButtonState(btn, 'error');
        } else {
          setButtonState(btn, 'success');
        }
      } catch (error) {
        log.error('Download error:', error);
        setButtonState(btn, 'error');
      }
    }
  },
});
