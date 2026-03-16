import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useFunds } from "./useFunds";
import { wrapper } from "@/test/test-utils";

describe("useFunds", () => {
  it("fetches the first page of funds with defaults", async () => {
    const { result } = renderHook(() => useFunds(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const { data } = result.current;
    expect(data?.pagination.page).toBe(1);
    expect(data?.pagination.limit).toBe(10);
    expect(data?.pagination.totalFunds).toBeGreaterThan(0);
    expect(data?.data.length).toBe(10);
    expect(data?.data[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      symbol: expect.any(String),
      value: { amount: expect.any(Number), currency: expect.stringMatching(/^(USD|EUR)$/) },
      category: expect.any(String),
      profitability: expect.objectContaining({ YTD: expect.any(Number) }),
    });
  });

  it("respects page and limit query params", async () => {
    const { result } = renderHook(() => useFunds({ page: 2, limit: 5 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pagination.page).toBe(2);
    expect(result.current.data?.pagination.limit).toBe(5);
    expect(result.current.data?.data.length).toBe(5);
  });

  it("respects sort query param", async () => {
    const { result } = renderHook(() => useFunds({ sort: "name:asc" }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const names = result.current.data?.data.map((f) => f.name) ?? [];
    expect(names).toEqual([...names].sort());
  });
});
