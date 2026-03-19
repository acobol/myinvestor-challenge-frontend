import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PortfolioList } from "./components/PortfolioList";
import { OrdersList } from "./components/OrdersList";

export function PortfolioPage() {
  const { t } = useTranslation();

  return (
    <Tabs defaultValue="positions">
      <TabsList variant="line" className="mb-4">
        <TabsTrigger value="positions">{t("portfolio.tabs.positions")}</TabsTrigger>
        <TabsTrigger value="orders">{t("portfolio.tabs.orders")}</TabsTrigger>
      </TabsList>
      <TabsContent value="positions">
        <PortfolioList />
      </TabsContent>
      <TabsContent value="orders">
        <OrdersList />
      </TabsContent>
    </Tabs>
  );
}
