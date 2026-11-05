import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:material_plus_ui/src/internal/bidi.dart';

void main() {
  group('the direction a value is written in', () {
    test('is its first letter’s', () {
      expect(mpTextDirectionOf('Nov 5, 2026'), TextDirection.ltr);
      expect(mpTextDirectionOf('5 нояб. 2026 г.'), TextDirection.ltr);
      expect(mpTextDirectionOf('오후 3:30'), TextDirection.ltr);
      expect(mpTextDirectionOf('2026年11月5日'), TextDirection.ltr);
      expect(mpTextDirectionOf('٥ نوفمبر ٢٠٢٦'), TextDirection.rtl);
      expect(mpTextDirectionOf('5 בנובמבר 2026'), TextDirection.rtl);
    });

    test('passes over digits, punctuation and spaces', () {
      expect(mpTextDirectionOf('2026. 11. 5. PM'), TextDirection.ltr);
      expect(mpTextDirectionOf('07/07/2026 ص'), TextDirection.rtl);
    });

    test('is left to right when there is no letter at all', () {
      expect(mpTextDirectionOf('2026. 11. 5.'), TextDirection.ltr);
      expect(mpTextDirectionOf('٠٧/٠٧/٢٠٢٦'), TextDirection.ltr);
      expect(mpTextDirectionOf(''), TextDirection.ltr);
    });
  });
}
