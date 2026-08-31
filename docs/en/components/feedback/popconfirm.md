---
title: MPPopconfirm
order: 13
---

# MPPopconfirm

<p class="mp-lede">A confirmation that stays where the control is.</p>

<Demo src="popconfirm/hero" :minHeight="220">

<<< @/.vitepress/demos/popconfirm/hero.tsx

</Demo>

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

## Props

<PropsTable name="MPPopconfirm" />

## When this rather than `useMPConfirm`

They ask the same question. The difference is **where the reader's eye is**, and that is a real difference rather than a stylistic one:

|                 | `MPPopconfirm` | [`useMPConfirm`](./confirm.md) |
| --------------- | -------------- | ------------------------------ |
| Appears         | at the control | in the middle of the screen    |
| The page behind | stays put      | goes under a scrim             |
| Costs           | one element    | a provider                     |
| Answers with    | a callback     | a promise                      |

A **row of twelve delete buttons** is the case for this one. A modal that covered the table would take away the row the reader was pointing at, and having to re-find it afterwards is how the wrong row gets deleted.

A confirmation about the **page** — leaving with unsaved changes, an irreversible account action — wants the modal, because it is not about a thing on the page at all.

## Every other way out is _no_

Escape, a press outside and the cancel button all close it without confirming, and `onCancel` is called for all three. The same rule [`useMPConfirm`](./confirm.md) follows, for the same reason: the safe answer to "are you sure" is no.

Opening is **not** an answer, so neither handler fires for it.

## It is a popover, not a dialog

So it does not trap the focus, and the page behind it stays live. That is the point of the shape — and it also means a reader can walk away from the question with Tab, which a modal would not allow.

Where the answer genuinely has to be given, reach for the modal.

## Sharp edges

- **The trigger must accept a ref and spread props.** Every Material Plus component does; a bare function component of your own may not.
- **`color` paints the yes button only**, and `'error'` is not the default — for the reason [`useMPConfirm`](./confirm.md#colour-is-a-decision-not-a-default) gives.
- **The labels are translated, the question is not.** _Confirm_ and _Cancel_ come from the language in force; `title` and `description` are your copy.

## Next

- [useMPConfirm](./confirm.md) — the same question in the middle of the screen.
- [MPPopover](./popover.md) — the component underneath, for a popup that is not a question.
