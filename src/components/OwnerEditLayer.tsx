"use client";
/**
 * Owner edit-mode context and floating toggle. Only rendered on a brand page
 * when the current session owns the brand. Flips a boolean that InlineEdit
 * children read to decide whether to render editable affordances.
 *
 * Enter with the pencil FAB or `?edit=1` (parsed from the initial URL), exit
 * with Escape or the same FAB.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import clsx from "clsx";

type SaveState = "idle" | "saving" | "saved" | "error";

type Ctx = {
  editing: boolean;
  setEditing: (v: boolean) => void;
  saveState: SaveState;
  setSaveState: (v: SaveState) => void;
};
const EditCtx = createContext<Ctx | null>(null);

export function useEdit() {
  return useContext(EditCtx);
}

/** Provider + floating toggle. Pass `enabled` = isOwner from the caller. */
export function OwnerEditLayer({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Read `?edit=1` once on mount so the state initializes without a setState-in-effect.
  const [editing, setEditingState] = useState<boolean>(() => enabled && sp?.get("edit") === "1");
  const [saveState, setSaveStateInternal] = useState<SaveState>("idle");
  const savedTimer = useRef<number | null>(null);

  // Escape leaves edit mode.
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingState(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);

  // Auto-clear the "saved" indicator without triggering a setState-in-effect on every save.
  useEffect(() => {
    if (saveState !== "saved") return;
    savedTimer.current = window.setTimeout(() => setSaveStateInternal("idle"), 1400);
    return () => { if (savedTimer.current) window.clearTimeout(savedTimer.current); };
  }, [saveState]);

  const setEditing = useCallback((v: boolean) => {
    setEditingState(v);
    // Keep the URL clean when leaving edit mode.
    if (!v && sp?.get("edit") === "1" && pathname) {
      const next = new URLSearchParams(sp.toString());
      next.delete("edit");
      const q = next.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    }
  }, [pathname, router, sp]);

  const setSaveState = useCallback((v: SaveState) => {
    setSaveStateInternal(v);
  }, []);

  const value = useMemo<Ctx>(() => ({ editing, setEditing, saveState, setSaveState }), [editing, setEditing, saveState, setSaveState]);

  if (!enabled) return <>{children}</>;

  return (
    <EditCtx.Provider value={value}>
      {children}
      <OwnerFab editing={editing} onToggle={() => setEditing(!editing)} saveState={saveState} />
    </EditCtx.Provider>
  );
}

function OwnerFab({ editing, onToggle, saveState }: { editing: boolean; onToggle: () => void; saveState: SaveState }) {
  return (
    <div className="pointer-events-none fixed right-4 top-[76px] z-40 flex flex-col items-end gap-2 md:right-6 md:top-[88px]">
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          "press pointer-events-auto flex items-center gap-2 rounded-pill px-4 py-[10px] text-[11.5px] font-semibold soft",
          editing ? "bg-ink text-paper" : "bg-white text-ink",
        )}
        aria-pressed={editing}
        aria-label={editing ? "Exit edit mode" : "Edit this page"}
      >
        <span aria-hidden="true">{editing ? "✓" : "✎"}</span>
        {editing ? "Editing · press Esc to exit" : "Edit page"}
      </button>
      {editing && saveState !== "idle" && (
        <span
          className={clsx(
            "pointer-events-none rounded-pill px-3 py-[6px] text-[10.5px] font-semibold uppercase tracking-[.12em]",
            saveState === "saving" && "bg-cream text-ink/60",
            saveState === "saved" && "bg-sage text-paper",
            saveState === "error" && "bg-rust text-paper",
          )}
        >
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Couldn't save"}
        </span>
      )}
    </div>
  );
}
