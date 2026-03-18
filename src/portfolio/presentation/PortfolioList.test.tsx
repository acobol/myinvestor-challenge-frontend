import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test/test-utils";
import { server } from "@/mocks/server";
import { fundsDb } from "@/mocks/data";
import "@/i18n";
import i18n from "@/i18n";
import { Toaster } from "@/components/ui/sonner";
import { PortfolioList } from "./PortfolioList";

// Polyfill HTMLDialogElement for jsdom (required by BuyFundDialog)
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

describe("PortfolioList", () => {
  const t = i18n.t.bind(i18n);

  async function renderAndWait() {
    render(
      <>
        <Toaster />
        <PortfolioList />
      </>,
    );
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  }

  describe("loading state", () => {
    it("shows a loading indicator while the request is in flight", () => {
      render(<PortfolioList />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(t("portfolio.loading"))).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows an error message when the API fails", async () => {
      server.use(
        http.get("http://localhost:3000/portfolio", () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      render(<PortfolioList />);

      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
      expect(screen.getByText(t("portfolio.error"))).toBeInTheDocument();
    });

    it("shows a retry button on error", async () => {
      server.use(
        http.get("http://localhost:3000/portfolio", () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      render(<PortfolioList />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: t("portfolio.retry") })).toBeInTheDocument(),
      );
    });
  });

  describe("success state", () => {
    it("renders the portfolio title", async () => {
      await renderAndWait();

      expect(screen.getByText(t("portfolio.title"))).toBeInTheDocument();
    });

    it("shows all seeded fund names", async () => {
      await renderAndWait();

      const seededFunds = fundsDb.all().slice(0, 3);
      for (const fund of seededFunds) {
        expect(screen.getByText(fund.name)).toBeInTheDocument();
      }
    });

    it("shows an empty message when the portfolio has no positions", async () => {
      server.use(
        http.get("http://localhost:3000/portfolio", () =>
          HttpResponse.json({ data: [] }),
        ),
      );

      await renderAndWait();

      expect(screen.getByText(t("portfolio.empty"))).toBeInTheDocument();
    });

    it("renders an actions button for each position", async () => {
      await renderAndWait();

      const actionButtons = screen.getAllByRole("button", { name: t("portfolio.actions.label") });
      // 3 seeded positions
      expect(actionButtons).toHaveLength(3);
    });
  });

  describe("buy action", () => {
    it("opens the buy dialog when the Buy menu item is clicked", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const [firstTrigger] = screen.getAllByRole("button", { name: t("portfolio.actions.label") });
      await user.click(firstTrigger!);
      await user.click(screen.getByRole("menuitem", { name: t("portfolio.actions.buy") }));

      expect(screen.getByRole("dialog")).toHaveAttribute("open");
      expect(
        screen.getByRole("heading", { name: t("portfolio.buy.title") }),
      ).toBeInTheDocument();
    });

    it("shows the selected fund name inside the buy dialog", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const seededFunds = fundsDb.all().slice(0, 3);
      const [firstTrigger] = screen.getAllByRole("button", { name: t("portfolio.actions.label") });
      await user.click(firstTrigger!);
      await user.click(screen.getByRole("menuitem", { name: t("portfolio.actions.buy") }));

      const dialog = await screen.findByRole("dialog");
      const shownFund = seededFunds.find((f) =>
        dialog.textContent?.includes(f.name),
      );
      expect(shownFund).toBeDefined();
    });

    it("closes the buy dialog when Cancel is clicked", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const [firstTrigger] = screen.getAllByRole("button", { name: t("portfolio.actions.label") });
      await user.click(firstTrigger!);
      await user.click(screen.getByRole("menuitem", { name: t("portfolio.actions.buy") }));
      await screen.findByRole("dialog");

      await user.click(screen.getByRole("button", { name: t("portfolio.buy.cancel") }));

      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });

    it("shows a success toast and closes the dialog after a successful buy", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const [firstTrigger] = screen.getAllByRole("button", { name: t("portfolio.actions.label") });
      await user.click(firstTrigger!);
      await user.click(screen.getByRole("menuitem", { name: t("portfolio.actions.buy") }));
      await screen.findByRole("dialog");

      await user.type(screen.getByLabelText(t("portfolio.buy.amountLabel")), "50");
      await user.click(screen.getByRole("button", { name: t("portfolio.buy.submit") }));

      await screen.findByText(t("portfolio.buy.success"));
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    });
  });
});
