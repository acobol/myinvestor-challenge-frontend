import { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { ArrowRightToLine, Eye, EllipsisVertical } from "lucide-react";
import type { Fund } from "@/fund/domain/fund.schema";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SortIcon } from "@/components/SortIcon";
import { LinkButton } from "@/components/LinkButton";
import { formatAmount, formatPercent } from "../utils/fund.formatters";

const columnHelper = createColumnHelper<Fund>();

function ProfitabilityCell({ value, locale }: { value: number; locale: string }) {
  return (
    <span className={cn("tabular-nums", value > 0 ? "text-green-600" : value < 0 ? "text-red-500" : "")}>
      {formatPercent(value, locale)}
    </span>
  );
}

interface FundsTableProps {
  data: Fund[];
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  onBuy: (fund: Fund) => void;
  onSeeDetails: (fund: Fund) => void;
}

export function FundsTable({ data, sorting, onSortingChange, onBuy, onSeeDetails }: FundsTableProps) {
  const { t, i18n } = useTranslation();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => t("funds.columns.name"),
        cell: ({ row }) => (
          <LinkButton onClick={() => onSeeDetails(row.original)}>
            {row.original.name}
          </LinkButton>
        ),
        sortDescFirst: true
      }),
      columnHelper.accessor("symbol", {
        header: () => t("funds.columns.symbol"),
        enableSorting: false,
      }),
      columnHelper.accessor("category", {
        header: () => t("funds.columns.category"),
        cell: ({ getValue }) => t(`funds.categories.${getValue()}`),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.value.amount, {
        id: "value",
        header: () => t("funds.columns.value"),
        cell: ({ getValue }) => (
          <span className="tabular-nums">{formatAmount(getValue(), i18n.language)}</span>
        ),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.value.currency, {
        id: "currency",
        header: () => t("funds.columns.currency"),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.profitability.YTD, {
        id: "ytd",
        header: () => t("funds.columns.ytd"),
        cell: ({ getValue }) => (
          <ProfitabilityCell value={getValue()} locale={i18n.language} />
        ),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.profitability.oneYear, {
        id: "oneYear",
        header: () => t("funds.columns.oneYear"),
        cell: ({ getValue }) => (
          <ProfitabilityCell value={getValue()} locale={i18n.language} />
        ),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.profitability.threeYears, {
        id: "threeYears",
        header: () => t("funds.columns.threeYears"),
        cell: ({ getValue }) => (
          <ProfitabilityCell value={getValue()} locale={i18n.language} />
        ),
        sortDescFirst: true
      }),
      columnHelper.accessor((row) => row.profitability.fiveYears, {
        id: "fiveYears",
        header: () => t("funds.columns.fiveYears"),
        cell: ({ getValue }) => (
          <ProfitabilityCell value={getValue()} locale={i18n.language} />
        ),
        sortDescFirst: true
      }),
      columnHelper.display({
        id: "actions",
        header: () => t("funds.columns.actions"),
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label={t("funds.columns.actions")}>
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onBuy(row.original)}>
                <ArrowRightToLine />
                {t("funds.actions.buy")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSeeDetails(row.original)}>
                <Eye />
                {t("funds.actions.seeDetails")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [t, i18n.language, onBuy, onSeeDetails],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { sorting },
    onSortingChange,
    manualSorting: true,
    enableMultiSort: false,
  });

  return (
    <div className="overflow-auto rounded-xl max-h-[70vh]">
      <table className="w-full caption-bottom text-sm">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "sticky top-0 bg-background",
                      idx === 0 && "left-0 z-20",
                      idx !== 0 && "z-10",
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="flex cursor-pointer items-center whitespace-nowrap"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon sorted={sorted} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell, idx) => (
                <TableCell
                  key={cell.id}
                  className={cn(idx === 0 && "sticky left-0 z-10 bg-background")}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
    </div>
  );
}
