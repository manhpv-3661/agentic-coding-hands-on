import Image from "next/image";

/**
 * Full-viewport hero keyvisual for the Login screen. MoMorph:
 * https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/GzbNeVGJHz
 * (node `662:14389` "image 1", inside group `662:14388` mms_C_Keyvisual).
 *
 * `mms_C_Keyvisual.jpg` is a direct Figma export of that group (hand-pulled,
 * since the node isn't a tagged `MM_MEDIA_*` asset and the MoMorph media API
 * 401/500s on it) — 1440x1022, matching the group's own Figma box (1441x1022
 * at x:0 y:2 in the 1440x1024 frame) almost exactly, and free of any baked
 * header/footer/text since it's the isolated layer, not a full-page render.
 * `object-cover` fills the responsive `inset-0` container from it, same
 * full-bleed pattern as `PrelaunchBackground`/`AwardsHero` — this screen's
 * box previously stayed a fixed `w-[1441px] h-[1022px]` px box instead, so it
 * neither grew on wide viewports nor shrank on narrow ones like every other
 * screen's background.
 *
 * The left→right dark scrim is Figma's `Rectangle 57` (662:14392) fade: flat
 * opaque `#00101A` through 25.41% of width, then fades to transparent by
 * 100%.
 */
export function LoginKeyvisualBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Image src="/login/mms_C_Keyvisual.jpg" alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]" />
    </div>
  );
}
