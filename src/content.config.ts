import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { strapiLoader } from '@/lib/strapi-loader';
import { toImage, type StrapiMedia } from '@/lib/strapi';

const image = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
});

interface StrapiAuthor {
  slug: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  avatar?: StrapiMedia | null;
}

interface StrapiBlogPost {
  slug: string;
  title: string;
  summary?: string | null;
  isFeatured: boolean;
  featuredText?: string | null;
  thumbnail?: StrapiMedia | null;
  mainImage?: StrapiMedia | null;
  author?: { slug: string } | null;
  publishedDate: string;
  readingTime?: string | null;
  content: string;
  createdAt: string;
}

/** CMS collection #2: authors (related to blog posts). */
const authors = defineCollection({
  loader: strapiLoader<StrapiAuthor>({
    pluralApiId: 'authors',
    params: [['populate[avatar]', 'true']],
    transform: (author) => ({
      name: author.name,
      slug: author.slug,
      role: author.role ?? undefined,
      bio: author.bio ?? undefined,
      avatar: toImage(author.avatar),
    }),
  }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    role: z.string().optional(),
    bio: z.string().optional(),
    avatar: image.optional(),
  }),
});

/** CMS collection #1: blog posts. */
const blog = defineCollection({
  loader: strapiLoader<StrapiBlogPost>({
    pluralApiId: 'blog-posts',
    params: [
      ['populate[thumbnail]', 'true'],
      ['populate[mainImage]', 'true'],
      ['populate[author][fields][0]', 'slug'],
      ['sort[0]', 'publishedDate:desc'],
      ['sort[1]', 'createdAt:desc'],
    ],
    markdownField: 'content',
    transform: (post) => ({
      title: post.title,
      slug: post.slug,
      summary: post.summary ?? '',
      isFeatured: post.isFeatured,
      featuredText: post.featuredText ?? '',
      thumbnail: toImage(post.thumbnail),
      mainImage: toImage(post.mainImage),
      author: post.author?.slug,
      publishedDate: post.publishedDate,
      readingTime: post.readingTime ?? '',
      createdAt: post.createdAt,
    }),
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string(),
    isFeatured: z.boolean(),
    featuredText: z.string(),
    thumbnail: image.optional(),
    mainImage: image.optional(),
    author: reference('authors').optional(),
    publishedDate: z.coerce.date(),
    readingTime: z.string(),
    createdAt: z.coerce.date(),
  }),
});

export const collections = { blog, authors };
