export function sanitizeFilename(str: string): string {
  return str
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\u2026.]+$/, '');
}

export function truncateTitle(title: string, maxLength: number): string {
  if (title.length <= maxLength) return title;
  return title.substring(0, maxLength).trim();
}

export function computeFilename(
  format: string,
  metadata: {
    title: string;
    subreddit?: string;
    imageIds?: string[];
    maxTitleLength?: number;
  },
  index: number,
  total: number,
  extension: string,
): string {
  const title = truncateTitle(
    sanitizeFilename(metadata.title || 'Untitled'),
    metadata.maxTitleLength ?? 50,
  );
  const imageId = metadata.imageIds?.[index] || `image-${index + 1}`;

  switch (format) {
    case 'subreddit-title':
      return `${sanitizeFilename(metadata.subreddit || 'unknown')}-${title}_${index + 1}${extension}`;
    case 'imageId':
      return `${imageId}${extension}`;
    case 'title':
    default:
      return total > 1
        ? `${title}_${index + 1}${extension}`
        : `${title}${extension}`;
  }
}

export function getExtensionFromUrl(url: string, fallback = '.jpg'): string {
  if (url.includes('i.redd.it')) {
    const match = url.match(/i\.redd\.it\/[^.]+\.(gif|png|jpe?g)/i);
    if (match) return `.${match[1].toLowerCase()}`;
  }

  const ext = url.match(/\.(gif|png|jpe?g)(?:\?|$)/i);
  return ext ? `.${ext[1].toLowerCase()}` : fallback;
}
