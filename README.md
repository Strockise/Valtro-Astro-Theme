# Valtro — Astro Theme

Valtro is a SaaS / CRM marketing theme for [Astro](https://astro.build) with a blog powered by [Strapi](https://strapi.io).

**Live demo:** https://valtro-astro-theme.vercel.app

- 2 home pages, Feature, Pricing, Blog, Blog post, Contact, Style Guide and 404 pages
- Scroll, load and hover animations, dropdown navigation, mobile menu, FAQ accordion and tabs
- Blog Posts and Authors managed in Strapi 5 and loaded through Astro's Content Layer
- Fully static output, responsive from 320px to 1920px+
- Self-hosted Geist font through Astro's Fonts API
- SEO ready: per-page meta and Open Graph tags, canonical URLs, sitemap and robots.txt

## Requirements

- Node.js 22.12 or newer
- A running Strapi backend: the `strapi/` project included in this repository, or your own Strapi 5 instance with the same content types

## Quick start

```bash
# 1. Start the CMS
cd strapi
cp .env.example .env        # then replace the "tobemodified" secrets
npm install
npm run seed                # optional: imports the demo posts, authors and images
npm run develop             # http://localhost:1337/admin

# 2. Start the theme (in a second terminal, from the repository root)
cp .env.example .env
npm install
npm run dev                 # http://localhost:4321
```

## Commands

| Command           | Action                                          |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the dev server at `localhost:4321`        |
| `npm run build`   | Build the static site to `./dist/`              |
| `npm run preview` | Preview the production build locally            |
| `npm run check`   | Type-check `.astro` and `.ts` files             |

## Environment variables

| Variable               | Required | Description                                                                                      |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `SITE_URL`             | Yes      | Public URL of the site, used for canonical and Open Graph URLs                                   |
| `STRAPI_URL`           | Yes      | Base URL of Strapi, e.g. `http://localhost:1337`                                                  |
| `STRAPI_API_TOKEN`     | No       | Read-only Strapi API token. Only needed when the Strapi Public role has no read access           |
| `PUBLIC_FORM_ENDPOINT` | No       | URL that receives the contact form as a `POST` (Formspree, Basin, your API…). Empty = demo mode  |

Never commit `.env`. It is already listed in `.gitignore`.

## Project structure

```text
src/
├── components/
│   ├── blog/            # BlogCard, FeaturedBlogCard, BlogSection, PostHero, PostContent
│   ├── layout/          # Header, Footer
│   ├── sections/        # Page sections, grouped by page (home, home-two, feature, ...)
│   │   └── shared/      # Sections used on several pages (PageHeader, Sponsor, Faq)
│   ├── seo/SeoMeta.astro
│   └── ui/SocialIcon.astro
├── config/
│   ├── config.json      # Site title, description, OG image, blog settings, footer credits
│   ├── menu.json        # Main navigation, header CTA, footer links, footer CTA
│   └── social.json      # Footer social links
├── layouts/BaseLayout.astro
├── lib/
│   ├── strapi.ts        # Strapi REST client + media helpers
│   ├── strapi-loader.ts # Astro Content Layer loader for Strapi collections
│   ├── blog.ts          # Post queries (sorting, featured, latest, related)
│   └── utils.ts
├── pages/
│   ├── index.astro, home-two.astro, feature.astro, pricing.astro
│   ├── blog.astro, blog-post/[slug].astro
│   ├── contact.astro, style-guide.astro, 404.astro
├── styles/              # normalize.css, base.css (layout/widgets), valtro.css (theme)
└── content.config.ts    # "blog" and "authors" collections loaded from Strapi
public/
├── images/              # Theme images and icons
├── js/interactions.js   # Interaction runtime (animations, navbar, dropdowns, tabs)
    └── js/jquery-3.5.1.min.js
```

## Content (Strapi)

Two collection types power the blog:

| Collection    | Fields                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Blog Post** | `title`, `slug`, `summary`, `isFeatured`, `featuredText`, `thumbnail` (image), `mainImage` (image), `author` (→ Author), `publishedDate`, `readingTime`, `content` (Markdown) |
| **Author**    | `name`, `slug`, `role`, `avatar` (image), `bio`, `blogPosts` (← Blog Post)                                                              |

Where the content appears:

- **/blog**: the featured post (`isFeatured = true`) and a list of all other posts
- **/blog-post/[slug]**: one page per post, with author, published date, reading time, content and 3 related posts
- **Home Two**: the 3 latest non-featured posts

Posts are sorted by `publishedDate`, newest first. Content is fetched when the site is built, so after you publish in Strapi, rebuild the site. A Strapi webhook can trigger a deploy hook on your host to automate this.

In development, if Strapi is unreachable, the blog renders its empty state and a warning is logged. A production build fails instead, so a site never ships without its blog.

## Customization

- **Site details and SEO**: `src/config/config.json`
- **Navigation and footer links**: `src/config/menu.json`
- **Social links**: `src/config/social.json`
- **Colors, typography and spacing**: CSS variables at the top of `src/styles/valtro.css`
- **Page content**: the section components in `src/components/sections/`

### About `data-w-id` and `ixPage`

The animations are driven by `public/js/interactions.js`. It finds elements through their `data-w-id` attributes and the page ID passed to `BaseLayout` as `ixPage`. Keep those attributes when you edit a section, or its animation stops working. A new page can reuse the `ixPage` of the existing page it most resembles.

## Contact form

Set `PUBLIC_FORM_ENDPOINT` to any service that accepts a form `POST` and returns a 2xx status. The form shows the theme's success or error message from the response. Without an endpoint, it runs in demo mode and always shows the success message.

## Deployment

The output is a static site. Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages…). Set `SITE_URL` and `STRAPI_URL` (and `STRAPI_API_TOKEN` if you use one) in the host's build environment.

## License

Images are for demonstration purposes. Replace them with your own content before publishing.
