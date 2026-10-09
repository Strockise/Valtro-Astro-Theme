import { getImage } from 'astro:assets';

interface CmsImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface Options {
  /** Extra srcset widths (the original width is always included). */
  widths?: number[];
  /** `sizes` attribute matching the image's rendered width. */
  sizes?: string;
  format?: 'webp' | 'jpg' | 'png' | 'avif';
}

/**
 * Downloads a Strapi image at build time and emits optimized copies with the
 * site, so the deployed pages never depend on the CMS being reachable.
 */
export async function cmsImage(image: CmsImage | undefined, { widths, sizes, format = 'webp' }: Options = {}) {
  if (!image?.src) return undefined;
  if (!image.width || !image.height) return { src: image.src, alt: image.alt };

  const original = image.width;
  const candidates = widths ? [...widths.filter((w) => w < original), original] : undefined;
  const result = await getImage({
    src: image.src,
    width: image.width,
    height: image.height,
    format,
    ...(candidates ? { widths: candidates, sizes } : {}),
  });

  return {
    src: result.src,
    srcset: result.srcSet.attribute || undefined,
    sizes: candidates ? sizes : undefined,
    alt: image.alt,
  };
}
