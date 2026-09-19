/**
 * `Slider` — a number chosen along a track, as `MPSlider`.
 *
 * `showValue` is on, and that is not the protocol's decision to make: MD3 draws
 * the value in a label above the thumb while it is being dragged, and a slider
 * whose reading is never shown is a control the reader has to guess at. The
 * schema gives the agent no way to ask either way, so the catalog answers.
 *
 * A failing check goes to `description` rather than to an error line, because
 * `MPSlider` has none: a slider always holds a number in range, so the only thing
 * a check can say about it is that the number is not the one the agent wanted —
 * which is a note under the track, not a malformed value.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { SliderApi } from '@a2ui/web_core/v0_9';
import { MPSlider } from '../../components/slider/MPSlider';
import { weightStyle } from '../internal/common';

export const MPA2uiSlider = createComponentImplementation(SliderApi, ({ props }) => {
  const min = props.min ?? 0;

  return (
    <MPSlider
      value={typeof props.value === 'number' ? props.value : min}
      /* Single-thumb, so the array form never arrives — but the callback is
         shared with the range slider, and a cast here would be a lie. */
      onValueChange={(next) => props.setValue(Array.isArray(next) ? next[0] : next)}
      min={min}
      max={props.max}
      label={props.label}
      description={props.validationErrors?.[0]}
      showValue
      style={weightStyle(props.weight)}
    />
  );
});
