/**
 * `Icon` — one of the protocol's fifty-nine named glyphs, or an SVG path the
 * agent drew itself, through `MPIcon`.
 *
 * The names are a closed list and are mapped in `internal/icons.ts`. A name that
 * is not on the list draws nothing rather than a placeholder glyph: the schema
 * rejects it before a renderer ever sees it, so anything arriving here is either
 * a name this catalog knows or a payload that got past validation, and neither
 * case is improved by inventing a picture for it.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { IconApi } from '@a2ui/web_core/v0_9';
import { MPIcon } from '../../components/icon/MPIcon';
import { A2UI_ICONS } from '../internal/icons';
import { asText, weightStyle } from '../internal/common';

export const MPA2uiIcon = createComponentImplementation(IconApi, ({ props }) => {
  const name = props.name;
  const shared = {
    style: weightStyle(props.weight),
    // An icon with no name of its own is decoration, and `MPIcon` hides it from
    // assistive technology unless `label` says otherwise.
    label: asText(props.accessibility?.label),
    title: asText(props.accessibility?.description)
  };

  /*
   * The agent's own artwork. `MPIcon` takes an element as readily as a component,
   * so a path arrives as the one element it describes — `currentColor`, so it
   * takes the colour of whatever it was placed in, exactly as a named glyph does.
   */
  if (name && typeof name === 'object' && 'svgPath' in name) {
    return (
      <MPIcon
        icon={
          <svg viewBox="0 0 24 24" width={24} height={24} fill="currentColor">
            <path d={String(name.svgPath)} />
          </svg>
        }
        {...shared}
      />
    );
  }

  const glyph = typeof name === 'string' ? A2UI_ICONS[name] : undefined;

  if (!glyph) {
    return null;
  }

  return <MPIcon icon={glyph} {...shared} />;
});
