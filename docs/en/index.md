---
layout: home

title: Material Plus
titleTemplate: Material Design 3 components for React
description: A React component library implementing Material Design 3 — the components other Material libraries do not ship, and wider versions of the ones they do. Themed with CSS custom properties. TypeScript types included, ESM only.

hero:
  name: Material Plus
  text: The Material components you keep writing yourself
  tagline: Material Design 3, followed from the specification. Themed in CSS custom properties, so it drops into a project that already has Material without a second design system to reconcile.
  image:
    src: /logo-large.png
    alt: Material Plus
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: All components
      link: /components/

features:
  - title: Themed in one line
    details: Set --mp-source-color and every colour role follows, exactly as Material generates a scheme from a source colour. No provider, no theme object, no re-render — and it can read the --md-sys-color-* tokens your page already has.
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

Every Material library leaves you writing the same four or five components in every project — the field that handles composition properly, the icon wrapper that agrees with your set, the form row that assembles a label, supporting text and two adornments the same way every time.

Material Plus is that pile, extracted and tested.

<div class="mp-why">
  <div class="mp-why-card">
    <h3>It coexists</h3>
    <p>Nothing here is page-level: no reset, no provider, no global styling. Theming is CSS custom properties in a cascade layer, so a project already running Material keeps its own setup and this one follows along.</p>
  </div>
  <div class="mp-why-card">
    <h3>Tested in real browsers</h3>
    <p>Every component carries its own tests, run in Chromium, Firefox and WebKit across three operating systems on every change. The composition tests drive real IME events.</p>
  </div>
  <div class="mp-why-card">
    <h3>Small on purpose</h3>
    <p>One runtime dependency, one peer. No CSS-in-JS runtime — the styling is a stylesheet. Every component compiles to its own module, so what you do not import is not shipped.</p>
  </div>
</div>

## Install

```bash
npm install material-plus-ui
```

`@base-ui/react`, `react` and `react-dom` are peer dependencies. One line of CSS wires up the stylesheet:

```css
@import 'material-plus-ui/styles.css';
```

```tsx
import { MPTextField } from 'material-plus-ui';

export default function SignIn() {
  const [email, setEmail] = useState('');

  return <MPTextField label="Email" type="email" value={email} onChange={setEmail} />;
}
```
