import { useEffect, useState } from 'react';

const CAROUSEL_INTERVAL_MS = 4500;

export function useHeroCarousel(count: number) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Clamp index when count shrinks
  useEffect(() => {
    if (count > 0 && activeIndex >= count) {
      setActiveIndex(0);
    }
  }, [activeIndex, count]);

  // Auto-rotate
  useEffect(() => {
    if (count <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % count);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count]);

  return { activeIndex, goTo: setActiveIndex };
}
