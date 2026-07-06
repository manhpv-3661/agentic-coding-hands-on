"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export type DismissableMenuHasPopup = "menu" | "listbox" | "dialog";

export interface UseDismissableMenuOptions {
  /** ARIA role advertised via the trigger's `aria-haspopup`. Defaults to "menu". */
  haspopup?: DismissableMenuHasPopup;
}

export interface DismissableMenuTriggerProps {
  onClick: () => void;
  "aria-expanded": boolean;
  "aria-haspopup": DismissableMenuHasPopup;
}

export interface UseDismissableMenuResult {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  containerRef: RefObject<HTMLDivElement | null>;
  triggerProps: DismissableMenuTriggerProps;
}

/**
 * Module-scoped stack of currently-open menu instances, ordered by open
 * time (last entry = topmost/most-recently-opened). Lets a nested menu
 * (e.g. a listbox opened inside an already-open dialog) own Escape without
 * also bubbling the close up to its parent — only the topmost instance
 * reacts to a given Escape press, mirroring how stacked native `<dialog>`s
 * behave.
 */
const openMenuStack: symbol[] = [];

/**
 * Shared open/close behavior for header menus (bell, account, widget,
 * language, ...): toggle on trigger click, close on outside pointerdown,
 * close on Escape. Generalizes the inline pattern already used in
 * `app/login/components/language-selector.tsx` into a reusable hook so every
 * menu consumer gets identical semantics (DRY).
 *
 * Enter/Space activation is NOT wired here on purpose — spread
 * `triggerProps` onto a native `<button>` element (not a `<div>`) so the
 * browser's built-in keyboard activation handles it for free.
 *
 * Listeners are only attached while `open` is true and are always cleaned up
 * on close/unmount, so idle (closed) menus cost nothing.
 */
export function useDismissableMenu(
  options: UseDismissableMenuOptions = {},
): UseDismissableMenuResult {
  const { haspopup = "menu" } = options;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // Stable per-instance identity for the open-menu stack — a lazy `useState`
  // initializer (not a ref written during render) so it's computed exactly
  // once without touching a ref outside an effect/event handler.
  const [instanceId] = useState<symbol>(() => Symbol("dismissable-menu"));

  const toggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;

    openMenuStack.push(instanceId);

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Only the topmost open menu closes on a given Escape press — a
      // nested menu (e.g. this dialog's own recipient dropdown) must not
      // also close its parent dialog in the same keystroke.
      if (openMenuStack[openMenuStack.length - 1] !== instanceId) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      const index = openMenuStack.lastIndexOf(instanceId);
      if (index !== -1) openMenuStack.splice(index, 1);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, instanceId]);

  return {
    open,
    setOpen,
    toggle,
    containerRef,
    triggerProps: {
      onClick: toggle,
      "aria-expanded": open,
      "aria-haspopup": haspopup,
    },
  };
}
