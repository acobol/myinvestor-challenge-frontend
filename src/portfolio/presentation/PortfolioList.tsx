import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FUND_CATEGORIES } from "@/fund/domain/fund.constants";
import { usePortfolio } from "@/portfolio/application/usePortfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioGroup } from "./PortfolioGroup";

const SKELETON_GROUPS = 2;
const SKELETON_ITEMS = 3;

export function PortfolioList() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = usePortfolio();

  const noop = useCallback(() => {}, []);

  if (isLoading) {
    return (
      <Card role="status">
        <span className="sr-only">{t("portfolio.loading")}</span>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: SKELETON_GROUPS }).map((_, g) => (
            <div key={g} className="border-b last:border-b-0">
              <Skeleton className="mx-4 my-3 h-4 w-28" />
              {Array.from({ length: SKELETON_ITEMS }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-t px-4 py-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ))}
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
        <p className="text-destructive">{t("portfolio.error")}</p>
        <button
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {t("portfolio.retry")}
        </button>
      </div>
    );
  }

  const positions = data ?? [];

  const groups = FUND_CATEGORIES.map((category) => ({
    category,
    items: positions
      .filter((p) => p.category === category)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portfolio.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {groups.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("portfolio.empty")}</p>
        ) : (
          groups.map(({ category, items }) => (
            <PortfolioGroup
              key={category}
              category={category}
              items={items}
              onBuy={noop}
              onSell={noop}
              onTransfer={noop}
              onSeeDetails={noop}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
