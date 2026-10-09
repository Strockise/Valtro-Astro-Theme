import { getCollection, type CollectionEntry } from 'astro:content';
import config from '@/config/config.json';

export type Post = CollectionEntry<'blog'>;

export const postUrl = (post: Post) => `${config.blog.base_path}/${post.data.slug}`;

/** All posts, newest first (published date, then creation date). */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog');
  return posts.sort(
    (a, b) =>
      b.data.publishedDate.getTime() - a.data.publishedDate.getTime() ||
      b.data.createdAt.getTime() - a.data.createdAt.getTime(),
  );
}

/** The post shown in the Blog page's featured block. */
export const getFeatured = (posts: Post[]) => posts.find((post) => post.data.isFeatured);

/**
 * Non-featured posts, as used by the Home Two blog section and the
 * "Related blog" list (which also skips the post being read).
 */
export const getLatest = (posts: Post[], count: number, exclude?: string) =>
  posts.filter((post) => !post.data.isFeatured && post.id !== exclude).slice(0, count);
