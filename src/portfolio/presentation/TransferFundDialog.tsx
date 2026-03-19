import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { useTransferFund } from "@/portfolio/application/useTransferFund";
import { useRecordOrder } from "@/portfolio/application/useRecordOrder";
import { Dialog } from "@/components/Dialog";
import { formatAmount } from "@/fund/presentation/fund.formatters";
import { TransferFundForm } from "./TransferFundForm";

export interface TransferFundDialogProps {
  position: PortfolioPosition | null;
  allPositions: PortfolioPosition[];
  onClose: () => void;
}

export function TransferFundDialog({ position, allPositions, onClose }: TransferFundDialogProps) {
  const { t, i18n } = useTranslation();
  const { mutate, isPending, reset } = useTransferFund();
  const recordOrder = useRecordOrder();

  function handleSubmit(toFundId: string, quantity: number) {
    if (!position) return;
    const toPosition = allPositions.find((p) => p.id === toFundId);
    mutate(
      { fromFundId: position.id, toFundId, quantity },
      {
        onSuccess: () => {
          void recordOrder({
            type: "TRANSFER",
            fundId: position.id,
            fundName: position.name,
            quantity,
            pricePerUnit: position.value.amount,
            currency: position.value.currency,
            toFundId,
            toFundName: toPosition?.name ?? toFundId,
          });
          toast.success(t("portfolio.transfer.success"), {
            description: t("portfolio.transfer.successDetail", {
              units: formatAmount(quantity, i18n.language),
              fromName: position.name,
              toName: toPosition?.name ?? toFundId,
            }),
          });
          handleClose();
        },
        onError: () => {
          toast.error(t("portfolio.transfer.error"));
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
        <TransferFundForm
          position={position}
          allPositions={allPositions}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          isPending={isPending}
        />
      )}
    </Dialog>
  );
}
