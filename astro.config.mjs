// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';

const { SITE_URL, STRAPI_URL } = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const strapi = new URL(STRAPI_URL || 'http://localhost:1337');

// https://astro.build/config
export default defineConfig({
  site: SITE_URL || 'https://example.com',
  image: {
    // Strapi media is downloaded and optimized at build time.
    remotePatterns: [{ protocol: strapi.protocol.replace(':', ''), hostname: strapi.hostname, port: strapi.port || undefined }],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Geist',
      cssVariable: '--font-geist',
      weights: [300, 400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
});
