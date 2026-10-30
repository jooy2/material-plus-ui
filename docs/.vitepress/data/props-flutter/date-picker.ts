import {
  colorRow,
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

/**
 * The rows the four pickers share, written here once and imported by the
 * other three picker files. Each is derived from the named component's React
 * row, which says the same thing on all four.
 */

/** `locale`, which reaches the dates as well as the words in Flutter too. */
export function localeRow(component: string): PropRow {
  return from(component, 'locale', {
    type: 'String?',
    description: {
      ko: 'BCP 47 태그. 월과 요일 이름, 헤더 두 버튼의 순서, 주의 첫날, 트리거가 날짜를 쓰는 방식, 컴포넌트가 스스로 하는 말을 정합니다. 날짜 이름은 라이브러리가 단어를 싣는 열여덟 개 언어의 표에서 읽습니다. 가장 가까운 `MPLocaleProvider`, `MPConfigProvider`, 앱의 `Localizations` 순으로 따릅니다',
      en: "A BCP 47 tag deciding the month and weekday names, the order of the header's two buttons, which day the week starts on, how the trigger writes the date, and the words the component says. The names come from the library's own table for each of the eighteen languages it ships words for. Falls back to the nearest `MPLocaleProvider`, then `MPConfigProvider`, then the app's `Localizations`"
    }
  });
}

/** `names`, the one row with no React counterpart. */
export const namesRow: PropRow = {
  name: 'names',
  type: 'MPDateNames?',
  description: {
    ko: '`locale`에 대한 라이브러리 표 대신 쓸 월·요일 이름과 날짜 모양. 라이브러리에 표가 없는 언어나, 날짜를 다르게 쓰는 지역(`en-GB`, `pt-PT`)에 넘깁니다',
    en: "The month and weekday names and the date shapes, in place of the library's own table for `locale`: for a language it has no table for, or a region that writes dates differently (`en-GB`, `pt-PT`)"
  }
};

export function weekStartsOnRow(component: string): PropRow {
  return from(component, 'weekStartsOn', {
    type: 'MPWeekday?',
    description: {
      ko: '주가 시작하는 요일. 빼면 로케일의 표가 정합니다',
      en: "Which day the week starts on. Left out, the locale's table decides"
    }
  });
}

export function labelsRow(component: string): PropRow {
  return from(component, 'labels', {
    type: 'Map<String, String>?',
    description: {
      ko: '컴포넌트가 스스로 하는 말을 `picker` 이름공간의 키로 덮어씁니다(`previousMonth`, `today`). 주지 않은 말은 `locale`의 번역, 그다음 영어를 따릅니다',
      en: 'Overrides for the words the component says on its own behalf, by key of the `picker` namespace (`previousMonth`, `today`). Whatever is not given falls back to the translation for `locale`, and then to English'
    }
  });
}

export function formatRow(component: string, en: string, ko: string): PropRow {
  return from(component, 'format', {
    type: 'String Function(DateTime)?',
    default: undefined,
    description: { ko, en }
  });
}

/** The controlled and uncontrolled value, under Flutter's names. */
export function valueRows(component: string, type: string, changed: string): PropRow[] {
  return [
    from(component, 'value', {
      type: `${type}?`,
      description: {
        ko: '고른 값. 주면 피커가 이 값을 보여 주고, 부모가 새로 넘긴 값(`null` 포함)이 피커가 들고 있던 값을 대신합니다',
        en: 'The chosen value. Given, the picker shows it, and a new value from the parent, `null` included, replaces whatever the picker held'
      }
    }),
    renamed(component, 'defaultValue', 'initialValue', { type: `${type}?` }),
    renamed(component, 'onValueChange', 'onChanged', { type: changed })
  ];
}

/** `open`, `defaultOpen` and `onOpenChange`. */
export function openRows(component: string): PropRow[] {
  return [
    from(component, 'open', { type: 'bool?' }),
    renamed(component, 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from(component, 'onOpenChange', { type: 'ValueChanged<bool>?' })
  ];
}

/** The shell: the label, the lines under it, the glyph, and the states. */
export function shellRows(component: string, glyph: { ko: string; en: string }): PropRow[] {
  return [
    from(component, 'label', { type: `${WIDGET}?` }),
    from(component, 'floatingLabel', { type: 'bool', default: 'true' }),
    from(component, 'description', { type: `${WIDGET}?` }),
    from(component, 'errorMessage', { type: `${WIDGET}?` }),
    from(component, 'startIcon', {
      type: `${WIDGET}?`,
      default: glyph.en,
      description: {
        ko: `값 앞에 놓이는 내용. 기본값은 ${glyph.ko}이고, \`null\`을 넘기면 글리프를 뺍니다`,
        en: `Content placed before the value. Defaults to ${glyph.en}, and \`null\` asks for none`
      }
    }),
    sizeRow(component),
    colorRow(component),
    from(component, 'fullWidth', { type: 'bool', default: 'false' }),
    {
      name: 'required',
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. 화면 낭독기와 라벨의 별표로 알리고, `MPForm` 안에서 비어 있으면 제출을 막습니다',
        en: 'Marks the picker required, to a screen reader and with an asterisk on the label. Inside an `MPForm`, an empty one holds the submit back'
      }
    },
    from(component, 'disabled', { type: 'bool', default: 'false' }),
    from(component, 'readOnly', { type: 'bool', default: 'false' })
  ];
}

/** `name`, which files the value with an `MPForm` rather than a hidden input. */
export function nameRow(component: string, en: string, ko: string): PropRow {
  return from(component, 'name', {
    type: 'String?',
    description: {
      ko: `\`MPForm\`이 값을 담는 이름. 값은 로컬 시각 기준의 ${ko} 문자열로 넘어갑니다`,
      en: `The name an \`MPForm\` files the value under, as ${en}, in local time`
    }
  });
}

/** What Flutter takes where React takes the raw DOM events. */
export const eventRows: PropRow[] = [
  semanticLabelRow,
  ...focusRows,
  {
    name: 'onKeyEvent',
    type: 'FocusOnKeyEventCallback?',
    description: {
      ko: '트리거에서 눌린 키 가운데 트리거가 스스로 처리하지 않는 키를 받습니다. React의 `onKeyDown`, `onKeyUp` 자리입니다',
      en: "Hears every key pressed on the trigger that the trigger does not answer itself. React's `onKeyDown` and `onKeyUp`"
    }
  },
  {
    name: 'onFocusChange',
    type: 'ValueChanged<bool>?',
    description: {
      ko: '트리거가 포커스를 받으면 `true`, 잃으면 `false`로 호출됩니다. React의 `onFocus`, `onBlur` 자리입니다',
      en: "Called with `true` when the trigger takes the focus and `false` when it loses it. React's `onFocus` and `onBlur`"
    }
  }
];

const listRow = (name: string, en: string, ko: string): PropRow => ({
  name,
  type: 'List<String>',
  default: 'English',
  description: { ko, en }
});

export default {
  MPDateNames: [
    listRow(
      'months',
      "The twelve month names in full, January first, as they stand on their own: the header's month button",
      '열두 달의 전체 이름, 1월부터. 홀로 서는 형태이며 헤더의 월 버튼이 씁니다'
    ),
    listRow(
      'monthsShort',
      'The same twelve, abbreviated. What the month grid draws',
      '같은 열두 달의 줄임 이름. 월 격자가 그립니다'
    ),
    {
      name: 'formatMonths',
      type: 'List<String>?',
      description: {
        ko: '날짜 안에서 쓰이는 달 이름. 달 이름이 격변화하는 언어용입니다(폴란드어 `lipiec`와 `7 lipca 2026`). 빼면 `months`',
        en: 'The month names as they are written inside a date, for a language that inflects them (Polish `lipiec` alone, `7 lipca 2026` in a date). Left out, `months`'
      }
    },
    {
      name: 'formatMonthsShort',
      type: 'List<String>?',
      description: {
        ko: '같은 것의 줄임 형태. 빼면 `monthsShort`',
        en: 'The same, abbreviated. Left out, `monthsShort`'
      }
    },
    listRow(
      'weekdays',
      'The seven weekday names in full, Sunday first whatever the week starts on',
      '요일의 전체 이름 일곱 개. 주의 첫날과 상관없이 일요일부터'
    ),
    listRow('weekdaysShort', 'The same seven, abbreviated', '같은 일곱 요일의 줄임 이름'),
    listRow(
      'weekdaysNarrow',
      "The same seven as narrow as the language writes them: the day grid's column headers. Each header is read out by its full name",
      '언어가 쓰는 가장 짧은 요일 이름. 일 격자의 열 머리글이며, 화면 낭독기는 전체 이름으로 읽습니다'
    ),
    {
      name: 'am',
      type: 'String',
      default: "'AM'",
      description: { ko: '하루의 앞 절반', en: 'The first half of the day, on a 12-hour clock' }
    },
    {
      name: 'pm',
      type: 'String',
      default: "'PM'",
      description: { ko: '하루의 뒤 절반', en: 'And the second' }
    },
    {
      name: 'monthBeforeYear',
      type: 'bool',
      default: 'true',
      description: {
        ko: '헤더가 월을 연도보다 먼저 쓰는지. `July 2026`과 `2026년 7월`의 차이입니다',
        en: 'Whether the header writes the month before the year: `July 2026` against `2026년 7월`'
      }
    },
    {
      name: 'firstDayOfWeek',
      type: 'MPWeekday',
      default: 'MPWeekday.sunday',
      description: {
        ko: '그 언어에서 주가 시작하는 요일. 피커의 `weekStartsOn`이 이깁니다',
        en: "Which day the week starts on in the language. A picker's own `weekStartsOn` wins"
      }
    },
    {
      name: 'hour12',
      type: 'bool',
      default: 'true',
      description: {
        ko: '그 언어가 12시간제 시계를 쓰는지. 피커의 `hour12`가 이깁니다',
        en: "Whether the language reads a clock on a 12-hour dial. A picker's own `hour12` wins"
      }
    },
    {
      name: 'patterns',
      type: 'MPDatePatterns',
      default: 'const MPDatePatterns()',
      description: {
        ko: '날짜와 시각을 쓰는 모양. ICU의 패턴 문자(`y`, `M`~`MMMM`, `L`, `d`, `E`, `h`, `K`, `H`, `mm`, `ss`, `a`, 작은따옴표 안의 글자)로 씁니다. `fullDate`, `mediumDate`, `yearMonth`, `year`, `time12`, `time24`와 초가 붙은 둘, 날짜와 함께 쓰는 `shortTime12`·`shortTime24`, 그리고 `{date}`와 `{time}`을 잇는 `dateTime`',
        en: "The shapes a date and a time are written in, in ICU's pattern letters (`y`, `M` to `MMMM`, `L`, `d`, `E`, `h`, `K`, `H`, `mm`, `ss`, `a`, and literals in single quotes): `fullDate`, `mediumDate`, `yearMonth`, `year`, `time12` and `time24` with and without seconds, `shortTime12` and `shortTime24` for the time beside a date, and `dateTime`, which joins `{date}` and `{time}`"
      }
    }
  ],
  MPDatePicker: [
    ...valueRows('MPDatePicker', 'DateTime', 'ValueChanged<DateTime?>?'),
    ...openRows('MPDatePicker'),
    from('MPDatePicker', 'precision', { type: 'MPDatePrecision', default: 'MPDatePrecision.day' }),
    from('MPDatePicker', 'defaultMonth', { type: 'DateTime?' }),
    from('MPDatePicker', 'minDate', { type: 'DateTime?' }),
    from('MPDatePicker', 'maxDate', { type: 'DateTime?' }),
    from('MPDatePicker', 'shouldDisableDate', { type: 'bool Function(DateTime)?' }),
    localeRow('MPDatePicker'),
    namesRow,
    weekStartsOnRow('MPDatePicker'),
    formatRow(
      'MPDatePicker',
      'How the trigger writes the chosen day: a function, since there is no `Intl` to hand options to. Left out, it follows `precision` — a medium date, the month and year, or the year, in the shape the locale writes them',
      '트리거가 고른 날을 쓰는 함수. 옵션을 넘길 `Intl`이 없어서 함수로 받습니다. 빼면 `precision`을 따라 중간 길이 날짜, 월과 연도, 연도를 로케일이 쓰는 모양대로 씁니다'
    ),
    from('MPDatePicker', 'placeholder', { type: 'String?' }),
    from('MPDatePicker', 'clearable', { type: 'bool', default: 'false' }),
    from('MPDatePicker', 'showTodayButton', { type: 'bool', default: 'true' }),
    from('MPDatePicker', 'closeOnSelect', { type: 'bool', default: 'true' }),
    labelsRow('MPDatePicker'),
    ...shellRows('MPDatePicker', { ko: '달력 글리프', en: 'the calendar glyph' }),
    nameRow(
      'MPDatePicker',
      '`YYYY-MM-DD`, or `YYYY-MM` and `YYYY` at a coarser `precision`',
      '`YYYY-MM-DD`(더 굵은 `precision`이면 `YYYY-MM`, `YYYY`)'
    ),
    ...eventRows
  ]
} satisfies Record<string, PropRow[]>;
