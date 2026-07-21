"use client";

import { useState } from "react";
import Image from "next/image";

export type GalleryImage = {
  id: string;
  url: string;
};

type ImageGalleryProps = {
  images: GalleryImage[];
  alt: string;
};

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-zinc-800 text-sm text-zinc-400">
        Sin imagen
      </div>
    );
  }

  const selectedImage = images[selectedIndex] ?? images[0];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-800">
        <Image src={selectedImage.url} alt={alt} fill priority className="object-cover" />
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === selectedIndex ? "border-brand-tint" : "border-transparent"
              }`}
            >
              <Image src={image.url} alt={`${alt} miniatura ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
