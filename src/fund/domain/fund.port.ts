import type { FundsQuery, FundsResponse } from "./fund.schema";

export interface FundRepository {
  getFunds(query: FundsQuery): Promise<FundsResponse>;
}
