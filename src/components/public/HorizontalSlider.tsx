"use client";

import { useRef, useState, type ReactNode } from "react";

type HorizontalSliderProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  gridClassName: string;
  cardWidthClassName?: string;
};

export default function HorizontalSlider<T>({
  items,
  getKey,
  renderItem,
  gridClassName,
  cardWidthClassName = "w-[80%]",
}: HorizontalSliderProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return null;
  }

  const handleScroll = () => {
    const container = scrollRef.current;

    if (!container || items.length === 0) {
      return;
    }

    const cardWidth = container.scrollWidth / items.length;
    const index = Math.round(container.scrollLeft / cardWidth);
    setActiveIndex(Math.min(items.length - 1, Math.max(0, index)));
  };

  return (
    <>
      {/* Mobile: carrusel horizontal con scroll-snap nativo */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 md:hidden"
      >
        {items.map((item) => (
          <div key={getKey(item)} className={`${cardWidthClassName} flex-shrink-0 snap-start`}>
            {renderItem(item)}
          </div>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="mt-3 flex justify-center gap-1.5 md:hidden">
          {items.map((item, index) => (
            <span
              key={getKey(item)}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-4 bg-brand" : "w-1.5 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      ) : null}

      {/* Desktop/tablet: grid */}
      <div className="mx-auto hidden max-w-6xl px-4 sm:px-6 md:block">
        <div className={`grid gap-6 ${gridClassName}`}>
          {items.map((item) => (
            <div key={getKey(item)}>{renderItem(item)}</div>
          ))}
        </div>
      </div>
    </>
  );
}
