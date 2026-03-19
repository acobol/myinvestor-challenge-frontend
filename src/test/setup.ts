import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { server } from "@/mocks/server";
import { seedDatabase } from "@/mocks/data";
import { orderIdbRepository } from "@/portfolio/infrastructure/order.idb-repository";

// Recharts' ResponsiveContainer uses ResizeObserver; jsdom does not implement it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Sonner uses matchMedia for dark-mode detection; jsdom does not implement it.
window.matchMedia = window.matchMedia ?? ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as typeof window.matchMedia;

// Radix UI uses pointer capture and scroll APIs that jsdom does not implement.
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.Element.prototype.scrollIntoView = () => {};

beforeAll(async () => {
  await seedDatabase();
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(async () => {
  server.resetHandlers();
  cleanup();
  await orderIdbRepository.clear();
});

afterAll(() => server.close());
