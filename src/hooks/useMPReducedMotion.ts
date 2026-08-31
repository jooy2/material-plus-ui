import { usePrefersReducedMotion } from '../internal/animate';

/**
 * Whether the reader has asked for less motion.
 *
 * `prefers-reduced-motion: reduce`, which every `MPAnimate*` component in this
 * library already consults on its own — a fade becomes an appearance, a
 * typewriter prints its sentence, a marquee stops. This is the same answer,
 * exported so an application's own motion can be held to the preference the
 * library is already holding itself to, rather than each of them asking
 * separately and one of them forgetting.
 *
 * ```tsx
 * const still = useMPReducedMotion();
 *
 * <video autoPlay={!still} />;
 * ```
 *
 * ## Why not `usePrefersReducedMotion`
 *
 * Which is what it is called internally, and what the ecosystem calls it. The
 * `MP` prefix is on every name this package exports for the reason the icons
 * carry it: a file importing from four libraries should be able to tell which
 * one a name came from without going back to the import block.
 *
 * ## On a server
 *
 * `false` — motion allowed. A preference is a property of a reader and a server
 * has none, and the alternative would be a first paint that suppressed animation
 * for everybody and then started it a moment later for most of them, which is a
 * flash rather than a preference. `useSyncExternalStore` under this hands over
 * to the browser's real answer on hydration.
 */
export function useMPReducedMotion(): boolean {
  return usePrefersReducedMotion();
}
