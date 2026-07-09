import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Single-owner layout primitives (site-wide layout system audit,
 * `plans/260707-2337-site-layout-system-audit-fixes/`).
 *
 * `PageGutter` is the ONLY component allowed to own left/right viewport
 * padding; `ContentFrame` is the ONLY component allowed to own max-width. No
 * other component should hardcode a competing `px-36` gutter or `max-w-[...]`
 * — nest `ContentFrame` inside `PageGutter` instead, or add a new named width
 * below if the design genuinely calls for one.
 *
 * The 144px gutter and the three content widths were numerically
 * re-verified against live MoMorph across all four audited screens
 * (login/home/awards/kudos) — confirmed correct, values unchanged. See
 * `phase-01-numeric-contract-audit.md` for the per-screen contract tables
 * this was checked against.
 *
 * Desktop-only (`plans/260709-0724-desktop-only-banner-overlay-fix/`): the
 * gutter is now a FLAT 144px at every viewport width — no breakpoint
 * scaling. Site is designed and shipped desktop-only; below-native-width
 * viewports do not reflow.
 *
 * Exception: the footer's 90px gutter is real design (Figma `Footer`
 * instance uses 90px, not 144px) and intentionally lives OUTSIDE this
 * primitive (`site-footer.tsx` / `login-footer.tsx` hardcode it directly) —
 * do not fold it into `PageGutter`, that would introduce the actual mismatch.
 */
const GUTTER_CLASS = "w-full px-36";

const CONTENT_WIDTH_CLASS = {
  1120: "max-w-[1120px]",
  1152: "max-w-[1152px]",
  1224: "max-w-[1224px]",
} as const;

type ContentWidth = keyof typeof CONTENT_WIDTH_CLASS;

type LayoutProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

type PolymorphicProps<T extends ElementType> = LayoutProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof LayoutProps<T>>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function PageGutter<T extends ElementType = "div">({
  as,
  className,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag className={joinClasses(GUTTER_CLASS, className)} {...props}>
      {children}
    </Tag>
  );
}

export type ContentFrameProps<T extends ElementType = "div"> = PolymorphicProps<T> & {
  width: ContentWidth;
};

export function ContentFrame<T extends ElementType = "div">({
  as,
  className,
  width,
  children,
  ...props
}: ContentFrameProps<T>) {
  const Tag = as ?? "div";

  return (
    <Tag
      className={joinClasses("mx-auto w-full", CONTENT_WIDTH_CLASS[width], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
