import type { KudosPost } from "@/lib/kudos/kudos-types";
import { CopyLinkButton } from "./copy-link-button";
import { ArrowRightIcon, HeartIcon, PencilIcon, SentArrowIcon } from "./kudos-card-icons";
import { KudosImageGallery } from "./kudos-image-gallery";
import { KudosPersonBlock } from "./kudos-person-block";

export interface KudosCardLabels {
  viewDetail: string;
  copyLink: string;
  copied: string;
  /** Toast text on a failed clipboard write (`kudos.card.copyFailed`,
   * finding M4 — never claim "copied" on failure). */
  copyFailed: string;
  /** F008 heart aria-labels: not-yet-liked / already-liked. */
  like: string;
  unlike: string;
}

export interface KudosCardProps {
  post: KudosPost;
  /** `"highlight"` = carousel slide (clamp-3, CTA, static hashtags, no
   * gallery). `"feed"` = feed item (clamp-5, gallery, clickable hashtags,
   * decorative pencil beside the title). */
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

/**
 * Shared Kudos card, parameterized by `variant` rather than forked (DRY).
 * Pure presentational — no hooks, no `"use client"`; the like toggle's
 * state lives with the caller (F008, `KudosPageClient`), not here.
 *
 * Cream `#FFF8E1` card with dark `#00101A` text throughout (MoMorph design
 * ground truth, researcher-260707-0110) — the highlight variant additionally
 * gets a 4px `#FFEA9E` border, the feed variant a larger 24px radius and no
 * border. `#FFEA9E` dividers separate the header/content/action zones; the
 * message itself sits in a translucent yellow inner box.
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
    <article
      className={
        isFeed
          ? "flex w-full flex-col gap-4 rounded-3xl bg-[#FFF8E1] px-10 pt-10 pb-4"
          : "flex w-full flex-col gap-4 rounded-2xl border-4 border-[#FFEA9E] bg-[#FFF8E1] px-6 pt-6 pb-4"
      }
    >
      {/* mm:I2940:13464;335:9442 / mm:I3127:21871;256:4857 — 24px gap,
       * space-between, in both variants (not gap-3/packed). Ground truth
       * never wraps this row to two lines even for its longest sample names
       * ("Huỳnh Dương Xuân Nhật" / "Huỳnh Dương Xuân") — `flex-wrap` let the
       * recipient block drop to its own line on the narrower "All Kudos"
       * single-column card (confirmed via live-browser screenshot), so this
       * stays a single non-wrapping row; `min-w-0` on each person block lets
       * its name/department text truncate instead of forcing a wrap. */}
      <div className="flex items-center justify-between gap-[0_20px]">
        <KudosPersonBlock person={post.sender} />
        <SentArrowIcon />
        <KudosPersonBlock person={post.recipient} />
      </div>

      {/* mm:3127:21871 / mm:2940:13464 — the rule sits immediately after the
       * sender/recipient row, welding timestamp+title to the message/gallery/
       * hashtags group below it, not to the avatar row above it. */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      <p className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-[#999999]">
        {post.timestamp}
      </p>

      {/* "Danh hiệu" (F007, FR-5) — optional, compose-form-only. Feed cards
       * add a decorative, non-interactive pencil (design: 32px, no edit
       * affordance — mirrors the composer pill's pencil precedent). */}
      {post.title && (
        <div className="relative flex w-full items-center justify-center">
          <p className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-[#00101A]">
            {post.title}
          </p>
          {isFeed && <PencilIcon className="absolute right-0 text-[#00101A]" />}
        </div>
      )}

      <div className="rounded-xl border border-[#FFEA9E] bg-[rgba(255,234,158,0.40)] px-6 py-4">
        <p
          className={`font-montserrat text-xl leading-8 font-bold text-justify text-[#00101A] ${contentClamp}`}
        >
          {post.content}
        </p>
      </div>

      {isFeed && <KudosImageGallery count={post.imageCount} imageUrls={post.imageUrls} />}

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {post.hashtags.slice(0, 5).map((tag) =>
          isFeed ? (
            <button
              key={tag}
              type="button"
              onClick={() => onHashtagClick?.(tag)}
              className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-[#D4271D] transition-opacity duration-150 hover:opacity-70"
            >
              {tag}
            </button>
          ) : (
            <span
              key={tag}
              className="font-montserrat text-base leading-6 font-bold tracking-[0.5px] text-[#D4271D]"
            >
              {tag}
            </span>
          ),
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#FFEA9E] pt-4">
        {likeInteractive ? (
          // F008: own-post → disabled + dimmed, count still visible.
          <button
            type="button"
            aria-pressed={liked ?? false}
            aria-label={liked ? labels.unlike : labels.like}
            disabled={isOwnPost}
            onClick={() => onToggleLike?.(post.id)}
            className="flex items-center gap-2 font-montserrat text-2xl leading-8 font-bold text-[#00101A] transition-opacity duration-150 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={liked ? "text-[#D4271D]" : "text-[#999999]"}>
              <HeartIcon filled={Boolean(liked)} />
            </span>
            {displayHearts}
          </button>
        ) : (
          // Legacy F006 fallback — never a button, no click handler.
          <span className="flex items-center gap-2 font-montserrat text-2xl leading-8 font-bold text-[#00101A]">
            <span className="text-[#999999]">
              <HeartIcon filled />
            </span>
            {post.hearts}
          </span>
        )}
        <div className="flex items-center gap-6">
          <CopyLinkButton
            link={`/kudos#${post.id}`}
            label={labels.copyLink}
            copiedLabel={labels.copied}
            copyFailedLabel={labels.copyFailed}
          />
          {/* Static, non-navigating — no `/kudos/[id]` detail route exists. */}
          {!isFeed && (
            <span className="flex items-center gap-1 font-montserrat text-base leading-6 font-bold tracking-[0.15px] text-[#00101A]">
              {labels.viewDetail}
              <ArrowRightIcon />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
