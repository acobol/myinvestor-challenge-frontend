import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";

async function enableMocking() {
  if (!import.meta.env.DEV) return;
  const [{ worker }, { seedDatabase }] = await Promise.all([
    import("./mocks/browser"),
    import("./mocks/data"),
  ]);
  await seedDatabase();
  return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
});
