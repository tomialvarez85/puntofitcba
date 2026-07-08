import Image from "next/image";

type HeroBackgroundProps = {
  images: string[];
};

const GRID_SIZE = 12;
const GRID_TEMPLATE =
  "grid-cols-2 grid-rows-6 sm:grid-cols-3 sm:grid-rows-4 md:grid-cols-4 md:grid-rows-3 lg:grid-cols-6 lg:grid-rows-2";

export default function HeroBackground({ images }: HeroBackgroundProps) {
  const cells =
    images.length > 0 ? Array.from({ length: GRID_SIZE }, (_, index) => images[index % images.length]) : [];

  if (cells.length === 0) {
    return <div className="absolute inset-0 bg-brand" />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-0 grid ${GRID_TEMPLATE}`}>
        {cells.map((url, index) => (
          <div key={`${url}-${index}`} className="relative">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(min-width: 1024px) 16.67vw, (min-width: 640px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/60" />
    </div>
  );
}
