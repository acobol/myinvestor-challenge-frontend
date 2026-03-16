import { Collection } from "@msw/data";
import { faker } from "@faker-js/faker";
import {
  FundSchema,
  FundCategorySchema,
  CurrencySchema,
  type Fund,
  type FundCategory,
} from "@/fund/domain/fund.schema";
import { PortfolioItemSchema } from "@/portfolio/domain/portfolio.schema";

// ---- Collections ----

export const fundsDb = new Collection({ schema: FundSchema });
export const portfolioDb = new Collection({ schema: PortfolioItemSchema });

// ---- Fund generation ----

const MANAGERS = [
  "Vanguard",
  "iShares",
  "Fidelity",
  "BlackRock",
  "Amundi",
  "Invesco",
  "Schroders",
  "Nordea",
  "Pictet",
  "DWS",
  "Robeco",
  "Allianz",
  "Franklin",
  "PIMCO",
  "Threadneedle",
];

const FOCUS_BY_CATEGORY: Record<FundCategory, string[]> = {
  GLOBAL: ["Global", "World", "International", "Sustainable Global", "Emerging Markets"],
  TECH: ["Technology", "Digital Innovation", "Cybersecurity", "Semiconductor", "Cloud Computing", "Fintech"],
  HEALTH: ["Healthcare", "Biotech", "Pharma", "Medical Devices", "Life Sciences", "Oncology"],
  MONEY_MARKET: ["Money Market", "Short-Term Bond", "Liquidity", "Cash Reserve", "Treasury"],
};

const FUND_TYPES = ["Fund", "ETF", "Index Fund", "UCITS"];

const PROFITABILITY_RANGES: Record<
  FundCategory,
  { ytd: [number, number]; multipliers: [number, number, number] }
> = {
  MONEY_MARKET: { ytd: [0.5, 4], multipliers: [2, 5, 9] },
  GLOBAL: { ytd: [-5, 18], multipliers: [2.5, 6, 11] },
  HEALTH: { ytd: [-3, 22], multipliers: [2.5, 6.5, 12] },
  TECH: { ytd: [-15, 35], multipliers: [2.5, 7, 14] },
};

function generateFund(index: number): Fund {
  const category = faker.helpers.arrayElement(FundCategorySchema.options);
  const { ytd, multipliers } = PROFITABILITY_RANGES[category];
  const ytdValue = faker.number.float({ min: ytd[0], max: ytd[1], fractionDigits: 1 });

  return {
    id: `fund-${String(index + 1).padStart(3, "0")}`,
    name: `${faker.helpers.arrayElement(MANAGERS)} ${faker.helpers.arrayElement(FOCUS_BY_CATEGORY[category])} ${faker.helpers.arrayElement(FUND_TYPES)}`,
    symbol: faker.string.alpha({ length: 4, casing: "upper" }),
    value: {
      amount:
        category === "MONEY_MARKET"
          ? faker.number.float({ min: 99, max: 101, fractionDigits: 2 })
          : faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
      currency: faker.helpers.arrayElement(CurrencySchema.options),
    },
    category,
    profitability: {
      YTD: ytdValue,
      oneYear: parseFloat((ytdValue * multipliers[0]).toFixed(1)),
      threeYears: parseFloat((ytdValue * multipliers[1]).toFixed(1)),
      fiveYears: parseFloat((ytdValue * multipliers[2]).toFixed(1)),
    },
  };
}

// ---- Seed ----

export async function seedDatabase(): Promise<void> {
  fundsDb.clear();
  portfolioDb.clear();

  faker.seed(42);

  await fundsDb.createMany(28, (i) => generateFund(i));

  const initialFunds = fundsDb.all().slice(0, 3);
  for (const fund of initialFunds) {
    const qty = faker.number.int({ min: 20, max: 100 });
    await portfolioDb.create({
      id: fund.id,
      name: fund.name,
      quantity: qty,
      totalValue: {
        amount: parseFloat((fund.value.amount * qty).toFixed(2)),
        currency: fund.value.currency,
      },
    });
  }
}
