import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { render, screen, waitFor } from "@/test/test-utils";
import { server } from "@/mocks/server";
import { fundsDb } from "@/mocks/data";
import i18n from "@/i18n";
import { FundsList } from "./FundsList";

describe("FundsList", () => {
  const t = i18n.t.bind(i18n);

  describe("loading state", () => {
    it("shows a loading indicator while the request is in flight", () => {
      render(<FundsList />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByText(t("funds.loading"))).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows an error message when the API fails", async () => {
      server.use(
        http.get("http://localhost:3000/funds", () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      render(<FundsList />);

      await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
      expect(screen.getByText(t("funds.error"))).toBeInTheDocument();
    });

    it("shows a retry button on error", async () => {
      server.use(
        http.get("http://localhost:3000/funds", () =>
          HttpResponse.json({ message: "Internal Server Error" }, { status: 500 }),
        ),
      );

      render(<FundsList />);

      await waitFor(() =>
        expect(screen.getByRole("button", { name: t("funds.retry") })).toBeInTheDocument(),
      );
    });
  });

  describe("success state", () => {
    it("renders all column headers after loading", async () => {
      render(<FundsList />);

      await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

      expect(screen.getByText(t("funds.columns.name"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.symbol"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.category"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.value"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.ytd"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.oneYear"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.threeYears"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.fiveYears"))).toBeInTheDocument();
    });

    it("renders a row for every fund returned by the API", async () => {
      render(<FundsList />);

      await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());

      const totalFunds = fundsDb.all().length;
      const headerRows = 1;
      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(totalFunds + headerRows);
    });
  });
});
