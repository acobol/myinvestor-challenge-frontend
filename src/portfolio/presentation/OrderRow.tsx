import { useTranslation } from "react-i18next";
import type { Order, OrderType } from "@/portfolio/domain/order.schema";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatAmount } from "@/fund/presentation/fund.formatters";
import { formatOrderDate } from "./order.formatters";
import { ArrowRightLeft, ShoppingCart, TrendingDown } from "lucide-react";
import { LinkButton } from "@/components/LinkButton";

const ORDER_TYPE_STYLES: Record<OrderType, string> = {
  BUY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  SELL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  TRANSFER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};

const ORDER_TYPE_ICONS: Record<OrderType, React.ReactNode> = {
  BUY: <ShoppingCart className="size-3" />,
  SELL: <TrendingDown className="size-3" />,
  TRANSFER: <ArrowRightLeft className="size-3" />,
};

export interface OrderRowProps {
  order: Order;
  locale: string;
  onSeeDetails?: () => void;
}

export function OrderRow({ order, locale, onSeeDetails }: OrderRowProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-b px-4 py-3 last:border-b-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Badge className={ORDER_TYPE_STYLES[order.type]}>
            {ORDER_TYPE_ICONS[order.type]}
            {t(`portfolio.orders.types.${order.type}`)}
          </Badge>
          <LinkButton onClick={onSeeDetails}>
            {order.fundName}
          </LinkButton>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatOrderDate(order.date, locale)}</span>
          {order.type === "TRANSFER" && order.toFundName && (
            <>
              <span>→</span>
              <span>{order.toFundName}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm font-medium tabular-nums">
          {formatAmount(order.quantity, locale)} {t("portfolio.orders.units").toLowerCase()}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatCurrency(order.pricePerUnit, order.currency, locale)}/{t("portfolio.orders.units").toLowerCase().slice(0, 3)}.
        </span>
        {order.amountEur != null && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(order.amountEur, "EUR", locale)}
          </span>
        )}
      </div>
    </div>
  );
}
