// packages/backend/src/utils/pagination.ts
import type { PaginationQuery, PaginationMeta } from "@types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function getPaginationQuery(
  page?: number,
  limit?: number,
): PaginationQuery {
  const p = Math.max(1, Math.floor(Number(page)) || DEFAULT_PAGE);
  const l = Math.min(
    MAX_LIMIT,
    Math.max(1, Math.floor(Number(limit)) || DEFAULT_LIMIT),
  );
  return { page: p, limit: l, skip: (p - 1) * l };
}

export function getPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
