/// The wedge that points a floating sheet back at what opened it.
///
/// Three components draw one: `MPTooltip`, `MPPopover` and `MPHoverCard`. One
/// drawing in one file, as React's `internal/PopupArrow.tsx` is, because a
/// wedge a pixel out of line with its sheet is not something anybody reports.
///
/// None of this is exported from `material_plus_ui.dart`. It is the library
/// talking to itself.
library;

import 'package:flutter/widgets.dart';

import 'package:material_plus_ui/src/types.dart';

/// How wide the wedge is at each rung, for a popover and a hover card.
///
/// A tooltip keeps its own, a pixel or two narrower throughout, because a
/// tooltip is a strip of text rather than a sheet and a wedge sized for a card
/// reads as a spike coming off it.
const Map<MPSize, double> mpPopupArrowSize = <MPSize, double>{
  MPSize.xs: 8,
  MPSize.sm: 9,
  MPSize.md: 10,
  MPSize.lg: 11,
  MPSize.xl: 12,
};

/// [child], the sheet, with the wedge on the edge that faces the anchor.
///
/// [side] is the side the sheet ended up on after any flip, which only the
/// anchored portal knows; the wedge points the other way, back at the anchor.
/// [size] is the wedge's width, and it is half that tall, as React's
/// `viewBox="0 0 10 5"` draws it.
///
/// The wedge is a sibling of the sheet, outside its box, rather than a child:
/// a sheet clips itself at its rounded corner, and a wedge inside it would
/// have its point cut off. It overlaps the sheet by a pixel, which is what
/// closes the hairline a fractional position would leave between the two.
///
/// Along the edge it sits where [align] puts the sheet, inset by [inset] (the
/// sheet's corner radius) so a `start` wedge points at the anchor rather than
/// at the sheet's own rounded corner. Along a top or a bottom edge, start and
/// end are the reader's.
///
/// Hidden from a screen reader: the sheet it hangs off is already announced,
/// and an arrow announced separately would be a corner of the sheet passing
/// itself off as a second object.
class MPPopupArrow extends StatelessWidget {
  /// Draws [child] with a wedge on [side].
  const MPPopupArrow({
    required this.side,
    required this.size,
    required this.color,
    required this.child,
    this.align = MPAlign.center,
    this.inset = 0,
    super.key,
  });

  /// The side of the anchor the sheet is on.
  final MPSide side;

  /// Where the sheet sits along that side, which is where the wedge sits too.
  final MPAlign align;

  /// The wedge's width. It is half that tall.
  final double size;

  /// The fill, which is the sheet's own.
  final Color color;

  /// How far from the sheet's corners the wedge is kept.
  final double inset;

  /// The sheet.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final bool vertical = side == MPSide.top || side == MPSide.bottom;
    final double along = switch (align) {
      MPAlign.start => -1.0,
      MPAlign.center => 0.0,
      MPAlign.end => 1.0,
    };

    final Widget wedge = CustomPaint(
      size: vertical ? Size(size, size / 2) : Size(size / 2, size),
      painter: _WedgePainter(side: side, color: color),
    );

    // Inside the `Positioned` rather than round it: a stack reads its
    // children's placement off their parent data, which only a direct child
    // carries.
    final Widget slot = ExcludeSemantics(
      child: IgnorePointer(
        child: Padding(
          padding: vertical
              ? EdgeInsets.symmetric(horizontal: inset)
              : EdgeInsets.symmetric(vertical: inset),
          child: Align(
            alignment: vertical ? AlignmentDirectional(along, 0) : Alignment(0, along),
            child: wedge,
          ),
        ),
      ),
    );

    // One pixel into the sheet: the wedge's base and the sheet's edge are then
    // one surface rather than two with a seam between them.
    final double outside = -(size / 2 - 1);

    final Widget placed = switch (side) {
      MPSide.top => Positioned(left: 0, right: 0, bottom: outside, height: size / 2, child: slot),
      MPSide.bottom => Positioned(left: 0, right: 0, top: outside, height: size / 2, child: slot),
      MPSide.left => Positioned(top: 0, bottom: 0, right: outside, width: size / 2, child: slot),
      MPSide.right => Positioned(top: 0, bottom: 0, left: outside, width: size / 2, child: slot),
    };

    return Stack(clipBehavior: Clip.none, children: <Widget>[child, placed]);
  }
}

/// A triangle pointing away from the sheet, towards the anchor.
class _WedgePainter extends CustomPainter {
  const _WedgePainter({required this.side, required this.color});

  final MPSide side;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final Path path = Path();

    // The point faces away from the sheet, which is towards the anchor: a sheet
    // on the anchor's top has its wedge on its own bottom edge, pointing down.
    switch (side) {
      case MPSide.top:
        path
          ..moveTo(0, 0)
          ..lineTo(size.width, 0)
          ..lineTo(size.width / 2, size.height);
      case MPSide.bottom:
        path
          ..moveTo(0, size.height)
          ..lineTo(size.width, size.height)
          ..lineTo(size.width / 2, 0);
      case MPSide.left:
        path
          ..moveTo(0, 0)
          ..lineTo(0, size.height)
          ..lineTo(size.width, size.height / 2);
      case MPSide.right:
        path
          ..moveTo(size.width, 0)
          ..lineTo(size.width, size.height)
          ..lineTo(0, size.height / 2);
    }

    canvas.drawPath(path..close(), Paint()..color = color);
  }

  @override
  bool shouldRepaint(_WedgePainter oldDelegate) {
    return oldDelegate.side != side || oldDelegate.color != color;
  }
}
