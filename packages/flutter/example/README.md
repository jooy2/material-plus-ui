# Example

A complete app, in the two lines that matter: import the library, use a component. There is no provider to install and no theme to fill in: a component follows the platform's brightness until an `MPTheme` overrides it.

```dart
import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return WidgetsApp(
      color: mpDefaultSourceColor,
      builder: (BuildContext context, Widget? child) {
        return Directionality(
          textDirection: TextDirection.ltr,
          child: MPTheme(
            sourceColor: const Color(0xFF7C3AED),
            child: Builder(
              builder: (BuildContext context) {
                return ColoredBox(
                  color: MPTheme.of(context).colors.surface,
                  child: Center(
                    child: MPButton(onPressed: () {}, child: const Text('Save')),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }
}
```

The same widgets work under a `MaterialApp` or a `CupertinoApp`; the package reads none of their theme and changes none of it.

## The gallery in this directory

`lib/` holds something larger than the snippet above: every demo the documentation site shows, in one app. It has two modes, and they are the same code seen from two sides.

```bash
flutter run
```

runs it as a gallery, every demo stacked, with a theme switch. Built for the web it becomes the renderer behind the Flutter previews on [material-plus.cdget.com](https://material-plus.cdget.com), one demo per frame, which is what makes those previews a real Flutter build rather than a screenshot.
