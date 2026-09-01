/** Stories shown on one page of a listing. */
export const POSTS_PER_PAGE = 9;

export interface Page<T> {
  items: T[];
  current: number;
  total: number;
}

/** The slice of `items` belonging to page `current` (1-based). */
export function paginate<T>(
  items: T[],
  current: number,
  perPage = POSTS_PER_PAGE,
): Page<T> {
  const total = Math.max(1, Math.ceil(items.length / perPage));
  const page = Math.min(Math.max(1, current), total);
  return {
    items: items.slice((page - 1) * perPage, page * perPage),
    current: page,
    total,
  };
}

/** Page numbers to generate routes for, skipping page 1 (it lives at the base path). */
export function extraPageNumbers(count: number, perPage = POSTS_PER_PAGE): number[] {
  const total = Math.ceil(count / perPage);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => i + 2);
}

/** Page 1 keeps the clean base path; later pages live under `/page/n`. */
export function pageHref(basePath: string, page: number): string {
  return page === 1 ? basePath : `${basePath}/page/${page}`;
}
