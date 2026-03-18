import { FundsList } from "@/fund/presentation/FundsList";
import { DevTools } from "@/components/DevTools";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
        <main className="mx-auto max-w-7xl px-4 py-8">
          <FundsList />
          {import.meta.env.DEV && <DevTools />}
        </main>
        <Toaster />
      </>
  );
}

export default App;
