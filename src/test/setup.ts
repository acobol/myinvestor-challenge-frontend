import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll } from "vitest";
import { server } from "@/mocks/server";
import { seedDatabase } from "@/mocks/data";

beforeAll(async () => {
  await seedDatabase();
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
