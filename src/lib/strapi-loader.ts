import type { Loader, LoaderContext } from 'astro/loaders';
import { fetchCollection, STRAPI_URL } from './strapi';

interface StrapiLoaderOptions<T> {
  /** Plural API ID of the collection type, e.g. "blog-posts". */
  pluralApiId: string;
  /** Raw Strapi query-string pairs (populate, sort, filters...). */
  params?: [string, string][];
  /** Maps a Strapi entry to the collection's data shape. */
  transform: (entry: T) => Record<string, unknown>;
  /** Unique, URL-safe entry ID. Defaults to the `slug` field. */
  id?: (entry: T) => string;
  /** Field holding Markdown (Strapi "Rich text (Markdown)") to render with Astro's pipeline. */
  markdownField?: keyof T;
}

/**
 * Astro Content Layer loader backed by the Strapi REST API.
 * Entries are fetched on `astro dev` / `astro build` and stored in Astro's
 * data store, so pages use the standard getCollection()/getEntry() API.
 */
export function strapiLoader<T extends Record<string, any>>(options: StrapiLoaderOptions<T>): Loader {
  const { pluralApiId, params = [], transform, id = (entry) => entry.slug, markdownField } = options;

  return {
    name: `strapi:${pluralApiId}`,
    load: async ({ store, logger, parseData, generateDigest, renderMarkdown }: LoaderContext) => {
      let entries: T[];
      try {
        entries = await fetchCollection<T>(pluralApiId, params);
      } catch (error) {
        const message = `Could not load "${pluralApiId}" from Strapi at ${STRAPI_URL}. Is Strapi running and STRAPI_URL correct?\n${(error as Error).message}`;
        // A production build must never silently ship without CMS content.
        if (import.meta.env.PROD) throw new Error(message);
        logger.warn(message);
        return;
      }

      store.clear();
      for (const entry of entries) {
        const entryId = id(entry);
        const data = await parseData({ id: entryId, data: transform(entry) });
        const markdown = markdownField ? entry[markdownField] : undefined;
        store.set({
          id: entryId,
          data,
          digest: generateDigest(entry),
          rendered: typeof markdown === 'string' ? await renderMarkdown(markdown) : undefined,
        });
      }
      logger.info(`Loaded ${entries.length} ${pluralApiId} from Strapi`);
    },
  };
}
