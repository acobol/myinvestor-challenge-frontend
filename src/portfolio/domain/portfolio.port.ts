export interface PortfolioRepository {
  buyFund(fundId: string, quantity: number): Promise<void>;
}
