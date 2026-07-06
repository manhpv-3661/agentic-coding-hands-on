"use client";

import { useState } from "react";
import { KudosSectionHeading } from "./kudos-section-heading";
import { SpotlightNameCloud } from "./spotlight-name-cloud";

export interface SpotlightBoardLabels {
  searchPlaceholder: string;
  panZoom: string;
}

export interface SpotlightBoardProps {
  names: string[];
  total: number;
  labels: SpotlightBoardLabels;
}

const SEARCH_MAX_LENGTH = 100;

/**
 * "SPOTLIGHT BOARD" section (FR-9/10/11). Self-contained client section:
 * owns its OWN search + Pan/Zoom state, independent of the shared
 * hashtag/department filter (Phase 08's `kudos-board.tsx`) — isolated per
 * Phase 06's Key Insights, safe to build/test/run in parallel with
 * Highlight (05) and All Kudos (07).
 *
 * "{total} KUDOS" is the static `SPOTLIGHT_TOTAL` counter, NOT a count of
 * rendered names (clarifications.md).
 */
export function SpotlightBoard({ names, total, labels }: SpotlightBoardProps) {
  const [query, setQuery] = useState("");
  const [panZoom, setPanZoom] = useState(false);

  return (
    <section className="flex w-full flex-col gap-6">
      <KudosSectionHeading subtitle="Sun* Annual Awards 2025" title="SPOTLIGHT BOARD" />

      <div className="flex w-full flex-col gap-4 rounded-2xl border border-[#2E3940] bg-[#101317] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="font-montserrat text-2xl font-bold text-[#FFEA9E]">{total} KUDOS</p>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, SEARCH_MAX_LENGTH))}
              maxLength={SEARCH_MAX_LENGTH}
              placeholder={labels.searchPlaceholder}
              aria-label={labels.searchPlaceholder}
              className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setPanZoom((current) => !current)}
              aria-pressed={panZoom}
              className={`rounded-full border px-4 py-2 text-sm transition-colors duration-150 ${
                panZoom
                  ? "border-[#FFEA9E] text-[#FFEA9E]"
                  : "border-white/20 text-white/70"
              }`}
            >
              {labels.panZoom}
            </button>
          </div>
        </div>

        <SpotlightNameCloud names={names} query={query} panZoom={panZoom} />
      </div>
    </section>
  );
}
