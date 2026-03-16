import { useState } from "react";

export interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export function usePagination(defaultPageSize = 10): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  function setPageSizeAndReset(newSize: number) {
    setPageSize(newSize);
    setPage(1);
  }

  return { page, pageSize, setPage, setPageSize: setPageSizeAndReset };
}
