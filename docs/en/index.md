---
layout: home

title: Material Plus
titleTemplate: Material Design 3 components for React
description: A React component library implementing Material Design 3 — the components other Material libraries do not ship, and wider versions of the ones they do. Themed with CSS custom properties. TypeScript types included, ESM only.

hero:
  name: Material Plus
  text: A component library that follows the Material specification and extends it
  tagline: The latest Material Design specification as it stands, with a wider range of components on top of it and a design that goes further. Its options let you run the whole thing more compactly, or open it out for a wider screen.
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

## Features

<ul class="mp-feature-list">
  <li>Material Design 3 colour, type and shape tokens</li>
  <li>A colour scheme generated from one source colour</li>
  <li>Light and dark schemes</li>
  <li>Korean, Japanese and Chinese IME input</li>
  <li>Translations in 18 languages</li>
  <li>Right-to-left layout</li>
  <li>Responsive breakpoints and window size classes</li>
  <li>A size ladder from xs to xl</li>
  <li>Ten charts</li>
  <li>Date and time pickers</li>
  <li>Data table and tree view</li>
  <li>Command palette and keyboard shortcuts</li>
  <li>Seventeen motion components</li>
  <li>Layout primitives and page layouts</li>
  <li>Nine hooks</li>
  <li>TypeScript declarations included</li>
  <li>ESM only, tree-shakeable</li>
  <li>A stylesheet that splits per component</li>
  <li>Next.js server components</li>
  <li>A Tailwind CSS v4 token sheet</li>
  <li>Tested in Chromium, Firefox and WebKit</li>
</ul>

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

## Preview

Six of them. What is inside a card is not a picture — it is the component, running in this page.

<Demo src="home/preview" plain :minHeight="420" />

The rest are in [All components](/components/).
