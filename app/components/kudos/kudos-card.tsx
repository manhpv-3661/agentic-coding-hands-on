import type { KudosPost } from "@/lib/kudos/kudos-types";
import { Avatar } from "./avatar";
import { CopyLinkButton } from "./copy-link-button";
import { KudosImageGallery } from "./kudos-image-gallery";

export interface KudosCardLabels {
  viewDetail: string;
  copyLink: string;
  copied: string;
  /** F008 heart aria-labels: not-yet-liked / already-liked. */
  like: string;
  unlike: string;
}

export interface KudosCardProps {
  post: KudosPost;
  /** `"highlight"` = carousel slide (clamp-3, CTA, static hashtags, no
   * gallery). `"feed"` = feed item (clamp-5, gallery, clickable hashtags). */
  variant: "highlight" | "feed";
  labels: KudosCardLabels;
  /** Feed-only hashtag click → board filter (FR-17). Static when omitted. */
  onHashtagClick?: (tag: string) => void;
  /** F008: has the viewer liked this post? Default `false`; consulted only
   * when `onToggleLike` is wired. */
  liked?: boolean;
  /** F008: may the viewer like this post — `false` for their own post.
   * Default `true`; consulted only when `onToggleLike` is wired. */
  canLike?: boolean;
  /** F008: fires with the post id on click. Its presence is what turns the
   * heart into an interactive `<button>` — omit for the legacy static
   * `<span>` fallback (server-safe F006 default). */
  onToggleLike?: (postId: string) => void;
}

/** Inline "sent" arrow, `currentColor`-driven (matches `award-card.tsx`). */
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

/** Heart icon — `filled` toggles solid (liked) vs. outline (F008); the
 * legacy fallback always renders filled. `currentColor`-driven. */
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={filled ? undefined : "2"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4.5 9 4.5C10.5 4.5 11.5 5.2 12 6C12.5 5.2 13.5 4.5 15 4.5C17.5 4.5 20 6.5 20 9.5C20 15.5 12 21 12 21Z" />
    </svg>
  );
}

function PersonBlock({ name, department, stars }: { name: string; department: string; stars: number }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={name} size={36} />
      <div className="flex flex-col items-start">
        <span className="text-sm font-semibold text-white">{name}</span>
        {/* Anonymous senders (F007, FR-18) have no department/stars. */}
        {department && (
          <span className="text-xs text-white/60">
            {department} · ⭐ {stars}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Shared Kudos card, parameterized by `variant` rather than forked (DRY).
 * Pure presentational — no hooks, no `"use client"`; the like toggle's
 * state lives with the caller (F008, `KudosPageClient`), not here.
 */
export function KudosCard({
  post,
  variant,
  labels,
  onHashtagClick,
  liked,
  canLike,
  onToggleLike,
}: KudosCardProps) {
  const isFeed = variant === "feed";
  const contentClamp = isFeed ? "line-clamp-5" : "line-clamp-3";

  // F008: interactive only when wired; `hearts` is never mutated — display
  // count adds the viewer's own like on top of the static base count.
  const likeInteractive = Boolean(onToggleLike);
  const isOwnPost = likeInteractive && canLike === false;
  const displayHearts = post.hearts + (liked ? 1 : 0);

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

      {/* "Danh hiệu" (F007, FR-5) — optional, compose-form-only. */}
      {post.title && (
        <p className="font-montserrat text-sm font-semibold text-[#FFEA9E]">{post.title}</p>
      )}

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
        {likeInteractive ? (
          // F008: own-post → disabled + dimmed, count still visible.
          <button
            type="button"
            aria-pressed={liked ?? false}
            aria-label={liked ? labels.unlike : labels.like}
            disabled={isOwnPost}
            onClick={() => onToggleLike?.(post.id)}
            className={`flex items-center gap-1 text-sm transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
              liked ? "text-[#FFEA9E]" : "text-white/70 hover:text-white"
            }`}
          >
            <HeartIcon filled={Boolean(liked)} />
            {displayHearts}
          </button>
        ) : (
          // Legacy F006 fallback — never a button, no click handler.
          <span className="flex items-center gap-1 text-sm text-white/70">
            <HeartIcon filled />
            {post.hearts}
          </span>
        )}
        <div className="flex items-center gap-4">
          <CopyLinkButton link={`/kudos#${post.id}`} label={labels.copyLink} copiedLabel={labels.copied} />
          {/* Static, non-navigating — no `/kudos/[id]` detail route exists. */}
          {!isFeed && <span className="text-sm font-medium text-white/70">{labels.viewDetail}</span>}
        </div>
      </div>
    </article>
  );
}
