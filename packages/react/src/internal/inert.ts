/**
 * `inert`, spelled the way the running React understands it.
 *
 * Two components cover content that has to stop being reachable while it is
 * covered — [MPSpoiler](../components/spoiler/MPSpoiler.tsx) and
 * [MPPill](../components/pill/MPPill.tsx) — and both of them promise something
 * `aria-hidden` cannot: a subtree that is not tabbable, not readable by a
 * screen reader, and not selectable by a drag across the page. A spoiler that
 * can be defeated by Ctrl-A is not a spoiler.
 *
 * The catch is that there is no single JSX spelling that delivers it. React 19
 * added `inert` to the attributes it knows, as a **boolean**:
 *
 * - React 19 — `inert={true}` renders the attribute; `inert=""` is read as an
 *   empty string for a boolean attribute, so it is treated as *false*, dropped,
 *   and warned about.
 * - React 18 — `inert` is an unknown attribute, so `inert={true}` is dropped
 *   and warned about, and `inert=""` is what renders it.
 *
 * The two are exactly inverted, which is why this is a version test rather than
 * one clever value. `peerDependencies` allows React 18, so without this the
 * protection silently evaporated for half the supported range — the attribute
 * was simply absent, and nothing said so except a console warning nobody reads
 * in production.
 *
 * ## Why not a ref
 *
 * `element.inert = true` is the IDL property and works in both, but it can only
 * run after the element exists. Server-rendered markup would arrive without it
 * and the content would be reachable until hydration — which for a spoiler is
 * the one moment it must not be.
 */
import * as React from 'react';

/**
 * Whether this React writes `inert` as a boolean.
 *
 * Parsed rather than compared, because the string carries pre-release suffixes:
 * `19.0.0-rc-1` is a 19. A build whose major does not parse — the
 * `0.0.0-experimental-…` canaries — is ahead of 19 rather than behind it, so it
 * takes the modern spelling.
 */
const major = Number.parseInt(React.version, 10);
const modern = !Number.isFinite(major) || major === 0 || major >= 19;

/**
 * The props to spread, as two frozen objects rather than one built per call: a
 * fresh object on every render of every covered panel is a fresh object for
 * React to diff, for no gain.
 */
const ON = Object.freeze({ inert: (modern ? true : '') as unknown as boolean });
const OFF = Object.freeze({});

/**
 * `{ inert }` when the subtree should be unreachable, and nothing at all when it
 * should not.
 *
 * Nothing rather than `inert={false}`, because React 18 warns about a `false`
 * on an attribute it does not know — and an attribute that is absent is already
 * the whole of what "not inert" means.
 */
export function inertProps(inert: boolean): { inert?: boolean } {
  return inert ? ON : OFF;
}
