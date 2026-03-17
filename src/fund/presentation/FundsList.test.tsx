import { describe, it, expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render, screen, waitFor, within } from "@/test/test-utils";
import { server } from "@/mocks/server";
import i18n from "@/i18n";
import { FundsList } from "./FundsList";

describe("FundsList", () => {
  const t = i18n.t.bind(i18n);

  async function renderAndWait() {
    render(<FundsList />);
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  }

  function getDataRows() {
    return screen.getAllByRole("row").slice(1); // skip header
  }

  function getNameCells() {
    return getDataRows().map((row) => within(row).getAllByRole("cell")[0].textContent ?? "");
  }

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
      await renderAndWait();

      expect(screen.getByText(t("funds.columns.name"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.symbol"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.category"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.value"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.ytd"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.oneYear"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.threeYears"))).toBeInTheDocument();
      expect(screen.getByText(t("funds.columns.fiveYears"))).toBeInTheDocument();
    });

    it("renders one page of funds (default 10 per page)", async () => {
      await renderAndWait();

      expect(getDataRows()).toHaveLength(10);
    });

    it("shows pagination controls after loading", async () => {
      await renderAndWait();

      expect(screen.getByRole("navigation", { name: /pagination/i })).toBeInTheDocument();
      expect(screen.getByLabelText(t("common.pagination.perPage"))).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    it("previous link is disabled on the first page", async () => {
      await renderAndWait();

      expect(screen.getByRole("link", { name: /go to previous page/i })).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("next link is enabled on the first page", async () => {
      await renderAndWait();

      expect(screen.getByRole("link", { name: /go to next page/i })).not.toHaveAttribute(
        "aria-disabled",
        "true",
      );
    });

    it("navigating to page 2 marks it as the active page", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      await user.click(screen.getByRole("link", { name: "2" }));

      await waitFor(() => {
        expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page");
      });
    });

    it("navigating to page 2 shows a different set of funds", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const page1Names = getNameCells();

      await user.click(screen.getByRole("link", { name: "2" }));

      await waitFor(() => {
        const page2Names = getNameCells();
        expect(page2Names).not.toEqual(page1Names);
      });
    });

    it("changing page size to 20 shows 20 funds", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      await user.click(screen.getByRole("combobox", { name: t("common.pagination.perPage") }));
      await user.click(screen.getByRole("option", { name: "20" }));

      await waitFor(() => {
        expect(getDataRows()).toHaveLength(20);
      });
    });

    it("changing page size resets to page 1", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      // Navigate to page 2 first
      await user.click(screen.getByRole("link", { name: "2" }));
      await waitFor(() =>
        expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("aria-current", "page"),
      );

      // Change page size
      await user.click(screen.getByRole("combobox", { name: t("common.pagination.perPage") }));
      await user.click(screen.getByRole("option", { name: "20" }));

      await waitFor(() => {
        expect(screen.getByRole("link", { name: "1" })).toHaveAttribute("aria-current", "page");
      });
    });
  });

  describe("actions column", () => {
    it("renders an actions column header", async () => {
      await renderAndWait();

      expect(screen.getByText(t("funds.columns.actions"))).toBeInTheDocument();
    });

    it("renders an actions trigger button in each row", async () => {
      await renderAndWait();

      const triggers = screen.getAllByRole("button", { name: t("funds.columns.actions") });
      expect(triggers).toHaveLength(10);
    });

    it("opens a dropdown with Buy and See details items on trigger click", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const [firstTrigger] = screen.getAllByRole("button", { name: t("funds.columns.actions") });
      await user.click(firstTrigger);

      expect(screen.getByRole("menuitem", { name: t("funds.actions.buy") })).toBeInTheDocument();
      expect(screen.getByRole("menuitem", { name: t("funds.actions.seeDetails") })).toBeInTheDocument();
    });
  });

  describe("sorting", () => {
    it("sortable column headers render as buttons", async () => {
      await renderAndWait();

      const sortableColumns = [
        t("funds.columns.name"),
        t("funds.columns.category"),
        t("funds.columns.value"),
        t("funds.columns.currency"),
        t("funds.columns.ytd"),
        t("funds.columns.oneYear"),
        t("funds.columns.threeYears"),
        t("funds.columns.fiveYears"),
      ];

      for (const label of sortableColumns) {
        expect(screen.getByRole("button", { name: new RegExp(label, "i") })).toBeInTheDocument();
      }
    });

    it("symbol column header is not a sort button", async () => {
      await renderAndWait();

      const headers = screen.getAllByRole("columnheader");
      const symbolHeader = headers.find((h) =>
        h.textContent?.includes(t("funds.columns.symbol")),
      );
      expect(symbolHeader?.querySelector("button")).toBeNull();
    });

    it("clicking the name header sorts funds in descending order (sortDescFirst)", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      await user.click(screen.getByRole("button", { name: new RegExp(t("funds.columns.name"), "i") }));

      await waitFor(() => {
        const names = getNameCells();
        expect(names.length).toBeGreaterThan(0);
        // sortDescFirst: true — first click sorts highest first (Z→A)
        expect(names[0] >= names[names.length - 1]).toBe(true);
      });
    });

    it("clicking the name header twice sorts funds in ascending order", async () => {
      const user = userEvent.setup();
      await renderAndWait();

      const nameButtonQuery = () =>
        screen.getByRole("button", { name: new RegExp(t("funds.columns.name"), "i") });

      // First click — descending sort (sortDescFirst); wait for data to settle
      await user.click(nameButtonQuery());
      await waitFor(() => {
        const names = getNameCells();
        expect(names.length).toBeGreaterThan(0);
        expect(names[0] >= names[names.length - 1]).toBe(true);
      });

      // Second click — ascending sort
      await user.click(nameButtonQuery());
      await waitFor(() => {
        const names = getNameCells();
        expect(names.length).toBeGreaterThan(0);
        // in ascending order, the first name comes before the last alphabetically (A→Z)
        expect(names[0] <= names[names.length - 1]).toBe(true);
      });
    });
  });
});
