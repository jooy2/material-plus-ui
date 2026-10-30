/// Reading a widget as the words it draws.
library;

import 'package:flutter/widgets.dart';

/// The words [widget] draws when it is a [Text], for a semantics node that
/// needs its name as a string.
///
/// `null` for any other widget and for a blank [Text]: only a caller's own
/// `semanticLabel` can name a field whose label is a row of widgets.
String? mpTextOf(Widget? widget) {
  if (widget is! Text) {
    return null;
  }

  final String? text = widget.data ?? widget.textSpan?.toPlainText();

  return text == null || text.trim().isEmpty ? null : text;
}

/// Everything [widget] says, walked into rather than built.
///
/// The counterpart of `textOf` in the React build's `internal/text.ts`, and
/// wider than [mpTextOf] on purpose. A [Text] is its words; a widget that
/// only holds others — a [Row], a [Padding], a [DefaultTextStyle] — is the
/// words of what it holds, joined with nothing between them; anything else
/// adds nothing. What a [StatelessWidget] or a [StatefulWidget] draws is only
/// decided when it builds and cannot be read here, so a flag or a `MPIcon`
/// among the children adds nothing, which is exactly right: a picture of a
/// thing is not its name.
///
/// An empty string when there are no words, as `textOf` answers.
String mpTextWithin(Widget? widget) {
  if (widget is Text) {
    return widget.data ?? widget.textSpan?.toPlainText(includePlaceholders: false) ?? '';
  }

  // Before the general case below: a `RichText` holds its `WidgetSpan`s as
  // children, and those are pictures inside the text rather than more of it.
  if (widget is RichText) {
    return widget.text.toPlainText(includePlaceholders: false);
  }

  if (widget is MultiChildRenderObjectWidget) {
    return widget.children.map(mpTextWithin).join();
  }

  if (widget is SingleChildRenderObjectWidget) {
    return mpTextWithin(widget.child);
  }

  if (widget is ProxyWidget) {
    return mpTextWithin(widget.child);
  }

  return '';
}
