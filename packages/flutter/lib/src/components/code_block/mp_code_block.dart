/// A viewer for one line of code or a thousand.
library;

import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/components/config/mp_config_provider.dart';
import 'package:material_plus_ui/src/internal/focus_ring.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/icons.dart';
import 'package:material_plus_ui/src/internal/interaction.dart';
import 'package:material_plus_ui/src/internal/keyboard_scroll.dart';
import 'package:material_plus_ui/src/internal/languages.dart';
import 'package:material_plus_ui/src/internal/messages.dart';
import 'package:material_plus_ui/src/internal/scale.dart';
import 'package:material_plus_ui/src/theme/color_scheme.dart';
import 'package:material_plus_ui/src/theme/oklch.dart';
import 'package:material_plus_ui/src/theme/theme.dart';
import 'package:material_plus_ui/src/theme/tokens.dart';
import 'package:material_plus_ui/src/types.dart';

/// Which of a theme's twelve colours a run of text is drawn in.
///
/// The React build carries highlight.js's class name on a run and lets its
/// stylesheet map it onto a slot. There is no stylesheet here, so a
/// [MPCodeHighlighter] says which slot a run takes, and these are the twelve
/// slots, the same twelve on both sides.
enum MPCodeTokenKind {
  /// A comment, or a doc comment. Drawn in italics.
  comment,

  /// A keyword, a literal, an operator.
  keyword,

  /// A string, a regular expression, a link.
  string,

  /// A number, a symbol, a bullet.
  number,

  /// A function's or a section's name.
  function,

  /// A type, a built-in, a class.
  type,

  /// A variable, a parameter, a substitution.
  variable,

  /// A markup tag.
  tag,

  /// An attribute or a property.
  attribute,

  /// A pragma, an annotation, punctuation.
  meta,

  /// An added line in a diff.
  addition,

  /// A removed one.
  deletion,
}

/// One run of text in a single colour.
@immutable
class MPCodeToken {
  /// Creates a run. Leave [kind] out for text drawn in the theme's own ink.
  const MPCodeToken(this.text, [this.kind]);

  /// The characters.
  final String text;

  /// Which slot colours them, or `null` for the foreground.
  final MPCodeTokenKind? kind;
}

/// One line of code, as the runs it is made of. An empty list is a blank line.
typedef MPCodeLine = List<MPCodeToken>;

/// Colours [code] written in [language], one [MPCodeLine] per line, or
/// returns `null` for a language it does not know, which draws the block
/// plain.
typedef MPCodeHighlighter = List<MPCodeLine>? Function(String code, String language);

/// Which palette a code block wears.
enum MPCodeBlockTheme {
  /// The screen's own scheme: light on a light screen, dark on a dark one.
  auto,

  /// Pinned dark, whatever the screen is doing.
  dark,

  /// Pinned light.
  light,

  /// No hue at all: structure carried by weight and by how far a run is
  /// muted, out of the screen's own neutral roles.
  mono,
}

/// The fourteen colours a code block is drawn out of.
///
/// Five more are derived, as the React stylesheet derives them: the dim ink,
/// the rule, the hover wash and the two a marked line uses are fixed mixes of
/// the ground and the ink, so a theme of your own is fourteen colours rather
/// than nineteen.
@immutable
class MPCodeTheme {
  /// Creates a palette.
  const MPCodeTheme({
    required this.background,
    required this.foreground,
    required this.comment,
    required this.keyword,
    required this.string,
    required this.number,
    required this.function,
    required this.type,
    required this.variable,
    required this.tag,
    required this.attribute,
    required this.meta,
    required this.addition,
    required this.deletion,
    this.bold = false,
  });

  /// The sheet.
  final Color background;

  /// The ink for anything no slot claims.
  final Color foreground;

  /// [MPCodeTokenKind.comment].
  final Color comment;

  /// [MPCodeTokenKind.keyword].
  final Color keyword;

  /// [MPCodeTokenKind.string].
  final Color string;

  /// [MPCodeTokenKind.number].
  final Color number;

  /// [MPCodeTokenKind.function].
  final Color function;

  /// [MPCodeTokenKind.type].
  final Color type;

  /// [MPCodeTokenKind.variable].
  final Color variable;

  /// [MPCodeTokenKind.tag].
  final Color tag;

  /// [MPCodeTokenKind.attribute].
  final Color attribute;

  /// [MPCodeTokenKind.meta].
  final Color meta;

  /// [MPCodeTokenKind.addition].
  final Color addition;

  /// [MPCodeTokenKind.deletion].
  final Color deletion;

  /// Draws the structural slots heavier rather than in another hue: `mono`'s
  /// answer, with no hue to tell a keyword from a string.
  final bool bold;

  /// The line numbers, the prompts and the bar's quieter text: the ink 58% of
  /// the way from the ground.
  Color get dim => Color.lerp(background, foreground, 0.58)!;

  /// The rule round the block and under the bar.
  Color get rule => foreground.withValues(alpha: 0.14);

  /// The wash under a hovered button on the bar.
  Color get hover => foreground.withValues(alpha: 0.09);

  /// A marked line's ground: neutral, mixed from the theme's own ink rather
  /// than dyed with the screen's accent, which the block has refused.
  Color get mark => foreground.withValues(alpha: 0.10);

  /// The rule down a marked line's leading edge.
  Color get markEdge => foreground.withValues(alpha: 0.45);

  /// The colour a run of [kind] is drawn in.
  Color inkFor(MPCodeTokenKind? kind) {
    return switch (kind) {
      null => foreground,
      MPCodeTokenKind.comment => comment,
      MPCodeTokenKind.keyword => keyword,
      MPCodeTokenKind.string => string,
      MPCodeTokenKind.number => number,
      MPCodeTokenKind.function => function,
      MPCodeTokenKind.type => type,
      MPCodeTokenKind.variable => variable,
      MPCodeTokenKind.tag => tag,
      MPCodeTokenKind.attribute => attribute,
      MPCodeTokenKind.meta => meta,
      MPCodeTokenKind.addition => addition,
      MPCodeTokenKind.deletion => deletion,
    };
  }

  /// Whether a run of [kind] is drawn heavier. Only ever true on `mono`.
  bool boldFor(MPCodeTokenKind? kind) {
    return bold &&
        (kind == MPCodeTokenKind.keyword ||
            kind == MPCodeTokenKind.function ||
            kind == MPCodeTokenKind.type ||
            kind == MPCodeTokenKind.tag);
  }

  /// The house light set: the React stylesheet's own `oklch` values.
  static final MPCodeTheme light = MPCodeTheme(
    background: _ok(0.984, 0.003, 262),
    foreground: _ok(0.30, 0.016, 262),
    comment: _ok(0.58, 0.022, 262),
    keyword: _ok(0.48, 0.19, 322),
    string: _ok(0.46, 0.12, 148),
    number: _ok(0.50, 0.14, 48),
    function: _ok(0.48, 0.17, 264),
    type: _ok(0.45, 0.10, 214),
    variable: _ok(0.45, 0.12, 28),
    tag: _ok(0.48, 0.18, 22),
    attribute: _ok(0.47, 0.13, 82),
    meta: _ok(0.52, 0.05, 262),
    addition: _ok(0.45, 0.14, 152),
    deletion: _ok(0.48, 0.18, 25),
  );

  /// The house dark set, and what `auto` becomes on a dark screen.
  static final MPCodeTheme dark = MPCodeTheme(
    background: _ok(0.195, 0.014, 262),
    foreground: _ok(0.90, 0.012, 262),
    comment: _ok(0.60, 0.024, 262),
    keyword: _ok(0.76, 0.13, 324),
    string: _ok(0.80, 0.13, 148),
    number: _ok(0.81, 0.12, 62),
    function: _ok(0.78, 0.12, 258),
    type: _ok(0.82, 0.10, 210),
    variable: _ok(0.82, 0.09, 32),
    tag: _ok(0.77, 0.13, 22),
    attribute: _ok(0.85, 0.11, 92),
    meta: _ok(0.70, 0.05, 262),
    addition: _ok(0.80, 0.14, 152),
    deletion: _ok(0.75, 0.15, 25),
  );

  /// `mono`, out of the screen's own neutral roles.
  static MPCodeTheme mono(MPColorScheme colors) {
    final Color fg = colors.onSurface;
    final Color muted = colors.onSurfaceVariant;

    return MPCodeTheme(
      background: colors.surfaceContainer,
      foreground: fg,
      comment: muted,
      keyword: fg,
      string: muted,
      number: muted,
      function: fg,
      type: fg,
      variable: fg,
      tag: fg,
      attribute: muted,
      meta: muted,
      addition: fg,
      deletion: muted,
      bold: true,
    );
  }

  static Color _ok(double l, double c, double h) => mpFitToSrgb(l, c, h);
}

/// The code's own type scale, one step under the running text at every rung:
/// a monospace face at the prose's nominal size reads a size larger.
const Map<MPSize, ({double size, double height})> _codeText =
    <MPSize, ({double size, double height})>{
      MPSize.xs: (size: 11, height: 1.55),
      MPSize.sm: (size: 12, height: 1.6),
      MPSize.md: (size: 13, height: 1.65),
      MPSize.lg: (size: 14, height: 1.7),
      MPSize.xl: (size: 16, height: 1.7),
    };

const Map<MPSize, double> _bodyPadY = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 12,
  MPSize.md: 14,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

const Map<MPSize, double> _linePadX = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 12,
  MPSize.md: 14,
  MPSize.lg: 16,
  MPSize.xl: 20,
};

const Map<MPSize, double> _barPadY = <MPSize, double>{
  MPSize.xs: 4,
  MPSize.sm: 4,
  MPSize.md: 6,
  MPSize.lg: 8,
  MPSize.xl: 8,
};

/// How long the copy button says it worked.
const Duration _copiedFor = Duration(seconds: 2);

/// The rule a marked line draws down its leading edge, which every line keeps
/// room for so marking one does not shift its text.
const double _markEdge = 2;

/// The faces the code is set in when none is given, the platform's own
/// monospace first.
const List<String> _monospace = <String>[
  'SF Mono',
  'Menlo',
  'Consolas',
  'Roboto Mono',
  'DejaVu Sans Mono',
  'monospace',
];

/// A padding with the density steps taken out, floored where it stops being
/// air.
double _tighten(double base, MPDensity density, double floor) {
  return math.max(floor, base + mpClampDensity(density) * 2);
}

/// `'4'`, `'4-9'` or `'1,4-9,12'` as the set of line numbers it names.
///
/// Anything unparseable is dropped rather than thrown: a marked line is an
/// annotation, and a typo in one should cost the annotation, not the code. A
/// range written backwards is still a range.
Set<int> _markedLines(String? spec) {
  final Set<int> marked = <int>{};

  if (spec == null) {
    return marked;
  }

  final RegExp range = RegExp(r'^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$');

  for (final String part in spec.split(',')) {
    final RegExpMatch? match = range.firstMatch(part);

    if (match == null) {
      continue;
    }

    final int from = int.parse(match.group(1)!);
    final int to = match.group(2) == null ? from : int.parse(match.group(2)!);

    for (int line = math.min(from, to); line <= math.max(from, to); line += 1) {
      marked.add(line);
    }
  }

  return marked;
}

/// [code] as plain lines, one run each.
List<MPCodeLine> _plainLines(String code) {
  return <MPCodeLine>[
    for (final String line in code.split('\n'))
      line.isEmpty ? const <MPCodeToken>[] : <MPCodeToken>[MPCodeToken(line)],
  ];
}

/// A viewer for one line of code or a thousand.
///
/// ```dart
/// MPCodeBlock(code: source, language: 'dart', title: const Text('lib/main.dart'), lineNumbers: true)
/// ```
///
/// Everything above the code is optional and off one parameter each, because
/// the same widget has to be a snippet with no chrome and the full transcript
/// at the top of a README.
///
/// ## The colouring is the caller's
///
/// The React block loads highlight.js on demand. This package has no
/// dependencies, and a hand-written grammar for thirty-odd languages is a
/// promise it could not keep. So the block draws the code in its theme's ink,
/// with the bar, the numbers, the marks and the palettes all in place, and a
/// caller who has a highlighter hands it in as [highlighter], returning runs
/// tagged with an [MPCodeTokenKind]. The theme colours each run by its slot.
///
/// ## The block does not take the screen's accent
///
/// Code is read against a ground chosen for code, and the twelve hues it needs
/// are not the four MD3 has. [theme] picks which palette fills the slots.
class MPCodeBlock extends StatefulWidget {
  /// Creates a code block.
  const MPCodeBlock({
    required this.code,
    this.language,
    this.theme = MPCodeBlockTheme.auto,
    this.customTheme,
    this.size,
    this.density,
    this.highlight = true,
    this.highlighter,
    this.toolbar = true,
    this.title,
    this.showLanguage = true,
    this.copyable = true,
    this.rawToggle = false,
    this.markLines,
    this.lineNumbers = false,
    this.startLine = 1,
    this.prompt,
    this.wrap = false,
    this.maxHeight,
    this.fontFamily,
    this.fontSize,
    this.lineHeight,
    this.locale,
    this.copyLabel,
    this.copiedLabel,
    this.rawLabel,
    this.onCopy,
    super.key,
  });

  /// The code.
  ///
  /// Line endings are normalised and trailing whitespace is trimmed off the
  /// end of the block, so a string written with a newline before its closing
  /// quote does not end in a blank line. Nothing is trimmed off the front:
  /// indentation means something in half the languages there are.
  final String code;

  /// What it is written in: `ts`, `bash`, `yml`, `dockerfile`. The common
  /// spellings and file extensions are understood, so a value copied off a
  /// fenced code block works as it stands.
  final String? language;

  /// The palette. [MPCodeBlockTheme.auto] follows the screen's brightness.
  final MPCodeBlockTheme theme;

  /// A palette of your own, in place of [theme]. The React build takes a
  /// theme name a stylesheet of yours defines; there is no stylesheet here, so
  /// the palette itself is passed.
  final MPCodeTheme? customTheme;

  /// The type scale and the air round the code.
  final MPSize? size;

  /// Tightens that air and nothing else.
  final MPDensity? density;

  /// Colours the code with [highlighter]. Off, or with no highlighter, the
  /// code is drawn in the theme's ink.
  final bool highlight;

  /// Turns the code into coloured runs. See the note on the class: the
  /// package carries no grammar of its own.
  final MPCodeHighlighter? highlighter;

  /// The bar over the code, and the master switch for it: off, none of
  /// [showLanguage], [copyable] or [rawToggle] draws anything.
  final bool toolbar;

  /// A name at the start of the bar, usually a file path, set in monospace.
  final Widget? title;

  /// Names the language at the start of the bar.
  final bool showLanguage;

  /// The button that puts the code on the clipboard.
  final bool copyable;

  /// The toggle that drops the colouring and shows the characters as they
  /// are. Means nothing when nothing is coloured, so it is drawn only with
  /// [highlight] on.
  final bool rawToggle;

  /// Lines to mark: a tinted row with a rule down its leading edge.
  ///
  /// One line, a range or a list of both: `'4'`, `'4-9'`, `'1,4-9,12'`,
  /// counted the way the gutter counts, so with [startLine] at 286 `'288'`
  /// marks the line the gutter calls 288.
  final String? markLines;

  /// Numbers down the side.
  final bool lineNumbers;

  /// What the first line is numbered.
  final int startLine;

  /// A shell prompt in front of every line that has something on it: `$`,
  /// `#`, `>>>`. Drawn but never part of the text: it is not selectable and is
  /// not what the copy button puts on the clipboard.
  final String? prompt;

  /// Wraps long lines instead of scrolling them sideways.
  final bool wrap;

  /// How tall the block may get before the code scrolls inside it, in logical
  /// pixels. Left out, the block is as tall as the code.
  final double? maxHeight;

  /// The typeface. Defaults to the platform's own monospace stack.
  final String? fontFamily;

  /// Overrides the size the [size] ladder chose.
  final double? fontSize;

  /// Overrides the leading, as a multiple of the font size.
  final double? lineHeight;

  /// Which language the block's own words are in. Falls back to the nearest
  /// `MPLocaleProvider`, then to the app's locale, then to English.
  final String? locale;

  /// The copy button's label. Defaults to the wording in [locale].
  final String? copyLabel;

  /// What the copy button says once the code is on the clipboard.
  final String? copiedLabel;

  /// The raw toggle's name.
  final String? rawLabel;

  /// Called with the copied text once the clipboard has taken it.
  final ValueChanged<String>? onCopy;

  @override
  State<MPCodeBlock> createState() => _MPCodeBlockState();
}

class _MPCodeBlockState extends State<MPCodeBlock> {
  final ScrollController _down = ScrollController();
  final ScrollController _across = ScrollController();

  bool _raw = false;

  /// Whether the last copy worked, or `null` while there is nothing to say.
  bool? _copied;
  Timer? _timer;

  String? _source;
  String? _sourceOf;
  List<MPCodeLine>? _coloured;
  (String, String?, bool)? _colouredFor;

  @override
  void dispose() {
    _timer?.cancel();
    _down.dispose();
    _across.dispose();
    super.dispose();
  }

  /// The code with Windows line endings normalised and the trailing blank
  /// lines gone: what the clipboard gets, and what a highlighter is handed.
  String get _text {
    if (_sourceOf != widget.code) {
      _sourceOf = widget.code;
      _source = widget.code.replaceAll(RegExp(r'\r\n?'), '\n').replaceAll(RegExp(r'\s+$'), '');
    }

    return _source!;
  }

  List<MPCodeLine> _lines(String? language) {
    final String text = _text;
    final bool wanted = widget.highlight && !_raw && language != null && widget.highlighter != null;

    if (!wanted) {
      return _plainLines(text);
    }

    // Coloured once per text and language, not on every build.
    final (String, String?, bool) key = (text, language, true);

    if (_colouredFor != key) {
      _colouredFor = key;
      _coloured = widget.highlighter!(text, language);
    }

    return _coloured ?? _plainLines(text);
  }

  Future<void> _copy() async {
    final String text = _text;
    bool done;

    try {
      await Clipboard.setData(ClipboardData(text: text));
      done = true;
    } on PlatformException {
      done = false;
    }

    if (!mounted) {
      return;
    }

    _timer?.cancel();
    setState(() => _copied = done);
    _timer = Timer(_copiedFor, () {
      if (mounted) {
        setState(() => _copied = null);
      }
    });

    if (done) {
      widget.onCopy?.call(text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final MPConfigValue? config = MPConfigProvider.maybeOf(context);
    final MPSize size = widget.size ?? config?.size ?? MPSize.md;
    final MPDensity density = widget.density ?? config?.density ?? 0;
    final MPThemeData theme = MPTheme.of(context);
    final Map<String, String> messages = mpMessagesOf(
      context,
      mpCodeMessages,
      locale: widget.locale,
    );
    final MPCodeTheme palette =
        widget.customTheme ??
        switch (widget.theme) {
          MPCodeBlockTheme.light => MPCodeTheme.light,
          MPCodeBlockTheme.dark => MPCodeTheme.dark,
          MPCodeBlockTheme.mono => MPCodeTheme.mono(theme.colors),
          MPCodeBlockTheme.auto =>
            theme.colors.brightness == Brightness.dark ? MPCodeTheme.dark : MPCodeTheme.light,
        };
    final String? language = canonicalLanguage(widget.language);
    final List<MPCodeLine> lines = _lines(language);
    final Set<int> marked = _markedLines(widget.markLines);
    final ({double size, double height}) scale = _codeText[size]!;
    final double fontSize = widget.fontSize ?? scale.size;
    final TextStyle code = TextStyle(
      fontFamily: widget.fontFamily ?? _monospace.first,
      fontFamilyFallback: widget.fontFamily == null ? _monospace.sublist(1) : null,
      fontSize: fontSize,
      height: widget.lineHeight ?? scale.height,
      color: palette.foreground,
      leadingDistribution: TextLeadingDistribution.even,
    );
    final TextStyle meta = theme.typescale.bodySmall.style(palette.dim);
    final double padX = _tighten(_linePadX[size]!, density, 6);
    final double padY = _tighten(_bodyPadY[size]!, density, 4);
    final double barPadY = _tighten(_barPadY[size]!, density, 2);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.medium);
    final int last = widget.startLine + math.max(lines.length - 1, 0);
    final String copyName = widget.copyLabel ?? messages['copy']!;
    final String copiedName = widget.copiedLabel ?? messages['copied']!;
    final String rawName = widget.rawLabel ?? messages['raw']!;
    final String? titleText = widget.title is Text ? (widget.title! as Text).data : null;
    final String regionName = widget.title != null
        ? (titleText ?? messages['label']!)
        : (language ?? messages['label']!);

    final bool barShown =
        widget.toolbar &&
        (widget.showLanguage || widget.copyable || widget.rawToggle || widget.title != null);

    Widget? bar;

    if (barShown) {
      bar = DecoratedBox(
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: palette.rule)),
        ),
        child: Padding(
          // The line's padding plus the room a marked line keeps for its rule,
          // so the title starts exactly where the code under it does.
          padding: EdgeInsets.symmetric(horizontal: padX + _markEdge, vertical: barPadY),
          child: Row(
            spacing: 4,
            children: <Widget>[
              if (widget.title != null)
                Flexible(
                  child: DefaultTextStyle(
                    style: meta.copyWith(
                      color: palette.foreground,
                      fontFamily: code.fontFamily,
                      fontFamilyFallback: code.fontFamilyFallback,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    child: widget.title!,
                  ),
                ),
              if (widget.showLanguage && language != null)
                Flexible(
                  child: ExcludeSemantics(
                    child: Text(
                      language.toUpperCase(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: meta.copyWith(
                        fontFamily: code.fontFamily,
                        fontFamilyFallback: code.fontFamilyFallback,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ),
              const Spacer(),
              if (widget.rawToggle && widget.highlight)
                _BarButton(
                  palette: palette,
                  meta: meta,
                  icon: MPGlyphShape.code,
                  semanticLabel: rawName,
                  toggled: _raw,
                  onPressed: () => setState(() => _raw = !_raw),
                ),
              if (widget.copyable)
                _BarButton(
                  palette: palette,
                  meta: meta,
                  icon: _copied == true ? MPGlyphShape.check : MPGlyphShape.copy,
                  label: _copied == null
                      ? copyName
                      : _copied!
                      ? copiedName
                      : messages['copyFailed']!,
                  onPressed: _copy,
                ),
            ],
          ),
        ),
      );
    }

    final double gutter = _gutterWidth(last, code);

    Widget body = Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        for (int index = 0; index < lines.length; index += 1)
          _Line(
            tokens: lines[index],
            number: widget.lineNumbers ? widget.startLine + index : null,
            gutter: gutter,
            prompt: widget.prompt,
            marked: marked.contains(widget.startLine + index),
            palette: palette,
            style: code,
            padX: padX,
            wrap: widget.wrap,
          ),
      ],
    );

    // Selectable, with the numbers and the prompts left out: they are drawn,
    // not part of the text, as the React build's generated content is not. A
    // selection draws its handles in an overlay, so a block with none above it
    // (a bare widget tree, a test) is drawn without one rather than failing.
    if (Overlay.maybeOf(context) != null) {
      body = SelectableRegion(selectionControls: emptyTextSelectionControls, child: body);
    }

    if (!widget.wrap) {
      final Widget rows = body;

      // The rows as wide as the longest line rather than the window onto
      // them, so a marked line's tint reaches the same edge on every line, and
      // never narrower than the block.
      body = LayoutBuilder(
        builder: (BuildContext context, BoxConstraints constraints) {
          return SingleChildScrollView(
            controller: _across,
            scrollDirection: Axis.horizontal,
            child: ConstrainedBox(
              constraints: BoxConstraints(minWidth: constraints.maxWidth),
              child: IntrinsicWidth(child: rows),
            ),
          );
        },
      );
    }

    body = SingleChildScrollView(
      controller: _down,
      padding: EdgeInsets.symmetric(vertical: padY),
      child: body,
    );

    body = ConstrainedBox(
      constraints: BoxConstraints(maxHeight: widget.maxHeight ?? double.infinity),
      child: body,
    );

    // A focus stop while there is anything to scroll, so a reader with no
    // pointer can reach the rest; and named, because a stop is announced by
    // its name.
    body = Semantics(
      container: true,
      label: regionName,
      child: MPKeyboardScroll(
        vertical: _down,
        horizontal: widget.wrap ? null : _across,
        borderRadius: BorderRadius.zero,
        ringOffset: -focusRingWidth,
        child: body,
      ),
    );

    return DecoratedBox(
      decoration: BoxDecoration(
        color: palette.background,
        border: Border.all(color: palette.rule),
        borderRadius: radius,
      ),
      child: Padding(
        padding: const EdgeInsets.all(1),
        child: ClipRRect(
          borderRadius: radius - const BorderRadius.all(Radius.circular(1)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              ?bar,
              Flexible(child: body),
              // The copy button changes its own label, which a screen reader
              // reading the screen rather than the button would never hear.
              Semantics(
                container: true,
                liveRegion: true,
                label: _copied == null
                    ? ''
                    : _copied!
                    ? copiedName
                    : messages['copyFailed']!,
                child: const SizedBox(width: 1, height: 0),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Wide enough for the last number, so the gutter does not step as the
  /// block scrolls.
  double _gutterWidth(int last, TextStyle style) {
    if (!widget.lineNumbers) {
      return 0;
    }

    final TextPainter painter = TextPainter(
      text: TextSpan(text: '$last', style: style),
      textDirection: TextDirection.ltr,
      textScaler: MediaQuery.textScalerOf(context),
    )..layout();
    final double width = painter.width;

    painter.dispose();

    return width;
  }
}

/// One line: the number, the prompt and the code, with room down the leading
/// edge for a mark's rule.
class _Line extends StatelessWidget {
  const _Line({
    required this.tokens,
    required this.number,
    required this.gutter,
    required this.prompt,
    required this.marked,
    required this.palette,
    required this.style,
    required this.padX,
    required this.wrap,
  });

  final MPCodeLine tokens;
  final int? number;
  final double gutter;
  final String? prompt;
  final bool marked;
  final MPCodeTheme palette;
  final TextStyle style;
  final double padX;
  final bool wrap;

  @override
  Widget build(BuildContext context) {
    final double em = style.fontSize!;
    final TextStyle dim = style.copyWith(color: palette.dim);
    final Widget text = Text.rich(
      TextSpan(
        children: <InlineSpan>[
          for (final MPCodeToken run in tokens)
            TextSpan(
              text: run.text,
              style: TextStyle(
                color: palette.inkFor(run.kind),
                fontStyle: run.kind == MPCodeTokenKind.comment ? FontStyle.italic : null,
                fontWeight: palette.boldFor(run.kind) ? FontWeight.w600 : null,
              ),
            ),
        ],
      ),
      style: style,
      softWrap: wrap,
      // A blank line keeps a line's height: a block that closed up its own
      // paragraph breaks would be reflowing the reader's file.
      strutStyle: StrutStyle.fromTextStyle(style, forceStrutHeight: true),
    );

    return DecoratedBox(
      decoration: BoxDecoration(
        color: marked ? palette.mark : null,
        border: BorderDirectional(
          start: BorderSide(
            color: marked ? palette.markEdge : const Color(0x00000000),
            width: _markEdge,
          ),
        ),
      ),
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: padX),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: wrap ? MainAxisSize.max : MainAxisSize.min,
          children: <Widget>[
            if (number != null)
              SelectionContainer.disabled(
                child: ExcludeSemantics(
                  child: Padding(
                    padding: EdgeInsetsDirectional.only(end: em * 1.25),
                    child: SizedBox(
                      width: gutter,
                      child: Text('$number', style: dim, textAlign: TextAlign.end),
                    ),
                  ),
                ),
              ),
            if (prompt != null && tokens.isNotEmpty)
              SelectionContainer.disabled(
                child: ExcludeSemantics(
                  child: Padding(
                    padding: EdgeInsetsDirectional.only(end: em * 0.75),
                    child: Text(prompt!, style: dim),
                  ),
                ),
              ),
            if (wrap) Expanded(child: text) else text,
          ],
        ),
      ),
    );
  }
}

/// A button on the bar: plain against the block's own palette rather than an
/// `MPIconButton`, because the block has refused the screen's colour roles and
/// a control that read them would be a light button on a black bar.
class _BarButton extends StatelessWidget {
  const _BarButton({
    required this.palette,
    required this.meta,
    required this.icon,
    required this.onPressed,
    this.label,
    this.semanticLabel,
    this.toggled,
  });

  final MPCodeTheme palette;
  final TextStyle meta;
  final MPGlyphShape icon;
  final VoidCallback onPressed;
  final String? label;
  final String? semanticLabel;
  final bool? toggled;

  @override
  Widget build(BuildContext context) {
    final MPThemeData theme = MPTheme.of(context);
    final BorderRadius radius = BorderRadius.circular(theme.shapes.extraSmall);
    final bool reduceMotion = MediaQuery.maybeDisableAnimationsOf(context) ?? false;

    return MPInteractive(
      onTap: onPressed,
      builder: (BuildContext context, MPInteraction state) {
        final bool lit = state.hovered || (toggled ?? false);
        final Color ink = lit ? palette.foreground : palette.dim;
        final ({bool? focused, VoidCallback? onFocus, bool? expanded}) focus = mpFocusSemanticsOf(
          context,
        );

        return Semantics(
          container: true,
          button: true,
          toggled: toggled,
          label: semanticLabel,
          focused: focus.focused,
          onFocus: focus.onFocus,
          onTap: onPressed,
          child: CustomPaint(
            foregroundPainter: state.focusVisible
                ? MPFocusRingPainter(color: palette.foreground, borderRadius: radius, offset: 1)
                : null,
            child: AnimatedContainer(
              duration: reduceMotion ? Duration.zero : MPMotion.short4,
              curve: MPMotion.standard,
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              decoration: BoxDecoration(
                color: lit ? palette.hover : const Color(0x00000000),
                borderRadius: radius,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                spacing: 4,
                children: <Widget>[
                  MPGlyph(icon, size: meta.fontSize! * 1.15, color: ink),
                  if (label != null) Text(label!, style: meta.copyWith(color: ink)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
