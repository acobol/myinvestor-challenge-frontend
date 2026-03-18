import type { PortfolioPosition } from "./portfolio.schema";

export interface PortfolioRepository {
  getPortfolio(): Promise<PortfolioPosition[]>;
  buyFund(fundId: string, quantity: number): Promise<void>;
  sellFund(fundId: string, quantity: number): Promise<void>;
  transferFund(fromFundId: string, toFundId: string, quantity: number): Promise<void>;
}
