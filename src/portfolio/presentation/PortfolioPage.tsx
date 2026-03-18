import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PortfolioPage() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("portfolio.title")}</CardTitle>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
