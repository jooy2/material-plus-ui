---
title: Sign-up page
order: 4
aside: false
---

# Sign-up page

<p class="mp-lede">Registration for Kestrel, in three steps. This is the library's fields with nothing else in the way — every kind of answer a form can ask for, and the states around them. <code>label</code>, <code>description</code> and <code>errorMessage</code> are the same three slots on nearly all of them.</p>

<Demo src="concepts/signup" :minHeight="660" />

The source is one file: `docs/.vitepress/demos/concepts/signup.tsx`. The flow works — fill the first step in and Continue turns on.

## Which field asks what

| Question | Component | Worth noticing |
| --- | --- | --- |
| Personal or team | `MPSegmentedButton` | One of a small, visible set — nothing to open |
| Name, email, password | `MPTextField` | `type="password"` and `autoComplete` pass straight through to the native control |
| Password strength | `MPProgressLinear` | `max={4}` with a colour per band, and it appears only once something has been typed |
| Date of birth | `MPDatePicker` | `maxDate={new Date()}` makes a future date unselectable rather than wrong afterwards |
| Country | `MPSelect` | A fixed list, so the value is chosen and never typed |
| Workspace URL | `MPTextField` | The slug is normalised as it is typed, and the caption under it shows what the URL will be |
| Seats | `MPNumberField` | Bounded by `min` and `max`, with the steppers the kind of answer implies |
| Disciplines | `MPCombobox` | `multiple`, and anything not on the list is offered as the last row rather than committed on blur |
| Plan | `MPRadioGroup` `MPRadio` | Two options with a `description` each, because the choice needs the detail beside it |
| Brand colour | `MPColorPicker` | A saturation square and a hue rail — every colour of a hue within one movement |
| Logo | `MPFilePicker` | `accept`, `maxSize` and `maxFiles` are enforced before anything is handed back |
| Email code | `MPOtpField` | `length={6}` with `groupSize={3}`; a paste fills every box at once |
| Terms, changelog | `MPCheckbox` `MPSwitch` | A checkbox is consent to submit with; a switch is a setting that takes effect as it is flipped |

## Notes

- Each step is gated on its own fields alone — Continue stays disabled until that step is valid, and the last one also needs the code and the terms.
- `MPTextField` is the one control with no `description`: its supporting line is either an error or nothing, so the hints under it are captions the form draws itself.
- The right-hand column is `MPCard`, `MPList`, `MPTimeline` and `MPBlockquote`: what the trial includes, what happens next, and one quote. It answers the question a form cannot, which is why anyone should fill it in.
- The two columns are one CSS grid with `minmax(min(100%, 260px), 1fr)`, so they become one column on a phone with nothing to configure.
