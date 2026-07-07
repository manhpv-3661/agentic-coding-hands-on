import { expect, type Page } from "@playwright/test";

/**
 * Shared measurement/assertion helpers for `layout-contract.spec.ts`
 * (`.claude/rules/momorph/momorph-layout-system.md` §7 — verify layout
 * numerically, via real DOM measurement, never by eye).
 */

export interface Viewport {
  name: string;
  width: number;
  height: number;
}

/**
 * The four standard measurement widths (plan.md Assumption #4). Only the
 * screen's OWN live-MoMorph viewport (1440 for login/awards/kudos, 1512 for
 * home — see phase-04/06/07 vs phase-05 contract tables) gets numeric
 * contract assertions against a Figma-sourced number; every other viewport
 * here gets structural invariants only (content never exceeds max-width,
 * gutter present exactly once) — never a fabricated pixel value.
 */
export const VIEWPORTS: Viewport[] = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "375", width: 375, height: 812 },
];

/** Gutter/max-width tolerance (plan.md Assumption #4). */
export const TOLERANCE_PX = 1;
/** Header/footer heights are flow-driven (font metrics, line-height
 * rounding) rather than a hard CSS dimension, so the numeric contract
 * checks use a looser tolerance for them — see phase-08 Risk Assessment
 * ("assert gutter/max-width strictly, heights loosely"). */
export const HEIGHT_TOLERANCE_PX = 6;

/**
 * `PageGutter`'s OWN Tailwind breakpoints (`app/components/layout/
 * page-layout.tsx`: `w-full px-6 sm:px-10 lg:px-36`). This is the shared
 * primitive's responsive contract, not a per-screen design number, so it is
 * valid to assert at every viewport regardless of whether that viewport has
 * a live Figma frame behind it.
 */
export function expectedGutterForWidth(viewportWidth: number): number {
  if (viewportWidth >= 1024) return 144; // lg:px-36
  if (viewportWidth >= 640) return 40; // sm:px-10
  return 24; // px-6 (base, <640)
}

interface BoxMeasurement {
  width: number;
  height: number;
  paddingLeft: number;
  paddingRight: number;
}

/**
 * Measures the Nth element matching `selector` via `getBoundingClientRect`
 * (width/height) and `getComputedStyle` (padding) — real DOM measurement,
 * not an assumption about class names doing what they say.
 */
export async function measureBox(
  page: Page,
  selector: string,
  index = 0,
): Promise<BoxMeasurement> {
  return page.evaluate(
    ({ selector, index }) => {
      const el = document.querySelectorAll(selector)[index] as HTMLElement | undefined;
      if (!el) {
        throw new Error(`layout-contract: no element matched "${selector}" at index ${index}`);
      }
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        width: rect.width,
        height: rect.height,
        paddingLeft: parseFloat(style.paddingLeft),
        paddingRight: parseFloat(style.paddingRight),
      };
    },
    { selector, index },
  );
}

/** Asserts `actual` falls within `expected ± tolerance`, with a message
 * that names what was being checked (so a failure reads as a layout
 * contract violation, not a bare number mismatch). */
export function expectClose(actual: number, expected: number, tolerance: number, label: string) {
  expect(
    actual,
    `${label}: expected ${expected}px ±${tolerance}px, measured ${actual}px`,
  ).toBeGreaterThanOrEqual(expected - tolerance);
  expect(
    actual,
    `${label}: expected ${expected}px ±${tolerance}px, measured ${actual}px`,
  ).toBeLessThanOrEqual(expected + tolerance);
}

/** Structural invariant: content column width must never exceed
 * `maxWidthPx` (the primitive's own cap), regardless of viewport — this is
 * the single-max-width-owner rule, not a design pixel value. */
export function expectNeverExceeds(actual: number, maxWidthPx: number, label: string) {
  expect(actual, `${label}: content width ${actual}px exceeds cap ${maxWidthPx}px`).toBeLessThanOrEqual(
    maxWidthPx + TOLERANCE_PX,
  );
}

/**
 * Structural-invariant check shared by every 1440-only screen (login,
 * awards, kudos) at every viewport OTHER than their one live-design width:
 * the shared gutter primitive's own breakpoint holds, content never
 * exceeds its max-width cap, and no descendant re-applies the gutter — no
 * fabricated per-viewport pixel numbers (phase-08 Requirements).
 */
export async function assertStructuralInvariants(
  page: Page,
  url: string,
  viewport: Viewport,
  contentSelector: string,
  maxWidthPx: number,
  contentIndex = 0,
) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url);

  const expectedGutter = expectedGutterForWidth(viewport.width);
  const header = await measureBox(page, "header");
  expectClose(header.paddingLeft, expectedGutter, TOLERANCE_PX, `${url} header gutter @${viewport.name}`);
  expectClose(header.paddingRight, expectedGutter, TOLERANCE_PX, `${url} header gutter @${viewport.name}`);

  const content = await measureBox(page, contentSelector, contentIndex);
  expectNeverExceeds(content.width, maxWidthPx, `${url} content @${viewport.name}`);
  await expectNoDoubleGutter(page, contentSelector, contentIndex);
}

/**
 * Structural invariant, safe on every `ContentFrame`: no descendant
 * re-applies the shared `PageGutter` gutter class (`lg:px-36`) — that would
 * mean a second layer silently owns the viewport gutter inside the content
 * column (momorph-layout-system.md §3, "exactly one layer owns gutter").
 */
export async function expectNoNestedGutterClass(page: Page, contentFrameSelector: string, index = 0) {
  const hasNestedGutter = await page.evaluate(
    ({ contentFrameSelector, index }) => {
      const el = document.querySelectorAll(contentFrameSelector)[index] as HTMLElement | undefined;
      if (!el) {
        throw new Error(
          `layout-contract: no element matched "${contentFrameSelector}" at index ${index}`,
        );
      }
      return el.querySelector('[class*="lg:px-36"]') !== null;
    },
    { contentFrameSelector, index },
  );

  expect(
    hasNestedGutter,
    `${contentFrameSelector}: a descendant re-applies the PageGutter gutter class (double gutter)`,
  ).toBe(false);
}

/**
 * Single-owner invariant (momorph-layout-system.md §3): a `ContentFrame`
 * must never carry its OWN horizontal padding (it only owns `max-width` +
 * `mx-auto`) on top of {@link expectNoNestedGutterClass}'s check.
 *
 * NOT universal: `root-further-content.tsx`'s `ContentFrame(1152)` is a
 * documented exception — its `lg:px-[104px] lg:py-[120px]` reproduces that
 * exact node's own *interior* card padding from the live Figma source (see
 * that file's docblock), not a re-applied viewport gutter. Use
 * {@link expectNoNestedGutterClass} alone for that one.
 */
export async function expectNoDoubleGutter(page: Page, contentFrameSelector: string, index = 0) {
  const result = await page.evaluate(
    ({ contentFrameSelector, index }) => {
      const el = document.querySelectorAll(contentFrameSelector)[index] as HTMLElement | undefined;
      if (!el) {
        throw new Error(
          `layout-contract: no element matched "${contentFrameSelector}" at index ${index}`,
        );
      }
      const style = getComputedStyle(el);
      return {
        paddingLeft: parseFloat(style.paddingLeft),
        paddingRight: parseFloat(style.paddingRight),
      };
    },
    { contentFrameSelector, index },
  );

  expect(result.paddingLeft, `${contentFrameSelector}: ContentFrame must own zero horizontal padding`).toBe(0);
  expect(result.paddingRight, `${contentFrameSelector}: ContentFrame must own zero horizontal padding`).toBe(0);
  await expectNoNestedGutterClass(page, contentFrameSelector, index);
}
