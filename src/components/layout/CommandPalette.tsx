import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { filterCommands, type Command } from "../../content/commands";
import { useGoTo } from "../../hooks/useGoTo";

type Props = { open: boolean; onClose: () => void };

/**
 * A searchable list of real destinations and actions, opened with Ctrl/⌘+K,
 * the backtick key, or the "Jump to…" button. Built on a modal <dialog> so
 * the browser provides the focus trap, Escape and the inert background; the
 * search box is an ARIA combobox driving a listbox.
 *
 * Everything here is also reachable without it.
 */
export function CommandPalette({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState("");
  const goTo = useGoTo();
  const uid = useId().replace(/:/g, "");

  const results = useMemo(() => filterCommands(query), [query]);
  const groups = useMemo(() => {
    const order: Command["group"][] = ["Go to", "Projects", "Actions"];
    return order
      .map((g) => ({ group: g, items: results.filter((c) => c.group === g) }))
      .filter((g) => g.items.length);
  }, [results]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActiveIndex(0);
      setMessage("");
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => setActiveIndex(0), [query]);

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const close = useCallback(() => {
    onClose();
    // Focus returns to whatever opened the palette.
    requestAnimationFrame(() => returnFocus.current?.focus?.());
  }, [onClose]);

  const run = async (c: Command) => {
    const a = c.action;
    if (a.type === "copy") {
      try {
        await navigator.clipboard.writeText(a.value);
        setMessage(a.done);
      } catch {
        setMessage(`Copy failed. The address is ${a.value}`);
      }
      return;
    }
    onClose();
    if (a.type === "external") {
      window.open(a.href, "_blank", "noopener,noreferrer");
      return;
    }
    goTo(a.to);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === "Home" && e.ctrlKey) {
      setActiveIndex(0);
    } else if (e.key === "End" && e.ctrlKey) {
      setActiveIndex(Math.max(results.length - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const c = results[activeIndex];
      if (c) void run(c);
    }
  };

  const optionId = (i: number) => `${uid}-opt-${i}`;
  const listId = `${uid}-list`;
  let flatIndex = -1;

  return (
    <dialog
      ref={dialogRef}
      className="pal"
      aria-labelledby={`${uid}-title`}
      onClose={() => open && close()}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === dialogRef.current) close();
      }}
    >
      <div className="pal-panel">
        <h2 id={`${uid}-title`} className="sr-only">
          Jump to a page or action
        </h2>
        <div className="pal-search">
          <input
            ref={inputRef}
            className="pal-input"
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? optionId(activeIndex) : undefined}
            aria-label="Search pages, projects and actions"
            placeholder="Search pages, projects and actions"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="pal-esc" onClick={close}>
            <span className="kbd">Esc</span>
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div ref={listRef} id={listId} role="listbox" aria-label="Results" className="pal-list">
          {groups.map(({ group, items }) => (
            <div key={group} role="group" aria-labelledby={`${uid}-${group}`} className="pal-group">
              <div id={`${uid}-${group}`} className="pal-group-label" role="presentation">
                {group}
              </div>
              {items.map((c) => {
                flatIndex += 1;
                const i = flatIndex;
                return (
                  <div
                    key={c.id}
                    id={optionId(i)}
                    data-index={i}
                    role="option"
                    aria-selected={i === activeIndex}
                    className="pal-option"
                    onMouseMove={() => setActiveIndex(i)}
                    onClick={() => void run(c)}
                  >
                    <span className="pal-option-label">{c.label}</span>
                    {c.hint && <span className="pal-option-hint">{c.hint}</span>}
                  </div>
                );
              })}
            </div>
          ))}
          {!results.length && <p className="pal-empty">Nothing matches “{query}”.</p>}
        </div>

        <p className="pal-foot" role="status" aria-live="polite">
          {message || `${results.length} ${results.length === 1 ? "result" : "results"} · ↑↓ to move · Enter to open`}
        </p>
      </div>
    </dialog>
  );
}
