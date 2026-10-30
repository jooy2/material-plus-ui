import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

import 'package:material_plus_ui_example/canvas.dart';
import 'package:material_plus_ui_example/demos/registry.dart';
import 'package:material_plus_ui_example/host_bridge.dart';
import 'package:material_plus_ui_example/room.dart';

/// The Material Plus component gallery.
///
/// It has two jobs, and they are the same code seen from two sides:
///
/// - Run it (`flutter run`) and it is a gallery: every demo, stacked, with a
///   theme switch. This is how the components are looked at while they are
///   being built.
/// - Build it for the web and the documentation site embeds it, one demo per
///   `<iframe>`, named by `?demo=button/variants`. That is what makes the
///   Flutter previews on the site the *real* Flutter build rather than a
///   screenshot or a stand-in.
///
/// Nothing here imports Material or Cupertino, for the same reason the library
/// does not: a gallery that needed a `MaterialApp` around it would not be
/// showing what a consumer of this package actually gets.
void main() {
  // The demos that switch language need a table to switch to.
  registerMPMessages(mpLocales);
  runApp(const GalleryApp());
}

/// See `assets/fonts/README.md`.
const String _fontFamily = 'Roboto';

/// The app, in whichever of its two modes the URL asks for.
class GalleryApp extends StatefulWidget {
  /// Creates the gallery.
  const GalleryApp({super.key});

  @override
  State<GalleryApp> createState() => _GalleryAppState();
}

class _GalleryAppState extends State<GalleryApp> {
  static const HostBridge _host = HostBridge();

  late Brightness _brightness = _requestedBrightness;

  Brightness get _requestedBrightness {
    return _host.query['theme'] == 'dark' ? Brightness.dark : Brightness.light;
  }

  @override
  void initState() {
    super.initState();

    // The page flips a preview's theme without reloading it: rebuilding a whole
    // Flutter engine to change the colours would be absurd.
    _host.onTheme((Brightness brightness) {
      if (mounted && brightness != _brightness) {
        setState(() => _brightness = brightness);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return WidgetsApp(
      debugShowCheckedModeBanner: false,
      title: 'Material Plus',
      color: mpDefaultSourceColor,
      builder: (BuildContext context, Widget? child) {
        return Directionality(
          textDirection: TextDirection.ltr,
          child: DefaultTextStyle.merge(
            style: const TextStyle(fontFamily: _fontFamily),
            child: MPTheme(
              brightness: _brightness,
              // Somewhere for a dialog or an overlay to go. A real app gets one
              // from its navigator; this gallery has no routes, so it says so
              // itself, sized to the demo, which is what an embedded preview
              // wants a full-screen sheet measured against.
              child: Overlay.wrap(
                child: _host.embedded
                    ? _localized(_Embedded(demo: _host.query['demo']!, align: _host.query['align']))
                    : _Gallery(
                        brightness: _brightness,
                        onFlip: () => setState(() {
                          _brightness = _brightness == Brightness.dark
                              ? Brightness.light
                              : Brightness.dark;
                        }),
                      ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// [child] in the language of the documentation page around the preview.
///
/// The page says which with `?locale=`, the way it says which theme. Without
/// it the gallery's locale is the `WidgetsApp` default, English, whatever
/// language the page is in.
Widget _localized(Widget child) {
  final String? locale = const HostBridge().query['locale'];

  if (locale == null || locale.isEmpty) {
    return child;
  }

  return MPLocaleProvider(locale: locale, child: child);
}

/// One demo, sized to its content and reported back to the page.
class _Embedded extends StatefulWidget {
  const _Embedded({required this.demo, required this.align});

  final String demo;
  final String? align;

  @override
  State<_Embedded> createState() => _EmbeddedState();
}

class _EmbeddedState extends State<_Embedded> {
  static const HostBridge _host = HostBridge();

  /// How tall a preview is while something has taken the whole app.
  ///
  /// A dialog, a drawer and an overlay cover the window they are in, and in a
  /// preview that window is the frame, so a sheet opened over a hundred pixels
  /// of frame is a sheet nobody can read. It is given a screen instead.
  static const double _screen = 360;

  final GlobalKey _content = GlobalKey();

  /// The frame this preview last asked the page for.
  PreviewRoom _room = PreviewRoom.none;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback(_measure);
  }

  /// Measures after every frame, and reports a frame that has changed.
  ///
  /// It arms itself for the next frame rather than being armed by `build`,
  /// which is the difference between measuring the demo and measuring what the
  /// demo has opened: a popup goes up on a `setState` below this widget, which
  /// never rebuilds it. A preview that is sitting still produces no frames, so
  /// re-arming costs nothing.
  void _measure(Duration _) {
    if (!mounted) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback(_measure);

    final PreviewRoom? room = measureRoom(
      context: context,
      content: _content,
      lead: _room.lead,
      padding: MPCanvas.padding,
      screen: _screen,
    );

    if (room == null || room.matches(_room)) {
      return;
    }

    setState(() => _room = room);
    _host.reportHeight(room.height);
  }

  @override
  Widget build(BuildContext context) {
    final WidgetBuilder? build = demos[widget.demo];

    return MPCanvas(
      align: widget.align == 'center' ? Alignment.topCenter : Alignment.topLeft,
      lead: _room.lead,
      child: KeyedSubtree(
        key: _content,
        child: build == null ? _Missing(demo: widget.demo) : build(context),
      ),
    );
  }
}

/// What a demo the Flutter package has not reached says for itself.
class _Missing extends StatelessWidget {
  const _Missing({required this.demo});

  final String demo;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return Text(
      'No Flutter version of “$demo” yet.',
      style: theme.typescale.bodyMedium.style(theme.colors.onSurfaceVariant),
    );
  }
}

/// Every demo, stacked: the mode `flutter run` gives you.
class _Gallery extends StatelessWidget {
  const _Gallery({required this.brightness, required this.onFlip});

  final Brightness brightness;
  final VoidCallback onFlip;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final EdgeInsets padding = MediaQuery.paddingOf(context);

    return MPCanvas(
      child: Padding(
        padding: EdgeInsets.only(top: padding.top, bottom: padding.bottom + 48),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: Text(
                      'Material Plus',
                      style: theme.typescale.headlineSmall.style(theme.colors.onSurface),
                    ),
                  ),
                  MPButton(
                    variant: MPVariant.tonal,
                    size: MPSize.sm,
                    onPressed: onFlip,
                    child: Text(brightness == Brightness.dark ? 'Light' : 'Dark'),
                  ),
                ],
              ),
            ),
            for (final MapEntry<String, WidgetBuilder> entry in demos.entries)
              Padding(
                padding: const EdgeInsets.only(bottom: 32),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        entry.key,
                        style: theme.typescale.labelMedium.style(theme.colors.onSurfaceVariant),
                      ),
                    ),
                    entry.value(context),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
