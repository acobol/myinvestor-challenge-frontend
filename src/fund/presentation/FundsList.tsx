import { useCallback, useState } from "react";
import type { SortingState } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import type { Fund } from "@/fund/domain/fund.schema";
import { useFunds } from "@/fund/application/useFunds";
import { usePagination } from "@/shared/application/usePagination";
import { toApiSort } from "@/fund/application/fund.sort-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageSizeSelector, TablePagination } from "@/components/TablePagination";
import { FundsTable } from "./FundsTable";
import { BuyFundDialog } from "@/portfolio/presentation/BuyFundDialog";
import { useFundDetail } from "./useFundDetail";

const SKELETON_ROWS = 10;
const SKELETON_COLS = 10;

export function FundsList() {
  const { t } = useTranslation();
  const { page, pageSize, setPage, setPageSize } = usePagination(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [buyFund, setBuyFund] = useState<Fund | null>(null);
  const { openDetail, detailDialog } = useFundDetail();
  const { data, isLoading, isError, refetch } = useFunds({
    page,
    limit: pageSize,
    sort: toApiSort(sorting),
  });

  function handleSortingChange(updater: SortingState | ((prev: SortingState) => SortingState)) {
    setSorting(updater);
    setPage(1);
  }

  const handleBuy = useCallback((fund: Fund) => setBuyFund(fund), []);
  const handleSeeDetails = useCallback((fund: Fund) => openDetail(fund.id), [openDetail]);

  if (isLoading) {
    return (
      <Card role="status">
          <span className="sr-only">{t("funds.loading")}</span>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-b-xl">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {Array.from({ length: SKELETON_COLS }).map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: SKELETON_ROWS }).map((_, row) => (
                  <tr key={row} className="border-t">
                    {Array.from({ length: SKELETON_COLS }).map((_, col) => (
                      <td key={col} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      >
        <p className="text-destructive">{t("funds.error")}</p>
        <button
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {t("funds.retry")}
        </button>
      </div>
    );
  }

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("funds.title")}</CardTitle>
        <PageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </CardHeader>
      <CardContent>
        <FundsTable
          data={data?.data ?? []}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          onBuy={handleBuy}
          onSeeDetails={handleSeeDetails}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </CardContent>
      <BuyFundDialog fund={buyFund} onClose={() => setBuyFund(null)} />
      {detailDialog}
    </Card>
  );
}
