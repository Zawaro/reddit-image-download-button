## MODIFIED Requirements

### Requirement: Extract image URLs from Reddit DOM

Unchanged behavior: extract single images from `shreddit-aspect-ratio > img.media-lightbox-img`, gallery images from `gallery-carousel li > img.media-lightbox-img`, and text-body images from `shreddit-post-text-body img[src*='preview.redd.it']`. Implementation now in TypeScript, imported by the content script entrypoint.

#### Scenario: Single image extracted from media container
- **WHEN** post has `shreddit-aspect-ratio img` in `div[slot="post-media-container"]`
- **THEN** the image `src` attribute is extracted

#### Scenario: Gallery images extracted
- **WHEN** post has `gallery-carousel` with `<li>` items containing `img.media-lightbox-img`
- **THEN** all image URLs are extracted from the gallery items

### Requirement: Transform preview URLs to original format — MODIFIED

The `transformUrl()` function SHALL be imported from `shared/transformUrl.ts` rather than defined inline. This function is shared between content script (for displaying transformed URLs) and background (for probing the correct origin URL). The implementation SHALL use the same three regex patterns as before.

#### Scenario: Preview URL transformed by shared module
- **WHEN** content script calls `transformUrl()` from shared module
- **THEN** it returns the `i.redd.it` equivalent URL

### Requirement: Extract post metadata

Unchanged behavior. Metadata extraction SHALL remain in the content script entrypoint, returning `{ title, author, subreddit, imageIds }`.

#### Scenario: Post metadata extracted from attributes
- **WHEN** `shreddit-post` has `author`, `subreddit-name`, and a title element
- **THEN** metadata object is populated with all three fields
