import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { render } from "@/test/test-utils";
import { server } from "@/mocks/server";
import { fundsDb } from "@/mocks/data";
import "@/i18n";
import i18n from "@/i18n";
import { PortfolioList } from "./PortfolioList";

describe("PortfolioList", () => {
  const t = i18n.t.bind(i18n);

  async function renderAndWait() {
    render(<PortfolioList />);
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
});
