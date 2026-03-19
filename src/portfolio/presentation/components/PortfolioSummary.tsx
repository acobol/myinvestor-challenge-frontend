import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell } from "recharts";
import { FUND_CATEGORIES } from "@/fund/domain/fund.constants";
import { formatCurrency } from "@/fund/presentation/utils/fund.formatters";
import { toEur } from "@/portfolio/presentation/utils/portfolio.formatters";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const CATEGORY_COLORS: Record<string, string> = {
  GLOBAL: "var(--chart-1)",
  TECH: "var(--chart-2)",
  HEALTH: "var(--chart-3)",
  MONEY_MARKET: "var(--chart-4)",
};

interface PortfolioSummaryProps {
  positions: PortfolioPosition[];
}

export function PortfolioSummary({ positions }: PortfolioSummaryProps) {
  const { t, i18n } = useTranslation();

  const totalEur = positions.reduce(
    (sum, p) => sum + toEur(p.totalValue.amount, p.totalValue.currency),
    0,
  );

  const categoryData = FUND_CATEGORIES.map((cat) => ({
    category: cat,
    value: positions
      .filter((p) => p.category === cat)
      .reduce((sum, p) => sum + toEur(p.totalValue.amount, p.totalValue.currency), 0),
  })).filter((d) => d.value > 0);

  const chartConfig = Object.fromEntries(
    FUND_CATEGORIES.map((cat) => [
      cat,
      {
        label: t(`funds.categories.${cat}`),
        color: CATEGORY_COLORS[cat],
      },
    ]),
  ) satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:items-center sm:justify-around">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{t("portfolio.summary.total")}</p>
        <p className="text-2xl font-bold">{formatCurrency(totalEur, "EUR", i18n.language)}</p>
      </div>

      {categoryData.length > 0 && (
        <div className="flex items-center gap-6">
          <ChartContainer config={chartConfig} className="h-40 w-40">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      formatCurrency(Number(value), "EUR", i18n.language)
                    }
                  />
                }
              />
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="category"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {categoryData.map(({ category }) => (
                  <Cell
                    key={category}
                    fill={CATEGORY_COLORS[category]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <ul className="space-y-1.5 text-sm">
            {categoryData.map(({ category, value }) => (
              <li key={category} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <span className="text-muted-foreground">
                  {t(`funds.categories.${category}`)}
                </span>
                <span className="ml-auto pl-4 font-medium tabular-nums">
                  {formatCurrency(value, "EUR", i18n.language)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
