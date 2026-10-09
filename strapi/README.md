# Valtro — Strapi backend

Strapi 5 project that provides the two CMS collections used by the Valtro Astro theme: **Blog Posts** and **Authors**.

## Setup

```bash
cp .env.example .env     # replace every "tobemodified" value with a random secret
npm install
npm run seed             # optional: imports the demo content and images
npm run develop          # admin panel: http://localhost:1337/admin
```

On first start, create your admin account in the admin panel.

`npm run seed` uses Strapi's official `strapi import` with `seed/valtro-seed.tar.gz`. The archive contains the demo posts, the author, the images and the public read permissions. It contains no admin users or tokens. Importing **replaces** existing content, so run it on a fresh project only.

## Content types

Defined as code in `src/api/*/content-types/*/schema.json`.

### Blog Post (`api::blog-post.blog-post`, Draft & Publish enabled)

| Field           | Type                   | Notes                                              |
| --------------- | ---------------------- | -------------------------------------------------- |
| `title`         | Text (required)        |                                                    |
| `slug`          | UID from `title`       | Used for `/blog-post/[slug]`                       |
| `summary`       | Long text              | Featured card text and meta description            |
| `isFeatured`    | Boolean                | The featured post appears in the Blog page header block |
| `featuredText`  | Text                   | Label on the featured card, e.g. "Featured blog"   |
| `thumbnail`     | Image (required)       | Card image                                         |
| `mainImage`     | Image (required)       | Post hero image and social share image             |
| `author`        | Relation → Author      | Many posts to one author                           |
| `publishedDate` | Date (required)        | Displayed as "August 11, 2025"; used for sorting   |
| `readingTime`   | Text                   | e.g. "04 min"                                      |
| `content`       | Rich text (Markdown)   | Rendered by Astro's Markdown pipeline              |

### Author (`api::author.author`)

| Field       | Type                     |
| ----------- | ------------------------ |
| `name`      | Text (required)          |
| `slug`      | UID from `name`          |
| `role`      | Text                     |
| `avatar`    | Image                    |
| `bio`       | Long text                |
| `blogPosts` | Relation ← Blog Post     |

## API access

On startup, `src/index.ts` grants the **Public** role `find` and `findOne` on both collections, so the Astro theme can read published content without a token.

To keep the API private, set `STRAPI_PUBLIC_READ=false`, remove those permissions in *Settings → Users & Permissions → Roles → Public*, then create a **Read-only** API token (*Settings → API Tokens*) and use it as `STRAPI_API_TOKEN` in the Astro project.

## Strapi MCP server

The [Strapi MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server) is enabled in `config/server.ts` (`mcp.enabled`, toggled by `MCP_ENABLED`). It is served at `/mcp` and lets AI agents list, create, update, publish and delete Blog Posts and Authors, and manage Media Library metadata.

1. In the admin panel, open *Settings → Admin tokens* and create a token with Content Manager permissions for Blog Post and Author (add Media Library permissions if needed).
2. Connect Claude Code:

   ```bash
   claude mcp add strapi --transport http http://localhost:1337/mcp -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

   Or use the included `.mcp.json`, which reads the token from the `STRAPI_ADMIN_TOKEN` environment variable (and an optional `STRAPI_MCP_URL`).

Limits, per the Strapi docs: the MCP server cannot change content types and cannot upload files. Upload media through the Media Library or the Upload API first, then reference it by its numeric ID.

## Publishing workflow

The Astro theme reads Strapi when the site is built. After publishing changes, rebuild the site. To automate this, add a webhook in *Settings → Webhooks* pointing to your host's deploy hook, with the `entry.publish`, `entry.unpublish`, `entry.update` and `entry.delete` events.

## Deployment

Any Node.js host supported by Strapi works (Strapi Cloud, a VPS, Render, Railway…). For production, switch `DATABASE_CLIENT` to PostgreSQL or MySQL. Use a cloud upload provider (S3, Cloudinary…) if the host's filesystem is ephemeral. The Astro theme accepts both relative `/uploads/...` URLs and absolute provider URLs.
