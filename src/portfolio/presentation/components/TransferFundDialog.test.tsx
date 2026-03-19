import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import { fundsDb, portfolioDb } from "@/mocks/data";
import "@/i18n";
import i18n from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import type { PortfolioPosition } from "@/portfolio/domain/portfolio.schema";
import { TransferFundDialog } from "./TransferFundDialog";

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

const positionA: PortfolioPosition = {
  id: "fund-001",
  name: "Alpha Fund",
  symbol: "ALF",
  quantity: 10,
  totalValue: { amount: 1000, currency: "EUR" },
  value: { amount: 100, currency: "EUR" },
  category: "GLOBAL",
  profitability: { YTD: 5, oneYear: 10, threeYears: 25, fiveYears: 60 },
};

const positionB: PortfolioPosition = {
  id: "fund-002",
  name: "Beta Fund",
  symbol: "BET",
  quantity: 20,
  totalValue: { amount: 400, currency: "EUR" },
  value: { amount: 20, currency: "EUR" },
  category: "TECH",
  profitability: { YTD: 8, oneYear: 15, threeYears: 40, fiveYears: 90 },
};

const allPositions = [positionA, positionB];

function renderDialog(
  position: PortfolioPosition | null,
  positions: PortfolioPosition[] = allPositions,
  onClose = vi.fn(),
) {
  return render(
    <>
      <Toaster />
      <TransferFundDialog position={position} allPositions={positions} onClose={onClose} />
    </>,
  );
}

describe("TransferFundDialog", () => {
  describe("visibility", () => {
    it("opens when a position is provided", () => {
      renderDialog(positionA);
      expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });

    it("does not open when position is null", () => {
      renderDialog(null);
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  describe("content", () => {
    it("shows the transfer title", () => {
      renderDialog(positionA);
      expect(
        screen.getByRole("heading", { name: i18n.t("portfolio.transfer.title") }),
      ).toBeInTheDocument();
    });

    it("shows source fund name and available units", () => {
      renderDialog(positionA);
      // The "from" paragraph contains both name and available units
      expect(screen.getByText(/Alpha Fund.*Available/)).toBeInTheDocument();
    });

    it("shows the destination select", () => {
      renderDialog(positionA);
      expect(
        screen.getByRole("combobox"),
      ).toBeInTheDocument();
    });

    it("shows the quantity label", () => {
      renderDialog(positionA);
      expect(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
      ).toBeInTheDocument();
    });
  });

  describe("validation", () => {
    it("shows error when no destination fund is selected on submit", async () => {
      const user = userEvent.setup();
      renderDialog(positionA);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      expect(
        await screen.findByText(i18n.t("portfolio.transfer.validation.toFundRequired")),
      ).toBeInTheDocument();
    });

    it("shows error when quantity is zero on submit", async () => {
      const user = userEvent.setup();
      renderDialog(positionA);

      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      expect(
        await screen.findByText(i18n.t("portfolio.transfer.validation.positive")),
      ).toBeInTheDocument();
    });

    it("shows error when quantity exceeds owned units", async () => {
      const user = userEvent.setup();
      renderDialog(positionA);

      await user.type(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
        "11",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      expect(
        await screen.findByText(i18n.t("portfolio.transfer.validation.max")),
      ).toBeInTheDocument();
    });
  });

  describe("submission", () => {
    function buildSeededPositions(): [PortfolioPosition, PortfolioPosition] {
      const seededFunds = fundsDb.all();
      const seededPortfolio = portfolioDb.all();

      const fund0 = seededFunds[0]!;
      const port0 = seededPortfolio[0]!;
      const fund1 = seededFunds[1]!;
      const port1 = seededPortfolio[1]!;

      const from: PortfolioPosition = {
        ...port0,
        symbol: fund0.symbol,
        category: fund0.category,
        value: fund0.value,
        profitability: fund0.profitability,
      };
      const to: PortfolioPosition = {
        ...port1,
        symbol: fund1.symbol,
        category: fund1.category,
        value: fund1.value,
        profitability: fund1.profitability,
      };
      return [from, to];
    }

    it("closes the dialog on successful transfer", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const [from, to] = buildSeededPositions();
      renderDialog(from, [from, to], onClose);

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: to.name }));
      await user.type(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    });

    it("shows a success toast on successful transfer", async () => {
      const user = userEvent.setup();
      const [from, to] = buildSeededPositions();
      renderDialog(from, [from, to]);

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: to.name }));
      await user.type(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.transfer.success"));
    });

    it("does not show the source fund in the destination select", async () => {
      const user = userEvent.setup();
      const [from, to] = buildSeededPositions();
      renderDialog(from, [from, to]);

      await user.click(screen.getByRole("combobox"));

      expect(screen.queryByRole("option", { name: from.name })).toBeNull();
      expect(screen.getByRole("option", { name: to.name })).toBeInTheDocument();
    });

    it("shows an error toast and closes the dialog on failed transfer", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      // Use a position not in MSW DB → 404
      const unknownFrom: PortfolioPosition = {
        ...positionA,
        id: "does-not-exist",
      };
      renderDialog(unknownFrom, [unknownFrom, positionB], onClose);

      await user.click(screen.getByRole("combobox"));
      await user.click(await screen.findByRole("option", { name: positionB.name }));
      await user.type(
        screen.getByLabelText(i18n.t("portfolio.transfer.quantityLabel")),
        "1",
      );
      await user.click(
        screen.getByRole("button", { name: i18n.t("portfolio.transfer.submit") }),
      );

      await screen.findByText(i18n.t("portfolio.transfer.error"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
