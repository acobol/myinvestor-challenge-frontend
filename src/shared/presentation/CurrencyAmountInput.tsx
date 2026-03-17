import { useState } from "react";
import { formatCurrency } from "@/fund/presentation/fund.formatters";
import { cn } from "@/lib/utils";

export interface CurrencyAmountInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur: () => void;
  /** BCP 47 locale used for display formatting. */
  locale: string;
  id?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

/**
 * Controlled text input that shows a locale-formatted EUR amount when blurred
 * (e.g. "10,55 €") and a plain numeric string when focused for easy editing.
 * Accepts both '.' and ',' as decimal separator.
 */
export function CurrencyAmountInput({
  value,
  onChange,
  onBlur,
  locale,
  ...props
}: CurrencyAmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState("");

  const displayValue = isFocused
    ? rawInput
    : value > 0
      ? formatCurrency(value, "EUR", locale)
      : "";

  function handleFocus() {
    setIsFocused(true);
    setRawInput(value > 0 ? String(value) : "");
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    setRawInput(raw);
    const normalized = raw.replace(",", ".");
    const parsed = parseFloat(normalized);
    onChange(isNaN(parsed) ? 0 : parsed);
  }

  function handleBlur() {
    setIsFocused(false);
    onBlur();
  }

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        (props["aria-invalid"] === true || props["aria-invalid"] === "true") &&
          "border-destructive",
      )}
    />
  );
}
