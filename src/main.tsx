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
  const [{ worker }, { seedDatabase }, { orderIdbRepository }] = await Promise.all([
    import("./mocks/browser"),
    import("./mocks/data"),
    import("./portfolio/infrastructure/order.idb-repository"),
  ]);
  await Promise.all([seedDatabase(), orderIdbRepository.clear()]);
  try {
    const state = JSON.parse(localStorage.getItem("msw-dev-tools") ?? "{}") as {
      mswDisabled?: boolean;
    };
    if (state.mswDisabled) return;
  } catch { /* ignore */ }
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
