import { Navigate, Route, Routes } from "react-router";
import { FundsList } from "@/fund/presentation/FundsList";
import { PortfolioPage } from "@/portfolio/presentation/PortfolioPage";
import { AppNav, MobileBottomNav } from "@/components/AppNav";
import { DevTools } from "@/components/DevTools";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1 gap-6 mx-auto w-full max-w-7xl px-4 py-8">
        <AppNav />
        <main className="flex-1 min-w-0">
          <Routes>
            <Route index element={<Navigate to="/funds" replace />} />
            <Route path="/funds" element={<FundsList />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
          </Routes>
        </main>
      </div>
      {/* Mobile bottom nav sits after content — never overlaps */}
      <MobileBottomNav />
      {import.meta.env.DEV && <DevTools />}
      <Toaster />
    </div>
  );
}

export default App;
