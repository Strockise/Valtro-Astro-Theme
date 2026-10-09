const trimSlash = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path);

/**
 * Mirrors Webflow's `w--current` behaviour: a link is current when it points
 * at the page being rendered.
 */
export function isCurrent(href: string, pathname: string): boolean {
  if (!href.startsWith('/')) return false;
  return trimSlash(href) === trimSlash(pathname);
}

/** Props for an anchor that should carry Webflow's current-page state. */
export function currentAttrs(href: string, pathname: string, className: string) {
  const current = isCurrent(href, pathname);
  return {
    href,
    class: current ? `${className} w--current` : className,
    'aria-current': current ? ('page' as const) : undefined,
  };
}

/** Webflow's default CMS date format, e.g. "August 11, 2025". */
export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}
