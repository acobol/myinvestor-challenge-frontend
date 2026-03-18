import { useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { TransferFormSchema, type TransferFormValues } from "@/portfolio/domain/transfer-fund.schema";
import { formatAmount } from "@/fund/presentation/fund.formatters";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface TransferFundFormProps {
  position: PortfolioPosition;
  allPositions: PortfolioPosition[];
  onSubmit: (toFundId: string, quantity: number) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function TransferFundForm({
  position,
  allPositions,
  onSubmit,
  onCancel,
  isPending,
}: TransferFundFormProps) {
  const { t, i18n } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferFormValues>({
    defaultValues: { toFundId: "", quantity: 0 },
  });

  function validateToFundId(value: string): string | true {
    const result = TransferFormSchema.shape.toFundId.safeParse(value);
    if (!result.success) return t("portfolio.transfer.validation.toFundRequired");
    if (value === position.id) return t("portfolio.transfer.validation.sameFund");
    return true;
  }

  function validateQuantity(value: number): string | true {
    const result = TransferFormSchema.shape.quantity.safeParse(value);
    if (!result.success) {
      const issue = result.error.issues[0];
      if (issue?.code === "too_small") return t("portfolio.transfer.validation.positive");
      return t("portfolio.transfer.validation.invalid");
    }
    if (value > position.quantity) return t("portfolio.transfer.validation.max");
    return true;
  }

  function handleFormSubmit(values: TransferFormValues) {
    onSubmit(values.toFundId, values.quantity);
  }

  return (
    <div ref={containerRef} className="p-6 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">{t("portfolio.transfer.title")}</h2>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>{t("portfolio.transfer.fromLabel")}</Label>
        <p className="text-sm text-muted-foreground">
          {position.name}
          {" · "}
          {t("portfolio.transfer.available", {
            units: formatAmount(position.quantity, i18n.language),
          })}
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="toFundId">{t("portfolio.transfer.toLabel")}</Label>
          <Controller
            control={control}
            name="toFundId"
            rules={{ validate: validateToFundId }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isPending}
              >
                <SelectTrigger
                  id="toFundId"
                  aria-invalid={!!errors.toFundId}
                  aria-describedby={errors.toFundId ? "toFundId-error" : undefined}
                >
                  <SelectValue placeholder={t("portfolio.transfer.toPlaceholder")} />
                </SelectTrigger>
                <SelectContent container={containerRef.current}>
                  {allPositions
                    .filter((pos) => pos.id !== position.id)
                    .map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.toFundId && (
            <p id="toFundId-error" role="alert" className="text-sm text-destructive">
              {errors.toFundId.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quantity">{t("portfolio.transfer.quantityLabel")}</Label>
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
                onChange={(e) =>
                  field.onChange(isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber)
                }
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            {t("portfolio.transfer.cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? t("portfolio.transfer.submitting") : t("portfolio.transfer.submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
