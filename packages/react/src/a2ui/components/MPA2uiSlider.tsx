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
 *
 * `steps` divides the range into that many equal steps, and the thumb stops only
 * on them. That is MD3's discrete slider, so the ticks are drawn as well. With no
 * `steps` the slider moves in ones, as an HTML range input and the protocol's
 * own renderer do.
 */
import { createComponentImplementation } from '@a2ui/react';
import { SliderApi } from '@a2ui/web_core/v1_0';
import { MPSlider } from '../../components/slider/MPSlider';
import { weightStyle } from '../internal/common';

export const MPA2uiSlider = createComponentImplementation(SliderApi, ({ props }) => {
  const min = props.min ?? 0;
  const { max, steps } = props;
  const discrete = typeof steps === 'number' && steps >= 1 && max > min;

  return (
    <MPSlider
      value={typeof props.value === 'number' ? props.value : min}
      /* Single-thumb, so the array form never arrives — but the callback is
         shared with the range slider, and a cast here would be a lie. */
      onValueChange={(next) => props.setValue(Array.isArray(next) ? next[0] : next)}
      min={min}
      max={max}
      step={discrete ? (max - min) / steps : undefined}
      marks={discrete}
      label={props.label}
      description={props.validationErrors?.[0]}
      showValue
      style={weightStyle(props.weight)}
    />
  );
});
