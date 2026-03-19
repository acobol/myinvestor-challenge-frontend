import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { Fund } from "@/fund/domain/fund.schema";
import { EUR_USD_RATE } from "@/shared/domain/currency";
import { calculateQuantity } from "@/portfolio/application/fund-actions.utils";
import { BuyFormSchema, type BuyFormValues } from "@/portfolio/domain/buy-fund.schema";
import { formatCurrency, formatAmount } from "@/fund/presentation/fund.formatters";
import { CurrencyAmountInput } from "@/shared/presentation/CurrencyAmountInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface BuyFundFormProps {
  fund: Fund;
  onSubmit: (quantity: number) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function BuyFundForm({
  fund,
  onSubmit,
  onCancel,
  isPending,
}: BuyFundFormProps) {
  const { t, i18n } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BuyFormValues>({
    defaultValues: { amountEur: 0 },
    // Default mode is 'onSubmit': validates on submit, then re-validates on change.
    // Alternatives: 'onTouched' (after first blur) | 'onChange' (immediate) | 'onBlur'.
    // https://react-hook-form.com/docs/useform#mode
  });

  const amountEur = watch("amountEur") ?? 0;
  const unitQuantity = amountEur > 0 ? calculateQuantity(amountEur, fund) : null;

  function validateAmount(value: number): string | true {
    const result = BuyFormSchema.shape.amountEur.safeParse(value);
    if (result.success) return true;
    const issue = result.error.issues[0];
    if (issue?.code === "too_big") return t("portfolio.buy.validation.max");
    if (issue?.code === "too_small") return t("portfolio.buy.validation.positive");
    return t("portfolio.buy.validation.invalid");
  }

  function handleFormSubmit(values: BuyFormValues) {
    onSubmit(calculateQuantity(values.amountEur, fund));
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{t("portfolio.buy.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {fund.name}
          {" · "}
          {formatCurrency(fund.value.amount, fund.value.currency, i18n.language)}
          {" "}
          {fund.value.currency}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amountEur">{t("portfolio.buy.amountLabel")}</Label>
          <Controller
            control={control}
            name="amountEur"
            rules={{ validate: validateAmount }}
            render={({ field }) => (
              <CurrencyAmountInput
                id="amountEur"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                locale={i18n.language}
                disabled={isPending}
                aria-invalid={!!errors.amountEur}
                aria-describedby={
                  errors.amountEur ? "amountEur-error" : undefined
                }
              />
            )}
          />
          {errors.amountEur && (
            <p
              id="amountEur-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {errors.amountEur.message}
            </p>
          )}
        </div>

        {unitQuantity !== null && (
          <p className="text-sm text-muted-foreground">
            {t("portfolio.buy.unitsPreview", {
              units: formatAmount(unitQuantity, i18n.language),
            })}
          </p>
        )}

        {fund.value.currency === "USD" && (
          <p className="text-xs text-muted-foreground">
            {t("portfolio.buy.conversionNote", { rate: EUR_USD_RATE })}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            {t("portfolio.buy.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? t("portfolio.buy.submitting")
              : t("portfolio.buy.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
