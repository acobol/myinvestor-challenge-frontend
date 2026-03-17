import type { Fund } from "@/fund/domain/fund.schema";
import { useBuyFund } from "@/portfolio/application/useBuyFund";
import { Dialog } from "@/components/Dialog";
import { BuyFundForm } from "./BuyFundForm";

export interface BuyFundDialogProps {
  fund: Fund | null;
  onClose: () => void;
}

export function BuyFundDialog({ fund, onClose }: BuyFundDialogProps) {
  const { mutate, isPending, isError, reset } = useBuyFund();

  function handleSubmit(quantity: number) {
    if (!fund) return;
    mutate({ fundId: fund.id, quantity }, { onSuccess: onClose });
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
          isError={isError}
        />
      )}
    </Dialog>
  );
}
