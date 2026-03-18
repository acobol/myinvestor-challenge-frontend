import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/test-utils";
import "@/i18n";
import i18n from "@/i18n";
import { fundsDb } from "@/mocks/data";
import { FundDetailDialog } from "./FundDetailDialog";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

describe("FundDetailDialog", () => {
  const t = i18n.t.bind(i18n);

  function getFund() {
    return fundsDb.all()[0]!;
  }

  describe("visibility", () => {
    it("dialog is closed when fund is null", () => {
      render(<FundDetailDialog fund={null} onClose={vi.fn()} />);

      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("dialog is open when a fund is provided", () => {
      render(<FundDetailDialog fund={getFund()} onClose={vi.fn()} />);

      expect(screen.getByRole("dialog")).toHaveAttribute("open");
    });
  });

  describe("content", () => {
    it("shows the fund name", () => {
      const fund = getFund();
      render(<FundDetailDialog fund={fund} onClose={vi.fn()} />);

      expect(screen.getByText(fund.name)).toBeInTheDocument();
    });

    it("shows the fund symbol", () => {
      const fund = getFund();
      render(<FundDetailDialog fund={fund} onClose={vi.fn()} />);

      expect(screen.getByText(fund.symbol)).toBeInTheDocument();
    });

    it("shows the current value section heading", () => {
      render(<FundDetailDialog fund={getFund()} onClose={vi.fn()} />);

      expect(screen.getByText(t("funds.detail.currentValue"))).toBeInTheDocument();
    });

    it("shows the profitability section heading", () => {
      render(<FundDetailDialog fund={getFund()} onClose={vi.fn()} />);

      expect(screen.getByText(t("funds.detail.profitability"))).toBeInTheDocument();
    });

    it("shows all profitability period labels", () => {
      render(<FundDetailDialog fund={getFund()} onClose={vi.fn()} />);

      expect(screen.getByText(t("funds.columns.ytd"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.oneYear"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.threeYears"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.fiveYears"))).toBeInTheDocument();
    });
  });

  describe("close behaviour", () => {
    it("calls onClose when the close button is clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<FundDetailDialog fund={getFund()} onClose={onClose} />);

      await user.click(screen.getByRole("button", { name: /close/i }));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
