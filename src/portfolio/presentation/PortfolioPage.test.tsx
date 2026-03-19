import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import "@/i18n";
import i18n from "@/i18n";
import { PortfolioPage } from "./PortfolioPage";

// Simulate desktop viewport
vi.mock("@/shared/application/useMediaQuery", () => ({ useMediaQuery: () => true }));

describe("PortfolioPage", () => {
  const t = i18n.t.bind(i18n);

  it("renders tabs for positions and orders", async () => {
    render(<PortfolioPage />);

    expect(screen.getByRole("tab", { name: t("portfolio.tabs.positions") })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: t("portfolio.tabs.orders") })).toBeInTheDocument();
  });

  it("shows positions tab by default", async () => {
    render(<PortfolioPage />);

    const positionsTab = screen.getByRole("tab", { name: t("portfolio.tabs.positions") });
    expect(positionsTab).toHaveAttribute("data-state", "active");
  });

  it("switches to orders tab when clicked", async () => {
    const user = userEvent.setup();
    render(<PortfolioPage />);

    const ordersTab = screen.getByRole("tab", { name: t("portfolio.tabs.orders") });
    await user.click(ordersTab);

    expect(ordersTab).toHaveAttribute("data-state", "active");
    await waitFor(() => {
      expect(screen.getByText(t("portfolio.orders.empty"))).toBeInTheDocument();
    });
  });
});
