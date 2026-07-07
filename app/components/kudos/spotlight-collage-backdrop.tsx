import Image from "next/image";

interface CollageTile {
  src: string;
  alt: string;
  className: string;
  rounded: string;
}

const COLLAGE_TILES: CollageTile[] = [
  {
    src: "/kudos/gallery/photo-1.jpg",
    alt: "",
    className: "left-[6%] top-[12%] h-24 w-24 rotate-[-6deg]",
    rounded: "rounded-[22px]",
  },
  {
    src: "/kudos/avatars/avatar-1.jpg",
    alt: "",
    className: "left-[18%] top-[44%] h-20 w-20",
    rounded: "rounded-full",
  },
  {
    src: "/kudos/avatars/avatar-2.jpg",
    alt: "",
    className: "left-[34%] top-[18%] h-16 w-16",
    rounded: "rounded-full",
  },
  {
    src: "/kudos/gallery/photo-1.jpg",
    alt: "",
    className: "left-[41%] top-[55%] h-28 w-28 rotate-[8deg]",
    rounded: "rounded-[26px]",
  },
  {
    src: "/kudos/avatars/avatar-3.jpg",
    alt: "",
    className: "left-[58%] top-[15%] h-18 w-18",
    rounded: "rounded-full",
  },
  {
    src: "/kudos/gallery/photo-1.jpg",
    alt: "",
    className: "left-[67%] top-[42%] h-24 w-24 rotate-[-10deg]",
    rounded: "rounded-[24px]",
  },
  {
    src: "/kudos/avatars/avatar-1.jpg",
    alt: "",
    className: "left-[79%] top-[20%] h-16 w-16",
    rounded: "rounded-full",
  },
  {
    src: "/kudos/avatars/avatar-2.jpg",
    alt: "",
    className: "left-[84%] top-[58%] h-20 w-20",
    rounded: "rounded-full",
  },
];

/**
 * Decorative member-photo collage for the Spotlight board. The real Figma
 * export path for this backdrop is unavailable in this repo, so this uses the
 * shipped local mock photos and arranges them into a dense, low-contrast
 * collage behind the name cloud and ticker.
 */
export function SpotlightCollageBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden rounded-[47px]">
      <div className="absolute inset-0 bg-[#101317]" />
      <div className="absolute inset-0 grid grid-cols-4 gap-4 px-10 py-8 opacity-18">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className={`min-h-24 rounded-[28px] bg-[url('/kudos/gallery/photo-1.jpg')] bg-cover bg-center ${
              index % 2 === 0 ? "translate-y-4" : "-translate-y-2"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        {COLLAGE_TILES.map((tile, index) => (
          <div
            key={index}
            className={`absolute overflow-hidden border border-white/20 opacity-45 shadow-[0_0_24px_rgba(0,0,0,0.25)] ${tile.className} ${tile.rounded}`}
          >
            <Image src={tile.src} alt={tile.alt} fill sizes="128px" className="object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,0.70)_0%,rgba(0,0,0,0.70)_100%)]" />
    </div>
  );
}
