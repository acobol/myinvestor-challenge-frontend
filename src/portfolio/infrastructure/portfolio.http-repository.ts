import type { PortfolioRepository } from "@/portfolio/domain/portfolio.port";

const BASE_URL = "http://localhost:3000";

export const portfolioHttpRepository: PortfolioRepository = {
  async buyFund(fundId: string, quantity: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/funds/${fundId}/buy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { message?: string };
      throw new Error(json.message ?? "Failed to buy fund");
    }
  },
};
