import { ChartLine, ArrowUp, ArrowDown, EllipsisVertical, ArrowRightToLine, ArrowLeftFromLine, ArrowRightLeft, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SwipeableRow } from "@/components/SwipeableRow";
import type { SwipeAction } from "@/components/SwipeableRow";
import { useMediaQuery } from "@/shared/application/useMediaQuery";
import { cn } from "@/lib/utils";
import { LinkButton } from "@/components/LinkButton";
import { formatAmount, formatCurrency, formatPercent } from "@/fund/presentation/utils/fund.formatters";
import { toEur, formatBenefit } from "../utils/portfolio.formatters";

interface PortfolioItemRowProps {
  position: PortfolioPosition;
  onBuy: () => void;
  onSell: () => void;
  onTransfer: () => void;
  onSeeDetails: () => void;
}

export function PortfolioItemRow({ position, onBuy, onSell, onTransfer, onSeeDetails }: PortfolioItemRowProps) {
  const { t, i18n } = useTranslation();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { totalValue, profitability } = position;

  const totalEur = toEur(totalValue.amount, totalValue.currency);
  const benefitAmount = totalEur * profitability.YTD / 100;
  const benefitPercent = profitability.YTD;
  const isPositive = benefitPercent > 0;
  const isNegative = benefitPercent < 0;

  const benefitColorClass = isPositive
    ? "text-green-600"
    : isNegative
      ? "text-red-500"
      : "text-muted-foreground";

  const swipeActions: SwipeAction[] = [
    {
      label: t("portfolio.actions.buy"),
      icon: <ArrowRightToLine size={16} />,
      onClick: onBuy,
      className: "bg-primary",
    },
    {
      label: t("portfolio.actions.sell"),
      icon: <ArrowLeftFromLine size={16} />,
      onClick: onSell,
      className: "bg-primary",
    },
    {
      label: t("portfolio.actions.transfer"),
      icon: <ArrowRightLeft size={16} />,
      onClick: onTransfer,
      className: "bg-primary",
    },
    {
      label: t("portfolio.actions.seeDetails"),
      icon: <Eye size={16} />,
      onClick: onSeeDetails,
      className: "bg-primary",
    },
  ];

  return (
    <SwipeableRow actions={swipeActions} disabled={isDesktop}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <ChartLine size={15} className="shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <LinkButton onClick={onSeeDetails}>
              {position.name}
            </LinkButton>
            <span className="text-xs text-muted-foreground">
              {t("portfolio.units", { units: formatAmount(position.quantity, i18n.language) })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">
              {formatCurrency(totalEur, "EUR", i18n.language)}
            </div>
            <div className={cn("flex items-center justify-end gap-0.5 text-xs tabular-nums", benefitColorClass)}>
              {isPositive && <ArrowUp size={11} />}
              {isNegative && <ArrowDown size={11} />}
              <span>{formatBenefit(benefitAmount, "EUR", i18n.language)}</span>
              <span>({formatPercent(benefitPercent, i18n.language)})</span>
            </div>
          </div>

          {isDesktop && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label={t("portfolio.actions.label")}>
                  <EllipsisVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onBuy}>
                  <ArrowRightToLine />
                  {t("portfolio.actions.buy")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSell}>
                  <ArrowLeftFromLine />
                  {t("portfolio.actions.sell")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTransfer}>
                  <ArrowRightLeft />
                  {t("portfolio.actions.transfer")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSeeDetails}>
                  <Eye />
                  {t("portfolio.actions.seeDetails")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </SwipeableRow>
  );
}
