import { http, HttpResponse } from "msw";
import { fundsDb, portfolioDb } from "./data";
import type { FundsQuery } from "@/fund/domain/fund.schema";
import { FundsQuerySchema } from "@/fund/domain/fund.schema";
import type { PortfolioItem } from "@/portfolio/domain/portfolio.schema";

import { API_BASE_URL } from "@/shared/infrastructure/api.config";

const BASE = API_BASE_URL;

// ---- Helpers ----

/**
 * Converts a sort string like "profitability.YTD:asc" or "currency:asc" into
 * the nested orderBy object expected by @msw/data.
 * "currency" maps to value.currency; "value" maps to value.amount.
 */
function buildOrderBy(sort: FundsQuery["sort"]): Record<string, unknown> | undefined {
  if (!sort) return undefined;

  const [rawField, direction] = sort.split(":") as [string, "asc" | "desc"];

  const FIELD_PATH_MAP: Record<string, string> = {
    currency: "value.currency",
    value: "value.amount",
  };
  const field = FIELD_PATH_MAP[rawField] ?? rawField;
  const keys = field.split(".");

  const orderBy: Record<string, unknown> = {};
  let cursor: Record<string, unknown> = orderBy;
  for (let i = 0; i < keys.length - 1; i++) {
    cursor[keys[i]] = {};
    cursor = cursor[keys[i]] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = direction;

  return orderBy;
}

/** Recomputes totalValue for every position based on current fund price. */
function getPortfolioWithValues(): PortfolioItem[] {
  const positions = portfolioDb.all();
  return positions.map((pos) => {
    const fund = fundsDb.findFirst((q) => q.where({ id: pos.id }));
    if (!fund) return pos;
    return {
      ...pos,
      totalValue: {
        amount: parseFloat((fund.value.amount * pos.quantity).toFixed(2)),
        currency: fund.value.currency,
      },
    };
  });
}

// ---- Handlers ----

export const handlers = [
  // GET /funds — list with pagination + sorting
  http.get(`${BASE}/funds`, ({ request }) => {
    const url = new URL(request.url);
    const params = FundsQuerySchema.parse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      sort: url.searchParams.get("sort") ?? undefined,
    });

    const orderBy = buildOrderBy(params.sort);
    const allFunds = fundsDb.findMany(undefined, { orderBy });
    const totalFunds = allFunds.length;
    const totalPages = Math.ceil(totalFunds / params.limit);
    const skip = (params.page - 1) * params.limit;
    const data = allFunds.slice(skip, skip + params.limit);

    return HttpResponse.json({
      pagination: { page: params.page, limit: params.limit, totalFunds, totalPages },
      data,
    });
  }),

  // GET /funds/:id — single fund
  http.get(`${BASE}/funds/:id`, ({ params }) => {
    const fund = fundsDb.findFirst((q) => q.where({ id: params.id as string }));
    if (!fund) {
      return HttpResponse.json({ message: "Fund not found" }, { status: 404 });
    }
    return HttpResponse.json({ data: fund });
  }),

  // POST /funds/transfer — must be before /funds/:id/buy to avoid :id = "transfer"
  http.post(`${BASE}/funds/transfer`, async ({ request }) => {
    const { fromFundId, toFundId, quantity } = (await request.json()) as {
      fromFundId: string;
      toFundId: string;
      quantity: number;
    };

    const fromFund = fundsDb.findFirst((q) => q.where({ id: fromFundId }));
    const toFund = fundsDb.findFirst((q) => q.where({ id: toFundId }));

    if (!fromFund || !toFund) {
      return HttpResponse.json({ message: "Fund not found" }, { status: 404 });
    }

    const fromPos = portfolioDb.findFirst((q) => q.where({ id: fromFundId }));
    if (!fromPos || fromPos.quantity < quantity) {
      return HttpResponse.json(
        { message: "Not enough units to transfer" },
        { status: 400 }
      );
    }

    // Deduct from source
    if (fromPos.quantity === quantity) {
      portfolioDb.delete(fromPos);
    } else {
      await portfolioDb.update(fromPos, {
        data(pos) {
          pos.quantity -= quantity;
        },
      });
    }

    // Add to destination
    const toPos = portfolioDb.findFirst((q) => q.where({ id: toFundId }));
    if (toPos) {
      await portfolioDb.update(toPos, {
        data(pos) {
          pos.quantity += quantity;
        },
      });
    } else {
      await portfolioDb.create({
        id: toFundId,
        name: toFund.name,
        quantity,
        totalValue: {
          amount: parseFloat((toFund.value.amount * quantity).toFixed(2)),
          currency: toFund.value.currency,
        },
      });
    }

    return HttpResponse.json({
      message: "Transfer successful",
      data: { portfolio: getPortfolioWithValues() },
    });
  }),

  // POST /funds/:id/buy
  http.post(`${BASE}/funds/:id/buy`, async ({ request, params }) => {
    const fundId = params.id as string;
    const { quantity } = (await request.json()) as { quantity: number };

    const fund = fundsDb.findFirst((q) => q.where({ id: fundId }));
    if (!fund) {
      return HttpResponse.json({ message: "Fund not found" }, { status: 404 });
    }

    const existing = portfolioDb.findFirst((q) => q.where({ id: fundId }));
    if (existing) {
      await portfolioDb.update(existing, {
        data(pos) {
          pos.quantity += quantity;
        },
      });
    } else {
      await portfolioDb.create({
        id: fundId,
        name: fund.name,
        quantity,
        totalValue: {
          amount: parseFloat((fund.value.amount * quantity).toFixed(2)),
          currency: fund.value.currency,
        },
      });
    }

    return HttpResponse.json({
      message: "Purchase successful",
      data: { portfolio: getPortfolioWithValues() },
    });
  }),

  // POST /funds/:id/sell
  http.post(`${BASE}/funds/:id/sell`, async ({ request, params }) => {
    const fundId = params.id as string;
    const { quantity } = (await request.json()) as { quantity: number };

    const position = portfolioDb.findFirst((q) => q.where({ id: fundId }));
    if (!position) {
      return HttpResponse.json(
        { message: "Fund not found in portfolio" },
        { status: 404 }
      );
    }
    if (position.quantity < quantity) {
      return HttpResponse.json(
        { message: "Not enough units to sell" },
        { status: 400 }
      );
    }

    if (position.quantity === quantity) {
      portfolioDb.delete(position);
    } else {
      await portfolioDb.update(position, {
        data(pos) {
          pos.quantity -= quantity;
        },
      });
    }

    return HttpResponse.json({
      message: "Sale successful",
      data: { portfolio: getPortfolioWithValues() },
    });
  }),

  // GET /portfolio
  http.get(`${BASE}/portfolio`, () => {
    return HttpResponse.json({ data: getPortfolioWithValues() });
  }),
];
