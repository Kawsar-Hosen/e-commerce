import { useMemo, useState } from 'react';
import { ADMIN_PAGE_SIZE } from '@/lib/constants';

/**
 * Local pagination for the admin tables.
 *
 * Filters live in component state, so pages simply call `resetPage()` whenever
 * a filter changes; the requested page is clamped to the row count so deleting
 * the last row on page 4 cannot leave the table blank.
 */
export function usePagination<T>(rows: T[], pageSize: number = ADMIN_PAGE_SIZE) {
  const [requestedPage, setRequestedPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const pageRows = useMemo(
    () => rows.slice((page - 1) * pageSize, page * pageSize),
    [rows, page, pageSize],
  );

  return {
    page,
    totalPages,
    pageRows,
    pageSize,
    totalRows: rows.length,
    setPage: (next: number) => setRequestedPage(Math.min(Math.max(1, next), totalPages)),
    resetPage: () => setRequestedPage(1),
  };
}
