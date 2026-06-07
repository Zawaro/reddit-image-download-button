export function normalizePath(path: string): string {
  return path.replace(/\\/g, '/');
}

export function toRelativePath(path: string): string {
  let normalized = normalizePath(path);
  normalized = normalized.replace(/^\/+/, '');
  normalized = normalized.replace(/^[A-Za-z]:\/+/i, '');
  return normalized;
}

export function expandFolderPattern(
  pattern: string,
  baseFolder: string,
  metadata: { subreddit?: string; author?: string },
): string {
  const now = new Date();
  const effectiveBase = toRelativePath(baseFolder || 'RedditImages');

  const variables: Record<string, string> = {
    '{base}': effectiveBase,
    '{year}': now.getFullYear().toString(),
    '{month}': String(now.getMonth() + 1).padStart(2, '0'),
    '{day}': String(now.getDate()).padStart(2, '0'),
    '{subreddit}': metadata.subreddit || 'unknown',
    '{author}': metadata.author || 'unknown',
  };

  let result = pattern;
  for (const [key, value] of Object.entries(variables)) {
    if (key === '{base}') {
      result = result.replace(/\{base\}/g, value);
    } else {
      result = result.replace(new RegExp(`\\${key}`, 'g'), sanitizeFilename(value));
    }
  }
  return normalizePath(result);
}

function sanitizeFilename(str: string): string {
  return str
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/[\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\u2026.]+$/, '');
}
