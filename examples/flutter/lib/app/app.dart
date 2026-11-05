import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:material_plus_showcase/app/page.dart';
import 'package:material_plus_showcase/app/settings.dart';
import 'package:material_plus_showcase/app/shell.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// The app, without a `MaterialApp`: the library needs neither Material nor
/// Cupertino, so this shows what a consumer gets with `WidgetsApp` alone.
class ShowcaseApp extends StatefulWidget {
  /// Creates the app.
  const ShowcaseApp({super.key});

  @override
  State<ShowcaseApp> createState() => _ShowcaseAppState();
}

class _ShowcaseAppState extends State<ShowcaseApp> {
  final ShowcaseSettings _settings = ShowcaseSettings();

  @override
  void dispose() {
    _settings.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _settings,
      builder: (BuildContext context, Widget? _) {
        return WidgetsApp(
          debugShowCheckedModeBanner: false,
          title: 'Material Plus Showcase',
          color: _settings.sourceColor,
          pageRouteBuilder: <T>(RouteSettings settings, WidgetBuilder builder) {
            return ShowcaseRoute<T>(builder: builder, settings: settings);
          },
          home: const Shell(),
          builder: (BuildContext context, Widget? child) {
            final MediaQueryData media = MediaQuery.of(context);
            final Brightness brightness = _settings.brightness ?? media.platformBrightness;

            return SettingsScope(
              settings: _settings,
              child: MediaQuery(
                data: _settings.textScale == null
                    ? media
                    : media.copyWith(textScaler: TextScaler.linear(_settings.textScale!)),
                child: Directionality(
                  textDirection: _settings.direction,
                  child: MPTheme(
                    sourceColor: _settings.sourceColor,
                    brightness: brightness,
                    child: MPConfigProvider(
                      density: _settings.density,
                      locale: _settings.language,
                      child: _Ground(
                        // The system's bars read the theme here, not the device's.
                        child: AnnotatedRegion<SystemUiOverlayStyle>(
                          value: brightness == Brightness.dark
                              ? SystemUiOverlayStyle.light
                              : SystemUiOverlayStyle.dark,
                          child: MPSnackbarProvider(
                            position: MPSnackbarPosition.bottomCenter,
                            child: Overlay.wrap(child: MPConfirmProvider(child: child!)),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

/// The font and the colour of plain text and icons, which nothing else above a
/// screen sets: a `Text` with no colour is white on iOS and Android.
class _Ground extends StatelessWidget {
  const _Ground({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);

    return DefaultTextStyle(
      style: theme.typescale.bodyLarge
          .style(theme.colors.onSurface)
          .copyWith(fontFamily: 'Roboto', package: 'material_plus_ui_example'),
      child: IconTheme(
        data: IconThemeData(color: theme.colors.onSurfaceVariant, size: 24),
        child: child,
      ),
    );
  }
}
