# Roboto

Two weights of [Roboto](https://github.com/googlefonts/roboto), Regular (400) and Medium (500), copied from the copy the Flutter SDK keeps in `bin/cache/artifacts/material_fonts`.

**They are here because MD3's type scale uses exactly these two weights.** Every `label` and `title` role is set at 500, and Flutter's engine carries one face and synthesises the rest by widening its strokes, so a gallery with no font of its own would draw every button label in a faux Medium. On the web the engine would otherwise fetch Roboto from Google's font servers at run time, which an embedded preview on the documentation site should not do.

The library itself sets no family and never should: a component inherits whatever the app's `DefaultTextStyle` carries. This is the gallery supplying one, the way an app does.

Licensed under the Apache License 2.0, in `LICENSE.txt`, which has to travel with the files.
