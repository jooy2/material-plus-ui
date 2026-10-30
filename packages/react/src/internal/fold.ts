/**
 * When a folding panel may stop clipping what is inside it.
 *
 * `MPAccordion` and `MPCollapsible` animate a panel's height, and both clip the
 * panel while it moves so the body is a window rather than a squashed copy of
 * itself. That clip is the animation's, not the panel's, and it has no business
 * surviving the animation: a settled panel that goes on clipping cuts the top
 * off the first thing in it that draws outside its own box. A text field's
 * floating label is exactly that — it sits *on* the field's top edge, which is
 * the panel's top edge — so a form in a fold arrived with its first label
 * sliced in half, and nothing in the console said so. A select's popup, a
 * tooltip and a focus ring are the same bug with different pixels.
 *
 * It cannot be a `data-open:` variant on its own: `data-open` is set for the
 * whole of the opening animation, which is the part that has to clip. The state
 * this needs is "open **and** no longer moving", and nothing in the DOM says
 * that, so `useSettledPanel` works it out from the transition itself.
 *
 * Its own file because the two components share it, and two copies of one rule
 * are two copies that will eventually disagree. It was the accordion's alone
 * until the collapsible turned out to clip the same label.
 */
import * as React from 'react';

/** Added to a panel once it has finished opening. */
export const PANEL_SETTLED = 'data-open:overflow-visible';

/**
 * Whether a height transition is actually going to run on this panel.
 *
 * `data-starting-style` says the panel is about to grow from nothing, and a
 * duration says the growing will be animated. A panel that started open has
 * neither, and a reader who asked for reduced motion has only the first — in
 * both cases no `transitionend` is coming, so a panel that waited for one would
 * stay clipped for good.
 */
function willMove(panel: HTMLElement): boolean {
  return (
    panel.hasAttribute('data-starting-style') &&
    parseFloat(getComputedStyle(panel).transitionDuration) > 0
  );
}

/**
 * Whether the panel has finished opening, and the two hooks into it that say so.
 *
 * - The height's `transitionend` decides it, either way. Base UI's
 *   `transitionStatus` cannot: it marks the first frame and the last, and what
 *   is needed here is the stretch between them.
 * - The callback ref covers the two panels that never transition at all — one
 *   that started open, and any panel under reduced motion — both of which would
 *   otherwise wait for an end that is not coming. It runs during the commit,
 *   before the browser paints, so a panel opening the ordinary way is clipped by
 *   the time there is anything to see.
 *
 * Closing needs nothing: `data-open` goes the moment a fold is asked to close,
 * which puts the clip back for the whole of the way down.
 */
export function useSettledPanel() {
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const [settled, setSettled] = React.useState(false);

  const attach = React.useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;

    if (node) {
      setSettled(node.hasAttribute('data-open') && !willMove(node));
    }
  }, []);

  const onTransitionEnd = React.useCallback((event: React.TransitionEvent<HTMLDivElement>) => {
    // The panel's own height and not a transition that bubbled up out of the
    // content: a button inside it changing colour would otherwise unclip a
    // panel that is still closing.
    if (event.target === panelRef.current && event.propertyName === 'height') {
      setSettled(panelRef.current.hasAttribute('data-open'));
    }
  }, []);

  return { attach, settled, onTransitionEnd };
}
