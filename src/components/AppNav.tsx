import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { LayoutList, Briefcase } from "lucide-react";

const NAV_LINKS = [
  { to: "/funds", labelKey: "nav.funds" as const, icon: LayoutList },
  { to: "/portfolio", labelKey: "nav.portfolio" as const, icon: Briefcase },
];

/** Desktop left-sidebar card — hidden on mobile. */
export function AppNav() {
  const { t } = useTranslation();

  return (
    <nav className="hidden md:flex md:flex-col md:w-48 md:shrink-0">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-3 flex flex-col gap-1">
        {NAV_LINKS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")
            }
          >
            <Icon size={16} />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

/** Mobile bottom bar — hidden on md+. Placed after main content so it never overlaps. */
export function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden px-4 py-3">
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-1 flex gap-1">
        {NAV_LINKS.map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                "flex flex-1 flex-col items-center gap-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              ].join(" ")
            }
          >
            <Icon size={18} />
            {t(labelKey)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
