import * as React from 'react';

/** Whether something is open, and the three ways to change that. */
export interface MPDisclosure {
  open: boolean;
  /** Opens it. Already open, nothing happens and nothing re-renders. */
  onOpen: () => void;
  /** Closes it. */
  onClose: () => void;
  /** The other one, whichever that is. */
  onToggle: () => void;
  /**
   * Sets it outright, which is what a controlled prop wants: pass this straight
   * to an `onOpenChange`.
   */
  setOpen: (open: boolean) => void;
}

/**
 * Open, and the three ways to change it.
 *
 * The most-written six lines in any application using this library. A dialog, a
 * drawer, a popover, a menu and a command palette are all controlled the same
 * way — `open` and `onOpenChange` — and every page that mounts one writes the
 * same `useState` and the same three callbacks, usually as inline arrows that
 * are a new function on every render.
 *
 * ```tsx
 * const dialog = useMPDisclosure();
 *
 * <MPButton onClick={dialog.onOpen}>Delete</MPButton>
 * <MPDialog open={dialog.open} onOpenChange={dialog.setOpen} title="Delete?">
 *   <MPButton onClick={dialog.onClose}>Cancel</MPButton>
 * </MPDialog>;
 * ```
 *
 * ## Why the library ships one at all
 *
 * Because the alternative is not "no hook", it is a hook per application, and
 * the two things this gets right are the two that get left out of one written in
 * a hurry.
 *
 * Every callback is stable for the life of the component. An inline
 * `onClick={() => setOpen(true)}` is a new function on every render, which
 * re-renders a memoised trigger for no reason and defeats the `React.memo` a
 * page put there on purpose.
 *
 * And `onOpen` on something already open is not a state change. React bails out
 * of a `useState` set to the value it already holds, so the three callbacks here
 * cost nothing when they are asked for what is already true — which matters
 * because a close handler is often wired to three things at once: a button, an
 * `onOpenChange`, and an Escape the component also handles.
 *
 * ## It is not a controlled/uncontrolled helper
 *
 * It holds state, so it makes a thing controlled. A component that should
 * manage its own open state takes `defaultOpen` and needs none of this.
 *
 * @param defaultOpen what it starts as. @default false
 */
export function useMPDisclosure(defaultOpen = false): MPDisclosure {
  const [open, setOpen] = React.useState(defaultOpen);

  const onOpen = React.useCallback(() => setOpen(true), []);
  const onClose = React.useCallback(() => setOpen(false), []);
  const onToggle = React.useCallback(() => setOpen((now) => !now), []);

  /*
   * Memoised on `open` alone: the four functions are already stable, so this
   * object changes exactly when the answer does. A caller spreading it into a
   * dependency array gets one that means what it says.
   */
  return React.useMemo(
    () => ({ open, onOpen, onClose, onToggle, setOpen }),
    [open, onOpen, onClose, onToggle]
  );
}
