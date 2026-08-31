import * as React from 'react';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { MPConfigContext, useMPConfig, type MPConfigValue } from '../../internal/config';
import { MPLocaleContext, useMPLocale } from '../../internal/locale';
import type { MPColor, MPSize } from '../../types';

export interface MPConfigProviderProps {
  /**
   * The size every control under this starts at.
   *
   * `md` is Material's own and is what a component takes when nobody says
   * anything — see `MPSize`. A design that runs at `sm` sets it here once
   * instead of at the several hundred call sites that would otherwise each have
   * to repeat it, and each be a place it can be forgotten.
   */
  size?: MPSize;
  /**
   * The accent family every control under this reads.
   *
   * `primary` unless set. A product themed on `secondary` or `tertiary` is one
   * line here rather than a prop on every button, chip, tab and slider.
   */
  color?: MPColor;
  /**
   * The language the components speak — the same value `MPLocaleProvider` takes,
   * carried here so an application needs one provider rather than two.
   */
  locale?: string;
  /**
   * Which way the text runs, for everything under it.
   *
   * This is the one prop here that reaches **two** systems, because the
   * direction is answered in two places and they have to agree:
   *
   * - **The stylesheet** reads the DOM's own `dir`. Every padding, margin and
   *   corner in this library is already a logical property, so the CSS half of
   *   RTL has always worked from a `dir` attribute anywhere above a component.
   * - **Base UI** reads a React context, and there was nothing putting one
   *   there. Seven of its parts consult it — the slider, menu, select, combobox,
   *   navigation menu, OTP field and scroll area — and without it they were all
   *   being told the page ran left to right. The visible one was the slider,
   *   whose handle sat exactly one handle-width off the value it was reporting,
   *   at every value, and hung off the end of the track at the extremes.
   *
   * Given here, both are set: the attribute goes on a `display: contents`
   * element, which takes part in no layout at all, and the same value goes into
   * Base UI's own `DirectionProvider`. Left out, nothing is rendered and nothing
   * is claimed — a page that sets `dir` on `<html>` and never mounts this still
   * gets the CSS half and not the other one.
   */
  dir?: 'ltr' | 'rtl';
  children?: React.ReactNode;
}

/**
 * The prop defaults for everything under it.
 *
 * Wrap the application. Every component in this library still takes `size` and
 * `color` of its own, and this is where those props get their default — so a
 * design that runs at `size="sm"` is one decision rather than one per call site.
 *
 * ```tsx
 * <MPConfigProvider size="sm" color="tertiary" locale="ko">
 *   <App />
 * </MPConfigProvider>
 * ```
 *
 * ## Why it carries these two and not a theme
 *
 * Everything a theme normally holds is already a CSS custom property here — the
 * colour roles, the type scale, the corners, the motion durations. Those reach a
 * component through the cascade, which means a *section* of a page can differ
 * from the rest of it without a provider at all and without a re-render. A JS
 * theme object would be a second place the same values live.
 *
 * `size` is the one thing that cannot travel that way. It resolves to literal
 * Tailwind class strings — `h-14`, `text-mp-body-large` — because Tailwind finds
 * classes by scanning source text and an interpolated `h-${n}` generates no rule
 * at all. A value that cannot be a custom property and has to reach every call
 * site is exactly what context is for. `color` joins it because the two are the
 * axes a whole product is usually set on together.
 *
 * ## Why `variant` is not here
 *
 * Because there is no such thing as *the* default variant. `MPAccordion` starts
 * `outlined`, `MPAlert` `tonal`, `MPBadge` `filled`, `MPButton` `filled`,
 * `MPChip` `outlined` — five answers to five different questions about emphasis.
 * One global value would overwrite all five with an arbitrary one, and the
 * component that looked wrong afterwards would give no clue why.
 *
 * ## What it does not override
 *
 * A component that had chosen its own default keeps it. `MPBadge` is `error`
 * because a badge is usually a count of something that wants attention;
 * `MPTooltip` is `sm` because a tooltip at a control's height is a slab;
 * `MPDialog`, `MPPill` and `MPShortcut` are `secondary`. Those are answers
 * rather than unfilled defaults, so the configuration passes them by — set the
 * prop to move them.
 *
 * ## Nesting
 *
 * Providers nest and **merge**, nearest wins per field. A section that only
 * changes the accent keeps the size the provider above it set:
 *
 * ```tsx
 * <MPConfigProvider size="sm">
 *   <App />
 *   <MPConfigProvider color="error">
 *     <DangerZone /> // size="sm" still, color="error" now
 *   </MPConfigProvider>
 * </MPConfigProvider>
 * ```
 */
export function MPConfigProvider({ size, color, locale, dir, children }: MPConfigProviderProps) {
  const outer = useMPConfig();
  const outerLocale = useMPLocale();

  // Merged rather than replaced, so a nested provider that names one field does
  // not silently reset the others to the library's defaults — and memoised on
  // the four values rather than on the object, so a parent re-rendering with the
  // same configuration does not re-render every consumer below.
  const value = React.useMemo<MPConfigValue>(
    () => ({ size: size ?? outer.size, color: color ?? outer.color }),
    [size, color, outer.size, outer.color]
  );

  const resolvedLocale = locale ?? outerLocale;

  const content = (
    <MPConfigContext.Provider value={value}>
      <MPLocaleContext.Provider value={resolvedLocale}>{children}</MPLocaleContext.Provider>
    </MPConfigContext.Provider>
  );

  if (!dir) {
    return content;
  }

  // `display: contents` rather than a plain wrapper, so that one prop can set
  // both halves of the direction without the provider becoming a box. The
  // element takes part in no layout: its children are laid out as though it were
  // not there, which is what lets this go around a flex or grid child without
  // becoming one.
  return (
    <DirectionProvider direction={dir}>
      <div dir={dir} style={{ display: 'contents' }}>
        {content}
      </div>
    </DirectionProvider>
  );
}

/**
 * The configuration in force at this point in the tree.
 *
 * Exported for the reason `useMPLocale` is: an application that has told this
 * library its size and its accent should not have to tell itself the same thing
 * twice. A wrapper component of your own around one of these can resolve a prop
 * the way the component underneath will.
 *
 * The fields are optional, and `undefined` means "nobody set one" rather than
 * `md` or `primary` — the library's own defaults are applied by the components,
 * not stored here, so that a future change of default is one place.
 */
export { useMPConfig };
export type { MPConfigValue };
