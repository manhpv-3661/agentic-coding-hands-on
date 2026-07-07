import Image from "next/image";

/**
 * Decorative Spotlight backdrop reconstructed from the real rendered crop
 * exported out of MoMorph. We do not have the isolated `image 25` background
 * asset as a clean PNG, only the flattened board crop, so this uses that crop
 * as a blurred/darkened reference layer. That preserves the true wave/network
 * geometry much better than inventing a new collage from unrelated mock photos,
 * while still pushing the baked text/UI far enough into the background that the
 * real foreground layers stay dominant.
 */
export function SpotlightCollageBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden rounded-[47px]">
      <Image
        src="/kudos/spotlight-crop.png"
        alt=""
        fill
        quality={100}
        unoptimized
        sizes="1157px"
        className="object-cover object-center opacity-[0.96] saturate-[1.08] brightness-[0.76] contrast-[1.03]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.34)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_88%,rgba(228,117,33,0.18),transparent_21%),radial-gradient(circle_at_7%_22%,rgba(102,177,88,0.14),transparent_17%),radial-gradient(circle_at_34%_90%,rgba(166,64,38,0.16),transparent_19%)]" />
    </div>
  );
}
