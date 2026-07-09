"use client";

import { useState } from "react";
import { useDismissableMenu } from "@/hooks/use-dismissable-menu";
import type { KudosPerson } from "@/lib/kudos/kudos-types";
import { cn } from "@/lib/ui/cn";
import { ChevronDownIcon } from "./chevron-down-icon";
import { FieldError } from "./field-error";

export interface RecipientSelectLabels {
  placeholder: string;
  search: string;
  error: string;
}

export interface RecipientSelectProps {
  options: KudosPerson[];
  value: KudosPerson | null;
  onChange: (person: KudosPerson) => void;
  /** Inline validation message (FR-4) — rendered below the field when set. */
  error?: string;
  labels: RecipientSelectLabels;
  /** Id applied to the trigger button, so a wrapping `FieldGroup` label can
   * point `htmlFor` at it. */
  id?: string;
}

/**
 * Searchable single-select over `KudosPerson[]` (F007, FR-3) — this repo has
 * no combobox library (clarifications.md), so it is hand-built: a trigger
 * button + a listbox panel with a local search filter. Reuses
 * `useDismissableMenu({ haspopup: "listbox" })` for Escape/outside-click
 * close rather than reimplementing that behavior (DRY, same primitive the
 * header menus already use).
 */
export function RecipientSelect({ options, value, onChange, error, labels, id }: RecipientSelectProps) {
  const { open, setOpen, containerRef, triggerProps } = useDismissableMenu({ haspopup: "listbox" });
  const [query, setQuery] = useState("");
  const errorId = id ? `${id}-error` : undefined;

  const filtered = options.filter((person) =>
    person.name.toLowerCase().includes(query.toLowerCase()),
  );

  function handleSelect(person: KudosPerson) {
    onChange(person);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <button
        id={id}
        type="button"
        {...triggerProps}
        // `aria-invalid` isn't a supported attribute on role="button" per
        // the ARIA spec — `aria-describedby` alone still links the error
        // text to this control.
        aria-describedby={error ? errorId : undefined}
        className="flex w-full items-center justify-between rounded-lg border border-[#998C5F] bg-white px-6 py-4 text-left text-[#00101A]"
      >
        <span
          className={cn(
            "text-base leading-6 font-bold tracking-[0.15px]",
            value ? "text-[#00101A]" : "text-[#999]",
          )}
        >
          {value?.name ?? labels.placeholder}
        </span>
        <span aria-hidden="true" className="text-[#998C5F]">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-[#998C5F] bg-white p-2 shadow-lg">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.search}
            className="mb-2 w-full rounded-md border border-[#998C5F] bg-white px-3 py-2 text-sm text-[#00101A] outline-none placeholder:text-[#999]"
          />
          <ul role="listbox" className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {filtered.map((person) => (
              <li key={person.name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value?.name === person.name}
                  onClick={() => handleSelect(person)}
                  className="flex w-full flex-col items-start rounded-md px-3 py-2 text-left text-sm text-[#00101A] hover:bg-[#FFF8E1]"
                >
                  <span className="font-medium">{person.name}</span>
                  <span className="text-xs text-[#999]">{person.department}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}
