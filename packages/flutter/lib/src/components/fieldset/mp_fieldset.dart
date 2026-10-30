/// A group of controls that answer one question together.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A group of controls that answer one question together, with a name on it.
///
/// ```dart
/// MPFieldset(
///   legend: const Text('Billing address'),
///   description: const Text('Where the invoice goes.'),
///   children: <Widget>[streetField, cityField],
/// )
/// ```
///
/// ## Why it draws no surface
///
/// Because a group of fields is a **grouping** and not a sheet, and the sheet
/// already exists: put this inside an `MPCard` or an `MPBox` when one is
/// wanted. A fieldset that painted its own would be a second sheet inside the
/// first the moment anybody did.
///
/// What it owns instead is the legend, the gap the controls stand at, and
/// [disabled], which reaches every control inside, including one a widget three
/// levels down drew and never heard of: the group takes the pointer and the
/// focus away from everything in it, and every control of this package in it
/// draws itself disabled and says so to a screen reader, as it does with a
/// `disabled` of its own.
class MPFieldset extends StatelessWidget {
  /// Creates a group of [children].
  const MPFieldset({
    required this.children,
    this.legend,
    this.description,
    this.disabled = false,
    this.size,
    super.key,
  });

  /// The controls that answer the question together.
  final List<Widget> children;

  /// What the group is called, usually a [Text].
  ///
  /// It is read before every control in the group, so it has to be a phrase
  /// that still reads correctly in front of each of them: "Billing address",
  /// not "Where should we send it?".
  final Widget? legend;

  /// A line under the legend.
  final Widget? description;

  /// Disables every control inside at once, the way a `<fieldset>` always has.
  final bool disabled;

  /// The legend's type scale and the gap the controls stand at. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final MPSize size = this.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;
    final bool named = legend != null || description != null;

    Widget group = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: mpSheetGap[size]!,
      children: <Widget>[
        if (named)
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: mpStackGap[size]!,
            children: <Widget>[
              if (legend != null)
                DefaultTextStyle.merge(
                  style: mpSheetTitle(theme.typescale, size).style(colors.onSurface),
                  child: legend!,
                ),
              if (description != null)
                DefaultTextStyle.merge(
                  style: theme.typescale.bodySmall.style(colors.onSurfaceVariant),
                  child: description!,
                ),
            ],
          ),
        ...children,
      ],
    );

    // Counted in with a disabled fieldset further out, as the browser counts
    // a `<fieldset disabled>` inside another.
    final bool inherited = disabled || MPFieldsetScope.disabledOf(context);

    // In the tree whether the group is disabled or not, with only their flags
    // switching: wrapped round the group only while disabled, every field in
    // it would be built again from scratch each time `disabled` changed, and
    // lose what was typed into it. The group itself is not drained; each
    // control draws itself disabled from the scope, and a group drained on top
    // of that would drain every field twice.
    group = ExcludeFocus(
      excluding: disabled,
      child: IgnorePointer(
        ignoring: disabled,
        child: MPFieldsetScope(disabled: inherited, child: group),
      ),
    );

    // A group of its own, so the legend is read as the first thing in it
    // rather than merged into whatever is round the fieldset.
    return Semantics(container: true, explicitChildNodes: true, child: group);
  }
}
