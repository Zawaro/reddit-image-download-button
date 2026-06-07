export function transformUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  if (url.includes('i.redd.it')) {
    return url;
  }

  if (url.includes('i.imgur.com') || url.includes('imgur.com')) {
    return url;
  }

  if (url.includes('preview.redd.it')) {
    const pathOnly = url.split('?')[0];

    const versionMatch = pathOnly.match(/-v\d+-([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i);
    if (versionMatch) {
      const imageId = versionMatch[1];
      const ext = versionMatch[2].toLowerCase();
      return `https://i.redd.it/${imageId}.${ext}`;
    }

    const typeMatch = pathOnly.match(/-t\d+-([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i);
    if (typeMatch) {
      const imageId = typeMatch[1];
      const ext = typeMatch[2].toLowerCase();
      return `https://i.redd.it/${imageId}.${ext}`;
    }

    const simpleMatch = pathOnly.match(/\/([a-zA-Z0-9]+)\.(jpg|jpeg|png|gif)$/i);
    if (simpleMatch) {
      const imageId = simpleMatch[1];
      const ext = simpleMatch[2].toLowerCase();
      return `https://i.redd.it/${imageId}.${ext}`;
    }

    return url;
  }

  return url;
}
