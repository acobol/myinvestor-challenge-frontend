import { useTranslation } from "react-i18next";
import { useOrders } from "@/portfolio/application/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderRow } from "./OrderRow";

const SKELETON_ROWS = 4;

export function OrdersList() {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = useOrders();

  if (isLoading) {
    return (
      <Card role="status">
        <span className="sr-only">{t("portfolio.orders.loading")}</span>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="p-0">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b px-4 py-3 last:border-b-0">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
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
        <p className="text-destructive">{t("portfolio.orders.error")}</p>
        <button
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {t("portfolio.orders.retry")}
        </button>
      </div>
    );
  }

  const orders = data ?? [];

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("portfolio.orders.empty")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portfolio.orders.title")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} locale={i18n.language} />
        ))}
      </CardContent>
    </Card>
  );
}
