import type { Fund } from "@/fund/domain/fund.schema";
import { useBuyFund } from "@/portfolio/application/useBuyFund";
import { useRecordOrder } from "@/portfolio/application/useRecordOrder";
import { toEur } from "@/shared/application/currency.utils";
import { Dialog } from "@/components/Dialog";
import { BuyFundForm } from "@/portfolio/presentation/BuyFundForm";
import { formatAmount } from "@/fund/presentation/fund.formatters";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export interface BuyFundDialogProps {
  fund: Fund | null;
  onClose: () => void;
}

export function BuyFundDialog({ fund, onClose }: BuyFundDialogProps) {
  const { t, i18n } = useTranslation();
  const { mutate, isPending, reset } = useBuyFund();
  const recordOrder = useRecordOrder();

  function handleSubmit(quantity: number) {
    if (!fund) return;
    mutate(
      { fundId: fund.id, quantity },
      {
        onSuccess: () => {
          void recordOrder({
            type: "BUY",
            fundId: fund.id,
            fundName: fund.name,
            quantity,
            pricePerUnit: fund.value.amount,
            currency: fund.value.currency,
            amountEur: toEur(quantity * fund.value.amount, fund.value.currency),
          });
          toast.success(t("portfolio.buy.success"), {
            description: t("portfolio.buy.successDetail", {
              units: formatAmount(quantity, i18n.language),
              name: fund.name,
            }),
          });
          handleClose();
        },
        onError: () => {
          toast.error(t("portfolio.buy.error"));
          handleClose();
        },
      },
    );
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={fund !== null} onClose={handleClose}>
      {fund && (
        <BuyFundForm
          fund={fund}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
}
