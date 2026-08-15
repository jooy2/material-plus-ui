---
title: MPFilePicker
order: 8
---

# MPFilePicker

<p class="mp-lede">A box you drop files on, or click to open the file dialog. Material has no component for this, so what it borrows is the part that is a surface — the corner size, the `outline-variant` edge, the state layers and the supporting text — and what it adds is the two things a hand-rolled dropzone gets wrong.</p>

<Demo src="file-picker/hero" :minHeight="200" />

```tsx
import { MPFilePicker } from 'material-plus-ui';

const [files, setFiles] = useState([]);

<MPFilePicker label="Attachments" multiple value={files} onFilesChange={setFiles} />;
```

## Props

<PropsTable name="MPFilePicker" />

## The two things this exists to fix

**`accept` is not enforced on a drop.** The browser applies the attribute to its own dialog and to nothing else, so a dropzone that only sets it accepts anything at all the moment a file arrives by drag. This one checks dropped files against the same three forms the attribute takes — `.ext`, `type/subtype` and `type/*`.

**`dragenter` and `dragleave` fire per child.** They both fire as the pointer crosses a _child_ of the zone, so a zone that toggles a boolean flickers the entire time a file is being dragged across its own contents. Counting the events is the only version that survives having anything inside the box — and there is always something inside the box, because the file list is in it.

## onReject

The prop worth wiring first.

<Demo src="file-picker/limits" :minHeight="280">

<<< @/.vitepress/demos/file-picker/limits.tsx

</Demo>

Without it a file that is turned away disappears in silence, which is the single worst thing a dropzone does: the reader watches their file vanish with no way to tell whether it was rejected or lost. Each rejection carries the `File` and one of three reasons — `'type'`, `'size'` or `'count'` — in the order they are checked.

`maxFiles` is counted against what is **already** held rather than against one drop. That is the difference between "you may drop five files" and "you may end up with five files", and only the second is what the prop means.

## formatFileSize

Exported alongside the component:

```tsx
import { formatFileSize } from 'material-plus-ui';

formatFileSize(1_400_000); // '1.4 MB'
```

Base 1000 and `MB` rather than base 1024 and `MiB` — it is the number every desktop file manager shows, and a picker that disagrees with the Finder about how big a file is has picked a fight it cannot win.

It is exported because a caller writing their own `hint` ("up to 5 MB") needs the same spelling the list underneath will use, and two spellings of one number inside one component is the version of this that looks like a bug.

## Examples

### title, hint and icon

The three things inside the box. `title` defaults to an English sentence and is meant to be replaced in a localised application; `hint` is the line under it — what is accepted, how big, how many. Pass `icon={null}` for a box with no picture in it.

### showList

The chosen files are listed under the box by default, each with a way to remove it. Turn it off when the files are shown somewhere else on the page — the picker still holds them either way.

### readOnly

Shows what was chosen without allowing it to be added to or removed from. The remove buttons go entirely rather than becoming disabled: nothing should offer an action that does nothing.

## Accessibility

- The pressable area is a real `<button>`, and the file list sits **outside** it — the remove buttons cannot be nested inside the browse button.
- The real `<input type="file">` is kept off-screen rather than hidden. `display: none` and `visibility: hidden` both make an input unfocusable, and this one still has to be reachable by a form and by a `required` validation message.
- That input is out of the tab order but **not** `aria-hidden`, and the two facts belong together: an empty `required` field is one the browser focuses to hang its validation bubble off, and focusing an element that has been taken out of the accessibility tree delivers that message to nobody. It carries the field's own name instead.
- The description or the error is wired to the button by `aria-describedby`.
- `removeLabel` receives the file's name, so each remove button is named for the file it removes rather than being one of five buttons all called "Remove".

## See also

- [Prop conventions](../../design/prop-conventions) — the shared vocabulary this follows.
