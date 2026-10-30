import { from, type PropRow } from './shared';
import {
  eventRows,
  formatRow,
  labelsRow,
  localeRow,
  nameRow,
  namesRow,
  openRows,
  shellRows,
  valueRows,
  weekStartsOnRow
} from './date-picker';

export default {
  MPDateTimePicker: [
    ...valueRows('MPDateTimePicker', 'DateTime', 'ValueChanged<DateTime?>?'),
    ...openRows('MPDateTimePicker'),
    from('MPDateTimePicker', 'defaultMonth', { type: 'DateTime?' }),
    from('MPDateTimePicker', 'minDate', { type: 'DateTime?' }),
    from('MPDateTimePicker', 'maxDate', { type: 'DateTime?' }),
    from('MPDateTimePicker', 'shouldDisableDate', { type: 'bool Function(DateTime)?' }),
    from('MPDateTimePicker', 'shouldDisableTime', {
      type: 'bool Function(DateTime, MPTimeUnit)?'
    }),
    from('MPDateTimePicker', 'hour12', { type: 'bool?' }),
    from('MPDateTimePicker', 'showSeconds', { type: 'bool', default: 'false' }),
    from('MPDateTimePicker', 'hourStep', { type: 'int', default: '1' }),
    from('MPDateTimePicker', 'minuteStep', { type: 'int', default: '1' }),
    from('MPDateTimePicker', 'secondStep', { type: 'int', default: '1' }),
    localeRow('MPDateTimePicker'),
    namesRow,
    weekStartsOnRow('MPDateTimePicker'),
    formatRow(
      'MPDateTimePicker',
      'How the trigger writes the chosen moment: a function, since there is no `Intl` to hand options to. Left out, a medium date and a short time, joined the way the locale joins them',
      '트리거가 고른 순간을 쓰는 함수. 옵션을 넘길 `Intl`이 없어서 함수로 받습니다. 빼면 중간 길이 날짜와 짧은 시각을 로케일이 잇는 방식대로 이어 씁니다'
    ),
    from('MPDateTimePicker', 'placeholder', { type: 'String?' }),
    from('MPDateTimePicker', 'clearable', { type: 'bool', default: 'false' }),
    from('MPDateTimePicker', 'showNowButton', { type: 'bool', default: 'true' }),
    from('MPDateTimePicker', 'closeOnSelect', { type: 'bool', default: 'false' }),
    labelsRow('MPDateTimePicker'),
    ...shellRows('MPDateTimePicker', { ko: '달력 글리프', en: 'the calendar glyph' }),
    nameRow('MPDateTimePicker', '`YYYY-MM-DDTHH:MM`', '`YYYY-MM-DDTHH:MM`'),
    ...eventRows
  ]
} satisfies Record<string, PropRow[]>;
