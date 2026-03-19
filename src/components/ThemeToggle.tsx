import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        checked={resolvedTheme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={t("common.theme.toggle")}
      />
      <Moon className="size-4 text-muted-foreground" />
    </label>
  );
}
