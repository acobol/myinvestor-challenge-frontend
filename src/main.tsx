import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";

const queryClient = new QueryClient();

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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
});
