import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { SellFormSchema, type SellFormValues } from "@/portfolio/domain/sell-fund.schema";
import { EUR_USD_RATE } from "@/shared/domain/currency";
import { calculateSaleProceeds } from "@/portfolio/application/fund-actions.utils";
import { formatCurrency, formatAmount } from "@/fund/presentation/fund.formatters";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface SellFundFormProps {
  position: PortfolioPosition;
  onSubmit: (quantity: number) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function SellFundForm({ position, onSubmit, onCancel, isPending }: SellFundFormProps) {
  const { t, i18n } = useTranslation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellFormValues>({
    defaultValues: { quantity: 0 },
  });

  const quantity = watch("quantity") ?? 0;
  const proceeds = quantity > 0 ? calculateSaleProceeds(quantity, position) : null;

  function validateQuantity(value: number): string | true {
    const result = SellFormSchema.shape.quantity.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue?.code === "too_small") return t("portfolio.sell.validation.positive");
      return t("portfolio.sell.validation.invalid");
    }
    if (value > position.quantity) return t("portfolio.sell.validation.max");
    return true;
  }

  function handleFormSubmit(values: SellFormValues) {
    onSubmit(values.quantity);
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{t("portfolio.sell.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {position.name}
          {" · "}
          {formatCurrency(position.value.amount, position.value.currency, i18n.language)}
          {" "}
          {position.value.currency}
        </p>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("portfolio.sell.available", {
          units: formatAmount(position.quantity, i18n.language),
        })}
      </p>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">{t("portfolio.sell.quantityLabel")}</Label>
          <Controller
            control={control}
            name="quantity"
            rules={{ validate: validateQuantity }}
            render={({ field }) => (
              <Input
                id="quantity"
                type="number"
                min={0}
                step="any"
                value={field.value === 0 ? "" : field.value}
                onChange={(e) => field.onChange(isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)}
                onBlur={field.onBlur}
                disabled={isPending}
                aria-invalid={!!errors.quantity}
                aria-describedby={errors.quantity ? "quantity-error" : undefined}
              />
            )}
          />
          {errors.quantity && (
            <p id="quantity-error" role="alert" className="text-sm text-destructive">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {proceeds !== null && (
          <p className="text-sm text-muted-foreground">
            {t("portfolio.sell.proceedsPreview", {
              amount: formatCurrency(proceeds, "EUR", i18n.language),
            })}
          </p>
        )}

        {position.value.currency === "USD" && (
          <p className="text-xs text-muted-foreground">
            {t("portfolio.sell.conversionNote", { rate: EUR_USD_RATE })}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {t("portfolio.sell.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("portfolio.sell.submitting") : t("portfolio.sell.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
