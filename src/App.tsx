import { useTranslation } from "react-i18next";

function App() {
  const { t } = useTranslation();

  return <div>{t("funds.title")}</div>;
}

export default App;
