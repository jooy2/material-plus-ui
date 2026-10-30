/// The English words every component falls back to, one namespace each.
///
/// The same tables as `packages/react/src/internal/messages/`, under the same
/// names and keys, so a translation written for one package reads in the other.
/// A component names the namespace it speaks, which carries English with it;
/// see `internal/i18n.dart` for how a translation is merged over it.
library;

import 'package:material_plus_ui/src/internal/i18n.dart';

/// The `alert` namespace, in English.
const MPNamespace mpAlertMessages = MPNamespace('alert', <String, String>{'dismiss': 'Dismiss'});

/// The `anchor` namespace, in English.
const MPNamespace mpAnchorMessages = MPNamespace('anchor', <String, String>{
  'label': 'On this page',
});

/// The `breadcrumb` namespace, in English.
const MPNamespace mpBreadcrumbMessages = MPNamespace('breadcrumb', <String, String>{
  'label': 'Breadcrumb',
  'expand': 'Show hidden steps',
});

/// The `carousel` namespace, in English.
const MPNamespace mpCarouselMessages = MPNamespace('carousel', <String, String>{
  'label': 'Carousel',
  'previous': 'Previous slide',
  'next': 'Next slide',
  'slide': 'Slide {index} of {total}',
});

/// The `chart` namespace, in English.
const MPNamespace mpChartMessages = MPNamespace('chart', <String, String>{
  'label': 'Chart',
  'table': 'Chart data',
  'category': 'Category',
  'total': 'Total',
  'showAll': 'Show all',
});

/// The `chat` namespace, in English.
const MPNamespace mpChatMessages = MPNamespace('chat', <String, String>{
  'sending': 'Sending',
  'sent': 'Sent',
  'delivered': 'Delivered',
  'read': 'Read',
  'failed': 'Not sent',
  'typing': 'Typing',
});

/// The `code` namespace, in English.
const MPNamespace mpCodeMessages = MPNamespace('code', <String, String>{
  'copy': 'Copy',
  'copied': 'Copied',
  'copyFailed': 'Could not copy',
  'raw': 'Plain text',
  'label': 'Code',
});

/// The `colorPicker` namespace, in English.
const MPNamespace mpColorPickerMessages = MPNamespace('colorPicker', <String, String>{
  'area': 'Saturation and brightness',
  'hue': 'Hue',
  'alpha': 'Opacity',
  'value': 'Colour value',
  'swatches': 'Swatches',
  'clear': 'Clear',
  'empty': 'No colour',
});

/// The `combobox` namespace, in English.
const MPNamespace mpComboboxMessages = MPNamespace('combobox', <String, String>{
  'empty': 'No matches',
  'add': 'Add “{label}”',
});

/// The `command` namespace, in English.
const MPNamespace mpCommandMessages = MPNamespace('command', <String, String>{
  'label': 'Command palette',
  'search': 'Type a command or search…',
  'empty': 'No commands found',
});

/// The `common` namespace, in English.
const MPNamespace mpCommonMessages = MPNamespace('common', <String, String>{
  'close': 'Close',
  'clear': 'Clear',
  'open': 'Open',
  'remove': 'Remove',
  'removeNamed': 'Remove {label}',
  'loading': 'Loading',
  'required': 'Required',
});

/// The `confirm` namespace, in English.
const MPNamespace mpConfirmMessages = MPNamespace('confirm', <String, String>{
  'confirm': 'Confirm',
  'cancel': 'Cancel',
  'ok': 'OK',
});

/// The `dataTable` namespace, in English.
const MPNamespace mpDataTableMessages = MPNamespace('dataTable', <String, String>{
  'selectAll': 'Select all rows',
  'selectRow': 'Select row',
  'total': 'Rows: {total}',
  'selected': 'Selected: {count}',
  'download': 'Download CSV',
  'perPage': 'Rows per page',
  'resize': 'Resize column',
});

/// The `empty` namespace, in English.
const MPNamespace mpEmptyMessages = MPNamespace('empty', <String, String>{'title': 'Nothing here'});

/// The `filePicker` namespace, in English.
const MPNamespace mpFilePickerMessages = MPNamespace('filePicker', <String, String>{
  'prompt': 'Drop files here, or click to browse',
});

/// The `layout` namespace, in English.
const MPNamespace mpLayoutMessages = MPNamespace('layout', <String, String>{
  'skipToContent': 'Skip to content',
  'sidebar': 'Sidebar',
  'openSidebar': 'Open sidebar',
  'closeSidebar': 'Close sidebar',
  'resizeSidebar': 'Resize sidebar',
});

/// The `numberField` namespace, in English.
const MPNamespace mpNumberFieldMessages = MPNamespace('numberField', <String, String>{
  'increase': 'Increase',
  'decrease': 'Decrease',
});

/// The `overlay` namespace, in English.
const MPNamespace mpOverlayMessages = MPNamespace('overlay', <String, String>{'label': 'Overlay'});

/// The `pagination` namespace, in English.
const MPNamespace mpPaginationMessages = MPNamespace('pagination', <String, String>{
  'label': 'Pagination',
  'page': 'Page {page}',
  'status': 'Page {page} of {total}',
  'previous': 'Previous page',
  'next': 'Next page',
  'first': 'First page',
  'last': 'Last page',
});

/// The `picker` namespace, in English.
const MPNamespace mpPickerMessages = MPNamespace('picker', <String, String>{
  'previousMonth': 'Previous month',
  'nextMonth': 'Next month',
  'previousYear': 'Previous year',
  'nextYear': 'Next year',
  'previousYears': 'Previous years',
  'nextYears': 'Next years',
  'chooseMonth': 'Choose a month',
  'chooseYear': 'Choose a year',
  'today': 'Today',
  'thisMonth': 'This month',
  'thisYear': 'This year',
  'now': 'Now',
  'clear': 'Clear',
  'done': 'Done',
  'hour': 'Hour',
  'minute': 'Minute',
  'second': 'Second',
  'meridiem': 'AM/PM',
  'start': 'Start',
  'end': 'End',
});

/// The `rating` namespace, in English.
const MPNamespace mpRatingMessages = MPNamespace('rating', <String, String>{
  'label': 'Rating',
  'value': '{value} out of {max}',
  'empty': 'Not rated',
});

/// The `scroll` namespace, in English.
const MPNamespace mpScrollMessages = MPNamespace('scroll', <String, String>{
  'label': 'Scrollable content',
  'previous': 'Scroll back',
  'next': 'Scroll forward',
});

/// The `sparkline` namespace, in English.
const MPNamespace mpSparklineMessages = MPNamespace('sparkline', <String, String>{
  'summary': '{count} points, from {first} to {last}',
});

/// The `spoiler` namespace, in English.
const MPNamespace mpSpoilerMessages = MPNamespace('spoiler', <String, String>{
  'reveal': 'Reveal',
  'hide': 'Hide',
  'notice': 'Hidden so it is not read by accident',
});

/// The `table` namespace, in English.
const MPNamespace mpTableMessages = MPNamespace('table', <String, String>{'empty': 'No data'});

/// The `textField` namespace, in English.
const MPNamespace mpTextFieldMessages = MPNamespace('textField', <String, String>{
  'showPassword': 'Show the password',
  'hidePassword': 'Hide the password',
});

/// The `textLink` namespace, in English.
const MPNamespace mpTextLinkMessages = MPNamespace('textLink', <String, String>{
  'newTab': 'Opens in a new tab',
});

/// The `tour` namespace, in English.
const MPNamespace mpTourMessages = MPNamespace('tour', <String, String>{
  'previous': 'Back',
  'next': 'Next',
  'done': 'Done',
  'skip': 'Skip',
  'position': 'Step {index} of {total}',
});

/// The `transfer` namespace, in English.
const MPNamespace mpTransferMessages = MPNamespace('transfer', <String, String>{
  'source': 'Available',
  'target': 'Selected',
  'toTarget': 'Move to selected',
  'toSource': 'Move to available',
  'search': 'Search',
  'empty': 'Nothing here',
  'moved': 'Moved to {list}: {count}',
});
