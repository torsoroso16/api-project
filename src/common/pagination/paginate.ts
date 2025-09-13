import { PaginatorInfo } from '../dto/paginator-info.model';

export function paginate(
  totalItems: number,
  currentPage: number = 1,
  pageSize: number = 10,
  count: number = 0,
): PaginatorInfo {
  // Ensure positive values
  totalItems = Math.max(0, totalItems);
  currentPage = Math.max(1, currentPage);
  pageSize = Math.max(1, pageSize);
  count = Math.max(0, count);

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure current page isn't out of range
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }

  // Calculate start and end item indexes
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + count - 1, totalItems);

  return {
    total: totalItems,
    currentPage: currentPage,
    count,
    lastPage: totalPages,
    firstItem: count > 0 ? startIndex : 0,
    lastItem: count > 0 ? endIndex : 0,
    perPage: pageSize,
    hasMorePages: currentPage < totalPages,
  };
}