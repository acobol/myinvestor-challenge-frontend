import { FundResponseSchema, FundsResponseSchema } from "@/fund/domain/fund.schema";
import type { FundRepository } from "@/fund/domain/fund.port";
import type { Fund, FundsQuery, FundsResponse } from "@/fund/domain/fund.schema";
import { API_BASE_URL } from "@/shared/infrastructure/api.config";

function buildFundsUrl(query: FundsQuery): string {
  const params = new URLSearchParams();
  params.set("page", String(query.page));
  params.set("limit", String(query.limit));
  if (query.sort) params.set("sort", query.sort);
  return `${API_BASE_URL}/funds?${params.toString()}`;
}

export const fundHttpRepository: FundRepository = {
  async getFunds(query: FundsQuery): Promise<FundsResponse> {
    const response = await fetch(buildFundsUrl(query));

    if (!response.ok) {
      throw new Error(`Failed to fetch funds: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    return FundsResponseSchema.parse(json);
  },

  async getFundById(id: string): Promise<Fund> {
    const response = await fetch(`${API_BASE_URL}/funds/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch fund: ${response.status} ${response.statusText}`);
    }

    const json: unknown = await response.json();
    return FundResponseSchema.parse(json).data;
  },
};
