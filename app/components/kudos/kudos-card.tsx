import type { KudosPost } from "@/lib/kudos/kudos-types";
import { Avatar } from "./avatar";
import { CopyLinkButton } from "./copy-link-button";
import { KudosImageGallery } from "./kudos-image-gallery";

export interface KudosCardLabels {
  viewDetail: string;
  copyLink: string;
  copied: string;
}

export interface KudosCardProps {
  post: KudosPost;
  /** `"highlight"` = carousel slide (clamp-3, "Xem chi tiết" CTA, static
   * hashtags, no gallery). `"feed"` = All Kudos list item (clamp-5, image
   * gallery, clickable hashtags, no CTA). See Phase 04 clarifications. */
  variant: "highlight" | "feed";
  labels: KudosCardLabels;
  /** Feed-only: clicking a hashtag sets the board's hashtag filter
   * (FR-17). Ignored (hashtags render as static `<span>`) when omitted —
   * i.e. always in the highlight variant. */
  onHashtagClick?: (tag: string) => void;
}

/** Inline "sent" arrow between sender and recipient — `currentColor` so it
 * follows the surrounding text color, matching the `award-card.tsx` icon
 * idiom (exported Figma assets ship with a hardcoded fill). */
function SentArrowIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M4 12H20M20 12L14 6M20 12L14 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Static heart icon paired with the static like count `<span>` — never a
 * `<button>` (the like/heart toggle is explicitly out of scope,
 * clarifications.md — no `aria-pressed`, no click handler anywhere near
 * it). */
function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4.5 9 4.5C10.5 4.5 11.5 5.2 12 6C12.5 5.2 13.5 4.5 15 4.5C17.5 4.5 20 6.5 20 9.5C20 15.5 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PersonBlock({ name, department, stars }: { name: string; department: string; stars: number }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={name} size={36} />
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold text-white">{name}</span>
        <span className="text-xs text-white/60">
          {department} · ⭐ {stars}
        </span>
      </div>
    </div>
  );
}

/**
 * Shared Kudos card — the sender→recipient header, content, hashtags, and
 * footer are identical between the Highlight carousel (Phase 05) and the
 * All Kudos feed (Phase 07); only clamp depth, gallery presence, and
 * hashtag interactivity differ (`variant`), so one component is
 * parameterized rather than forked (DRY, per Phase 04 Key Insights).
 *
 * Pure presentational: no hooks, no `"use client"` directive — it renders
 * one client leaf (`CopyLinkButton`) but is itself safe in either a
 * server or client subtree.
 */
export function KudosCard({ post, variant, labels, onHashtagClick }: KudosCardProps) {
  const isFeed = variant === "feed";
  const contentClamp = isFeed ? "line-clamp-5" : "line-clamp-3";

  return (
    // mm:kudos-card (shared Highlight/All-Kudos card)
    <article className="flex w-full flex-col gap-4 rounded-2xl border border-[#2E3940] bg-[#101317] p-6">
      <div className="flex flex-wrap items-center gap-3">
        <PersonBlock
          name={post.sender.name}
          department={post.sender.department}
          stars={post.sender.stars}
        />
        <SentArrowIcon />
        <PersonBlock
          name={post.recipient.name}
          department={post.recipient.department}
          stars={post.recipient.stars}
        />
      </div>

      <p className="text-xs text-white/50">{post.timestamp}</p>

      <p className={`font-montserrat text-sm text-white/90 ${contentClamp}`}>{post.content}</p>

      {isFeed && <KudosImageGallery count={post.imageCount} />}

      <div className="flex flex-wrap gap-2">
        {post.hashtags.slice(0, 5).map((tag) =>
          isFeed ? (
            <button
              key={tag}
              type="button"
              onClick={() => onHashtagClick?.(tag)}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#FFEA9E] transition-colors duration-150 hover:bg-white/20"
            >
              {tag}
            </button>
          ) : (
            <span
              key={tag}
              className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#FFEA9E]"
            >
              {tag}
            </span>
          ),
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#2E3940] pt-4">
        <span className="flex items-center gap-1 text-sm text-white/70">
          <HeartIcon />
          {post.hearts}
        </span>
        <div className="flex items-center gap-4">
          <CopyLinkButton link={`/kudos#${post.id}`} label={labels.copyLink} copiedLabel={labels.copied} />
          {!isFeed && (
            // Static, non-navigating — no `/kudos/[id]` detail route exists
            // in this pass (clarifications.md). Future work: link this to
            // `/kudos/${post.id}` once that route ships.
            <span className="text-sm font-medium text-white/70">{labels.viewDetail}</span>
          )}
        </div>
      </div>
    </article>
  );
}
