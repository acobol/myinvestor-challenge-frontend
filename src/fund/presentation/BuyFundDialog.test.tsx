import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { fundsDb } from "@/mocks/data";
import "@/i18n";
import i18n from "@/i18n";
import { BuyFundDialog } from "./BuyFundDialog";
import { Toaster } from "@/components/ui/sonner";
import { EUR_USD_RATE } from "@/shared/domain/currency";
import type { Fund } from "@/fund/domain/fund.schema";

// Polyfill HTMLDialogElement for jsdom
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

const eurFund: Fund = {
  id: "fund-eur-1",
  name: "Vanguard Global EUR",
  symbol: "VGE",
  value: { amount: 50, currency: "EUR" },
  category: "GLOBAL",
  profitability: { YTD: 5, oneYear: 10, threeYears: 25, fiveYears: 60 },
};

const usdFund: Fund = {
  id: "fund-usd-1",
  name: "iShares Tech USD",
  symbol: "ITU",
  value: { amount: 100, currency: "USD" },
  category: "TECH",
  profitability: { YTD: 12, oneYear: 22, threeYears: 80, fiveYears: 200 },
};

function renderDialog(fund: Fund | null, onClose = vi.fn()) {
  return render(
    <>
      <Toaster />
      <BuyFundDialog fund={fund} onClose={onClose} />
    </>,
  );
}

describe("BuyFundDialog", () => {
  describe("visibility", () => {
    it("opens when a fund is provided", () => {
      renderDialog(eurFund);
      expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });

    it("does not open when fund is null", () => {
      renderDialog(null);
      // A closed <dialog> has no ARIA role in the accessibility tree
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("content", () => {
    it("shows the buy title", () => {
      renderDialog(eurFund);
      expect(
        screen.getByRole("heading", { name: i18n.t("portfolio.buy.title") }),
      ).toBeInTheDocument();
    });

    it("shows fund name and price", () => {
      renderDialog(eurFund);
      expect(screen.getByText(/Vanguard Global EUR/)).toBeInTheDocument();
    });

    it("shows the amount label", () => {
      renderDialog(eurFund);
      expect(
        screen.getByLabelText(i18n.t("portfolio.buy.amountLabel")),
      ).toBeInTheDocument();
    });

    it("shows the EUR/USD conversion note for USD funds", () => {
      renderDialog(usdFund);
      expect(
        screen.getByText(
          i18n.t("portfolio.buy.conversionNote", { rate: EUR_USD_RATE }),
        ),
      ).toBeInTheDocument();
    });

    it("does not show conversion note for EUR funds", () => {
      renderDialog(eurFund);
      expect(
        screen.queryByText(
          i18n.t("portfolio.buy.conversionNote", { rate: EUR_USD_RATE }),
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe("units preview", () => {
    it("shows units preview when a valid amount is entered (EUR fund)", async () => {
      const user = userEvent.setup();
      renderDialog(eurFund);

      // eurFund.value.amount = 50 EUR → 100 EUR / 50 = 2 units
      await user.type(
        screen.getByLabelText(i18n.t("portfolio.buy.amountLabel")),
        "100",
      );

      expect(
        await screen.findByText(/portfolio\.buy\.unitsPreview|Recibirás|receive/i),
      ).toBeInTheDocument();
    });

    it("calculates correct units for EUR fund", async () => {
      const user = userEvent.setup();
      renderDialog(eurFund);

      // 100 EUR / 50 EUR per unit = 2.00 units
      const input = screen.getByLabelText(i18n.t("portfolio.buy.amountLabel"));
      await user.type(input, "100");

      await waitFor(() => {
        const preview = screen.getByText(/2,00|2\.00/);
        expect(preview).toBeInTheDocument();
      });
    });

    it("calculates correct units for USD fund applying EUR/USD rate", async () => {
      const user = userEvent.setup();
      renderDialog(usdFund);

      // 100 EUR × 1.08 = 108 USD / 100 USD per unit = 1.08 units
      const input = screen.getByLabelText(i18n.t("portfolio.buy.amountLabel"));
      await user.type(input, "100");

      await waitFor(() => {
        // Match only the units preview paragraph (not the conversion note)
        const preview = screen.getByText(
          (_, el) =>
            el?.tagName === "P" &&
            /1[,.]08/.test(el.textContent ?? "") &&
            !/exchange rate/.test(el.textContent ?? "") &&
            !/tipo de cambio/i.test(el.textContent ?? ""),
        );
        expect(preview).toBeInTheDocument();
      });
    });

    it("does not show units preview when amount is zero", () => {
      renderDialog(eurFund);
      expect(
        screen.queryByText(i18n.t("portfolio.buy.unitsPreview", { units: "" })),
      ).not.toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error when amount exceeds 10 000 €", async () => {
      const user = userEvent.setup();
      renderDialog(eurFund);

      const input = screen.getByLabelText(i18n.t("portfolio.buy.amountLabel"));
      await user.type(input, "10001");
      await user.click(screen.getByRole("button", { name: i18n.t("portfolio.buy.submit") }));

      expect(
        await screen.findByText(i18n.t("portfolio.buy.validation.max")),
      ).toBeInTheDocument();
    });

    it("shows error when amount is zero on submit", async () => {
      const user = userEvent.setup();
      renderDialog(eurFund);

      await user.click(screen.getByRole("button", { name: i18n.t("portfolio.buy.submit") }));

      expect(
        await screen.findByText(i18n.t("portfolio.buy.validation.positive")),
      ).toBeInTheDocument();
    });
  });

  describe("submission", () => {
    it("closes the dialog on successful purchase", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const seededFund = fundsDb.all()[0]!;
      renderDialog(seededFund, onClose);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.buy.amountLabel")),
        "50",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.buy.submit") }),
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("shows a success toast with fund name on successful purchase", async () => {
      const user = userEvent.setup();
      const seededFund = fundsDb.all()[0]!;
      renderDialog(seededFund);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.buy.amountLabel")),
        "50",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.buy.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.buy.success"));
      expect(
        screen.getByText(new RegExp(seededFund.name), { selector: "[data-description]" }),
      ).toBeInTheDocument();
    });

    it("shows an error toast and closes the dialog on failed purchase", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const unknownFund = { ...eurFund, id: "does-not-exist" };
      renderDialog(unknownFund, onClose);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.buy.amountLabel")),
        "50",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.buy.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.buy.error"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
