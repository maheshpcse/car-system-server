import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../common/constants/index.js';

export function parsePagination(page?: number, limit?: number) {
  const safePage = Math.max(1, page ?? DEFAULT_PAGE);
  const safeLimit = Math.min(MAX_LIMIT, Math.max(1, limit ?? DEFAULT_LIMIT));
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function paginationMeta(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalItems: total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
