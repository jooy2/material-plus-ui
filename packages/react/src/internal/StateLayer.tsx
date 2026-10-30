import * as React from 'react';

/**
 * Material's state layer.
 *
 * MD3 does not express hover, focus and press as three more colours. It puts a
 * translucent wash of the *content* colour over the container — 8% hovered, 10%
 * focused or pressed — so one rule covers a filled button, an outlined one and a
 * bare text one without any of them naming a second background.
 *
 * That is the whole reason this is an element rather than a `hover:bg-…` on the
 * control itself. A background can only be replaced, and replacing it is what
 * makes a text button's hover state opaque and an outlined button's hover state
 * cover its own border. A layer composites instead, so whatever was underneath —
 * a fill, a hairline, nothing at all — is still there under the wash.
 *
 * `bg-current` is what makes it one rule: the layer takes the colour of the
 * label it sits behind, which is already the right ink for the surface. A caller
 * that needs a different one sets `text-…` on the layer.
 *
 * ## How it is wired
 *
 * The control carries `group` and `relative`; this carries `group-hover:` and
 * friends. It cannot key off its own `:hover` because it covers the control and
 * has to be `pointer-events-none` for clicks to reach it — and an element that
 * takes no pointer events is never hovered.
 *
 * `rounded-[inherit]` rather than a radius of its own: the layer is the control's
 * shape, and a pill with a square wash in it is worse than no wash.
 *
 * ## `layer` replaces the appearance rather than adding to it
 *
 * The shape and the colour arrive as one string because a tick's layer is
 * neither. MD3 draws it as a 40dp circle *around* an 18dp box, in `on-surface`
 * rather than in the ink — which for a ticked checkbox is white, and a white
 * halo is not a state. Appending those classes to the defaults would leave two
 * `background-color` declarations of equal specificity fighting, and which one
 * wins is decided by their order in the generated stylesheet. So the caller
 * replaces the set rather than adding to it, and only the opacity ladder — the
 * part that is genuinely the same everywhere — is fixed here.
 */
export function MPStateLayer({
  layer = 'inset-0 rounded-[inherit] bg-current',
  className
}: {
  /** Shape, position and colour. Replaces the defaults; it does not extend them. */
  layer?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={[
        'pointer-events-none absolute opacity-0',
        layer,
        'transition-opacity duration-(--mp-sys-motion-duration-short4)',
        'group-hover:opacity-8',
        /*
         * `:active` and not `data-pressed`. Base UI spells the pressed state both
         * ways and they mean opposite things: on a Button `data-pressed` is the
         * moment of the press, on a Toggle it is the toggled-*on* state that
         * outlives it. Keying off it would leave every selected segment wearing a
         * permanent 10% wash. `:active` covers Space and Enter as well as the
         * pointer, so nothing is lost.
         */
        'group-active:opacity-10',
        // Keyboard focus only. A layer under every click-focused control would
        // leave the last button pressed looking permanently lit.
        'group-focus-visible:opacity-10',
        // A disabled control has its own treatment — content at 38%, a container
        // at 12% — and a wash on top of it would say something is available.
        'group-disabled:opacity-0 group-data-disabled:opacity-0',
        className ?? ''
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
