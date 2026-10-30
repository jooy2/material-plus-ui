---
title: MPPopconfirm
order: 13
---

# MPPopconfirm

<p class="mp-lede">A confirmation that stays where the control is.</p>

<Demo src="popconfirm/hero" :minHeight="220">

::: fw react

<<< @/.vitepress/demos/popconfirm/hero.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/popconfirm/hero.dart

:::

</Demo>

::: fw react

```tsx
import { MPPopconfirm } from 'material-plus-ui';

<MPPopconfirm
  trigger={<MPButton color="error">Delete</MPButton>}
  title="Delete this row?"
  confirmLabel="Delete"
  color="error"
  onConfirm={() => remove(id)}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPPopconfirm(
  trigger: (BuildContext context, VoidCallback toggle) =>
      MPButton(color: MPColor.error, onPressed: toggle, child: const Text('Delete')),
  title: const Text('Delete this row?'),
  confirmLabel: const Text('Delete'),
  color: MPColor.error,
  onConfirm: () => remove(id),
);
```

:::

## Props

<PropsTable name="MPPopconfirm" />

## When this rather than <Fw react="`useMPConfirm`" flutter="`MPConfirmProvider`" />

They ask the same question. The difference is **where the reader's eye is**, and that is a real difference rather than a stylistic one:

|  | `MPPopconfirm` | [<Fw react="`useMPConfirm`" flutter="`MPConfirmProvider`" />](../hooks/confirm.md) |
| --- | --- | --- |
| Appears | at the control | in the middle of the screen |
| The page behind | stays put | goes under a scrim |
| Costs | one element | a provider |
| Answers with | a callback | <Fw react="a promise" flutter="a `Future`" /> |

A **row of twelve delete buttons** is the case for this one. A modal that covered the table would take away the row the reader was pointing at, and having to re-find it afterwards is how the wrong row gets deleted.

A confirmation about the **page** — leaving with unsaved changes, an irreversible account action — wants the modal, because it is not about a thing on the page at all.

## Every other way out is _no_

Escape, a press outside and the cancel button all close it without confirming, and `onCancel` is called for all three. The same rule [<Fw react="`useMPConfirm`" flutter="`MPConfirmProvider`" />](../hooks/confirm.md) follows, for the same reason: the safe answer to "are you sure" is no.

::: fw flutter

The system back and Tab leaving the question count as no as well.

:::

Opening is **not** an answer, so neither handler fires for it.

## It is a popover, not a dialog

So it does not trap the focus, and the page behind it stays live. That is the point of the shape — and it also means a reader can walk away from the question with Tab, which a modal would not allow.

Where the answer genuinely has to be given, reach for the modal.

::: fw flutter

The focus moves into the question as it opens and lands on Cancel, the first button, so an Enter pressed out of habit answers no.

:::

## Sharp edges

::: fw react

- **The trigger must accept a ref and spread props.** Every Material Plus component does; a bare function component of your own may not.

:::

::: fw flutter

- **The trigger is a builder.** Wire the `toggle` it is handed to the control's `onPressed`; a trigger that ignores it never opens the question.

:::

- **`color` paints the yes button only**, and `'error'` is not the default — for the reason [<Fw react="`useMPConfirm`" flutter="`MPConfirmProvider`" />](../hooks/confirm.md#colour-is-a-decision-not-a-default) gives.
- **The labels are translated, the question is not.** _Confirm_ and _Cancel_ come from the language in force; `title` and `description` are your copy.

::: fw flutter

## Differences from the React build

| React | Flutter | Why |
| --- | --- | --- |
| `trigger: ReactElement` | `trigger: MPPopoverTriggerBuilder` | Base UI merges its handler onto the element. A widget cannot be reached into, so the builder is handed `toggle`. |
| `defaultOpen` | `initialOpen` | Flutter's name for where state a widget keeps for itself starts. |
| `children` | `child` | One widget, which can be a `Column` of more. |
| The buttons sit in a `flex` row | The buttons sit in a `Wrap` | Two labels translated into something longer than "Confirm" and "Cancel" stack instead of running off the sheet. |
| `className` | — | There is no class list to pass through. |

Everything [`MPPopover`](./popover#differences-from-the-react-build) does differently, this does too.

:::

## Next

- [<Fw react="useMPConfirm" flutter="MPConfirmProvider" />](../hooks/confirm.md) — the same question in the middle of the screen.
- [MPPopover](./popover.md) — the component underneath, for a popup that is not a question.
