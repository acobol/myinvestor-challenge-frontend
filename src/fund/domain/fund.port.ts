import type { Fund, FundsQuery, FundsResponse } from "./fund.schema";

export interface FundRepository {
  getFunds(query: FundsQuery): Promise<FundsResponse>;
  getFundById(id: string): Promise<Fund>;
}
