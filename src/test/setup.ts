import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { server } from "@/mocks/server";
import { seedDatabase } from "@/mocks/data";

// Radix UI uses pointer capture and scroll APIs that jsdom does not implement.
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {};
window.HTMLElement.prototype.releasePointerCapture = () => {};
window.Element.prototype.scrollIntoView = () => {};

beforeAll(async () => {
  await seedDatabase();
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
