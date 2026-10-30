---
layout: home

title: Material Plus
titleTemplate: Material Design 3 components for React and Flutter
description: A component library for React and Flutter, written from the Material Design 3 specification and extended past it — the charts, data table and command palette Material never names. One source colour themes every colour role, and the same colour gives the same scheme in both packages.

hero:
  name: Material Plus
  text: A component library that follows the Material specification and extends it
  tagline: The latest Material Design specification as it stands, for React and for Flutter, with a wider range of components on top of it and a design that goes further. Its options let you run the whole thing more compactly, or open it out for a wider screen.
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
    details: Set a source colour and every colour role follows, exactly as Material generates a scheme from one. React reads it from --mp-source-color, with no provider and no re-render, and picks up the --md-sys-color-* tokens your page already has. Flutter reads it from MPTheme(sourceColor:).
    link: /components/
    linkText: Browse
  - title: IME-safe by construction
    details: A controlled input that survives Korean, Japanese and Chinese composition, in both packages. No dropped syllables, no jumping caret, whatever your change handler does with the value.
    link: /components/inputs/text-field
    linkText: MPTextField
  - title: Typed in both languages
    details: The React package ships its TypeScript declarations, and every Flutter parameter is a Dart type. Your editor knows the prop names and the values they take before you do.
  - title: Bring your own icons
    details: MPIcon takes a glyph from any icon set — a component or an element in React, an IconData or a widget in Flutter. The React package also comes with lucide-react, gathered in a single constants file you can read at a glance.
    link: /components/display/icon
    linkText: MPIcon
---

## Why Material Plus

Material Design 3 is a written specification, and a component library can start either from that document or from somebody else's reading of it. This one started from the document, which is why its colour roles, type scale and shape tokens carry the names the specification gives them.

Then there is where the specification stops and a screen does not. The button ladder is the plain example: `xs`, `sm` and `md` are the specification's 32, 40 and 56px, and `lg` and `xl` are this library's 64 and 72px — the next size the specification names is 96px, and a 96px button beside a 64px field is not a row. Charts, a data table and a command palette are the same thing one level up. The specification does not name them; applications have them anyway.

::: fw react

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
    <p>Two runtime dependencies, and the grammars behind the second are loaded on demand. No CSS-in-JS runtime — the styling is a stylesheet. Every component compiles to its own module, so what you do not import is not shipped.</p>
  </div>
</div>

:::

::: fw flutter

<div class="mp-why">
  <div class="mp-why-card">
    <h3>It coexists</h3>
    <p>The package is built on Flutter's widgets library alone and imports neither Material nor Cupertino. It sits inside a <code>MaterialApp</code>, a <code>CupertinoApp</code> or a bare <code>WidgetsApp</code> without bringing a second Material in behind it.</p>
  </div>
  <div class="mp-why-card">
    <h3>Tested on every change</h3>
    <p>Every component carries its own widget tests, run on Linux, Windows and macOS under Flutter 3.41 and the current stable release. The text field's tests drive an input method's composing range.</p>
  </div>
  <div class="mp-why-card">
    <h3>Nothing else to install</h3>
    <p>The package depends on Flutter and nothing else, and it ships no fonts or images. There is no stylesheet to wire up and no provider to wrap the app in.</p>
  </div>
</div>

:::

## Features

::: fw react

<ul class="mp-feature-list">
  <li>Material Design 3 colour, type and shape tokens</li>
  <li>A colour scheme generated from one source colour</li>
  <li>Light and dark schemes</li>
  <li>Korean, Japanese and Chinese IME input</li>
  <li>Translations in 18 languages</li>
  <li>Right-to-left layout</li>
  <li>Responsive breakpoints and window size classes</li>
  <li>A size ladder from xs to xl</li>
  <li>Nine charts</li>
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

:::

::: fw flutter

<ul class="mp-feature-list">
  <li>Material Design 3 colour, type and shape tokens</li>
  <li>A colour scheme generated from one source colour</li>
  <li>Light and dark schemes</li>
  <li>Korean, Japanese and Chinese IME input</li>
  <li>Translations in 18 languages</li>
  <li>Right-to-left layout</li>
  <li>Responsive breakpoints and window size classes</li>
  <li>A size ladder from xs to xl</li>
  <li>Nine charts</li>
  <li>Date and time pickers</li>
  <li>Data table and tree view</li>
  <li>Command palette and keyboard shortcuts</li>
  <li>Seventeen motion components</li>
  <li>Layout primitives and page layouts</li>
  <li>The same component names and numbers as the React package</li>
  <li>No dependencies beyond Flutter</li>
  <li>No Material or Cupertino import</li>
  <li>Every platform Flutter builds for</li>
  <li>Tested on Linux, Windows and macOS</li>
</ul>

:::

## Install

Two packages, one set of component names: `material-plus-ui` on npm for React, and `material_plus_ui` on pub.dev for Flutter. The switch at the top of the sidebar, on every page but this one, chooses which of the two the documentation shows.

::: fw react

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

:::

::: fw flutter

```bash
flutter pub add material_plus_ui
```

It needs Flutter 3.41 or newer. There is no stylesheet and no provider: import the library and use a widget.

```dart
import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

class SignIn extends StatefulWidget {
  const SignIn({super.key});

  @override
  State<SignIn> createState() => _SignInState();
}

class _SignInState extends State<SignIn> {
  String _email = '';

  @override
  Widget build(BuildContext context) {
    return MPTextField(
      label: const Text('Email'),
      type: MPTextFieldType.email,
      value: _email,
      onChanged: (String next) => setState(() => _email = next),
    );
  }
}
```

:::

## Preview

Six of them. What is inside a card is not a picture — it is the component, running in this page.

::: fw flutter

The preview is the React build. Six live Flutter previews would be six engines on one page, so each component's own page carries its Flutter preview instead.

:::

<Demo src="home/preview" plain :minHeight="420" />

The rest are in [All components](/components/).
