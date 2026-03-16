import { useTranslation } from "react-i18next";
import { useFunds } from "@/fund/application/useFunds";
import { FundsTable } from "./FundsTable";

const ALL_FUNDS_LIMIT = 100;

export function FundsList() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useFunds({ limit: ALL_FUNDS_LIMIT });

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label={t("funds.loading")}
        className="flex items-center justify-center py-16 text-muted-foreground"
      >
        <svg
          aria-hidden="true"
          className="mr-2 h-5 w-5 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <span>{t("funds.loading")}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      >
        <p className="text-destructive">{t("funds.error")}</p>
        <button
          onClick={() => void refetch()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          {t("funds.retry")}
        </button>
      </div>
    );
  }

  return <FundsTable data={data?.data ?? []} />;
}
