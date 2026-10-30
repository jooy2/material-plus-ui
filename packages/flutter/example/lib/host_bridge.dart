/// The channel between an embedded preview and the documentation page around it.
///
/// Two messages, both trivial, and both only meaningful on the web:
///
/// - **up**, the rendered height, so the page can size the `<iframe>` to the
///   preview instead of guessing.
/// - **down**, the theme, when the reader flips one preview to the other mode.
///   Sent rather than re-navigated, because reloading the frame would rebuild a
///   whole Flutter engine to change two colours.
///
/// Behind a conditional import so the gallery still builds and runs as an app on
/// mobile and desktop, where there is no page to talk to.
library;

export 'package:material_plus_ui_example/host_bridge_stub.dart'
    if (dart.library.js_interop) 'package:material_plus_ui_example/host_bridge_web.dart';
