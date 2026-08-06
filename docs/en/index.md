---
layout: home

title: Material Plus
titleTemplate: Extra components for Material UI
description: A React component library that extends Material UI — the components MUI does not ship, and wider versions of the ones it does. TypeScript types included, ESM only.

hero:
  name: Material Plus
  text: The Material UI components you keep writing yourself
  tagline: Built on @mui/material rather than beside it. Same theme, same prop vocabulary, no second design system to reconcile.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: All components
      link: /components/

features:
  - title: Not a replacement
    details: Every component is built out of @mui/material. Your ThemeProvider, your palette, your typography — a Material Plus control reads all of it and lines up with the MUI control next to it.
    link: /components/
    linkText: Browse
  - title: IME-safe by construction
    details: A controlled input that survives Korean, Japanese and Chinese composition. No dropped syllables, no jumping caret, whatever your onChange does with the value.
    link: /components/inputs/text-field
    linkText: MPTextField
  - title: TypeScript first
    details: Declarations ship with the package. Your editor knows the prop names and the values they take before you do.
  - title: Bring your own icons
    details: MPIcon takes a component or an element from any icon set. lucide-react comes in the box, gathered in a single constants file you can read at a glance.
    link: /components/display/icon
    linkText: MPIcon
---

## Why Material Plus

Material UI is a large library, and it still leaves you writing the same four or five components in every project — the field that handles composition properly, the icon wrapper that agrees with your set, the form row that assembles a label, a helper and two adornments the same way every time.

Material Plus is that pile, extracted and tested.

<div class="mp-why">
  <div class="mp-why-card">
    <h3>MUI is a peer, not a copy</h3>
    <p><code>@mui/material</code> and Emotion are peer dependencies. Material Plus uses the copy your project already has, so there is never a second MUI in the bundle or a second theme in the tree.</p>
  </div>
  <div class="mp-why-card">
    <h3>Tested in real browsers</h3>
    <p>Every component carries its own tests, run in Chromium, Firefox and WebKit across three operating systems on every change. The composition tests drive real IME events.</p>
  </div>
  <div class="mp-why-card">
    <h3>Small on purpose</h3>
    <p>One runtime dependency. Every component compiles to its own module, so what you do not import is not shipped.</p>
  </div>
</div>

## Install

```bash
npm install material-plus
```

`@mui/material`, `@emotion/react`, `@emotion/styled`, `react` and `react-dom` are peer dependencies — you already have all five.

```tsx
import { MPTextField } from 'material-plus';

export default function SignIn() {
  const [email, setEmail] = useState('');

  return <MPTextField label="Email" type="email" value={email} onChange={setEmail} />;
}
```
