import { useCallback, useState } from "react";
import { useFund } from "@/fund/application/useFund";
import { FundDetailDialog } from "./FundDetailDialog";

export function useFundDetail() {
  const [detailFundId, setDetailFundId] = useState<string | null>(null);
  const { data: detailFund = null } = useFund(detailFundId);

  const openDetail = useCallback((id: string) => setDetailFundId(id), []);
  const closeDetail = useCallback(() => setDetailFundId(null), []);

  const detailDialog = (
    <FundDetailDialog fund={detailFund} onClose={closeDetail} />
  );

  return { openDetail, detailDialog };
}
