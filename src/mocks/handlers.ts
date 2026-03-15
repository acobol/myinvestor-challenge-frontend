import { http, HttpResponse } from "msw";

export const handlers = [
  // Handlers will be added in Phase 0.5
  http.get("http://localhost:3000/funds", () => {
    return HttpResponse.json({
      data: [],
      pagination: { page: 1, limit: 10, totalFunds: 0, totalPages: 0 },
    });
  }),
  http.get("http://localhost:3000/portfolio", () => {
    return HttpResponse.json({ data: [] });
  }),
];
