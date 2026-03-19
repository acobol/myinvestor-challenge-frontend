import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { render } from "@/test/test-utils";
import { orderIdbRepository } from "@/portfolio/infrastructure/order.idb-repository";
import "@/i18n";
import i18n from "@/i18n";
import { OrdersList } from "./OrdersList";

describe("OrdersList", () => {
  const t = i18n.t.bind(i18n);

  it("shows an empty state when there are no orders", async () => {
    render(<OrdersList />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

    expect(screen.getByText(t("portfolio.orders.empty"))).toBeInTheDocument();
  });

  it("shows orders after they are recorded", async () => {
    await orderIdbRepository.addOrder({
      type: "BUY",
      fundId: "fund-001",
      fundName: "Vanguard Global Fund",
      quantity: 5.5,
      pricePerUnit: 100,
      currency: "EUR",
      amountEur: 550,
    });

    await orderIdbRepository.addOrder({
      type: "SELL",
      fundId: "fund-002",
      fundName: "BlackRock Tech ETF",
      quantity: 3,
      pricePerUnit: 200,
      currency: "USD",
    });

    await orderIdbRepository.addOrder({
      type: "TRANSFER",
      fundId: "fund-003",
      fundName: "Fidelity Health Fund",
      quantity: 2,
      pricePerUnit: 100,
      currency: "EUR",
      toFundId: "fund-004",
      toFundName: "Amundi Money Market",
    });

    render(<OrdersList />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

    // Each order shows its fund name
    expect(screen.getByText("Vanguard Global Fund")).toBeInTheDocument();
    expect(screen.getByText("BlackRock Tech ETF")).toBeInTheDocument();
    expect(screen.getByText("Fidelity Health Fund")).toBeInTheDocument();

    // Transfer shows destination
    expect(screen.getByText("Amundi Money Market")).toBeInTheDocument();

    // All order type badges are present
    expect(screen.getByText(t("portfolio.orders.types.BUY"))).toBeInTheDocument();
    expect(screen.getByText(t("portfolio.orders.types.SELL"))).toBeInTheDocument();
    expect(screen.getByText(t("portfolio.orders.types.TRANSFER"))).toBeInTheDocument();

    // Buy order shows EUR amount
    expect(screen.getByText("€550.00")).toBeInTheDocument();
  });

  it("shows newest orders first", async () => {
    await orderIdbRepository.addOrder({
      type: "BUY",
      fundId: "fund-001",
      fundName: "First Order",
      quantity: 1,
      pricePerUnit: 100,
      currency: "EUR",
      amountEur: 100,
    });

    // Small delay to ensure different timestamps
    await new Promise((r) => setTimeout(r, 10));

    await orderIdbRepository.addOrder({
      type: "SELL",
      fundId: "fund-002",
      fundName: "Second Order",
      quantity: 2,
      pricePerUnit: 200,
      currency: "EUR",
    });

    render(<OrdersList />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

    const fundNames = screen.getAllByRole("button", { name: /Order/ }).map((el) => el.textContent);
    expect(fundNames[0]).toBe("Second Order");
    expect(fundNames[1]).toBe("First Order");
  });
});
