import Image from "next/image";

const HERO_IMAGES = ["/hero/2.png", "/hero/4.png"];

// Checkerboard order tuned for the desktop 4-col x 2-row layout so no image
// repeats in the same column across the two rows.
const CELL_ORDER = [0, 1, 0, 1, 1, 0, 1, 0];

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2">
        {CELL_ORDER.map((imageIndex, cellIndex) => (
          <div key={cellIndex} className="relative">
            <Image
              src={HERO_IMAGES[imageIndex]}
              alt=""
              fill
              className="object-cover"
              priority={cellIndex < 2}
              loading={cellIndex < 2 ? undefined : "lazy"}
              sizes="(min-width: 640px) 25vw, 50vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
