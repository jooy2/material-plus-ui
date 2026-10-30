import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/locales.dart';
import 'package:material_plus_ui/src/internal/i18n.dart';
import 'package:material_plus_ui/src/internal/messages.dart';

void main() {
  tearDown(resetMPMessages);

  test('speaks English until a language is registered', () {
    expect(mpResolveNamespace(mpCommonMessages, 'ko')['close'], 'Close');

    registerMPMessages(<MPLocale>[ko]);

    expect(mpResolveNamespace(mpCommonMessages, 'ko')['close'], '닫기');
  });

  test('matches the broadest registered tag', () {
    registerMPMessages(<MPLocale>[pt, zhHant]);

    expect(mpResolveNamespace(mpCommonMessages, 'pt-BR')['close'], pt.messages['common']!['close']);
    // An alias resolves to the table it was registered with.
    expect(
      mpResolveNamespace(mpCommonMessages, 'zh-TW')['close'],
      zhHant.messages['common']!['close'],
    );
    expect(
      mpResolveNamespace(mpCommonMessages, 'zh-Hant-HK')['close'],
      zhHant.messages['common']!['close'],
    );
  });

  test('falls back to English a namespace at a time', () {
    registerMPMessages(<MPLocale>[
      const MPLocale(
        locale: 'xx',
        messages: <String, Map<String, String>>{
          'common': <String, String>{'close': 'X'},
        },
      ),
    ]);

    final Map<String, String> common = mpResolveNamespace(mpCommonMessages, 'xx');

    expect(common['close'], 'X');
    expect(common['clear'], 'Clear');
    expect(mpResolveNamespace(mpPickerMessages, 'xx'), mpPickerMessages.en);
  });

  test('fills named placeholders, and leaves a missing one visible', () {
    expect(mpFillMessage('Remove {label}', <String, String>{'label': 'Tag'}), 'Remove Tag');
    expect(
      mpFillMessage('Page {page} of {total}', <String, String>{'page': '3'}),
      'Page 3 of {total}',
    );
  });

  test('every table uses only keys English has, with the same placeholders', () {
    const List<MPNamespace> english = <MPNamespace>[
      mpAlertMessages,
      mpAnchorMessages,
      mpBreadcrumbMessages,
      mpCarouselMessages,
      mpChartMessages,
      mpChatMessages,
      mpCodeMessages,
      mpColorPickerMessages,
      mpComboboxMessages,
      mpCommandMessages,
      mpCommonMessages,
      mpConfirmMessages,
      mpDataTableMessages,
      mpEmptyMessages,
      mpFilePickerMessages,
      mpLayoutMessages,
      mpNumberFieldMessages,
      mpOverlayMessages,
      mpPaginationMessages,
      mpPickerMessages,
      mpRatingMessages,
      mpScrollMessages,
      mpSparklineMessages,
      mpSpoilerMessages,
      mpTableMessages,
      mpTextFieldMessages,
      mpTextLinkMessages,
      mpTourMessages,
      mpTransferMessages,
      mpTextSelectionMessages,
    ];
    final Map<String, Map<String, String>> byName = <String, Map<String, String>>{
      for (final MPNamespace namespace in english) namespace.name: namespace.en,
    };
    final RegExp placeholder = RegExp(r'\{(\w+)\}');
    Set<String> holes(String text) => placeholder.allMatches(text).map((Match m) => m[1]!).toSet();

    expect(mpLocales, hasLength(18));

    for (final MPLocale locale in mpLocales) {
      for (final MapEntry<String, Map<String, String>> namespace in locale.messages.entries) {
        final Map<String, String>? en = byName[namespace.key];

        expect(en, isNotNull, reason: '${locale.locale}: no namespace ${namespace.key}');

        for (final MapEntry<String, String> entry in namespace.value.entries) {
          expect(
            en!.containsKey(entry.key),
            isTrue,
            reason: '${locale.locale}.${namespace.key}.${entry.key}',
          );
          expect(
            holes(entry.value),
            holes(en[entry.key]!),
            reason: '${locale.locale}.${namespace.key}.${entry.key}',
          );
        }
      }
    }
  });
}
