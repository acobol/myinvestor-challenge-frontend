import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const LANGUAGES = ["es", "en"] as const;
type Language = (typeof LANGUAGES)[number];

function isLanguage(value: string): value is Language {
  return LANGUAGES.includes(value as Language);
}

export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const current: Language = isLanguage(i18n.resolvedLanguage ?? "")
    ? (i18n.resolvedLanguage as Language)
    : "es";

  const next: Language = current === "es" ? "en" : "es";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 px-0 font-semibold text-xs"
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={t("common.language.toggle")}
      title={t("common.language.switchTo", { lang: t(`common.language.${next}`) })}
    >
      {current.toUpperCase()}
    </Button>
  );
}
