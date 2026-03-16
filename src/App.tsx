import { useTranslation } from "react-i18next";
import { FundsList } from "@/fund/presentation/FundsList";
import { DevTools } from '@/components/DevTools';

function App() {
  const { t } = useTranslation();

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">{t("funds.title")}</h1>
        <FundsList />
        {import.meta.env.DEV && <DevTools />}
      </main>
    </>
  );
}

export default App;
