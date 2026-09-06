"use client";
/**
 * Click-to-edit surface for the owner's brand page. When edit-mode is off it
 * just renders its children. When on, hovering shows a dashed accent outline
 * and a tiny "edit" hint; clicking reveals an inline input, textarea, color
 * picker, image URL field, or select. Saving is debounced 400ms and writes
 * through the caller's `onSave`, which is expected to persist through the
 * store's promise-returning `upsertBrand`.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { useEdit } from "./OwnerEditLayer";

type Kind = "text" | "textarea" | "color" | "image" | "select";

type Props = {
  kind: Kind;
  value: string | undefined;
  onSave: (next: string | undefined) => Promise<{ ok: true } | { ok: false; error: string }> | void;
  label: string;
  placeholder?: string;
  children: ReactNode;
  options?: readonly { value: string; label: string }[];
  clearable?: boolean;
  className?: string;
  debounceMs?: number;
};

export default function InlineEdit({
  kind, value, onSave, label, placeholder, children, options,
  clearable, className, debounceMs = 400,
}: Props) {
  const ctx = useEdit();
  const editing = !!ctx?.editing;
  const [open, setOpen] = useState(false);
  // Draft is seeded on open (via the click handler), then owned by the input.
  const [draft, setDraft] = useState<string>(value ?? "");
  const timer = useRef<number | null>(null);
  const latestOnSave = useRef(onSave);
  const latestValue = useRef(value);
  const latestClearable = useRef(clearable);
  useEffect(() => { latestOnSave.current = onSave; }, [onSave]);
  useEffect(() => { latestValue.current = value; }, [value]);
  useEffect(() => { latestClearable.current = clearable; }, [clearable]);

  const commit = useCallback(async (next: string) => {
    const cleaned = next.trim();
    const payload = cleaned.length === 0 && latestClearable.current ? undefined : cleaned;
    if ((payload ?? "") === (latestValue.current ?? "")) return;
    ctx?.setSaveState("saving");
    try {
      const res = await latestOnSave.current(payload);
      if (res && "ok" in res && res.ok === false) { ctx?.setSaveState("error"); return; }
      ctx?.setSaveState("saved");
    } catch {
      ctx?.setSaveState("error");
    }
  }, [ctx]);

  // Debounced autosave while typing. The effect closes over `commit` which is
  // stable across renders thanks to useCallback + refs.
  useEffect(() => {
    if (!editing || !open) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { void commit(draft); }, debounceMs);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [draft, debounceMs, editing, open, commit]);

  const openEditor = useCallback(() => {
    setDraft(latestValue.current ?? "");
    setOpen(true);
  }, []);

  const closeEditor = useCallback(async (persist: boolean) => {
    if (persist) await commit(draft);
    setOpen(false);
  }, [commit, draft]);

  if (!editing) return <>{children}</>;

  const outlineCls = "cursor-pointer rounded-md outline-dashed outline-2 outline-offset-2 outline-[color:var(--sage)]/45 hover:outline-[color:var(--sage)]";

  if (!open) {
    return (
      <div
        className={clsx("group relative inline-block max-w-full", outlineCls, className)}
        onClick={(e) => { e.stopPropagation(); openEditor(); }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEditor(); } }}
        aria-label={`Edit ${label}`}
      >
        {children}
        <span
          className="pointer-events-none absolute -top-[10px] -right-[10px] rounded-pill bg-ink px-[8px] py-[2px] text-[9px] font-semibold uppercase tracking-[.12em] text-paper opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        >
          ✎ {label}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx("relative inline-block w-full max-w-full rounded-md bg-white p-3 shadow-[inset_0_0_0_2px_var(--sage)]", className)}>
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-ink/50">
        <span>{label}</span>
        <div className="flex gap-1">
          {clearable && (draft ?? "").trim() && (
            <button
              type="button"
              className="rounded-sm bg-cream px-2 py-[3px] text-[10px] font-semibold text-ink/60"
              onClick={async () => { setDraft(""); await commit(""); setOpen(false); }}
            >Clear</button>
          )}
          <button
            type="button"
            className="rounded-sm bg-ink px-3 py-[3px] text-[10px] font-semibold text-paper"
            onClick={() => { void closeEditor(true); }}
          >Done</button>
          <button
            type="button"
            className="rounded-sm bg-cream px-2 py-[3px] text-[10px] font-semibold text-ink/60"
            onClick={() => { setOpen(false); }}
          >Cancel</button>
        </div>
      </div>
      <InlineField
        kind={kind}
        value={draft}
        setValue={setDraft}
        placeholder={placeholder}
        options={options}
        onEnter={() => { void closeEditor(true); }}
      />
    </div>
  );
}

function InlineField({ kind, value, setValue, placeholder, options, onEnter }: {
  kind: Kind; value: string; setValue: (v: string) => void; placeholder?: string;
  options?: readonly { value: string; label: string }[];
  onEnter: () => void;
}) {
  const baseInput = "w-full rounded-sm bg-white px-3 py-[9px] text-[13px] outline-none shadow-[inset_0_0_0_1px_rgba(var(--ink-rgb),.14)] focus:shadow-[inset_0_0_0_1.5px_rgba(var(--ink-rgb),.55)]";
  if (kind === "textarea") {
    return (
      <textarea
        className={clsx(baseInput, "min-h-[120px] resize-y leading-[1.55]")}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      />
    );
  }
  if (kind === "color") {
    const hex = /^#?[0-9a-f]{3,8}$/i.test(value) ? (value.startsWith("#") ? value : `#${value}`) : "#7C8C6F";
    return (
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 w-14 flex-none rounded-sm border border-ink/10 bg-transparent p-0"
          aria-label="Pick a color"
        />
        <input
          type="text"
          className={clsx(baseInput, "mono flex-1")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="#7C8C6F"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
        />
      </div>
    );
  }
  if (kind === "select") {
    return (
      <select
        className={baseInput}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
      >
        {(options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }
  if (kind === "image") {
    return (
      <input
        type="url"
        className={clsx(baseInput, "mono")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? "https://…"}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
        autoFocus
      />
    );
  }
  return (
    <input
      type="text"
      className={baseInput}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(); } }}
      autoFocus
    />
  );
}
