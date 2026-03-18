import { http, HttpResponse } from "msw";
import { worker } from "./browser";

const BASE = "http://localhost:3000";

export const ERROR_ENDPOINTS = [
  {
    id: "funds-list",
    label: "GET /funds",
    handler: http.get(`${BASE}/funds`, () =>
      HttpResponse.json({ message: "Simulated error" }, { status: 500 }),
    ),
  },
  {
    id: "portfolio",
    label: "GET /portfolio",
    handler: http.get(`${BASE}/portfolio`, () =>
      HttpResponse.json({ message: "Simulated error" }, { status: 500 }),
    ),
  },
  {
    id: "buy-fund",
    label: "POST /funds/:id/buy",
    handler: http.post(`${BASE}/funds/:id/buy`, () =>
      HttpResponse.json({ message: "Simulated error" }, { status: 500 }),
    ),
  },
] as const;

export type ErrorEndpointId = (typeof ERROR_ENDPOINTS)[number]["id"];

/**
 * Resets all runtime overrides then re-applies only the active error handlers.
 * Call this every time the active set changes.
 */
export function applyErrorOverrides(activeIds: ReadonlySet<ErrorEndpointId>) {
  worker.resetHandlers();
  const handlers = ERROR_ENDPOINTS.filter((ep) => activeIds.has(ep.id)).map((ep) => ep.handler);
  if (handlers.length > 0) {
    worker.use(...handlers);
  }
}

export async function startMsw(activeErrors: ReadonlySet<ErrorEndpointId>) {
  await worker.start({ onUnhandledRequest: "bypass" });
  if (activeErrors.size > 0) applyErrorOverrides(activeErrors);
}

export function stopMsw() {
  worker.stop();
}
