import { colorRow, from, renamed, sizeRow, type PropRow } from './shared';
import { labelsRow, localeRow, nameRow, namesRow, weekStartsOnRow } from './date-picker';

export default {
  MPCalendar: [
    from('MPCalendar', 'value', {
      type: 'DateTime?',
      description: {
        ko: '고른 날. 주면 달력이 이 날을 보여 주고, 부모가 새로 넘긴 값(`null` 포함)이 달력이 들고 있던 날을 대신합니다',
        en: 'The chosen day. Given, the calendar shows it, and a new value from the parent, `null` included, replaces whatever the calendar held'
      }
    }),
    renamed('MPCalendar', 'defaultValue', 'initialValue', { type: 'DateTime?' }),
    renamed('MPCalendar', 'onValueChange', 'onChanged', { type: 'ValueChanged<DateTime>?' }),
    from('MPCalendar', 'month', { type: 'DateTime?' }),
    from('MPCalendar', 'defaultMonth', { type: 'DateTime?' }),
    from('MPCalendar', 'onMonthChange', { type: 'ValueChanged<DateTime>?' }),
    from('MPCalendar', 'precision', { type: 'MPDatePrecision', default: 'MPDatePrecision.day' }),
    from('MPCalendar', 'minDate', { type: 'DateTime?' }),
    from('MPCalendar', 'maxDate', { type: 'DateTime?' }),
    from('MPCalendar', 'shouldDisableDate', { type: 'bool Function(DateTime)?' }),
    localeRow('MPCalendar'),
    namesRow,
    weekStartsOnRow('MPCalendar'),
    from('MPCalendar', 'showOutsideDays', { type: 'bool', default: 'true' }),
    from('MPCalendar', 'showPreviousButton', { type: 'bool', default: 'true' }),
    from('MPCalendar', 'showNextButton', { type: 'bool', default: 'true' }),
    renamed('MPCalendar', 'autoFocus', 'autofocus', { type: 'bool', default: 'false' }),
    from('MPCalendar', 'variant', { type: 'MPVariant', default: 'MPVariant.text' }),
    sizeRow('MPCalendar'),
    colorRow('MPCalendar'),
    labelsRow('MPCalendar'),
    nameRow(
      'MPCalendar',
      '`YYYY-MM-DD`, or `YYYY-MM` and `YYYY` at a coarser `precision`',
      '`YYYY-MM-DD`(더 굵은 `precision`이면 `YYYY-MM`, `YYYY`)'
    )
  ]
} satisfies Record<string, PropRow[]>;
