import type { PortfolioPosition } from "./portfolio.schema";
import type { Order } from "./order.schema";

export interface PortfolioRepository {
  getPortfolio(): Promise<PortfolioPosition[]>;
  getOrders(): Promise<Order[]>;
  buyFund(fundId: string, quantity: number): Promise<void>;
  sellFund(fundId: string, quantity: number): Promise<void>;
  transferFund(fromFundId: string, toFundId: string, quantity: number): Promise<void>;
}
