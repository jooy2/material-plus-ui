/**
 * `Modal` — a trigger and the content it opens, as `MPDialog`.
 *
 * ## Why the dialog is controlled rather than given the trigger
 *
 * `MPDialog` takes a `trigger` element and wires it itself, which is the better
 * arrangement and not one this component can use: the protocol hands over the
 * trigger as an *id*, and resolving an id returns a node — possibly a fragment,
 * possibly nothing at all, since the component it names may not have arrived yet.
 * `trigger` needs a single element to clone.
 *
 * So the dialog is opened from state, and the resolved trigger sits in a wrapper
 * that listens for the click. The wrapper is not the control: the child is, and
 * in practice it is the `Button` the schema tells the agent to send. A press of
 * that button — by mouse, by Enter or by Space — bubbles as a click and opens
 * the dialog, so the keyboard path is the child's own. The wrapper adds neither a
 * role nor a tab stop, which is deliberate: a focusable wrapper around a button
 * is two tab stops for one action.
 *
 * Everything past the open state is `MPDialog`'s: the scrim, the focus trap,
 * Escape, the restore of focus to whatever was focused before, and the close
 * button in the corner.
 */
import * as React from 'react';
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ModalApi } from '@a2ui/web_core/v0_9';
import { MPDialog } from '../../components/dialog/MPDialog';
import { asText, weightStyle } from '../internal/common';

export const MPA2uiModal = createComponentImplementation(ModalApi, ({ props, buildChild }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', ...weightStyle(props.weight) }}
      >
        {props.trigger ? buildChild(props.trigger) : null}
      </span>

      <MPDialog
        open={open}
        onOpenChange={setOpen}
        title={asText(props.accessibility?.label)}
        description={asText(props.accessibility?.description)}
      >
        {props.content ? buildChild(props.content) : null}
      </MPDialog>
    </>
  );
});
