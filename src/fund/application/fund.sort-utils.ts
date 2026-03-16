import type { SortingState } from "@tanstack/react-table";
import type { FundSortOption } from "@/fund/domain/fund.schema";

/** Maps TanStack Table column IDs to the corresponding API sort field. */
const SORT_FIELD_MAP: Record<string, string> = {
  name: "name",
  category: "category",
  value: "value",
  currency: "currency",
  ytd: "profitability.YTD",
  oneYear: "profitability.oneYear",
  threeYears: "profitability.threeYears",
  fiveYears: "profitability.fiveYears",
};

export function toApiSort(sorting: SortingState): FundSortOption | undefined {
  if (sorting.length === 0) return undefined;
  const { id, desc } = sorting[0];
  const field = SORT_FIELD_MAP[id];
  if (!field) return undefined;
  return `${field}:${desc ? "desc" : "asc"}` as FundSortOption;
}
