import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import type { Fund } from "@/fund/domain/fund.schema";
import { Dialog } from "@/components/Dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "./fund.formatters";

interface ProfitabilityRowProps {
  label: string;
  value: number;
  locale: string;
}

function ProfitabilityRow({ label, value, locale }: ProfitabilityRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-medium tabular-nums",
          value > 0 ? "text-green-600" : value < 0 ? "text-red-500" : "",
        )}
      >
        {formatPercent(value, locale)}
      </span>
    </div>
  );
}

export interface FundDetailDialogProps {
  fund: Fund | null;
  onClose: () => void;
}

export function FundDetailDialog({ fund, onClose }: FundDetailDialogProps) {
  const { t, i18n } = useTranslation();

  return (
    <Dialog open={fund !== null} onClose={onClose}>
      {fund && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold leading-tight">{fund.name}</h2>
              <p className="text-sm text-muted-foreground">{fund.symbol}</p>
            </div>
            <Button size="icon" variant="ghost" aria-label="close" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("funds.detail.currentValue")}
            </p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(fund.value.amount, fund.value.currency, i18n.language)}
            </p>
            <p className="text-sm text-muted-foreground">
              {fund.value.currency} · {t(`funds.categories.${fund.category}`)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t("funds.detail.profitability")}
            </p>
            <ProfitabilityRow
              label={t("funds.columns.ytd")}
              value={fund.profitability.YTD}
              locale={i18n.language}
            />
            <ProfitabilityRow
              label={t("funds.columns.oneYear")}
              value={fund.profitability.oneYear}
              locale={i18n.language}
            />
            <ProfitabilityRow
              label={t("funds.columns.threeYears")}
              value={fund.profitability.threeYears}
              locale={i18n.language}
            />
            <ProfitabilityRow
              label={t("funds.columns.fiveYears")}
              value={fund.profitability.fiveYears}
              locale={i18n.language}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
}
