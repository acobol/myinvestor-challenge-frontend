import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const MAX_VISIBLE_PAGES = 5;

interface PageSizeSelectorProps {
  pageSize: number;
  pageSizeOptions?: readonly number[];
  onPageSizeChange: (pageSize: number) => void;
}

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPageRange(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  if (page > 3) pages.push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);
  return pages;
}

export function PageSizeSelector({
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
}: PageSizeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 text-sm">
      <Label htmlFor="page-size-select">{t("common.pagination.perPage")}</Label>
      <Select
        value={String(pageSize)}
        onValueChange={(v) => onPageSizeChange(Number(v))}
      >
        <SelectTrigger id="page-size-select" className="h-8 w-16">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TablePagination({
  page,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  const { t } = useTranslation();

  const pageRange = buildPageRange(page, totalPages);

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            text={t("common.pagination.previous")}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
            aria-disabled={page <= 1}
            className={cn(page <= 1 && "pointer-events-none opacity-50")}
          />
        </PaginationItem>

        {pageRange.map((entry, idx) =>
          entry === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry}>
              <PaginationLink
                href="#"
                isActive={entry === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(entry);
                }}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            text={t("common.pagination.next")}
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
            aria-disabled={page >= totalPages}
            className={cn(page >= totalPages && "pointer-events-none opacity-50")}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
