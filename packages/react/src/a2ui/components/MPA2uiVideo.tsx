/**
 * `Video` — a player for a URL.
 *
 * The one component in the basic catalog this library has nothing of its own for,
 * so it is the browser's player with Material Plus's corner and surface on it.
 * Deliberately not a control of our own: a video player is a set of controls,
 * a timeline, a volume slider, captions, full screen and picture-in-picture, all
 * of which the browser already ships, in the reader's language, with the
 * keyboard shortcuts they already know.
 *
 * `controls` is not optional. A player an agent can place and a reader cannot
 * pause is not a player, and the protocol gives the agent no way to ask for one.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { VideoApi } from '@a2ui/web_core/v0_9';
import { asText, weightStyle } from '../internal/common';

export const MPA2uiVideo = createComponentImplementation(VideoApi, ({ props }) => (
  <video
    src={props.url}
    controls
    // `preload="metadata"` rather than the browser's default of the whole file:
    // a surface may hold several of these and none of them has been asked for
    // yet, so what is fetched up front is the duration and the poster frame.
    preload="metadata"
    aria-label={asText(props.accessibility?.label)}
    title={asText(props.accessibility?.description)}
    style={{
      display: 'block',
      width: '100%',
      height: 'auto',
      borderRadius: 'var(--mp-sys-shape-corner-medium, 12px)',
      ...weightStyle(props.weight)
    }}
  />
));
