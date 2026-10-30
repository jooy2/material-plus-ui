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
  valueRows
} from './date-picker';

export default {
  MPTimePicker: [
    ...valueRows('MPTimePicker', 'DateTime', 'ValueChanged<DateTime?>?'),
    ...openRows('MPTimePicker'),
    from('MPTimePicker', 'referenceDate', { type: 'DateTime?' }),
    from('MPTimePicker', 'minTime', { type: 'DateTime?' }),
    from('MPTimePicker', 'maxTime', { type: 'DateTime?' }),
    from('MPTimePicker', 'shouldDisableTime', { type: 'bool Function(DateTime, MPTimeUnit)?' }),
    from('MPTimePicker', 'hour12', { type: 'bool?' }),
    from('MPTimePicker', 'showSeconds', { type: 'bool', default: 'false' }),
    from('MPTimePicker', 'hourStep', { type: 'int', default: '1' }),
    from('MPTimePicker', 'minuteStep', { type: 'int', default: '1' }),
    from('MPTimePicker', 'secondStep', { type: 'int', default: '1' }),
    localeRow('MPTimePicker'),
    namesRow,
    formatRow(
      'MPTimePicker',
      'How the trigger writes the chosen time: a function, since there is no `Intl` to hand options to. Left out, the shape the locale writes a time in, on the dial `hour12` picks, with the seconds when they are shown',
      '트리거가 고른 시각을 쓰는 함수. 옵션을 넘길 `Intl`이 없어서 함수로 받습니다. 빼면 `hour12`가 고른 시계로, 로케일이 시각을 쓰는 모양대로 쓰고 초를 보일 때는 초까지 씁니다'
    ),
    from('MPTimePicker', 'placeholder', { type: 'String?' }),
    from('MPTimePicker', 'clearable', { type: 'bool', default: 'false' }),
    from('MPTimePicker', 'showNowButton', { type: 'bool', default: 'true' }),
    from('MPTimePicker', 'closeOnSelect', { type: 'bool', default: 'false' }),
    labelsRow('MPTimePicker'),
    ...shellRows('MPTimePicker', { ko: '시계 글리프', en: 'the clock glyph' }),
    nameRow(
      'MPTimePicker',
      '`HH:MM` (`HH:MM:SS` with `showSeconds`)',
      '`HH:MM`(`showSeconds`면 `HH:MM:SS`)'
    ),
    ...eventRows
  ]
} satisfies Record<string, PropRow[]>;
