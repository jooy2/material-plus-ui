/**
 * `AudioPlayer` — a player for a URL, with the description above it.
 *
 * The browser's player, for the reasons `MPA2uiVideo` gives. The description is
 * a title or a summary rather than an accessible name, so it is drawn where the
 * reader can see it — as a caption, in the type scale — instead of being hidden
 * in an attribute.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { AudioPlayerApi } from '@a2ui/web_core/v0_9';
import { MPFlex } from '../../components/flex/MPFlex';
import { MPTypography } from '../../components/typography/MPTypography';
import { asText, weightStyle } from '../internal/common';

export const MPA2uiAudioPlayer = createComponentImplementation(AudioPlayerApi, ({ props }) => (
  <MPFlex direction="column" gap={4} style={weightStyle(props.weight)}>
    {props.description ? <MPTypography level="caption">{props.description}</MPTypography> : null}

    <audio
      src={props.url}
      controls
      preload="metadata"
      aria-label={asText(props.accessibility?.label) ?? props.description}
      style={{ width: '100%' }}
    />
  </MPFlex>
));
