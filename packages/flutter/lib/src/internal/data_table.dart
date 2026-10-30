/// The arithmetic a data table does before it draws anything.
///
/// Sorting, paging and range selection are decisions about values rather than
/// about widgets, so they are here as plain functions: they can be read and
/// tested without a frame, and — the reason that matters — they are the same
/// three answers the React package gives, which is what keeps a table sorted
/// one way on the web from being sorted another way in an app.
library;

import 'package:flutter/foundation.dart';

/// Which way a column runs when it is sorted.
enum MPSortDirection {
  /// Smallest first.
  asc,

  /// Largest first.
  desc,
}

/// The column being sorted on, and its direction.
///
/// [key] is a plain [String] naming the column, not a widget [Key]. The React
/// package calls it the same thing, and a table sorted by `'customer'` in one
/// build and by something else in the other would be two APIs.
@immutable
class MPSort {
  /// Creates a sort.
  const MPSort({required this.key, required this.direction});

  /// The column's `key`.
  final String key;

  /// Which way it runs.
  final MPSortDirection direction;

  @override
  bool operator ==(Object other) {
    return other is MPSort && other.key == key && other.direction == direction;
  }

  @override
  int get hashCode => Object.hash(key, direction);

  @override
  String toString() => 'MPSort($key, ${direction.name})';
}

/// Puts two cell values in order, in the [direction] given: `1` for ascending
/// and `-1` for descending.
///
/// Numbers, dates and booleans compare as themselves and everything else
/// compares as its text. Two rules carry the weight:
///
/// **Nothing sorts last, in both directions.** A column of amounts with three
/// blanks in it is a column whose blanks are not the smallest amounts, and a
/// reader who reversed the sort to find the largest should not be handed the
/// empty ones instead. So the answer for a missing value is decided here, and
/// the direction turns only the rest round.
///
/// **Text compares case-insensitively.** `'a'.compareTo('B')` is positive by
/// code point, which puts every capitalised word above every lower-case one; a
/// list of names a reader cannot scan is a list that was sorted for the
/// machine. Accents are *not* folded, for the reason `internal/search.dart`
/// gives: Dart's core has no `String.normalize`, and this package has no
/// dependencies. The React build sorts them with `localeCompare` and the pages
/// say so.
int compareValues(Object? a, Object? b, [int direction = 1]) {
  final aMissing = a == null || a == '';
  final bMissing = b == null || b == '';

  if (aMissing || bMissing) {
    return aMissing && bMissing
        ? 0
        : aMissing
        ? 1
        : -1;
  }

  return _compareKnown(a, b) * direction;
}

/// Two values that are both there, ascending.
int _compareKnown(Object a, Object b) {
  if (a is num && b is num) {
    return a.compareTo(b);
  }

  if (a is bool && b is bool) {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }

  if (a is DateTime && b is DateTime) {
    return a.compareTo(b);
  }

  final aText = a.toString();
  final bText = b.toString();
  final folded = aText.toLowerCase().compareTo(bText.toLowerCase());

  // Same word, different case: fall back to the code points so the order is
  // stable rather than left to whichever row the sort happened to reach first.
  return folded != 0 ? folded : aText.compareTo(bText);
}

/// What pressing a column heading does next.
///
/// Ascending, then descending, then **off** — a third press puts the rows back
/// in the order they arrived in. That order is information: it is usually the
/// order the server chose, and a table that can never be put back has thrown it
/// away. Pressing a different column starts that column ascending rather than
/// inheriting the direction of the one before it.
MPSort? nextSort(MPSort? current, String key) {
  if (current == null || current.key != key) {
    return MPSort(key: key, direction: MPSortDirection.asc);
  }

  return current.direction == MPSortDirection.asc
      ? MPSort(key: key, direction: MPSortDirection.desc)
      : null;
}

/// The keys of every row between two of them, inclusive, in the order the rows
/// are currently in.
///
/// What a shift-click ticks. "Currently in" is the point: a reader dragging a
/// range down a sorted table means the rows they can see, not the rows the
/// unsorted list happens to hold between those two positions.
///
/// An unknown key selects nothing rather than throwing, because the anchor can
/// legitimately have been filtered away between the two presses.
List<K> keysBetween<K>(List<K> keys, K from, K to) {
  final start = keys.indexOf(from);
  final end = keys.indexOf(to);

  if (start == -1 || end == -1) {
    return <K>[];
  }

  return start <= end ? keys.sublist(start, end + 1) : keys.sublist(end, start + 1);
}

/// Which rows a page shows, as a `[start, end)` pair into the sorted set.
///
/// Clamped rather than trusted: a page number that has gone past the end — the
/// usual way being a filter that shortened the list under a reader sitting on
/// page nine — shows the last page instead of an empty table with a pager that
/// says there is something there.
(int, int) pageBounds(int total, int page, int pageSize) {
  final pages = (total / pageSize).ceil().clamp(1, 1 << 30);
  final current = page.clamp(1, pages);
  final start = (current - 1) * pageSize;

  return (start, (start + pageSize).clamp(0, total));
}
