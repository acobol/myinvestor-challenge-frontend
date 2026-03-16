import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  applyErrorOverrides,
  ERROR_ENDPOINTS,
  startMsw,
  stopMsw,
  type ErrorEndpointId,
} from "@/mocks/dev-tools";

// ---- Persistence ----

const STORAGE_KEY = "msw-dev-tools";

interface PersistedState {
  activeErrors: ErrorEndpointId[];
  noCache: boolean;
  mswDisabled: boolean;
}

const DEFAULT_STATE: PersistedState = { activeErrors: [], noCache: false, mswDisabled: false };

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: Partial<PersistedState> = raw ? (JSON.parse(raw) as Partial<PersistedState>) : {};
    const validIds = new Set(ERROR_ENDPOINTS.map((ep) => ep.id));
    return {
      activeErrors: (parsed.activeErrors ?? []).filter((id): id is ErrorEndpointId =>
        validIds.has(id),
      ),
      noCache: parsed.noCache ?? false,
      mswDisabled: parsed.mswDisabled ?? false,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---- Query cache helpers ----

const NO_CACHE_OPTIONS = { queries: { gcTime: 0, staleTime: 0 } } as const;
const DEFAULT_CACHE_OPTIONS = { queries: { gcTime: 5 * 60 * 1000, staleTime: 0 } } as const;

// ---- Toggle switch ----

function Toggle({
  checked,
  onChange,
  disabled = false,
  color = "blue",
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  color?: "blue" | "red" | "amber";
}) {
  const colorClass = checked
    ? color === "red"
      ? "bg-red-500"
      : color === "amber"
        ? "bg-amber-500"
        : "bg-blue-500"
    : "bg-neutral-600";

  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-4 w-8 items-center rounded-full transition-colors",
        colorClass,
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "inline-block h-3 w-3 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

// ---- Component ----

export function DevTools() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const initial = loadState();
  const [activeErrors, setActiveErrors] = useState<ReadonlySet<ErrorEndpointId>>(
    () => new Set(initial.activeErrors),
  );
  const [noCache, setNoCache] = useState(initial.noCache);
  const [mswDisabled, setMswDisabled] = useState(initial.mswDisabled);

  // Re-apply persisted state once the component mounts
  useEffect(() => {
    if (!mswDisabled) {
      if (activeErrors.size > 0) applyErrorOverrides(activeErrors);
    }
    if (noCache) queryClient.setDefaultOptions(NO_CACHE_OPTIONS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleError(id: ErrorEndpointId) {
    setActiveErrors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      applyErrorOverrides(next);
      saveState({ activeErrors: [...next], noCache, mswDisabled });
      void queryClient.invalidateQueries();
      return next;
    });
  }

  function toggleNoCache() {
    const next = !noCache;
    setNoCache(next);
    queryClient.setDefaultOptions(next ? NO_CACHE_OPTIONS : DEFAULT_CACHE_OPTIONS);
    saveState({ activeErrors: [...activeErrors], noCache: next, mswDisabled });
    void queryClient.invalidateQueries();
  }

  async function toggleMsw() {
    const next = !mswDisabled;
    setMswDisabled(next);
    saveState({ activeErrors: [...activeErrors], noCache, mswDisabled: next });
    if (next) {
      stopMsw();
    } else {
      await startMsw(activeErrors);
    }
    void queryClient.invalidateQueries();
  }

  const hasActiveOptions = activeErrors.size > 0 || noCache || mswDisabled;

  return (
    <div className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-1.5 shadow-md",
          "bg-neutral-900 text-neutral-100 hover:bg-neutral-700",
          hasActiveOptions && "ring-2 ring-amber-400",
        )}
      >
        <span>DEV TOOLS</span>
        {activeErrors.size > 0 && (
          <span className="rounded bg-red-500 px-1 text-white">
            {activeErrors.size} error{activeErrors.size > 1 ? "s" : ""}
          </span>
        )}
        {noCache && <span className="rounded bg-blue-500 px-1 text-white">no cache</span>}
        {mswDisabled && <span className="rounded bg-amber-500 px-1 text-white">real API</span>}
        <span>{open ? "▾" : "▸"}</span>
      </button>

      {open && (
        <div className="mt-1 w-56 rounded-md border border-neutral-700 bg-neutral-900 p-3 shadow-xl">

          <p className="mb-2 font-semibold uppercase tracking-wide text-neutral-400">MSW</p>
          <div className="flex items-center justify-between">
            <span className={cn("text-neutral-300", mswDisabled && "text-amber-400")}>
              {mswDisabled ? "Real API calls" : "Mocked (MSW)"}
            </span>
            <Toggle checked={mswDisabled} onChange={() => void toggleMsw()} color="amber" />
          </div>

          <hr className="my-3 border-neutral-700" />

          <p className={cn("mb-2 font-semibold uppercase tracking-wide text-neutral-400", mswDisabled && "opacity-40")}>
            Simulate errors
          </p>
          <ul className="space-y-1.5">
            {ERROR_ENDPOINTS.map(({ id, label }) => (
              <li key={id} className="flex items-center justify-between">
                <span className={cn("text-neutral-300", activeErrors.has(id) && "text-red-400")}>
                  {label}
                </span>
                <Toggle
                  checked={activeErrors.has(id)}
                  onChange={() => toggleError(id)}
                  disabled={mswDisabled}
                  color="red"
                />
              </li>
            ))}
          </ul>

          <hr className="my-3 border-neutral-700" />

          <p className="mb-2 font-semibold uppercase tracking-wide text-neutral-400">Cache</p>
          <div className="flex items-center justify-between">
            <span className={cn("text-neutral-300", noCache && "text-blue-400")}>
              Disable cache
            </span>
            <Toggle checked={noCache} onChange={toggleNoCache} color="blue" />
          </div>

          <p className="mt-3 text-neutral-500">
            For slow responses use DevTools → Network → Throttle.
          </p>
        </div>
      )}
    </div>
  );
}
