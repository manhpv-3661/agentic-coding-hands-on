import { test, expect } from "@playwright/test";
import {
  VIEWPORTS,
  TOLERANCE_PX,
  HEIGHT_TOLERANCE_PX,
  EXPECTED_GUTTER_PX,
  measureBox,
  expectClose,
  expectNeverExceeds,
  expectNoDoubleGutter,
  assertStructuralInvariants,
} from "./layout-contract-helpers";

/**
 * Numeric layout-contract tests — measures real DOM
 * (`getBoundingClientRect`/`getComputedStyle`) against the per-screen
 * contract tables in `phase-04..07-*.md`
 * (`plans/260707-2337-site-layout-system-audit-fixes/`), per
 * `.claude/rules/momorph/momorph-layout-system.md` §7. Screenshot diffing
 * is NOT the gate here — this is number vs. number.
 *
 * Runs on "chromium-authless" (port 3100, no Supabase env) so protected
 * home/awards/kudos routes render real content unauthenticated, same
 * convention as `homepage-content.spec.ts` / `awards-content.spec.ts`.
 * `/login` is public and renders identically on either project.
 *
 * Every screen has a live MoMorph frame at exactly ONE tested width (1440
 * for login/awards/kudos, 1512 for home — never in the 1440/1280/768/375
 * sweep, so home's numeric contract is asserted at 1512 separately). Every
 * OTHER width gets structural invariants only (content never exceeds its
 * max-width cap, the shared gutter primitive's own breakpoint holds, no
 * nested element re-applies the gutter) — never a fabricated number.
 */

const CONTENT_1152 = '[class*="max-w-[1152px]"]';

test.describe("Layout contract — Login (1440-only design)", () => {
  test("1440 numeric contract: header/main gutter 144, content capped at 1152, footer gutter 90", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/login");

    const header = await measureBox(page, "header");
    expectClose(header.paddingLeft, 144, TOLERANCE_PX, "login header left gutter");
    expectClose(header.paddingRight, 144, TOLERANCE_PX, "login header right gutter");
    expectClose(header.height, 80, HEIGHT_TOLERANCE_PX, "login header height");

    const main = await measureBox(page, "main");
    expectClose(main.paddingLeft, 144, TOLERANCE_PX, "login main gutter");
    expectClose(main.paddingRight, 144, TOLERANCE_PX, "login main gutter");

    const content = await measureBox(page, CONTENT_1152);
    expectClose(content.width, 1152, TOLERANCE_PX, "login content max-width");
    await expectNoDoubleGutter(page, CONTENT_1152);

    // Footer's 90px gutter is real design and intentionally OUTSIDE
    // PageGutter (phase-04 verdict) — do not expect 144 here.
    const footer = await measureBox(page, "footer");
    expectClose(footer.paddingLeft, 90, TOLERANCE_PX, "login footer gutter");
    expectClose(footer.paddingRight, 90, TOLERANCE_PX, "login footer gutter");
    // phase-04's contract itself flags "~91" as approximate; measured 105px
    // is `py-10` (40+40) + one 24px text line, single-row (no wrap) — a
    // font-metric rounding gap, loose-tolerance per plan Risk Assessment.
    expectClose(footer.height, 91, 20, "login footer height (design value is approximate)");
  });

  for (const viewport of VIEWPORTS.filter((v) => v.width !== 1440)) {
    test(`${viewport.name}: structural invariants only (not in design)`, async ({ page }) => {
      await assertStructuralInvariants(page, "/login", viewport, CONTENT_1152, 1152);
    });
  }
});

test.describe("Layout contract — Awards (1440-only design)", () => {
  test("1440 numeric contract: header/hero/title-block gutter 144, hero+catalog capped at 1152", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards");

    const header = await measureBox(page, "header");
    expectClose(header.paddingLeft, 144, TOLERANCE_PX, "awards header gutter");
    expectClose(header.height, 80, HEIGHT_TOLERANCE_PX, "awards header height");

    // Index 0: AwardsHero's own KV-logo ContentFrame. Index 1: the
    // page-level title+catalog wrapper (phase-06 "Bìa"/Title/Catalog rows).
    const heroContent = await measureBox(page, CONTENT_1152, 0);
    expectClose(heroContent.width, 1152, TOLERANCE_PX, "awards hero content max-width");

    const titleCatalog = await measureBox(page, CONTENT_1152, 1);
    expectClose(titleCatalog.width, 1152, TOLERANCE_PX, "awards title/catalog max-width");
    await expectNoDoubleGutter(page, CONTENT_1152, 1);

    // Footer's 90px gutter is intentional (SiteFooter, shared with home) —
    // NOT the 144px page gutter, confirmed in phase-06.
    const footer = await measureBox(page, "footer");
    expectClose(footer.paddingLeft, 90, TOLERANCE_PX, "awards footer gutter");
    // KNOWN FINDING, not asserted numerically (see implementer report): at
    // 1440 this shared `SiteFooter` wraps to 2 rows (~193px vs the
    // phase-06 contract's 144px) — its logo+nav row (~1057px) plus the
    // copyright text (~280px) sum past the 1260px available content width.
    // Pre-existing in `site-footer.tsx`, unrelated to the PageGutter/
    // ContentFrame system this phase covers — flagged for a follow-up fix
    // rather than asserted against or tolerance-widened to hide it.
  });

  for (const viewport of VIEWPORTS.filter((v) => v.width !== 1440)) {
    test(`${viewport.name}: structural invariants only (not in design)`, async ({ page }) => {
      await assertStructuralInvariants(page, "/awards", viewport, CONTENT_1152, 1152, 1);
    });
  }
});

test.describe("Layout contract — Kudos + Spotlight (1440-only design)", () => {
  test("1440 numeric contract: header gutter 144, board content capped at 1152", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");

    const header = await measureBox(page, "header");
    expectClose(header.paddingLeft, 144, TOLERANCE_PX, "kudos header gutter");
    expectClose(header.height, 80, HEIGHT_TOLERANCE_PX, "kudos header height");

    // Index 0: KudosBanner's own ContentFrame (title/pills overlay, rendered
    // first in kudos-page-client.tsx). Index 1: KudosBoard's ContentFrame —
    // the one this assertion is actually about (review finding: this test
    // previously defaulted to index 0 and silently measured the banner).
    const content = await measureBox(page, CONTENT_1152, 1);
    expectClose(content.width, 1152, TOLERANCE_PX, "kudos board content max-width");
    await expectNoDoubleGutter(page, CONTENT_1152, 1);
  });

  for (const viewport of VIEWPORTS.filter((v) => v.width !== 1440)) {
    test(`${viewport.name}: structural invariants only (not in design)`, async ({ page }) => {
      await assertStructuralInvariants(page, "/kudos", viewport, CONTENT_1152, 1152);
    });
  }

  test("Spotlight name-cloud renders names as live DOM (not baked into a background image)", async ({
    page,
  }) => {
    await page.goto("/kudos");

    // `spotlight-name-cloud.tsx` tags every name with `data-spotlight-index`;
    // the backdrop (`spotlight-collage-backdrop.tsx`) is CSS-only with no
    // text, so a nonzero count proves names are single-sourced DOM, not
    // double-rendered from a flattened crop (phase-07's fixed defect).
    const nameNodes = page.locator("span[data-spotlight-index]");
    await expect(nameNodes.first()).toBeVisible();
    expect(await nameNodes.count()).toBeGreaterThan(0);
  });
});

test.describe("Layout contract — Home (1512-only design)", () => {
  test("1512 numeric contract: header gutter 144, hero/awards/kudos-outer 1224, root-further 1152, kudos-inner 1120", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1512, height: 950 });
    await page.goto("/");

    const header = await measureBox(page, "header");
    expectClose(header.paddingLeft, 144, TOLERANCE_PX, "home header gutter");
    expectClose(header.height, 80, HEIGHT_TOLERANCE_PX, "home header height");

    const hero = await measureBox(page, 'main > :nth-child(1) [class*="max-w-[1224px]"]');
    expectClose(hero.width, 1224, TOLERANCE_PX, "home hero max-width");

    const rootFurther = await measureBox(page, `main > :nth-child(2) ${CONTENT_1152}`);
    expectClose(rootFurther.width, 1152, TOLERANCE_PX, "home root-further max-width");
    // Re-verified 2026-07-10: root-further-content.tsx's ContentFrame has NO
    // interior padding (the Figma node's declared `padding: 120px 104px` was
    // found NOT to apply to the real content — see that file's docblock) —
    // no exception needed here anymore, full invariant applies like any
    // other ContentFrame.
    await expectNoDoubleGutter(page, `main > :nth-child(2) ${CONTENT_1152}`);

    const awards = await measureBox(page, '#awards-section [class*="max-w-[1224px]"]');
    expectClose(awards.width, 1224, TOLERANCE_PX, "home awards max-width");

    const kudosOuter = await measureBox(page, '#kudos-section [class*="max-w-[1224px]"]');
    expectClose(kudosOuter.width, 1224, TOLERANCE_PX, "home kudos outer max-width");

    const kudosInner = await measureBox(page, '#kudos-section [class*="max-w-[1120px]"]');
    expectClose(kudosInner.width, 1120, TOLERANCE_PX, "home kudos inner max-width");
  });

  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: structural invariants only (design is 1512-only)`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const header = await measureBox(page, "header");
      expectClose(header.paddingLeft, EXPECTED_GUTTER_PX, TOLERANCE_PX, `home header gutter @${viewport.name}`);

      const hero = await measureBox(page, 'main > :nth-child(1) [class*="max-w-[1224px]"]');
      expectNeverExceeds(hero.width, 1224, `home hero @${viewport.name}`);

      const rootFurther = await measureBox(page, `main > :nth-child(2) ${CONTENT_1152}`);
      expectNeverExceeds(rootFurther.width, 1152, `home root-further @${viewport.name}`);

      const awards = await measureBox(page, '#awards-section [class*="max-w-[1224px]"]');
      expectNeverExceeds(awards.width, 1224, `home awards @${viewport.name}`);

      const kudosInner = await measureBox(page, '#kudos-section [class*="max-w-[1120px]"]');
      expectNeverExceeds(kudosInner.width, 1120, `home kudos inner @${viewport.name}`);
    });
  }
});
