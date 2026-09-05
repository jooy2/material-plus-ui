---
title: MPTreeSelect
order: 17
---

# MPTreeSelect

<p class="mp-lede">A value chosen from a tree rather than from a list. The gap between a select and a tree view: a hierarchy that folds away behind a field.</p>

<Demo src="tree-select/hero" :minHeight="420" />

```tsx
import { MPTreeSelect } from 'material-plus-ui';

<MPTreeSelect
  label="Region"
  searchable
  items={[
    {
      value: 'asia',
      label: 'Asia',
      children: [{ value: 'seoul', label: 'Seoul' }]
    }
  ]}
/>;
```

## Props

<PropsTable name="MPTreeSelect" />

## Why not a select with indented options

Because indentation in a flat list is a picture of a hierarchy rather than the thing itself. Nothing folds, so a taxonomy of two hundred nodes arrives two hundred rows long; nothing says which rows belong to the one above them once you have scrolled past it; and there is no way to say that a row groups the rows under it without being one of them.

[MPSelect](select) is the right control for a list of answers. This is the one for answers that live somewhere.

## Branches are not answers

`selectableBranches` is off by default, because that is the shape most of these trees have: the branches are the taxonomy and the leaves are the answers. A "Europe" that can be chosen alongside "France" is usually a data model nobody meant — and the day it _is_ meant, turning one prop on says so.

An item's own `selectable` overrules the rule either way, which is how a tree with exactly one selectable branch states it.

A branch that cannot be chosen is **not a disabled row**. It looks like every other row, it takes focus, and it opens and shuts — a taxonomy whose branches do not open is a list with extra steps. What it does not do is answer: its press is intercepted before the tree sees it, so pressing "Europe" opens Europe and leaves the "France" you had chosen exactly where it was.

## A search keeps the ancestors

`searchable` puts a field above the tree. What it filters to is every match **and every ancestor of one** — filtered to bare matches, a tree is a list, and a list of leaves is exactly what a tree was chosen over. "Seoul" under nothing at all does not say which Seoul, or which taxonomy it came from.

Two rules follow from the same reasoning:

- **A node that matches keeps all of its children**, not only the ones that matched. Having found the branch the reader asked for, hiding what is inside it is the opposite of helpful.
- **Every branch the filter kept is opened.** A match folded inside a shut parent is a match the reader was not shown.

While a search is on, the tree's open branches are the search's answer rather than the reader's, so `onExpandedChange` is quiet. Clearing the field — or shutting the popup, which clears it — gives the reader's own back.

Matching is `toLocaleLowerCase` and nothing more, which is the fold [MPCombobox](combobox) already uses. `searchLabel` is what a node is matched against when its `label` is not a plain string.

The field's own word is [MPTransfer](transfer)'s "Search", which is the same field doing the same job — one more spelling of it would be one more thing to translate in eighteen locales, and one more chance for the two to disagree.

## What the trigger writes

The chosen labels, comma-joined. `format` replaces that with anything else, and a multi-select of a hundred nodes is the case it exists for — ``format={(chosen) => `${chosen.length} chosen`}`` says more in less room than the ninety-nine labels that would not have fitted.

## `name`

One `<input type="hidden">` per value, all under the same name, so a form reads a multi-select as a repeated field. That is the shape `FormData.getAll` expects and the one a select with `multiple` already submits.
