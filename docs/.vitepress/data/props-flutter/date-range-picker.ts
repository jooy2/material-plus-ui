import { from, renamed, WIDGET, type PropRow } from './shared';
import {
  eventRows,
  formatRow,
  labelsRow,
  localeRow,
  nameRow,
  namesRow,
  openRows,
  shellRows,
  weekStartsOnRow
} from './date-picker';

export default {
  MPDateRangePicker: [
    from('MPDateRangePicker', 'value', {
      type: 'MPDateRange?',
      description: {
        ko: '고른 범위, `MPDateRange(start:, end:)`. 반쪽 범위도 실제 상태입니다. 주면 피커가 이 값을 보여 줍니다',
        en: 'The chosen range, `MPDateRange(start:, end:)`. Half a range is a real state. Given, the picker shows it'
      }
    }),
    renamed('MPDateRangePicker', 'defaultValue', 'initialValue', { type: 'MPDateRange?' }),
    renamed('MPDateRangePicker', 'onValueChange', 'onChanged', {
      type: 'ValueChanged<MPDateRange>?',
      description: {
        ko: '언제나 범위로 호출됩니다. 지운 범위는 `null`이 아니라 `MPDateRange.empty`입니다',
        en: 'Always called with a range. A cleared one is `MPDateRange.empty` rather than `null`'
      }
    }),
    ...openRows('MPDateRangePicker'),
    from('MPDateRangePicker', 'startPlaceholder', { type: 'String?' }),
    from('MPDateRangePicker', 'endPlaceholder', { type: 'String?' }),
    from('MPDateRangePicker', 'monthCount', { type: 'int', default: '2' }),
    from('MPDateRangePicker', 'presets', {
      type: 'List<MPDateRangePreset>',
      default: 'const []',
      description: {
        ko: '달력 옆에 놓이는 바로가기("최근 7일", "이번 달"). 오늘에 따라 달라지는 범위는 `MPDateRangePreset.computed`로 만듭니다',
        en: 'Shortcuts listed beside the calendars — "Last 7 days", "This month". A range that depends on today is an `MPDateRangePreset.computed`'
      }
    }),
    from('MPDateRangePicker', 'defaultMonth', { type: 'DateTime?' }),
    from('MPDateRangePicker', 'minDate', { type: 'DateTime?' }),
    from('MPDateRangePicker', 'maxDate', { type: 'DateTime?' }),
    from('MPDateRangePicker', 'shouldDisableDate', { type: 'bool Function(DateTime)?' }),
    localeRow('MPDateRangePicker'),
    namesRow,
    weekStartsOnRow('MPDateRangePicker'),
    formatRow(
      'MPDateRangePicker',
      'How the trigger writes each end: a function, since there is no `Intl` to hand options to. Left out, the medium date in the shape the locale writes it',
      '트리거가 양 끝을 쓰는 함수. 옵션을 넘길 `Intl`이 없어서 함수로 받습니다. 빼면 로케일이 쓰는 모양의 중간 길이 날짜입니다'
    ),
    from('MPDateRangePicker', 'clearable', { type: 'bool', default: 'false' }),
    from('MPDateRangePicker', 'closeOnSelect', { type: 'bool', default: 'true' }),
    labelsRow('MPDateRangePicker'),
    ...shellRows('MPDateRangePicker', { ko: '달력 글리프', en: 'the calendar glyph' }),
    nameRow(
      'MPDateRangePicker',
      'one ISO 8601 interval, `2026-07-03/2026-07-09`, once both ends are chosen',
      'ISO 8601 구간 하나(`2026-07-03/2026-07-09`), 양 끝을 모두 고른 뒤에만'
    ),
    ...eventRows
  ],
  MPDateRangePreset: [
    {
      name: 'label',
      type: WIDGET,
      required: true,
      description: {
        ko: '바로가기에 쓰는 말. 보통 `Text`입니다',
        en: 'What the shortcut says. Usually a `Text`'
      }
    },
    {
      name: 'value',
      type: 'MPDateRange',
      description: {
        ko: '움직이지 않는 범위. 기본 생성자로 줍니다',
        en: 'A range that does not move, given to the default constructor'
      }
    },
    {
      name: 'resolve',
      type: 'MPDateRange Function()',
      description: {
        ko: '누를 때 범위를 계산하는 함수. `MPDateRangePreset.computed`로 줍니다. 화면을 만들 때 한 번 계산한 "최근 7일"은 앱을 밤새 켜 둔 사람에게 틀린 범위가 됩니다',
        en: 'Works the range out when it is pressed, given to `MPDateRangePreset.computed`. "The last 7 days" worked out once, when the screen was built, is wrong for anyone who left the app open overnight'
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
