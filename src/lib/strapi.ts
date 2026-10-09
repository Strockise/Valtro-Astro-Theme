/**
 * Minimal Strapi 5 REST client used at build time (and by the dev server).
 * Configuration comes from environment variables only:
 *   STRAPI_URL        Base URL of the Strapi server (default http://localhost:1337)
 *   STRAPI_API_TOKEN  Optional read-only API token, sent as a Bearer token
 */

const env = (name: string): string | undefined => {
  const runtimeEnv = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {};
  const value = (import.meta.env as Record<string, string | undefined>)[name] ?? runtimeEnv[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
};

export const STRAPI_URL = (env('STRAPI_URL') ?? 'http://localhost:1337').replace(/\/+$/, '');
const STRAPI_API_TOKEN = env('STRAPI_API_TOKEN');

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiMediaFormat> | null;
}

interface StrapiListResponse<T> {
  data: T[];
  meta: { pagination?: { page: number; pageCount: number } };
}

/** Turns Strapi's relative upload paths into absolute URLs. */
export function mediaUrl(url: string | undefined | null): string {
  if (!url) return '';
  return /^https?:\/\//.test(url) ? url : `${STRAPI_URL}${url}`;
}

/** Normalised image data: absolute URL plus intrinsic size (used by `cmsImage`). */
export function toImage(media: StrapiMedia | null | undefined) {
  if (!media?.url) return undefined;
  return {
    src: mediaUrl(media.url),
    alt: media.alternativeText ?? '',
    width: media.width ?? undefined,
    height: media.height ?? undefined,
  };
}

/**
 * Fetches every entry of a collection type, following pagination.
 * `params` are raw Strapi query-string pairs, e.g. ['populate[author]', 'true'].
 */
export async function fetchCollection<T>(pluralApiId: string, params: [string, string][] = []): Promise<T[]> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (STRAPI_API_TOKEN) headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;

  const results: T[] = [];
  let page = 1;
  let pageCount = 1;
  do {
    const search = new URLSearchParams([...params, ['pagination[page]', String(page)], ['pagination[pageSize]', '100']]);
    const url = `${STRAPI_URL}/api/${pluralApiId}?${search}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Strapi request failed (${response.status} ${response.statusText}) for ${url}\n${body.slice(0, 500)}`);
    }
    const json = (await response.json()) as StrapiListResponse<T>;
    results.push(...json.data);
    pageCount = json.meta.pagination?.pageCount ?? 1;
    page += 1;
  } while (page <= pageCount);

  return results;
}
