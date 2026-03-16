import { FundsList } from "@/fund/presentation/FundsList";
import { DevTools } from '@/components/DevTools';

function App() {
  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <FundsList />
        {import.meta.env.DEV && <DevTools />}
      </main>
    </>
  );
}

export default App;
