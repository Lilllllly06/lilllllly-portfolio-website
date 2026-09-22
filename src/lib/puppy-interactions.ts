type Point = { x: number; y: number };
type Bounds = { left: number; right: number; top: number; bottom: number };

export const treatOfferDuration = 8000;

export function treatLanding(
  treat: Bounds,
  ground: number,
  viewport: { width: number; height: number },
) {
  const width = treat.right - treat.left;
  const inset = 8;
  const left = Math.max(
    inset,
    Math.min(treat.left, viewport.width - width - inset),
  );
  // Above the puppy, land at its feet. Below it, use the bottom of the screen.
  const floor = treat.bottom <= ground ? ground : viewport.height - inset;
  const distance = Math.max(0, floor - treat.bottom);
  return {
    x: left - treat.left,
    y: floor - treat.bottom,
    duration: Math.max(0.12, Math.min(0.8, Math.sqrt((2 * distance) / 1800))),
    bounce: Math.min(14, distance * 0.12),
  };
}

export function shouldOfferTreat(clickCount: number) {
  return clickCount === 1 || (clickCount > 0 && clickCount % 4 === 0);
}

export function isTreatOverDog(pagePoint: Point, dog: Bounds, scroll: Point) {
  // Framer Motion reports page coordinates; DOM rectangles use viewport coordinates.
  const x = pagePoint.x - scroll.x;
  const y = pagePoint.y - scroll.y;
  const padding = 18;
  return (
    x >= dog.left - padding &&
    x <= dog.right + padding &&
    y >= dog.top - padding &&
    y <= dog.bottom + padding
  );
}

export function puppyBounds(width: number) {
  const left = Math.min(74, Math.max(0, width - 44));
  return { left, right: Math.max(left, width - 138) };
}

export function nextPuppyDestination(
  current: number,
  width: number,
  random: number,
) {
  const { left, right } = puppyBounds(width);
  const inset = (right - left) * 0.2 * Math.max(0, Math.min(1, random));
  return current < (left + right) / 2 ? right - inset : left + inset;
}
