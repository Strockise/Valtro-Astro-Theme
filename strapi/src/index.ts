import type { Core } from '@strapi/strapi';

/** Read-only Content API actions the Astro frontend needs without a token. */
const PUBLIC_READ_ACTIONS = [
  'api::blog-post.blog-post.find',
  'api::blog-post.blog-post.findOne',
  'api::author.author.find',
  'api::author.author.findOne',
];

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Grants the Public role read access to blog posts and authors so the
   * Astro theme works out of the box. Set STRAPI_PUBLIC_READ=false to keep the
   * API private and use a read-only API token (STRAPI_API_TOKEN) instead.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (process.env.STRAPI_PUBLIC_READ === 'false') return;

    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });
    if (!publicRole) return;

    for (const action of PUBLIC_READ_ACTIONS) {
      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action, role: publicRole.id } });
      if (!existing) {
        await strapi.db
          .query('plugin::users-permissions.permission')
          .create({ data: { action, role: publicRole.id } });
      }
    }
  },
};
