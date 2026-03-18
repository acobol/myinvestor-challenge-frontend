import type { PortfolioRepository } from "@/portfolio/domain/portfolio.port";
import { PortfolioItemSchema } from "@/portfolio/domain/portfolio.schema";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { FundResponseSchema } from "@/fund/domain/fund.schema";
import { z } from "zod";

const BASE_URL = "http://localhost:3000";

const PortfolioListResponseSchema = z.object({ data: z.array(PortfolioItemSchema) });

export const portfolioHttpRepository: PortfolioRepository = {
  async getPortfolio(): Promise<PortfolioPosition[]> {
    const res = await fetch(`${BASE_URL}/portfolio`);
    if (!res.ok) throw new Error("Failed to fetch portfolio");
    const items = PortfolioListResponseSchema.parse(await res.json()).data;

    if (items.length === 0) return [];

    // Enrich each position with fund metadata in parallel.
    // Individual fund fetch errors are swallowed so partial results are still shown.
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const fundRes = await fetch(`${BASE_URL}/funds/${item.id}`);
        if (!fundRes.ok) throw new Error(`Fund ${item.id} not found`);
        const fund = FundResponseSchema.parse(await fundRes.json()).data;
        return {
          ...item,
          symbol: fund.symbol,
          category: fund.category,
          value: fund.value,
          profitability: fund.profitability,
        } satisfies PortfolioPosition;
      }),
    );

    return results
      .filter((r): r is PromiseFulfilledResult<PortfolioPosition> => r.status === "fulfilled")
      .map((r) => r.value);
  },

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

  async sellFund(fundId: string, quantity: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/funds/${fundId}/sell`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { message?: string };
      throw new Error(json.message ?? "Failed to sell fund");
    }
  },

  async transferFund(fromFundId: string, toFundId: string, quantity: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/funds/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromFundId, toFundId, quantity }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { message?: string };
      throw new Error(json.message ?? "Failed to transfer fund");
    }
  },
};
