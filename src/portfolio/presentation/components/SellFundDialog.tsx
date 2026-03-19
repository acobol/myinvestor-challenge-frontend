import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { useSellFund } from "@/portfolio/application/useSellFund";
import { useRecordOrder } from "@/portfolio/application/useRecordOrder";
import { calculateSaleProceeds } from "@/portfolio/application/fund-actions.utils";
import { Dialog } from "@/components/Dialog";
import { formatAmount, formatCurrency } from "@/fund/presentation/utils/fund.formatters";
import { SellFundForm } from "./SellFundForm";

export interface SellFundDialogProps {
  position: PortfolioPosition | null;
  onClose: () => void;
}

export function SellFundDialog({ position, onClose }: SellFundDialogProps) {
  const { t, i18n } = useTranslation();
  const { mutate, isPending, reset } = useSellFund();
  const recordOrder = useRecordOrder();

  function handleSubmit(quantity: number) {
    if (!position) return;
    const proceeds = calculateSaleProceeds(quantity, position);
    mutate(
      { fundId: position.id, quantity },
      {
        onSuccess: () => {
          void recordOrder({
            type: "SELL",
            fundId: position.id,
            fundName: position.name,
            quantity,
            pricePerUnit: position.value.amount,
            currency: position.value.currency,
            amountEur: proceeds,
          });
          toast.success(t("portfolio.sell.success"), {
            description: t("portfolio.sell.successDetail", {
              units: formatAmount(quantity, i18n.language),
              name: position.name,
              amount: formatCurrency(proceeds, "EUR", i18n.language),
            }),
          });
          handleClose();
        },
        onError: () => {
          toast.error(t("portfolio.sell.error"));
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
    <Dialog open={position !== null} onClose={handleClose}>
      {position && (
        <SellFundForm
          position={position}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
}
