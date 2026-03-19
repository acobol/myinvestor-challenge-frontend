import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { fundsDb, portfolioDb } from "@/mocks/data";
import "@/i18n";
import i18n from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { SellFundDialog } from "./SellFundDialog";

// Polyfill HTMLDialogElement for jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const eurPosition: PortfolioPosition = {
  id: "fund-eur-1",
  name: "Vanguard Global EUR",
  symbol: "VGE",
  quantity: 10,
  totalValue: { amount: 500, currency: "EUR" },
  value: { amount: 50, currency: "EUR" },
  category: "GLOBAL",
  profitability: { YTD: 5, oneYear: 10, threeYears: 25, fiveYears: 60 },
};

const usdPosition: PortfolioPosition = {
  id: "fund-usd-1",
  name: "iShares Tech USD",
  symbol: "ITU",
  quantity: 5,
  totalValue: { amount: 500, currency: "USD" },
  value: { amount: 100, currency: "USD" },
  category: "TECH",
  profitability: { YTD: 12, oneYear: 22, threeYears: 80, fiveYears: 200 },
};

function renderDialog(position: PortfolioPosition | null, onClose = vi.fn()) {
  return render(
    <>
      <Toaster />
      <SellFundDialog position={position} onClose={onClose} />
    </>,
  );
}

describe("SellFundDialog", () => {
  describe("visibility", () => {
    it("opens when a position is provided", () => {
      renderDialog(eurPosition);
      expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });

    it("does not open when position is null", () => {
      renderDialog(null);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("content", () => {
    it("shows the sell title", () => {
      renderDialog(eurPosition);
      expect(
        screen.getByRole("heading", { name: i18n.t("portfolio.sell.title") }),
      ).toBeInTheDocument();
    });

    it("shows fund name and price", () => {
      renderDialog(eurPosition);
      expect(screen.getByText(/Vanguard Global EUR/)).toBeInTheDocument();
    });

    it("shows available units", () => {
      renderDialog(eurPosition);
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it("shows the quantity label", () => {
      renderDialog(eurPosition);
      expect(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
      ).toBeInTheDocument();
    });

    it("shows the USD/EUR conversion note for USD positions", () => {
      renderDialog(usdPosition);
      expect(
        screen.getByText(/USD\/EUR|USD.EUR/i),
      ).toBeInTheDocument();
    });

    it("does not show conversion note for EUR positions", () => {
      renderDialog(eurPosition);
      expect(screen.queryByText(/USD\/EUR|USD.EUR/i)).not.toBeInTheDocument();
    });
  });

  describe("proceeds preview", () => {
    it("shows proceeds preview when a valid quantity is entered", async () => {
      const user = userEvent.setup();
      renderDialog(eurPosition);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "2",
      );

      // 2 units × 50 EUR = 100 EUR
      expect(await screen.findByText(/100/)).toBeInTheDocument();
    });

    it("shows proceeds preview for a fractional quantity", async () => {
      const user = userEvent.setup();
      renderDialog(eurPosition);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "0.5",
      );

      // 0.5 units × 50 EUR = 25 EUR
      expect(await screen.findByText(/25/)).toBeInTheDocument();
    });

    it("does not show proceeds preview when quantity is zero", () => {
      renderDialog(eurPosition);
      expect(
        screen.queryByText(new RegExp(i18n.t("portfolio.sell.proceedsPreview", { amount: "" }).replace("{{amount}}", ""))),
      ).not.toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error when quantity exceeds owned units", async () => {
      const user = userEvent.setup();
      renderDialog(eurPosition);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "11",
      );
      await user.click(screen.getByRole("button", { name: i18n.t("portfolio.sell.submit") }));

      expect(
        await screen.findByText(i18n.t("portfolio.sell.validation.max")),
      ).toBeInTheDocument();
    });

    it("shows error when quantity is zero on submit", async () => {
      const user = userEvent.setup();
      renderDialog(eurPosition);

      await user.click(screen.getByRole("button", { name: i18n.t("portfolio.sell.submit") }));

      expect(
        await screen.findByText(i18n.t("portfolio.sell.validation.positive")),
      ).toBeInTheDocument();
    });
  });

  describe("submission", () => {
    it("closes the dialog on successful sale", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const seededFund = fundsDb.all()[0]!;
      const seededPosition = portfolioDb.all()[0]!;
      const position: PortfolioPosition = {
        ...seededPosition,
        symbol: seededFund.symbol,
        category: seededFund.category,
        value: seededFund.value,
        profitability: seededFund.profitability,
      };
      renderDialog(position, onClose);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.sell.submit") }),
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("shows a success toast with fund name on successful sale", async () => {
      const user = userEvent.setup();
      const seededFund = fundsDb.all()[0]!;
      const seededPosition = portfolioDb.all()[0]!;
      const position: PortfolioPosition = {
        ...seededPosition,
        symbol: seededFund.symbol,
        category: seededFund.category,
        value: seededFund.value,
        profitability: seededFund.profitability,
      };
      renderDialog(position);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.sell.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.sell.success"));
      expect(
        screen.getByText(new RegExp(seededFund.name), { selector: "[data-description]" }),
      ).toBeInTheDocument();
    });

    it("shows an error toast and closes the dialog on failed sale", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      // Position not in portfolio MSW DB → 404
      const unknownPosition: PortfolioPosition = {
        ...eurPosition,
        id: "does-not-exist",
      };
      renderDialog(unknownPosition, onClose);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.sell.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.sell.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.sell.error"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
