/// Two lists, and the arrows that move rows between them.
library;

import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/box/mp_box.dart';
import 'package:material_plus_ui/src/components/checkbox/mp_checkbox.dart';
import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/components/icon_button/mp_icon_button.dart';
import 'package:material_plus_ui/src/components/text_field/mp_text_field.dart';
import 'package:material_plus_ui/src/internal/fieldset.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/search.dart';
import 'package:material_plus_ui/src/internal/select_list.dart';
import 'package:material_plus_ui/src/internal/text.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/types.dart';

/// A panel's inline inset, the sheet's: `px-2.5` to `px-6`.
const Map<MPSize, double> _insetX = <MPSize, double>{
  MPSize.xs: 10,
  MPSize.sm: 12,
  MPSize.md: 16,
  MPSize.lg: 20,
  MPSize.xl: 24,
};

/// The block padding of a panel's strips: `py-1` to `py-3`.
const Map<MPSize, double> _stripPadY = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 6,
  MPSize.md: 8,
  MPSize.lg: 10,
  MPSize.xl: 12,
};

/// The block padding round each row: `py-0.5` to `py-2`.
const Map<MPSize, double> _rowPadY = <MPSize, double>{
  MPSize.xs: 2,
  MPSize.sm: 4,
  MPSize.md: 4,
  MPSize.lg: 6,
  MPSize.xl: 8,
};

/// Between the panels and the arrows: `gap-3`.
const double _gap = 12;

/// One row a transfer can move.
@immutable
class MPTransferItem {
  /// Creates a row worth [value].
  const MPTransferItem({required this.value, required this.label, this.disabled = false});

  /// Identifies the row. What `value` holds when the row is on the chosen
  /// side.
  final String value;

  /// What the row says, usually a [Text]. Its words are what a search
  /// matches; a label with none is never filtered out.
  final Widget label;

  /// Stays on whichever side it is on: it can be neither ticked nor moved.
  final bool disabled;
}

/// Two lists, and the arrows that move rows between them.
///
/// ```dart
/// MPTransfer(
///   items: columns,
///   value: chosen,
///   onChanged: (List<String> next) => setState(() => chosen = next),
///   sourceLabel: const Text('All columns'),
///   targetLabel: const Text('In the report'),
/// )
/// ```
///
/// **Ticking is not choosing.** [value] is which side a row is on; a tick is
/// a mark saying it should move the next time an arrow is pressed. So
/// [onChanged] fires on the arrow and never on a tick, and what a caller
/// stores is the answer rather than the working. The chosen values come back
/// in the order [items] gives them, so a row brought back lands where it
/// started.
///
/// Each panel is an `MPBox` with a heading strip whose checkbox ticks the
/// whole column, an optional filter, and a column of `MPCheckbox` rows. In a
/// compact window the two panels stack with the arrows between them; from the
/// medium window up they stand side by side.
class MPTransfer extends StatefulWidget {
  /// Creates a transfer over [items].
  const MPTransfer({
    required this.items,
    this.value,
    this.initialValue = const <String>[],
    this.onChanged,
    this.sourceLabel,
    this.targetLabel,
    this.searchable = false,
    this.height = 220,
    this.disabled = false,
    this.variant = MPVariant.outlined,
    this.size,
    this.color,
    this.locale,
    this.labels,
    super.key,
  });

  /// Every row, in the order both lists draw them.
  final List<MPTransferItem> items;

  /// The values on the chosen side. Given, the transfer is controlled; left
  /// out, it keeps its own, starting at [initialValue].
  final List<String>? value;

  /// The values a transfer that keeps its own starts with. The React build's
  /// `defaultValue`.
  final List<String> initialValue;

  /// Called on an arrow press with the values now on the chosen side, in the
  /// order [items] gives them. The React build's `onValueChange`.
  final ValueChanged<List<String>>? onChanged;

  /// The heading over the list of what is not chosen. Defaults to the word
  /// for "available" in [locale].
  final Widget? sourceLabel;

  /// The heading over the list of what is chosen. Defaults to the word for
  /// "selected" in [locale].
  final Widget? targetLabel;

  /// Puts a filter above each list. Each narrows its own side, and an arrow
  /// moves only what its filter is still showing.
  final bool searchable;

  /// How tall each list is, in logical pixels. Both lists are the same
  /// height, so a row moving across does not move the arrows.
  final double height;

  /// Stops everything at once: the ticks, the filters and the arrows.
  final bool disabled;

  /// How the panels are drawn. [MPVariant.outlined] by default; the arrows
  /// are outlined too, or bare with [MPVariant.text].
  final MPVariant variant;

  /// Which rung: the panels' padding, the rows, the arrows. [MPSize.md]
  /// unless an [MPConfigProvider] says otherwise.
  final MPSize? size;

  /// Which accent family the ticks and the arrows read.
  final MPColor? color;

  /// Which language the transfer's own words are in. Falls back to the
  /// nearest `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// Overrides for those words, by key: `source`, `target`, `toTarget`,
  /// `toSource`, `search`, `empty`, `moved`. They win over the translation.
  final Map<String, String>? labels;

  @override
  State<MPTransfer> createState() => _MPTransferState();
}

class _MPTransferState extends State<MPTransfer> {
  late List<String> _own = List<String>.of(widget.initialValue);
  Set<String> _ticked = <String>{};

  /// The rows the last arrow moved, which settle into the list they landed
  /// in, and which list that was.
  Set<String> _arrived = const <String>{};
  bool _arrivedInTarget = true;

  String _sourceSearch = '';
  String _targetSearch = '';

  /// What the last press moved, said to a screen reader, and how many presses
  /// there have been, so the same sentence twice is still heard twice.
  String? _announced;
  int _presses = 0;

  List<String> get _selected => widget.value ?? _own;

  MPSize get _size => widget.size ?? MPConfigProvider.maybeOf(context)?.size ?? MPSize.md;

  MPColor get _color => widget.color ?? MPConfigProvider.maybeOf(context)?.color ?? MPColor.primary;

  bool get _disabled => widget.disabled || MPFieldsetScope.disabledOf(context);

  @override
  void didUpdateWidget(MPTransfer oldWidget) {
    super.didUpdateWidget(oldWidget);

    // A tick on a row that has left the list is a tick nothing can show or
    // move; one that came back with a new list of rows would be a surprise.
    final Set<String> live = <String>{for (final MPTransferItem item in widget.items) item.value};

    if (!_ticked.every(live.contains)) {
      _ticked = _ticked.where(live.contains).toSet();
    }
  }

  void _tick(String value, bool on) {
    setState(() {
      _ticked = <String>{..._ticked};
      on ? _ticked.add(value) : _ticked.remove(value);
    });
  }

  void _tickAll(List<MPTransferItem> rows, bool on) {
    setState(() {
      _ticked = <String>{..._ticked};

      for (final MPTransferItem row in rows) {
        if (row.disabled) {
          continue;
        }

        on ? _ticked.add(row.value) : _ticked.remove(row.value);
      }
    });
  }

  void _move(List<MPTransferItem> moving, {required bool toTarget, required String list}) {
    final List<MPTransferItem> moved = <MPTransferItem>[
      for (final MPTransferItem item in moving)
        if (!item.disabled && _ticked.contains(item.value)) item,
    ];

    if (moved.isEmpty) {
      return;
    }

    final Set<String> ids = <String>{for (final MPTransferItem item in moved) item.value};
    final Set<String> chosen = _selected.toSet();
    final List<String> next = toTarget
        ? <String>[
            for (final MPTransferItem item in widget.items)
              if (chosen.contains(item.value) || ids.contains(item.value)) item.value,
          ]
        : <String>[
            for (final String value in _selected)
              if (!ids.contains(value)) value,
          ];
    final Map<String, String> words = _words();
    final String sentence = mpFillMessage(words['moved']!, <String, String>{
      'count': '${moved.length}',
      'list': list,
    });

    setState(() {
      _ticked = _ticked.where((String value) => !ids.contains(value)).toSet();
      _arrived = ids;
      _arrivedInTarget = toTarget;
      _announced = sentence;
      _presses += 1;

      if (widget.value == null) {
        _own = next;
      }
    });

    if (MediaQuery.maybeSupportsAnnounceOf(context) ?? false) {
      SemanticsService.sendAnnouncement(View.of(context), sentence, Directionality.of(context));
    }

    widget.onChanged?.call(next);
  }

  Map<String, String> _words() {
    return mpMessagesOf(
      context,
      mpTransferMessages,
      locale: widget.locale,
      overrides: widget.labels,
    );
  }

  /// The rows a filter leaves. A row whose label has no words to match is
  /// never filtered out.
  List<MPTransferItem> _filter(List<MPTransferItem> rows, String query) {
    final String needle = searchText(query);

    if (needle.isEmpty) {
      return rows;
    }

    return <MPTransferItem>[
      for (final MPTransferItem row in rows)
        if (mpTextWithin(row.label).isEmpty || searchText(mpTextWithin(row.label)).contains(needle))
          row,
    ];
  }

  @override
  Widget build(BuildContext context) {
    final MPSize size = _size;
    final MPColor color = _color;
    final bool disabled = _disabled;
    final Map<String, String> words = _words();
    final Set<String> chosen = _selected.toSet();
    final List<MPTransferItem> source = <MPTransferItem>[
      for (final MPTransferItem item in widget.items)
        if (!chosen.contains(item.value)) item,
    ];
    final List<MPTransferItem> target = <MPTransferItem>[
      for (final MPTransferItem item in widget.items)
        if (chosen.contains(item.value)) item,
    ];
    final List<MPTransferItem> sourceRows = _filter(source, _sourceSearch);
    final List<MPTransferItem> targetRows = _filter(target, _targetSearch);
    final bool canSend = sourceRows.any(
      (MPTransferItem item) => !item.disabled && _ticked.contains(item.value),
    );
    final bool canReturn = targetRows.any(
      (MPTransferItem item) => !item.disabled && _ticked.contains(item.value),
    );
    final double width = MediaQuery.maybeSizeOf(context)?.width ?? 0;
    final bool wide =
        width > 0 && MPConfigProvider.of(context).windowClassOf(width) != MPWindowClass.compact;
    final bool rtl = Directionality.of(context) == TextDirection.rtl;
    final String sourceName = _name(widget.sourceLabel, words['source']!);
    final String targetName = _name(widget.targetLabel, words['target']!);
    final MPVariant arrowVariant = widget.variant == MPVariant.text
        ? MPVariant.text
        : MPVariant.outlined;

    final Widget sourcePanel = _Panel(
      title: widget.sourceLabel ?? Text(words['source']!),
      name: sourceName,
      rows: sourceRows,
      total: source.length,
      ticked: _ticked,
      arrived: _arrivedInTarget ? const <String>{} : _arrived,
      onTick: _tick,
      onTickAll: (bool on) => _tickAll(sourceRows, on),
      search: _sourceSearch,
      onSearch: (String next) => setState(() => _sourceSearch = next),
      searchable: widget.searchable,
      disabled: disabled,
      height: widget.height,
      words: words,
      variant: widget.variant,
      size: size,
      color: color,
    );

    final Widget targetPanel = _Panel(
      title: widget.targetLabel ?? Text(words['target']!),
      name: targetName,
      rows: targetRows,
      total: target.length,
      ticked: _ticked,
      arrived: _arrivedInTarget ? _arrived : const <String>{},
      onTick: _tick,
      onTickAll: (bool on) => _tickAll(targetRows, on),
      search: _targetSearch,
      onSearch: (String next) => setState(() => _targetSearch = next),
      searchable: widget.searchable,
      disabled: disabled,
      height: widget.height,
      words: words,
      variant: widget.variant,
      size: size,
      color: color,
    );

    // Down and up while the panels stack; towards the chosen list and back
    // while they stand side by side, which under RTL is to the left.
    final int forward = wide ? (rtl ? 2 : 0) : 1;
    final int back = wide ? (rtl ? 0 : 2) : 3;

    final List<Widget> arrows = <Widget>[
      MPIconButton(
        icon: MPGlyph(MPGlyphShape.arrowRight, quarterTurns: forward),
        label: words['toTarget']!,
        variant: arrowVariant,
        size: size,
        color: color,
        disabled: disabled || !canSend,
        onPressed: () => _move(sourceRows, toTarget: true, list: targetName),
      ),
      MPIconButton(
        icon: MPGlyph(MPGlyphShape.arrowRight, quarterTurns: back),
        label: words['toSource']!,
        variant: arrowVariant,
        size: size,
        color: color,
        disabled: disabled || !canReturn,
        onPressed: () => _move(targetRows, toTarget: false, list: sourceName),
      ),
    ];

    // One region that stays in the tree, with a keyed line inside it: a live
    // region inserted already full is one a screen reader may read at once or
    // not at all. Left out where the platform takes an announcement instead.
    final bool announces = MediaQuery.maybeSupportsAnnounceOf(context) ?? false;
    // A pixel square rather than nothing at all, as React's visually hidden
    // span is: a node with no size is one a screen reader may skip.
    final Widget live = Semantics(
      container: true,
      liveRegion: true,
      child: SizedBox.square(
        dimension: 1,
        child: _announced == null || announces
            ? null
            : Semantics(
                key: ValueKey<int>(_presses),
                container: true,
                label: _announced,
                child: const SizedBox.expand(),
              ),
      ),
    );

    if (wide) {
      return Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        spacing: _gap,
        children: <Widget>[
          Expanded(child: sourcePanel),
          _withLive(Column(mainAxisSize: MainAxisSize.min, spacing: 8, children: arrows), live),
          Expanded(child: targetPanel),
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: _gap,
      children: <Widget>[
        sourcePanel,
        _withLive(
          Row(mainAxisAlignment: MainAxisAlignment.center, spacing: 8, children: arrows),
          live,
        ),
        targetPanel,
      ],
    );
  }

  /// The arrows with the live region tucked into their corner, where it takes
  /// no room in the layout.
  static Widget _withLive(Widget arrows, Widget live) {
    return Stack(
      children: <Widget>[
        arrows,
        PositionedDirectional(start: 0, top: 0, child: live),
      ],
    );
  }

  /// A heading as words for the sentence a press says, or the locale's word
  /// when the heading is something words cannot be read off.
  static String _name(Widget? label, String fallback) {
    final String words = mpTextWithin(label);

    return words.isEmpty ? fallback : words;
  }
}

/// One side: the heading strip with its select-all, the filter, and the rows.
class _Panel extends StatelessWidget {
  const _Panel({
    required this.title,
    required this.name,
    required this.rows,
    required this.total,
    required this.ticked,
    required this.arrived,
    required this.onTick,
    required this.onTickAll,
    required this.search,
    required this.onSearch,
    required this.searchable,
    required this.disabled,
    required this.height,
    required this.words,
    required this.variant,
    required this.size,
    required this.color,
  });

  final Widget title;
  final String name;
  final List<MPTransferItem> rows;
  final int total;
  final Set<String> ticked;
  final Set<String> arrived;
  final void Function(String value, bool on) onTick;
  final ValueChanged<bool> onTickAll;
  final String search;
  final ValueChanged<String> onSearch;
  final bool searchable;
  final bool disabled;
  final double height;
  final Map<String, String> words;
  final MPVariant variant;
  final MPSize size;
  final MPColor color;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final MPColorScheme colors = theme.colors;
    final List<MPTransferItem> movable = <MPTransferItem>[
      for (final MPTransferItem row in rows)
        if (!row.disabled) row,
    ];
    final int tickedHere = movable.where((MPTransferItem row) => ticked.contains(row.value)).length;
    final bool all = movable.isNotEmpty && tickedHere == movable.length;
    final bool some = tickedHere > 0 && !all;
    final double insetX = _insetX[size]!;
    final double stripY = _stripPadY[size]!;
    final TextStyle meta = theme.typescale.bodySmall.style(colors.onSurfaceVariant);

    final Widget heading = Container(
      padding: EdgeInsets.symmetric(horizontal: insetX, vertical: stripY),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: colors.outlineVariant)),
      ),
      child: Row(
        spacing: 8,
        children: <Widget>[
          Expanded(
            // The list's own name is the select-all's label: a checkbox that
            // ticks the whole column is named after the column.
            child: MPCheckbox(
              size: size,
              color: color,
              checked: all,
              indeterminate: some,
              disabled: disabled || movable.isEmpty,
              label: DefaultTextStyle.merge(
                style: const TextStyle(fontWeight: FontWeight.w500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                child: title,
              ),
              onChanged: onTickAll,
            ),
          ),
          Text(
            '$tickedHere/$total',
            style: meta.copyWith(fontFeatures: const <FontFeature>[FontFeature.tabularFigures()]),
          ),
        ],
      ),
    );

    final Widget list = SizedBox(
      height: height,
      // A named group, and the name is the heading above it: without it the
      // two panels are one undifferentiated run of checkboxes, and a reader
      // moving by control has nothing saying which side either one is on.
      child: Semantics(
        container: true,
        explicitChildNodes: true,
        label: name,
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: insetX, vertical: stripY),
          child: rows.isEmpty
              ? Padding(
                  padding: EdgeInsets.symmetric(vertical: _rowPadY[size]!),
                  child: Text(words['empty']!, style: meta),
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    for (final MPTransferItem row in rows)
                      MPArrivingRow(
                        // By value, so a row keeps its own widgets as the
                        // filter hides the ones before it.
                        key: ValueKey<String>(row.value),
                        arriving: arrived.contains(row.value),
                        child: Padding(
                          padding: EdgeInsets.symmetric(vertical: _rowPadY[size]!),
                          child: MPCheckbox(
                            size: size,
                            color: color,
                            label: row.label,
                            checked: ticked.contains(row.value),
                            disabled: disabled || row.disabled,
                            onChanged: (bool on) => onTick(row.value, on),
                          ),
                        ),
                      ),
                  ],
                ),
        ),
      ),
    );

    return MPBox(
      variant: variant,
      size: size,
      padded: false,
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          heading,
          if (searchable)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: insetX, vertical: stripY),
              child: MPTextField(
                size: size,
                fullWidth: true,
                disabled: disabled,
                placeholder: words['search'],
                semanticLabel: words['search'],
                value: search,
                onChanged: onSearch,
              ),
            ),
          list,
        ],
      ),
    );
  }
}
