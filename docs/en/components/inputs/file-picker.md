---
title: MPFilePicker
order: 8
---

# MPFilePicker

<p class="mp-lede">A box you drop files on, or click to open the file dialog. Material has no component for this, so what it borrows is the part that is a surface — the corner size, the `outline-variant` edge, the state layers and the supporting text — and what it adds is the two things a hand-rolled dropzone gets wrong.</p>

<Demo src="file-picker/hero" :minHeight="200" />

::: fw react

```tsx
import { MPFilePicker } from 'material-plus-ui';

const [files, setFiles] = useState([]);

<MPFilePicker label="Attachments" multiple value={files} onFilesChange={setFiles} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPFilePicker(
  label: const Text('Attachments'),
  multiple: true,
  value: files,
  onBrowse: () async => pickWithYourPlugin(),
  onFilesChanged: (List<MPFile> next) => setState(() => files = next),
);
```

**The picker does not open the platform's file dialog.** This package is built on Flutter's widgets layer alone and has no dependencies, and reaching the file system is a plugin's job in every Flutter app that does it. So `onBrowse` is where the app's own picking runs: call the plugin you chose, turn what it hands back into `MPFile`s, and return them. A drop the app detects with a plugin of its own goes in through `MPFilePickerState.add`. What the component owns is everything after that: the rules, the list, the removal, and the box itself. The previews on this page hand back invented files.

:::

## Props

<PropsTable name="MPFilePicker" />

::: fw flutter

### MPFile

<PropsTable name="MPFile" />

An `MPFile` is deliberately **not** a `dart:io` `File`, and not an abstraction over one. What the box draws is a name and a size, and what its rules read is a name, a size and a kind, so that is what it asks for; `source` carries the app's own object through untouched, so the caller gets it back on the other side. `matches(accept)` is the `accept` check, for a caller writing a list of their own.

:::

## The two things this exists to fix

::: fw react

**`accept` is not enforced on a drop.** The browser applies the attribute to its own dialog and to nothing else, so a dropzone that only sets it accepts anything at all the moment a file arrives by drag. This one checks dropped files against the same three forms the attribute takes — `.ext`, `type/subtype` and `type/*`.

**`dragenter` and `dragleave` fire per child.** They both fire as the pointer crosses a _child_ of the zone, so a zone that toggles a boolean flickers the entire time a file is being dragged across its own contents. Counting the events is the only version that survives having anything inside the box — and there is always something inside the box, because the file list is in it.

:::

::: fw flutter

**`accept` is checked against what arrived.** Whatever `onBrowse` hands back and whatever reaches `MPFilePickerState.add` is checked against the same three forms the HTML attribute takes — `.ext`, `type/subtype` and `type/*` — whether or not the plugin that found it was told the same thing. A rule the component states and does not enforce is not a rule.

**The drag state is the app's to detect.** Flutter has no file drag from the operating system without a plugin, so the picker cannot know a file is over it. An app with one passes `dragging: true` while it is, and the box lights the way it should: the look of the state is the component's, the detection the app's.

:::

## onReject

The prop worth wiring first.

<Demo src="file-picker/limits" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/file-picker/limits.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/file_picker/limits.dart

:::

</Demo>

::: fw react

Without it a file that is turned away disappears in silence, which is the single worst thing a dropzone does: the reader watches their file vanish with no way to tell whether it was rejected or lost. Each rejection carries the `File` and one of three reasons — `'type'`, `'size'` or `'count'` — in the order they are checked.

:::

::: fw flutter

Without it a file that is turned away disappears in silence, which is the single worst thing a dropzone does: the reader watches their file vanish with no way to tell whether it was rejected or lost. Each rejection carries the `MPFile` and one of three reasons — `MPFileRejectionReason.type`, `.size` or `.count` — in the order they are checked.

:::

`maxFiles` is counted against what is **already** held rather than against one drop. That is the difference between "you may drop five files" and "you may end up with five files", and only the second is what the prop means.

## formatFileSize

Exported alongside the component:

::: fw react

```tsx
import { formatFileSize } from 'material-plus-ui';

formatFileSize(1_400_000); // '1.4 MB'
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

formatFileSize(1400000); // '1.4 MB'
```

:::

Base 1000 and `MB` rather than base 1024 and `MiB` — it is the number every desktop file manager shows, and a picker that disagrees with the Finder about how big a file is has picked a fight it cannot win.

It is exported because a caller writing their own `hint` ("up to 5 MB") needs the same spelling the list underneath will use, and two spellings of one number inside one component is the version of this that looks like a bug.

## Examples

### title, hint and icon

The three things inside the box. `title` defaults to the sentence in `locale`; `hint` is the line under it — what is accepted, how big, how many.

::: fw react

Pass `icon={null}` for a box with no picture in it.

:::

::: fw flutter

Pass `showIcon: false` for a box with no picture in it.

:::

### showList

The chosen files are listed under the box by default, each with a way to remove it. Turn it off when the files are shown somewhere else on the page — the picker still holds them either way.

### readOnly

Shows what was chosen without allowing it to be added to or removed from. The remove buttons go entirely rather than becoming disabled: nothing should offer an action that does nothing.

## Accessibility

::: fw react

- The pressable area is a real `<button>`, and the file list sits **outside** it — the remove buttons cannot be nested inside the browse button.
- The real `<input type="file">` is kept off-screen rather than hidden. `display: none` and `visibility: hidden` both make an input unfocusable, and this one still has to be reachable by a form and by a `required` validation message.
- That input is out of the tab order but **not** `aria-hidden`, and the two facts belong together: an empty `required` field is one the browser focuses to hang its validation bubble off, and focusing an element that has been taken out of the accessibility tree delivers that message to nobody. It carries the field's own name instead.
- The description or the error is wired to the button by `aria-describedby`.

:::

::: fw flutter

- The box is one button node, named by the label and the sentence inside it, and pressed with Enter or Space. The file list sits **outside** it, so each remove button is a node of its own rather than one nested inside the box.
- The box says when it is required and when it is invalid. Inside an `MPForm`, `name` files the list with the rest, a required picker holding nothing holds the submit back and takes the focus, and an error the form hands back under that name shows under the box.
- The focus ring is drawn outside the box on keyboard focus, as on every control in the library.

:::

- `removeLabel` receives the file's name, so each remove button is named for the file it removes rather than being one of five buttons all called "Remove".

::: fw flutter

## Differences from the React build

Most of this page is the same in both packages. These are the places where it is not, and why.

| React | Flutter | Why |
| --- | --- | --- |
| The browser's file dialog | `onBrowse` | A widgets-only package with no dependencies cannot open one. The app runs its own plugin there and hands back `MPFile`s. |
| Drag and drop from the desktop | `MPFilePickerState.add`, `dragging` | Flutter has no file drag from the operating system without a plugin. The app detects the drop and the drag; the rules and the look are the component's. |
| `File` | `MPFile` | A name, a size and a media type, with the app's own object in `source`. |
| `onFilesChange` | `onFilesChanged` | Flutter's spelling of a change callback. `onReject` keeps its name. |
| `defaultValue` | `initialValue` | Flutter's name. Left out, `value` is `null` and the picker keeps its own list. |
| `icon={null}` | `showIcon: false` | `null` is what asks for the default picture in Dart. |
| `label`, `title`, `hint`, `icon` (`ReactNode`) | `Widget?` | Usually a `Text`. |
| `id`, `className`, `style` | — | There is nothing to pass them through to. |
| — | `locale`, `semanticLabel`, `focusNode`, `autofocus` | The language of the picker's own words, a name for the box, and its focus from outside. |

The rest is matched deliberately: the dashed edge, the state layer and the drop colour, the rules and the order they are checked in, the list and its arriving rows, and `formatFileSize`.

:::

## See also

- [Prop conventions](../../design/prop-conventions) — the shared vocabulary this follows.
