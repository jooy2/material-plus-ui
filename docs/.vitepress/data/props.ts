/**
 * The props tables, as data.
 *
 * They live here rather than as Markdown tables for three reasons: a union type
 * like `'email' | 'password' | 'text'` does not have to be escaped one pipe at
 * a time, both locales come off one row — a Korean and an English table cannot
 * drift into listing different props — and a prop that several components share
 * is written once.
 *
 * Rendered by `theme/components/PropsTable.vue`.
 */

import type { Locale } from './i18n';

/** Every human-readable string in here is written twice, once per locale. */
type Text = Record<Locale, string>;

export interface PropRow {
  name: string;
  type: string;
  /** Omitted when the prop has no default — rendered as `—`. */
  default?: string;
  required?: boolean;
  description: Text;
}

const NODE = 'ReactNode';
const SIZE = "'xs' | 'sm' | 'md' | 'lg' | 'xl'";
const COLOR = "'primary' | 'secondary' | 'tertiary' | 'error'";
const VARIANT = "'filled' | 'tonal' | 'elevated' | 'outlined' | 'text'";

/**
 * The rows that are genuinely the same prop on more than one component.
 *
 * Written once and spread in, which is the whole reason this file is data. A
 * `size` that says one thing on a button and another on a checkbox is exactly
 * the drift `MPSize` exists to prevent, and two hand-written tables is how that
 * happens.
 */
const size: PropRow = {
  name: 'size',
  type: SIZE,
  default: "'md'",
  description: {
    ko: '컨트롤의 크기와 타입 스케일. `md`가 머터리얼 본래의 크기이고, 나머지 네 단계는 이 라이브러리의 것입니다',
    en: "The control's size and type scale. `md` is Material's own; the other four steps are this library's"
  }
};

const color: PropRow = {
  name: 'color',
  type: COLOR,
  default: "'primary'",
  description: {
    ko: '어떤 강조 색 계열을 읽을지. 임의의 색상값은 받지 않습니다 — `primary`가 무엇인지 바꾸려면 토큰을 설정하세요',
    en: 'Which accent family to read. Not an arbitrary colour: to change what `primary` *is*, set the token'
  }
};

const fullWidth: PropRow = {
  name: 'fullWidth',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '컨테이너 너비만큼 늘어납니다',
    en: 'Stretches the control to the width of its container'
  }
};

/* ---------------------------------------------------------------------------
 * Containers
 *
 * The components that are a box holding somebody else's content rather than the
 * thing being coloured. They share a `variant` whose `filled` is neutral, and
 * most of them share a `padded`. Written once for the reason `size` is: a
 * `variant` that means the accent on a card and a neutral surface on a box is
 * exactly the drift this file exists to prevent.
 * ------------------------------------------------------------------------- */

const containerVariant: PropRow = {
  name: 'variant',
  type: VARIANT,
  default: "'outlined'",
  description: {
    ko: '시트가 칠하는 면의 양. 컨테이너의 사다리라서 `filled`도 강조 색이 아니라 MD3의 filled 카드 표면인 `surface-container-highest`입니다 — 남의 내용을 담는 상자를 물들이면 그 내용의 배경이 물듭니다',
    en: "How much surface the sheet paints. A container's ladder, so even `filled` is neutral — MD3's own filled-card surface, `surface-container-highest`, rather than the accent: dyeing a box that holds somebody else's content dyes their content's background"
  }
};

const padded: PropRow = {
  name: 'padded',
  type: 'boolean',
  default: 'true',
  description: {
    ko: '내용 주위의 안쪽 여백. 가장자리까지 닿아야 하는 것 — 사진, 테이블, 자기 행을 그리는 리스트 — 에는 꺼 두세요',
    en: 'Inner padding around the content. Turn it off for something that should reach the edges — a picture, a table, a list that draws its own rows'
  }
};

const disabled: PropRow = {
  name: 'disabled',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '컨트롤을 비활성화하고 입력을 받지 않습니다',
    en: 'Greys the control out and stops it taking input'
  }
};

const readOnly: PropRow = {
  name: 'readOnly',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '값을 보여주되 바꾸지 못하게 합니다. `disabled`와 달리 탭 순서에 남습니다',
    en: 'Shows the value without allowing it to change. Unlike `disabled` it stays in the tab order'
  }
};

const required: PropRow = {
  name: 'required',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '필수 입력으로 표시합니다. 라벨과 보조기술 양쪽에 반영됩니다',
    en: 'Marks the control required, both to assistive technology and to the label'
  }
};

const name: PropRow = {
  name: 'name',
  type: 'string',
  description: {
    ko: '폼 컨트롤의 이름. native 컨트롤과 같습니다',
    en: 'Name of the form control, as on a native one'
  }
};

const id: PropRow = {
  name: 'id',
  type: 'string',
  description: {
    ko: '컨트롤에 붙고 라벨이 가리키는 id. 생략하면 자동 생성됩니다',
    en: 'The id put on the control and pointed at by the label. Generated when it is left out'
  }
};

const description: PropRow = {
  name: 'description',
  type: NODE,
  description: {
    ko: '컨트롤 아래 한 줄. `errorMessage`가 있으면 그쪽으로 대체됩니다',
    en: 'The line under the control. Replaced by `errorMessage` when there is one'
  }
};

const errorMessage: PropRow = {
  name: 'errorMessage',
  type: NODE,
  description: {
    ko: '컨트롤 아래 메시지. 이 값이 있으면 컨트롤 전체가 오류 상태가 되므로, 설명 없는 오류는 만들 수 없습니다',
    en: 'The message under the control. Its presence is what puts the whole control into its error state'
  }
};

/* ---------------------------------------------------------------------------
 * Motion
 *
 * The eleven `MPAnimate*` components take one set of settings, and it is
 * written once for the reason `size` is: a `delay` of 200 has to mean the same
 * thing on a fade and on a marquee, and eleven hand-written tables is how that
 * stops being true.
 *
 * `motion` is the whole set in the order a caller meets them — what it does,
 * how long, and then what makes it run. A component that genuinely cannot take
 * one of them filters it out rather than redescribing the rest.
 * ------------------------------------------------------------------------- */

const EASING =
  "'linear' | 'standard' | 'standard-decelerate' | 'standard-accelerate' | 'emphasized' | 'emphasized-decelerate' | 'emphasized-accelerate'";
const TRIGGER = "'mount' | 'visible' | 'hover' | 'manual'";
const REPEAT = "number | 'infinite'";

const animateDuration: PropRow = {
  name: 'duration',
  type: 'number',
  description: {
    ko: '한 번 도는 데 걸리는 시간(ms). 비워 두면 그 효과의 머터리얼 duration 토큰을 따르므로, 페이지가 모션 토큰을 바꾸면 같이 움직입니다',
    en: "How long one run takes, in milliseconds. Left unset it takes the effect's own Material duration token, so it moves when a page retunes its motion"
  }
};

const animateDelay: PropRow = {
  name: 'delay',
  type: 'number',
  default: '0',
  description: {
    ko: '시작하기 전 기다리는 시간(ms)',
    en: 'How long before it starts, in milliseconds'
  }
};

const animateEasing: PropRow = {
  name: 'easing',
  type: EASING,
  description: {
    ko: '어떤 머터리얼 이징 곡선을 탈지. 임의의 `cubic-bezier()`는 받지 않습니다 — `emphasized`가 무엇인지 바꾸려면 토큰을 설정하세요',
    en: 'Which Material easing curve it runs on. Not an arbitrary `cubic-bezier()`: to change what `emphasized` *is*, set the token'
  }
};

const animateRepeat: PropRow = {
  name: 'repeat',
  type: REPEAT,
  default: '1',
  description: {
    ko: "몇 번 도는지. `Infinity`가 아니라 `'infinite'`입니다 — CSS에 그 단어로 쓰이기 때문입니다",
    en: "How many times it runs. `'infinite'` rather than `Infinity`, because that is the word it is written into CSS as"
  }
};

const animateAlternate: PropRow = {
  name: 'alternate',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '한 번 걸러 거꾸로 돌립니다. 반복이 처음으로 튀지 않고 되돌아옵니다',
    en: 'Runs every other pass backwards, so a repeat returns instead of jumping'
  }
};

const animatePaused: PropRow = {
  name: 'paused',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '애니메이션을 그 자리에 붙들어 둡니다. 되감지 않습니다',
    en: 'Holds the animation where it is. It is not rewound'
  }
};

const animateTrigger: PropRow = {
  name: 'trigger',
  type: TRIGGER,
  default: "'mount'",
  description: {
    ko: '무엇이 시작시키는지 — 화면에 올라올 때, 스크롤로 보일 때, 포인터가 올라올 때, 또는 `play`로만',
    en: 'What starts it — being on the page, being scrolled into view, the pointer arriving, or nothing but `play`'
  }
};

const animatePlay: PropRow = {
  name: 'play',
  type: 'boolean',
  description: {
    ko: '`trigger="manual"`일 때 이것이 돌립니다. `false` → `true`마다 처음부터 다시 시작합니다',
    en: 'Runs it when `trigger` is `manual`. Each `false` → `true` starts it over'
  }
};

const animateOnce: PropRow = {
  name: 'once',
  type: 'boolean',
  default: 'true',
  description: {
    ko: '`trigger="visible"`일 때 처음 한 번만 돌릴지. 끄면 다시 보일 때마다 돕니다',
    en: 'With `trigger="visible"`, whether it runs only the first time. Off, it runs again on every return'
  }
};

const animateThreshold: PropRow = {
  name: 'threshold',
  type: 'number',
  default: '0.2',
  description: {
    ko: '`trigger="visible"`일 때 얼마나 보여야 보인 것으로 칠지, `0`부터 `1`까지',
    en: 'With `trigger="visible"`, how much has to be on screen before it counts, from `0` to `1`'
  }
};

/** Every setting an `MPAnimate*` takes, in the order a caller meets them. */
const motion: PropRow[] = [
  animateDuration,
  animateDelay,
  animateEasing,
  animateRepeat,
  animateAlternate,
  animatePaused,
  animateTrigger,
  animatePlay,
  animateOnce,
  animateThreshold
];

const animateRender: PropRow = {
  name: 'render',
  type: 'RenderProp',
  description: {
    ko: '`<div>` 아닌 것으로 렌더링합니다',
    en: 'Renders something other than a `<div>`'
  }
};

const animateMode: PropRow = {
  name: 'mode',
  type: "'in' | 'out'",
  default: "'in'",
  description: {
    ko: '내용이 도착하는지 떠나는지. 나가는 쪽이 더 짧습니다 — 머터리얼이 등장과 퇴장에 서로 다른 길이를 주기 때문입니다',
    en: 'Whether the content arrives or leaves. An exit is quicker than an entrance, which is the asymmetry Material asks for'
  }
};

/* ---------------------------------------------------------------------------
 * The pickers
 *
 * Four components with one vocabulary. Everything below is written once for the
 * same reason `size` is: a `locale` that means one thing on the date picker and
 * another on the clock is exactly the drift this file exists to prevent, and
 * four hand-written tables is how that happens.
 *
 * What is *not* here is anything whose meaning differs by component — `minDate`
 * is day-granular on `MPDatePicker` and read at full precision on
 * `MPDateTimePicker`, so it is written out on each of them rather than shared
 * under a description that would be wrong for one of the two.
 * ------------------------------------------------------------------------- */

const pickerLabel: PropRow = {
  name: 'label',
  type: NODE,
  description: {
    ko: '외곽선의 홈에 놓이는 라벨. 고른 값이 없고 포커스도 없고 앞에 글리프도 없는 동안에는 트리거 줄 위에 내려와 있습니다 — `floatingLabel` 참고',
    en: "Label in the outline's notch, resting on the trigger's own line while nothing is chosen, the popup is shut and there is no leading glyph — see `floatingLabel`"
  }
};

const pickerFloatingLabel: PropRow = {
  name: 'floatingLabel',
  type: 'boolean',
  default: 'true',
  description: {
    ko: '비어 있는 동안 라벨을 트리거 줄에 내려두고 포커스나 첫 선택에서 홈으로 올릴지 여부. 피커는 값 앞에 자기 글리프를 그리고 그 글리프가 바로 내려온 라벨이 설 자리이므로, 실제로는 `startIcon={null}`로 글리프를 뺀 피커에서만 동작합니다',
    en: "Whether the label rests on the trigger's line while it is empty and rises into the notch on focus or on the first choice. A picker draws its own glyph exactly where a resting label would stand, so in practice this only takes effect with `startIcon={null}`"
  }
};

const pickerStartIcon: PropRow = {
  name: 'startIcon',
  type: NODE,
  description: {
    ko: '값 앞에 놓이는 내용. 기본값은 피커 자신의 글리프(달력 또는 시계)이고, `null`을 주면 글리프가 사라집니다',
    en: "Content placed before the value. Defaults to the picker's own glyph — a calendar or a clock — and `null` is how that glyph is asked away"
  }
};

const pickerOpen: PropRow = {
  name: 'open',
  type: 'boolean',
  description: {
    ko: '팝업이 열려 있는지. `onOpenChange`와 함께 쓰면 controlled입니다',
    en: 'Whether the popup is open. Use with `onOpenChange` to control it'
  }
};

const pickerDefaultOpen: PropRow = {
  name: 'defaultOpen',
  type: 'boolean',
  default: 'false',
  description: { ko: '팝업이 처음에 열려 있을지', en: 'Whether it starts open' }
};

const pickerOnOpenChange: PropRow = {
  name: 'onOpenChange',
  type: '(open: boolean) => void',
  description: {
    ko: '팝업이 열리고 닫힐 때 호출됩니다',
    en: 'Called as the popup opens and closes'
  }
};

const pickerLocale: PropRow = {
  name: 'locale',
  type: 'string',
  description: {
    ko: 'BCP 47 태그. 월·요일 이름, 헤더 두 버튼의 순서, 주 시작 요일, 트리거의 날짜 표기를 결정합니다. 생략하면 가장 가까운 `MPLocaleProvider`, 그다음 플랫폼 기본값을 따릅니다',
    en: "A BCP 47 tag deciding the month and weekday names, the order of the header's two buttons, which day the week starts on, and how the trigger writes the value. Falls back to the nearest `MPLocaleProvider`, then to the platform's own"
  }
};

const pickerFormat: PropRow = {
  name: 'format',
  type: 'Intl.DateTimeFormatOptions',
  description: {
    ko: '트리거가 값을 쓰는 방식. `Intl`에 그대로 넘어가므로 `{ dateStyle: "full" }` 같은 것도 그대로 동작합니다',
    en: 'How the trigger writes the value. Passed straight to `Intl`, so `{ dateStyle: "full" }` works as written'
  }
};

const pickerPlaceholder: PropRow = {
  name: 'placeholder',
  type: NODE,
  description: {
    ko: '아무것도 고르지 않았을 때 트리거에 보이는 문구',
    en: 'Shown in the trigger while nothing is chosen'
  }
};

const pickerClearable: PropRow = {
  name: 'clearable',
  type: 'boolean',
  default: 'false',
  description: {
    ko: '값을 비우는 ×를 트리거에 답니다. 비어 있거나 읽기 전용일 때는 나타나지 않습니다',
    en: 'Offers the × that empties the control. It does not appear while the picker is empty, read only or disabled'
  }
};

const pickerLabels: PropRow = {
  name: 'labels',
  type: 'Partial<MPPickerLabels>',
  description: {
    ko: '피커가 스스로 지어내는 단어들의 개별 override. 지정하지 않은 것은 `locale`의 번역, 그다음 영어로 내려갑니다',
    en: 'Overrides for the words the picker says on its own behalf. Whatever is not given falls back to the translation for `locale`, and then to English'
  }
};

const pickerWeekStartsOn: PropRow = {
  name: 'weekStartsOn',
  type: '0 | 1 | 2 | 3 | 4 | 5 | 6',
  description: {
    ko: '주를 어느 요일부터 그릴지. `0`이 일요일이며, 생략하면 로케일이 말하는 값을 씁니다',
    en: 'Which day the week starts on — `0` is Sunday. Defaults to whatever the locale says'
  }
};

const pickerDefaultMonth: PropRow = {
  name: 'defaultMonth',
  type: 'Date',
  description: {
    ko: '값이 없을 때 달력이 열리는 달',
    en: 'Which month the calendar opens on when there is no value'
  }
};

const pickerShouldDisableDate: PropRow = {
  name: 'shouldDisableDate',
  type: '(date: Date) => boolean',
  description: {
    ko: '범위 안에 있지만 고를 수 없는 날을 막습니다 — 주말, 공휴일, 이미 예약된 방. 막힌 날도 지워지지 않고 그대로 그려집니다',
    en: 'Blocks individual days that are inside the range but still unavailable — weekends, holidays, a room already booked. A blocked day is still drawn'
  }
};

const pickerShouldDisableTime: PropRow = {
  name: 'shouldDisableTime',
  type: '(value: Date, unit: MPTimeUnit) => boolean',
  description: {
    ko: '시계의 개별 행을 막습니다. 각 열의 각 행마다 그 행이 만들어 낼 순간과 열 이름으로 호출됩니다',
    en: 'Blocks individual clock rows. Called once per row per column with the instant that row would produce and the column it is in'
  }
};

const pickerHour12: PropRow = {
  name: 'hour12',
  type: 'boolean',
  description: {
    ko: '12시간제 시계와 오전/오후 열. 생략하면 로케일이 쓰는 쪽을 따릅니다. 컬럼뿐 아니라 트리거 표기에도 함께 반영됩니다',
    en: 'A 12-hour dial with an AM/PM column. Defaults to whatever the locale does, and reaches the trigger as well as the columns'
  }
};

const pickerShowSeconds: PropRow = {
  name: 'showSeconds',
  type: 'boolean',
  default: 'false',
  description: { ko: '초 열을 추가합니다', en: 'Adds the seconds column' }
};

const pickerSteps: PropRow[] = [
  {
    name: 'hourStep',
    type: 'number',
    default: '1',
    description: { ko: '시 열의 간격', en: 'How far apart the rows of the hour column are' }
  },
  {
    name: 'minuteStep',
    type: 'number',
    default: '1',
    description: { ko: '분 열의 간격', en: 'How far apart the rows of the minute column are' }
  },
  {
    name: 'secondStep',
    type: 'number',
    default: '1',
    description: { ko: '초 열의 간격', en: 'How far apart the rows of the second column are' }
  }
];

/**
 * Where a caller's `className` and `style` land, for the components that draw
 * one element and put everything else inside it — which is most of them.
 */
const OUTERMOST: Text = {
  ko: '컴포넌트가 그리는 가장 바깥 엘리먼트에, 컴포넌트 자신의 클래스 뒤에 붙습니다',
  en: "Added to the outermost element the component draws, after the component's own classes"
};

/**
 * The components whose class lands somewhere else, and the reason there is a
 * list of them at all: a popup is **portalled**, so it is not inside the element
 * the trigger sits in and `OUTERMOST` would be describing a box the caller
 * cannot see. Where a component draws two things and only one of them is the
 * thing being styled — the word on a menu bar, the set rather than a segment —
 * it is named here too.
 *
 * This map is the only place to change that sentence. A `className` row written
 * into a table below is dropped, so that a component cannot end up with two.
 */
const CLASS_NAME_LANDS_ON: Record<string, Text> = {
  MPDialog: {
    ko: '대화상자의 시트에 붙습니다. 스크림도, 대화상자를 여는 트리거도 아닙니다',
    en: "Added to the dialog's own sheet — not the scrim, and not the trigger that opens it"
  },
  MPDrawer: {
    ko: '서랍의 패널에 붙습니다. 스크림이 아닙니다',
    en: "Added to the drawer's panel, not to the scrim"
  },
  MPOverlay: {
    ko: '오버레이의 내용이 가운데 놓이는 박스에 붙습니다. 스크림이 아닙니다',
    en: "Added to the box the overlay's content is centred in, not to the scrim"
  },
  MPCommandPalette: {
    ko: '팔레트의 패널에 붙습니다',
    en: "Added to the palette's panel"
  },
  MPMenu: {
    ko: '메뉴의 팝업에 붙습니다. 메뉴를 여는 트리거가 아닙니다',
    en: "Added to the menu's popup, not to the trigger that opens it"
  },
  MPContextMenu: {
    ko: '메뉴의 팝업에 붙습니다. 오른쪽 클릭을 받는 영역이 아닙니다',
    en: "Added to the menu's popup, not to the area that takes the right click"
  },
  MPMenuSubmenu: {
    ko: '하위 메뉴의 팝업에 붙습니다. 그것을 여는 행이 아닙니다',
    en: "Added to the submenu's popup, not to the row that opens it"
  },
  MPPopover: {
    ko: '팝오버의 패널에 붙습니다. 트리거가 아닙니다',
    en: "Added to the popover's panel, not to the trigger"
  },
  MPTooltip: {
    ko: '툴팁의 판에 붙습니다. 툴팁이 설명하는 엘리먼트가 아닙니다',
    en: "Added to the tooltip's plate, not to the element it describes"
  },
  MPMenubarMenu: {
    ko: '메뉴 바 위의 단어 — 메뉴를 여는 버튼 — 에 붙습니다. 열리는 메뉴가 아닙니다',
    en: 'Added to the word on the bar — the button that opens the menu — not to the menu it opens'
  },
  MPNavigationMenuItem: {
    ko: '행 안의 단어 — 링크이거나 패널을 여는 트리거 — 에 붙습니다. 패널이 아닙니다',
    en: 'Added to the word in the row — the link, or the trigger that opens the panel — not to the panel'
  },
  MPSegmentedButton: {
    ko: '세그먼트 하나가 아니라 세트 전체에 붙습니다',
    en: 'Added to the set rather than to a segment'
  }
};

/**
 * Which element each component puts a caller's raw event handlers on, for the
 * components that take them.
 *
 * A separate map from `CLASS_NAME_LANDS_ON` and deliberately so: a class
 * describes the whole component and lands on its outermost element, and an
 * event came from *one* element and lands on the control that produced it. On a
 * text field those are not the same box, which is the whole reason both
 * sentences have to be written down.
 *
 * Being in this map is also what puts the seven rows on a table at all. The
 * other components either already take every DOM prop — they extend
 * `React.ComponentPropsWithoutRef` and spread the rest onto an element they own
 * — or have no single element these would belong to.
 */
const EVENTS_LAND_ON: Record<string, Text> = {
  MPTextField: {
    ko: '`<input>`(여러 줄이면 `<textarea>`) 자체',
    en: 'the `<input>` itself — the `<textarea>`, on a multiline field'
  },
  MPNumberField: { ko: '숫자가 들어가는 `<input>`', en: 'the `<input>` the number goes into' },
  MPSelect: { ko: '목록을 여는 트리거 버튼', en: 'the trigger button that opens the list' },
  MPCombobox: { ko: '질의를 입력하는 `<input>`', en: 'the `<input>` the query is typed into' },
  MPDatePicker: { ko: '달력을 여는 트리거 버튼', en: 'the trigger button that opens the calendar' },
  MPDateRangePicker: {
    ko: '달력을 여는 트리거 버튼',
    en: 'the trigger button that opens the calendars'
  },
  MPDateTimePicker: {
    ko: '팝업을 여는 트리거 버튼',
    en: 'the trigger button that opens the popup'
  },
  MPTimePicker: { ko: '시계를 여는 트리거 버튼', en: 'the trigger button that opens the clock' },
  /*
   * The one entry that is not a control. A dialog's sheet is where a keystroke
   * inside the dialog arrives by bubbling, and the trigger that opened it and
   * the page behind it are both somewhere else.
   */
  MPDialog: { ko: '대화상자의 시트', en: 'the dialog’s sheet' }
};

/**
 * The seven of them, written once and put on whichever tables `EVENTS_LAND_ON`
 * names.
 *
 * `onKeyDown` carries the sentence the other six do not need: a caller's
 * handler runs before the component's own, so preventing the event is how a
 * combination is taken away from the control rather than merely observed.
 */
function eventRows(where: Text): PropRow[] {
  const on = (ko: string, en: string): Text => ({
    ko: `${where.ko}에서. ${ko}`,
    en: `${en}, on ${where.en}`
  });

  return [
    {
      name: 'onKeyDown',
      type: '(event: React.KeyboardEvent) => void',
      description: on(
        '수식 키를 포함한 모든 키 입력이라 조합을 다루는 자리입니다. 컴포넌트 자신의 처리보다 먼저 불리므로, `event.preventDefault()`가 그 키를 컴포넌트에게서 가져옵니다',
        'Every keystroke, modifiers included — the one to reach for for a combination. It runs before the component’s own handling, so `event.preventDefault()` takes the key away from the control'
      )
    },
    {
      name: 'onKeyUp',
      type: '(event: React.KeyboardEvent) => void',
      description: on('같은 키가 떨어질 때', 'The same keystroke released')
    },
    {
      name: 'onFocus',
      type: '(event: React.FocusEvent) => void',
      description: on(
        '컨트롤이 포커스를 가져갈 때. 옆의 버튼이 가져가는 포커스는 여기 오지 않습니다',
        'The control took the focus — never the button beside it taking it'
      )
    },
    {
      name: 'onBlur',
      type: '(event: React.FocusEvent) => void',
      description: on(
        '컨트롤이 포커스를 잃을 때. 폼 라이브러리의 touched 처리가 기다리는 짝입니다',
        'It lost the focus — the half a form library’s "touched" bookkeeping waits for'
      )
    },
    {
      name: 'onClick',
      type: '(event: React.MouseEvent) => void',
      description: on(
        '누를 때. 컴포넌트 자신의 반응은 그대로 일어납니다',
        'A press. The component’s own answer to a press still happens'
      )
    },
    {
      name: 'onDoubleClick',
      type: '(event: React.MouseEvent) => void',
      description: on('두 번 누를 때', 'Two presses')
    },
    {
      name: 'onContextMenu',
      type: '(event: React.MouseEvent) => void',
      description: on(
        '오른쪽 클릭. `event.preventDefault()`로 브라우저 메뉴를 자신의 것으로 바꿉니다',
        'The right-click. `event.preventDefault()` is how the browser’s menu is replaced with one of yours'
      )
    }
  ];
}

/**
 * The caveat that goes on every `className` row, said once.
 *
 * It is the one thing about this prop a caller has to know before reaching for
 * it, and it is not obvious: two Tailwind utilities of equal specificity are
 * resolved by their order in the generated stylesheet, so passing `px-8` to a
 * component that already sets `px-6` may or may not do anything.
 */
const CONCATENATED: Text = {
  ko: '병합이 아니라 이어 붙이기입니다 — 같은 속성을 지정하는 두 유틸리티가 어떻게 결정되는지는 시작하기 가이드의 `클래스와 스타일`을 보세요',
  en: 'Concatenated rather than merged — see `Class names and styles` in the getting started guide for what decides between two utilities that set the same property'
};

function classNameRow(where: Text): PropRow {
  return {
    name: 'className',
    type: 'string',
    description: {
      ko: `${where.ko}. ${CONCATENATED.ko}`,
      en: `${where.en}. ${CONCATENATED.en}`
    }
  };
}

const styleRow: PropRow = {
  name: 'style',
  type: 'React.CSSProperties',
  description: {
    ko: '같은 엘리먼트에 붙는 인라인 스타일이며, 컴포넌트가 거기에 지정해 둔 것 위에 덮입니다. 인라인은 어떤 스타일시트보다 우선하므로, 인스턴스 하나에만 토큰을 넘기는 길입니다',
    en: 'Inline styles for the same element, spread over whatever the component set there. Inline beats any stylesheet, which is what makes this the way to hand a token to one instance rather than to the theme'
  }
};

/**
 * The tables that describe something with no element behind it, and so take
 * neither prop: two providers that render only their children, and three plain
 * objects that are entries in somebody else's array.
 */
const NO_ELEMENT = new Set([
  'MPConfigProvider',
  'MPConfirmProvider',
  'MPConfirmOptions',
  'MPLocaleProvider',
  'MPSnackbarProvider',
  'MPSnackbarOptions',
  'MPTableColumn',
  'MPComboboxOption'
]);

const componentTables: Record<string, PropRow[]> = {
  MPIcon: [
    {
      name: 'icon',
      type: 'MPIconGlyph',
      required: true,
      description: {
        ko: '그릴 글리프. 아이콘 세트의 컴포넌트(`ICONS.search`)이거나 직접 만든 엘리먼트(`<svg>…</svg>`)입니다',
        en: 'The glyph to draw: a component from an icon set (`ICONS.search`), or an element of your own (`<svg>…</svg>`)'
      }
    },
    {
      name: 'size',
      type: 'number | string',
      description: {
        ko: '글리프가 그려지는 박스. 숫자는 CSS 픽셀, 문자열은 임의의 CSS 길이입니다. 지정하지 않으면 글리프 자신의 크기로 그려집니다',
        en: 'The box the glyph is drawn in. A number is CSS pixels, a string is any CSS length. Left unset the glyph draws at its own size'
      }
    },
    {
      name: 'color',
      type: 'string',
      description: {
        ko: '임의의 CSS 색상. 지정하지 않으면 아이콘이 놓인 자리의 색을 그대로 물려받습니다',
        en: 'Any CSS colour. Left unset the icon inherits the colour of whatever it sits in'
      }
    },
    {
      name: 'strokeWidth',
      type: 'number | string',
      description: {
        ko: '선 두께. 컴포넌트로 넘긴 글리프에만 전달되며, 이미 그려진 엘리먼트는 무시합니다',
        en: 'Stroke width, forwarded to a glyph given as a component. Ignored by an element, which is already drawn'
      }
    },
    {
      name: 'center',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '그리드나 flex 트랙 안에서 아이콘을 가운데로 보냅니다',
        en: 'Centres the icon in its grid or flex track'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '아이콘이 전달하는 의미. 지정하면 `role="img"`으로 읽히고, 지정하지 않으면 접근성 트리에서 완전히 빠집니다',
        en: 'What the icon says. With it the icon is announced as an image; without it the icon leaves the accessibility tree entirely'
      }
    }
  ],

  MPTextField: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description: {
        ko: '필드의 텍스트. controlled 컴포넌트이며, 조합 중일 때만 예외적으로 입력된 값이 그대로 보입니다',
        en: "The field's text. A controlled component — what is shown is what is passed, except during composition"
      }
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: {
        ko: '값이 바뀔 때마다 호출됩니다. 조합 중인 키 입력도 포함되며, 이벤트가 아니라 문자열을 받습니다',
        en: 'Called with the text on every change, including each keystroke of a composition. A string, not an event'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '필드의 라벨. 외곽선의 홈에 그려지되, 필드가 비어 있고 포커스도 없고 `startIcon`도 없는 동안에는 필드 줄 위 플레이스홀더 자리에 내려와 있습니다 — `floatingLabel` 참고',
        en: "Label for the field, drawn in the outline's notch and resting on the field's own line — where a placeholder would be — while it is empty, unfocused and has no `startIcon`. See `floatingLabel`"
      }
    },
    {
      name: 'floatingLabel',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '비어 있는 동안 라벨을 필드 줄에 내려두고 포커스나 첫 글자에서 홈으로 올릴지 여부. `false`면 홈에 고정됩니다. `startIcon`이 있으면 그 글리프가 내려온 라벨이 설 자리를 이미 차지하므로 언제나 홈에 있습니다',
        en: "Whether the label rests on the field's line while it is empty and rises into the notch on focus or on the first character. `false` pins it in the notch. A `startIcon` holds it up regardless — the glyph already stands where a resting label would"
      }
    },
    {
      name: 'type',
      type: "'email' | 'password' | 'search' | 'text'",
      default: "'text'",
      description: {
        ko: '어떤 컨트롤을 그릴지. `password`는 모양만이 아니라 동작도 달라져서, 끝에 표시/숨김 토글이 생깁니다. `search`는 소환되는 키보드와 자동완성이 달라지는 것이고 그리는 모습은 `text`와 같습니다 — 브라우저가 넣는 ×는 지워집니다',
        en: 'Which control to draw. `password` also changes behaviour: it grows a reveal toggle in the trailing adornment. `search` is for the keyboard it summons and the autofill it declines and draws exactly as `text` does — the browser’s own × is suppressed'
      }
    },
    {
      name: 'errorMessage',
      type: 'string',
      default: "''",
      description: {
        ko: '필드 아래 메시지. 이 값이 있으면 필드 전체가 오류 상태가 되므로, 설명 없는 오류는 만들 수 없습니다',
        en: 'The message under the field. Its presence is what puts the whole field into its error state'
      }
    },
    {
      name: 'name',
      type: 'string',
      description: {
        ko: '폼 컨트롤의 이름. native `<input>`과 같습니다',
        en: 'Name of the form control, as on a native `<input>`'
      }
    },
    {
      name: 'placeholder',
      type: 'string',
      description: {
        ko: '필드가 비어 있을 때 보이는 안내 문구',
        en: 'Placeholder shown while the field is empty'
      }
    },
    {
      name: 'autoComplete',
      type: 'string',
      description: {
        ko: "native `autocomplete` 토큰 — `'email'`, `'current-password'`, `'off'` 등",
        en: "Native `autocomplete` token — `'email'`, `'current-password'`, `'off'`"
      }
    },
    {
      name: 'rows',
      type: 'number',
      description: {
        ko: '지정하면 `<input>` 대신 이만큼의 줄을 가진 `<textarea>`를 그립니다',
        en: 'Renders a `<textarea>` of this many rows instead of an `<input>`'
      }
    },
    {
      name: 'resizable',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '여러 줄 필드의 높이를 사용자가 드래그해서 늘릴 수 있게 합니다. `rows` 없이는 의미가 없습니다',
        en: 'Lets the reader drag a multiline field taller. Ignored without `rows`'
      }
    },
    {
      name: 'maxLength',
      type: 'number',
      description: {
        ko: '받아들일 문자 수의 상한',
        en: 'Caps the number of characters the field will accept'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '텍스트 앞에 놓이는 내용. 보통 `MPIcon`입니다',
        en: 'Content placed before the text — an `MPIcon`, usually'
      }
    },
    {
      name: 'size',
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: "'md'",
      description: {
        ko: '컨트롤의 높이와 타입 스케일. `md`가 머터리얼 본래의 56px이고, 나머지 네 단계는 이 라이브러리의 것입니다',
        en: "The control's height and type scale. `md` is Material's own 56px; the other four steps are this library's"
      }
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '컨테이너 너비만큼 늘어납니다',
        en: 'Stretches the field to the width of its container'
      }
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '필수 입력으로 표시합니다. 라벨과 보조기술 양쪽에 반영됩니다',
        en: 'Marks the field required, both to assistive technology and to the label'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '필드를 비활성화하고 입력을 받지 않습니다',
        en: 'Greys the field out and stops it taking input'
      }
    },
    {
      name: 'readOnly',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '값을 보여주되 수정은 막습니다. `disabled`와 달리 텍스트를 선택할 수 있고 탭 순서에도 남습니다',
        en: 'Shows the value without allowing edits. Unlike `disabled` the text stays selectable and the field stays in the tab order'
      }
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '마운트 시 포커스를 줍니다. 다만 작은 화면에서는 키보드가 올라오는 것을 막기 위해 건너뜁니다',
        en: 'Focuses the field on mount — except on a small screen, where it would summon the on-screen keyboard'
      }
    },
    {
      name: 'onSubmit',
      type: '() => void',
      description: {
        ko: 'Enter를 눌렀을 때 호출됩니다. **이걸 넘기는 것이 필드가 그 키를 가져가는 조건**이고, 그때만 한 줄 필드에서 Enter가 삼켜져 폼이 두 번 제출되지 않습니다. 넘기지 않으면 Enter는 브라우저의 것 — `<form>` 안이라면 원래대로 폼이 제출됩니다',
        en: 'Called when Enter is pressed. **Passing it is what makes the field take the key**: only then is Enter swallowed on a single-line field, so a form is submitted once rather than also natively. Without it the keystroke is left to the browser, which inside a `<form>` is the native submit'
      }
    },
    {
      name: 'disableEnterKey',
      type: 'boolean',
      default: 'false',
      description: {
        ko: 'Enter를 원래 가져갈 쪽에게서 뺏습니다. `rows`가 있으면 줄바꿈이, 한 줄 필드에서는 둘러싼 폼의 제출이 그 대상입니다',
        en: 'Takes the Enter key away from whatever would otherwise have it — the newline with `rows`, the surrounding form’s submit on a single-line field'
      }
    },
    {
      name: 'onFormReset',
      type: '() => void',
      description: {
        ko: '모든 변경 직전, `onChange`보다 먼저 호출됩니다. 수정으로 무의미해진 폼 오류를 지우는 용도입니다',
        en: 'Called before every change, ahead of `onChange`. For clearing a form-level error that a further edit has made stale'
      }
    },
    {
      name: 'id',
      type: 'string',
      description: {
        ko: '컨트롤에 붙고 라벨이 가리키는 id. 생략하면 자동 생성됩니다',
        en: 'The id put on the control and pointed at by the label. Generated when it is left out'
      }
    }
  ],

  MPButton: [
    {
      name: 'variant',
      type: "'filled' | 'tonal' | 'elevated' | 'outlined' | 'text'",
      default: "'filled'",
      description: {
        ko: '버튼이 칠하는 면의 양. 순서대로 목소리가 작아집니다',
        en: 'How much surface the button paints. They are written in the order they get quieter'
      }
    },
    color,
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '라벨. 비워 두면 정사각형 아이콘 버튼이 되므로 `aria-label`을 주세요',
        en: 'The label. Left empty the button goes square, so give it an `aria-label`'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '라벨 앞에 놓이는 내용',
        en: 'Content placed before the label'
      }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: {
        ko: '라벨 뒤에 놓이는 내용',
        en: 'Content placed after the label'
      }
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`startIcon` 자리에 스피너를 넣고 클릭을 막습니다. `disabled`가 아니므로 포커스는 그대로 남습니다',
        en: 'Swaps `startIcon` for a spinner and stops the click. Not `disabled`, so the focus stays where it was'
      }
    },
    {
      name: 'loadingLabel',
      type: 'string',
      default: "'Loading'",
      description: {
        ko: '`loading` 중 스피너가 읽히는 이름',
        en: 'The accessible name of the spinner, announced while `loading`'
      }
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: {
        ko: 'native 버튼의 기본값은 `submit`이라 폼 안의 모든 버튼이 폼을 제출하게 됩니다. 그래서 여기서는 `button`입니다',
        en: 'A native button defaults to `submit`, which turns every button inside a form into one that submits it'
      }
    },
    {
      name: 'render',
      type: 'ReactElement | ((props, state) => ReactElement)',
      description: {
        ko: '`<button>` 대신 다른 엘리먼트를 그리면서 표면은 그대로 둡니다. 버튼처럼 보이는 링크가 이 prop이 있는 이유이고, 그때는 `nativeButton={false}`와 `role="link"`가 함께 필요합니다 — `nativeButton` 참고',
        en: 'Renders something other than a `<button>` while keeping the whole surface. A link wearing a button is the reason it exists, and that takes `nativeButton={false}` and `role="link"` with it — see `nativeButton`'
      }
    },
    {
      name: 'nativeButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '`render`가 진짜 `<button>`을 그리는지. `false`면 Base UI가 버튼의 semantics를 대신 붙이는데, 여기에는 `role="button"`도 들어갑니다 — 앵커에는 한 가지 과한 가정이라 `role="link"`를 함께 주세요',
        en: 'Whether `render` produces a real `<button>`. `false` has Base UI supply the button semantics instead, `role="button"` among them — which for an anchor is one assumption too many, so pass `role="link"` alongside it'
      }
    },
    size,
    fullWidth,
    disabled
  ],

  MPButtonGroup: [
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`MPButton`들. 진짜 버튼이며, 그룹은 선택 상태를 관리하지 않습니다',
        en: 'The `MPButton`s. They stay real buttons — the group does not manage selection'
      }
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '버튼이 놓이는 방향',
        en: 'Which way the buttons run'
      }
    },
    {
      name: 'variant',
      type: "'filled' | 'tonal' | 'elevated' | 'outlined' | 'text'",
      description: {
        ko: '그룹 안 모든 버튼에 전달됩니다. 버튼 자신의 prop이 우선합니다',
        en: "Passed to every button in the group. A button's own prop still wins"
      }
    },
    { ...color, default: undefined },
    { ...size, default: undefined },
    {
      name: 'disabled',
      type: 'boolean',
      description: {
        ko: '그룹 안 모든 버튼을 한 번에 비활성화합니다',
        en: 'Disables every button in the group at once'
      }
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '컨테이너 너비를 버튼들이 균등하게 나눠 갖습니다',
        en: 'Stretches to the container and divides the width evenly between the buttons'
      }
    }
  ],

  MPSelect: [
    {
      name: 'items',
      type: 'MPSelectOption[]',
      required: true,
      description: {
        ko: '옵션 목록. `{ value, label?, disabled? }` 배열입니다. 컴포지션이 아니라 데이터인 이유는 닫힌 트리거도 고른 옵션의 *라벨*을 보여줘야 하기 때문입니다',
        en: 'The options, as `{ value, label?, disabled? }`. Data rather than composed children, because a closed trigger has to show the chosen option’s *label*'
      }
    },
    {
      name: 'value',
      type: 'string | number | null',
      description: {
        ko: '고른 값. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'The chosen value. Use with `onValueChange` for a controlled select'
      }
    },
    {
      name: 'defaultValue',
      type: 'string | number | null',
      description: {
        ko: '처음 고른 값. uncontrolled일 때 씁니다',
        en: 'The value chosen at the start, for an uncontrolled select'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string | number | null) => void',
      description: {
        ko: '새로 고른 값으로 호출됩니다. 이벤트가 아니라 값입니다',
        en: 'Called with the newly chosen value — a value, not an event'
      }
    },
    {
      name: 'placeholder',
      type: NODE,
      description: {
        ko: '아무것도 고르지 않았을 때 트리거에 보이는 문구',
        en: 'Shown in the trigger while nothing is chosen'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '외곽선의 홈에 놓이는 라벨. 고른 값이 없고 팝업도 닫혀 있고 `startIcon`도 없는 동안에는 트리거 줄 위 플레이스홀더 자리에 내려와 있습니다 — `floatingLabel` 참고',
        en: "Label in the outline's notch, resting on the trigger's own line — where the placeholder would be — while nothing is chosen, the popup is shut and there is no `startIcon`. See `floatingLabel`"
      }
    },
    {
      name: 'floatingLabel',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '비어 있는 동안 라벨을 트리거 줄에 내려두고 포커스나 첫 선택에서 홈으로 올릴지 여부. `false`면 홈에 고정됩니다. `startIcon`이 있으면 언제나 홈에 있습니다',
        en: "Whether the label rests on the trigger's line while nothing is chosen and rises into the notch on focus or on the first choice. `false` pins it in the notch, and a `startIcon` holds it up regardless"
      }
    },
    description,
    errorMessage,
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '값 앞에 놓이는 내용. 보통 `MPIcon`입니다',
        en: 'Content placed before the value — an `MPIcon`, usually'
      }
    },
    size,
    fullWidth,
    required,
    disabled,
    readOnly,
    name,
    id
  ],

  MPNumberField: [
    {
      name: 'value',
      type: 'number | null',
      description: {
        ko: '값. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'The number. Use with `onValueChange` for a controlled field'
      }
    },
    {
      name: 'defaultValue',
      type: 'number',
      description: {
        ko: '처음 값. uncontrolled일 때 씁니다',
        en: 'The starting number, for an uncontrolled field'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: number | null) => void',
      description: {
        ko: '입력·스텝·휠 등 모든 변경마다 호출됩니다',
        en: 'Called on every change — typing, stepping, the wheel'
      }
    },
    {
      name: 'onValueCommitted',
      type: '(value: number | null) => void',
      description: {
        ko: '값이 확정될 때 호출됩니다. 타이핑 후 blur, 포인터를 뗀 시점, 키보드 조작 시점입니다',
        en: 'Called when the value settles: on blur after typing, on pointer release, and with every keyboard step'
      }
    },
    {
      name: 'min',
      type: 'number',
      description: {
        ko: '범위의 아래쪽 끝. 여기서 스텝이 멈춥니다',
        en: 'The bottom of the range. Stepping stops here'
      }
    },
    {
      name: 'max',
      type: 'number',
      description: { ko: '범위의 위쪽 끝', en: 'The top of the range' }
    },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: { ko: '한 번에 움직이는 폭', en: 'How far one step goes' }
    },
    {
      name: 'largeStep',
      type: 'number',
      default: '10',
      description: { ko: 'Shift를 누른 채 움직이는 폭', en: 'The step taken while Shift is held' }
    },
    {
      name: 'smallStep',
      type: 'number',
      default: '0.1',
      description: { ko: 'Alt를 누른 채 움직이는 폭', en: 'The step taken while Alt is held' }
    },
    {
      name: 'allowWheelScrub',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '포커스된 필드 위에서 휠로 값을 바꿀지. 기본은 꺼짐 — 페이지 스크롤과 같은 동작인데 의도한 쪽은 하나뿐입니다',
        en: 'Whether the wheel changes the value. Off by default: scrolling the page and changing the field are the same gesture, and only one was meant'
      }
    },
    {
      name: 'format',
      type: 'Intl.NumberFormatOptions',
      description: {
        ko: '숫자를 쓰는 방식 — 통화, 백분율, 소수 자릿수. `$1,240.00`으로 보여주면서 값은 `1240`으로 유지합니다',
        en: 'How the number is written — currency, percent, decimal places. Shows `$1,240.00` and still reports `1240`'
      }
    },
    {
      name: 'locale',
      type: 'Intl.LocalesArgument',
      description: {
        ko: '숫자를 쓰고 읽는 로케일. 기본은 런타임의 것입니다',
        en: "Which locale the number is written and parsed in. Defaults to the runtime's"
      }
    },
    {
      name: 'steppers',
      type: "'end' | 'split' | 'none'",
      default: "'end'",
      description: {
        ko: '증감 버튼의 위치. `split`은 숫자를 가운데 두고 양쪽에, `none`은 버튼 없이 — 화살표 키와 범위 제한은 그대로입니다',
        en: 'Where the steppers sit. `split` puts one either side of the number; `none` drops them, and the arrow keys and clamping stay'
      }
    },
    {
      name: 'incrementLabel',
      type: 'string',
      default: "'Increase'",
      description: {
        ko: '증가 버튼이 읽히는 이름',
        en: 'The accessible name of the increment button'
      }
    },
    {
      name: 'decrementLabel',
      type: 'string',
      default: "'Decrease'",
      description: {
        ko: '감소 버튼이 읽히는 이름',
        en: 'The accessible name of the decrement button'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '외곽선의 홈에 놓이는 라벨. 숫자가 없고 포커스도 없고 앞에 아무것도 서 있지 않은 동안에는 필드 줄 위에 내려와 있습니다 — `floatingLabel` 참고',
        en: "Label in the outline's notch, resting on the field's own line while it holds no number, is unfocused and has nothing standing at its start. See `floatingLabel`"
      }
    },
    {
      name: 'floatingLabel',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '비어 있는 동안 라벨을 필드 줄에 내려두고 포커스나 첫 숫자에서 홈으로 올릴지 여부. `false`면 홈에 고정됩니다. `startIcon`이나 `steppers="split"`의 빼기 버튼이 같은 자리에 서므로 그때도 홈에 있습니다',
        en: 'Whether the label rests on the field\'s line while it is empty and rises into the notch on focus or on the first digit. `false` pins it in the notch, and so does anything standing in the resting label\'s place — a `startIcon`, or the minus of `steppers="split"`'
      }
    },
    description,
    errorMessage,
    {
      name: 'placeholder',
      type: 'string',
      description: {
        ko: '필드가 비어 있을 때 보이는 문구',
        en: 'Placeholder shown while the field is empty'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '숫자 앞에 놓이는 내용 — 통화 기호, 단위, 아이콘',
        en: 'Content placed before the number — a currency mark, a unit, an icon'
      }
    },
    size,
    fullWidth,
    required,
    disabled,
    {
      ...readOnly,
      description: {
        ko: '숫자를 보여주되 수정을 막고, 증감 버튼도 사라집니다',
        en: 'Shows the number without allowing edits, and drops the steppers'
      }
    },
    name,
    id
  ],

  MPCheckbox: [
    {
      name: 'checked',
      type: 'boolean',
      description: {
        ko: '체크 여부. `onCheckedChange`와 함께 쓰면 controlled입니다',
        en: 'Whether the box is ticked. Use with `onCheckedChange` for a controlled box'
      }
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      description: {
        ko: '처음 체크 여부. uncontrolled일 때 씁니다',
        en: 'Whether the box starts ticked, for an uncontrolled one'
      }
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean) => void',
      description: {
        ko: '새 상태로 호출됩니다. 이벤트가 아니라 boolean입니다',
        en: 'Called with the new state — a boolean, not an event'
      }
    },
    {
      name: 'indeterminate',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '체크도 해제도 아닌 상태. 자식 중 일부만 체크된 부모 박스가 이것입니다. 대시로 그려지며 누르면 체크됩니다',
        en: 'Neither ticked nor empty — what a parent box shows when some of its children are. Drawn as a dash; clicking it ticks the box'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '체크박스 옆의 텍스트', en: 'The text beside the tick' }
    },
    description,
    errorMessage,
    size,
    color,
    required,
    disabled,
    readOnly,
    name,
    {
      name: 'value',
      type: 'string',
      description: {
        ko: '체크되었을 때 제출되는 값',
        en: 'The value submitted when the box is ticked'
      }
    },
    id
  ],

  MPRadioGroup: [
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`MPRadio`들. 셀렉트와 달리 옵션이 children인 이유는, 라디오 옵션은 라벨과 설명을 가진 *블록*이기 때문입니다',
        en: 'The `MPRadio`s. Children rather than data, unlike a select: a radio option is a *block* with a label and a description'
      }
    },
    {
      name: 'value',
      type: 'string | null',
      description: {
        ko: '고른 값. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'The chosen value. Use with `onValueChange` for a controlled group'
      }
    },
    {
      name: 'defaultValue',
      type: 'string | null',
      description: {
        ko: '처음 고른 값. uncontrolled일 때 씁니다',
        en: 'The value chosen at the start, for an uncontrolled group'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: { ko: '새로 고른 값으로 호출됩니다', en: 'Called with the newly chosen value' }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '옵션들이 답하는 질문. 스크린 리더가 첫 옵션 전에 읽습니다',
        en: 'The question the options answer, read before the first option'
      }
    },
    description,
    errorMessage,
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'vertical'",
      description: {
        ko: '옵션이 쌓이는 방향. 세로가 기본인 이유는 라벨 하나가 길어지는 순간 가로가 조용히 읽기 어려워지기 때문입니다',
        en: 'Which way the options stack. A column is scannable at any length; a row stops being readable the moment one label is long'
      }
    },
    size,
    color,
    required,
    disabled,
    readOnly,
    name
  ],

  MPRadio: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description: {
        ko: '이 옵션의 값. 그룹의 `onValueChange`가 이 값을 보고합니다',
        en: "What this option is worth. Reported by the group's `onValueChange`"
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '점 옆의 텍스트', en: 'The text beside the dot' }
    },
    {
      name: 'description',
      type: NODE,
      description: { ko: '라벨 아래 한 줄', en: 'The line under the label' }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '고를 수 없지만 목록에는 남습니다 — 옵션은 존재하되 지금은 선택할 수 없다는 뜻입니다',
        en: 'Unavailable, but still listed — the option exists, it just cannot be taken'
      }
    },
    id
  ],

  MPSwitch: [
    {
      name: 'checked',
      type: 'boolean',
      description: {
        ko: '켜짐 여부. `onCheckedChange`와 함께 쓰면 controlled입니다',
        en: 'Whether the switch is on. Use with `onCheckedChange` for a controlled one'
      }
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      description: {
        ko: '처음 켜짐 여부. uncontrolled일 때 씁니다',
        en: 'Whether it starts on, for an uncontrolled one'
      }
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean) => void',
      description: {
        ko: '새 상태로 호출됩니다. 이벤트가 아니라 boolean입니다',
        en: 'Called with the new state — a boolean, not an event'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '트랙 옆의 텍스트', en: 'The text beside the track' }
    },
    description,
    errorMessage,
    {
      name: 'icons',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '켜졌을 때 체크, 꺼졌을 때 X를 썸 안에 그립니다. 색만으로 상태를 구분하기 어려운 자리에서 켜 두세요',
        en: 'Draws a tick in the thumb when on and a cross when off. Worth turning on wherever colour alone carries the state'
      }
    },
    {
      name: 'labelPlacement',
      type: "'start' | 'end'",
      default: "'end'",
      description: {
        ko: '라벨이 놓이는 쪽. `start`는 설정 목록용으로, 라벨이 열을 이루고 스위치가 오른쪽에 정렬됩니다',
        en: 'Which side the label sits on. `start` is for a settings list, where the labels form a column and the switches line up'
      }
    },
    size,
    color,
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '행을 늘려서 `start` 라벨이 남는 폭을 가져가고 트랙이 끝에 붙게 합니다',
        en: 'Stretches the row so a `start` label takes the slack and the track sits against the far edge'
      }
    },
    required,
    disabled,
    readOnly,
    name,
    id
  ],

  MPSlider: [
    {
      name: 'value',
      type: 'number | number[]',
      description: {
        ko: '값, 또는 값들. 배열을 주면 범위 슬라이더가 됩니다 — 별도의 `range` prop이 없는 이유는 값의 모양이 이미 그것을 말하기 때문입니다',
        en: 'The value, or the values. An array makes it a range slider — there is no `range` prop, because the shape of the value already says which one this is'
      }
    },
    {
      name: 'defaultValue',
      type: 'number | number[]',
      description: {
        ko: '처음 값. uncontrolled일 때 씁니다',
        en: 'The starting value, for an uncontrolled slider'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: number | number[]) => void',
      description: { ko: '움직이는 동안 계속 호출됩니다', en: 'Called on every move' }
    },
    {
      name: 'onValueCommitted',
      type: '(value: number | number[]) => void',
      description: {
        ko: '드래그가 끝날 때 한 번 호출됩니다. 비싼 갱신은 여기에 두세요',
        en: 'Called once the drag ends, which is where an expensive update belongs'
      }
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: { ko: '범위의 아래쪽 끝', en: 'The bottom of the range' }
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: { ko: '범위의 위쪽 끝', en: 'The top of the range' }
    },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: {
        ko: '화살표 키 한 번, 드래그 한 칸이 움직이는 폭',
        en: 'How far one arrow key, or one notch of the drag, moves'
      }
    },
    {
      name: 'marks',
      type: 'boolean | { value: number; label?: ReactNode }[]',
      description: {
        ko: '트랙 위의 눈금, 그리고 그 아래 쓰일 글자. `true`는 `step`마다 하나씩 — MD3의 discrete 슬라이더 — 이고 쉰 개까지입니다. 배열은 어느 눈금인지 직접 정하는 형태이고, 라벨을 가질 수 있는 쪽입니다: 연도 범위 아래의 십 년 표시가 그것입니다. 채워진 트랙 위의 눈금은 강조 색의 잉크로, 홈 위의 눈금은 `on-surface-variant`로 그려집니다',
        en: 'The ticks on the track, and optionally what is written under them. `true` puts one at every `step` — MD3’s discrete slider — up to fifty of them. An array names them instead and is the form that can carry labels: the decade markings under a year range. A tick over the filled track is drawn in the accent’s own ink and one over the groove in `on-surface-variant`'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '트랙 위의 라벨', en: 'The label above the track' }
    },
    {
      name: 'description',
      type: NODE,
      description: { ko: '트랙 아래 한 줄', en: 'The line under the track' }
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '현재 값을 라벨 옆에 보여줍니다. 단위가 있는 값이라면 켜 두세요',
        en: 'Shows the current value beside the label. Turn it on for anything with units'
      }
    },
    {
      name: 'format',
      type: 'Intl.NumberFormatOptions',
      description: {
        ko: '값을 쓰는 방식. `Intl.NumberFormat`에 그대로 전달됩니다',
        en: 'How the readout is written. Passed to `Intl.NumberFormat`'
      }
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '슬라이더가 놓이는 방향. 세로 슬라이더는 자기 길이가 없으므로 높이를 주세요',
        en: 'Which way the slider runs. A vertical slider has no length of its own, so give it a height'
      }
    },
    size,
    color,
    disabled,
    name
  ],

  MPSegmentedButton: [
    {
      name: 'items',
      type: 'MPSegment[]',
      required: true,
      description: {
        ko: '세그먼트 목록. `{ value, label?, icon?, disabled? }` 배열입니다',
        en: 'The segments, as `{ value, label?, icon?, disabled? }`'
      }
    },
    {
      name: 'value',
      type: 'string[]',
      description: {
        ko: '선택된 값들. 단일 선택일 때도 배열이며, 그때는 최대 한 개가 들어 있습니다',
        en: 'Which segments are chosen. An array in both modes, holding at most one entry in single-select'
      }
    },
    {
      name: 'defaultValue',
      type: 'string[]',
      description: {
        ko: '처음 선택된 값들. uncontrolled일 때 씁니다',
        en: 'Which segments start chosen, for an uncontrolled set'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string[]) => void',
      description: { ko: '선택된 모든 값으로 호출됩니다', en: 'Called with every chosen value' }
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '동시에 두 개 이상 고를 수 있게 합니다',
        en: 'Whether more than one segment may be chosen at a time'
      }
    },
    {
      name: 'showCheck',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '선택된 세그먼트에 체크 표시를 넣습니다. 자리는 항상 비워 두므로 선택해도 라벨이 밀리지 않습니다',
        en: 'Whether a chosen segment shows a tick. The slot is reserved either way, so choosing one does not push the label sideways'
      }
    },
    size,
    fullWidth,
    disabled
  ],

  MPFilePicker: [
    {
      name: 'accept',
      type: 'string',
      description: {
        ko: "브라우저 파일 대화상자가 제시할 형식 — `'image/*,.pdf'`. 드롭된 파일도 같은 기준으로 검사합니다. 속성만으로는 검사되지 않습니다",
        en: "Which files the browser's own dialog offers — `'image/*,.pdf'`. Dropped files are checked against it too, which the attribute alone does not do"
      }
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '두 개 이상 고를 수 있게 합니다',
        en: 'Whether more than one file may be chosen'
      }
    },
    {
      name: 'maxSize',
      type: 'number',
      description: {
        ko: '파일 하나의 최대 크기, 바이트',
        en: 'The largest a single file may be, in bytes'
      }
    },
    {
      name: 'maxFiles',
      type: 'number',
      description: {
        ko: '한 번에 들고 있을 수 있는 개수. 한 번의 드롭이 아니라 이미 고른 것과 합쳐서 셉니다',
        en: 'How many files may be held at once. Counted against what is already chosen, not against one drop'
      }
    },
    {
      name: 'value',
      type: 'File[]',
      description: {
        ko: '고른 파일들. `onFilesChange`와 함께 쓰면 controlled입니다',
        en: 'The chosen files. Use with `onFilesChange` for a controlled picker'
      }
    },
    {
      name: 'defaultValue',
      type: 'File[]',
      description: {
        ko: '처음 고른 파일들. uncontrolled일 때 씁니다',
        en: 'The files chosen at the start, for an uncontrolled picker'
      }
    },
    {
      name: 'onFilesChange',
      type: '(files: File[]) => void',
      description: { ko: '목록이 바뀔 때마다 호출됩니다', en: 'Called whenever the list changes' }
    },
    {
      name: 'onReject',
      type: '(rejections: MPFileRejection[]) => void',
      description: {
        ko: "거절된 파일과 이유(`'type' | 'size' | 'count'`)로 호출됩니다. 이것이 없으면 거절된 파일이 조용히 사라집니다",
        en: "Called with everything that was turned away, and why (`'type' | 'size' | 'count'`). Without it a rejected file disappears in silence"
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '박스 위의 라벨', en: 'Label above the box' }
    },
    {
      ...description,
      description: {
        ko: '박스 아래 한 줄. `errorMessage`가 있으면 그쪽으로 대체됩니다',
        en: 'The line under the box. Replaced by `errorMessage` when there is one'
      }
    },
    errorMessage,
    {
      name: 'title',
      type: NODE,
      default: "'Drop files here, or click to browse'",
      description: { ko: '박스 안의 문장', en: 'The line inside the box' }
    },
    {
      name: 'hint',
      type: NODE,
      description: {
        ko: '그 아래 한 줄 — 무엇을, 얼마나 크게, 몇 개까지',
        en: 'The line under it — what is accepted, how big, how many'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '문장 위의 글리프. `null`을 주면 그림 없는 박스가 됩니다',
        en: 'The glyph above the title. Pass `null` for a box with no picture in it'
      }
    },
    {
      name: 'showList',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '고른 파일을 박스 아래에 목록으로 보여줍니다',
        en: 'Lists the chosen files under the box, each with a way to remove it'
      }
    },
    {
      name: 'removeLabel',
      type: '(name: string) => string',
      description: {
        ko: '삭제 버튼이 읽히는 이름. 파일 이름을 받습니다',
        en: "The accessible name of a file's remove button. Receives the file's name"
      }
    },
    size,
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '컨테이너 너비만큼 늘어납니다',
        en: 'Stretches to the width of its container'
      }
    },
    required,
    disabled,
    {
      ...readOnly,
      description: {
        ko: '고른 파일을 보여주되 추가와 삭제를 막습니다',
        en: 'Shows what was chosen without allowing it to be added to or removed from'
      }
    },
    name,
    {
      name: 'id',
      type: 'string',
      description: { ko: '브라우즈 버튼에 붙는 id', en: 'The id put on the browse button' }
    }
  ],

  MPVisuallyHidden: [
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '화면 낭독기만 읽을 내용. 보이는 표시가 축약인 자리에 그 문장을 그대로 둡니다',
        en: 'What a screen reader reads and nobody else sees — the sentence the visible mark is shorthand for'
      }
    },
    {
      name: 'render',
      type: 'useRender.RenderProp',
      description: {
        ko: '`<span>` 대신 다른 것을 렌더합니다. Base UI의 탈출구이며, 숨은 제목이 필요할 때 `<h2>` 같은 것으로 바꿉니다',
        en: "Renders something other than a `<span>` — Base UI's own escape hatch, for a hidden heading and the like"
      }
    },
    id
  ],

  MPTypography: [
    {
      name: 'level',
      type: "'h1'–'h6' | 'body' | 'lead' | 'caption' | 'overline'",
      default: "'body'",
      description: {
        ko: '타입 스케일과 그것을 담는 엘리먼트. 각 단계는 MD3의 타입 역할 하나에 그대로 대응합니다',
        en: 'The type scale and the element that carries it. Every level is one of MD3’s own type roles'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '읽어들일 강조 색 계열. **기본값이 없습니다** — 지정하지 않으면 주변 글과 같은 색입니다',
        en: 'Which accent family to read. **No default** — left unset the text is the ink of what surrounds it'
      }
    },
    {
      name: 'weight',
      type: "'regular' | 'medium' | 'semibold' | 'bold'",
      description: {
        ko: 'level이 정한 굵기를 덮어씁니다. 머터리얼의 제목은 굵지 않다는 점을 기억하세요',
        en: 'Overrides the weight the level would pick. Remember that Material headings are not bold'
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end' | 'justify'",
      description: { ko: '글의 정렬', en: 'How the text is set against its measure' }
    },
    {
      name: 'lines',
      type: 'number',
      description: {
        ko: '이 줄 수로 잘라내고 말줄임표를 붙입니다. `1`은 한 줄 자르기입니다',
        en: 'Clamps the text to this many lines with an ellipsis. `1` is a single-line truncation'
      }
    },
    {
      name: 'gutter',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '본문 흐름이 기대하는 아래 여백을 더합니다',
        en: 'Adds the space below that a run of prose expects'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '타입 스케일은 그대로 두고 다른 엘리먼트로 렌더링합니다',
        en: 'Renders a different element without changing the type scale'
      }
    }
  ],

  MPDivider: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '선이 놓이는 방향. 세로 구분선은 자기 높이가 없고 flex 부모에 맞춰 늘어납니다',
        en: 'Which way the line runs. A vertical divider stretches to its flex parent'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '선을 칠할 강조 색 계열. **기본값이 없습니다** — 지정하지 않으면 머터리얼의 `outline-variant`입니다',
        en: 'Which accent family the rule is drawn in. **No default** — left unset it is Material’s `outline-variant`'
      }
    },
    { ...size, description: { ko: '라벨의 타입 스케일', en: 'Type scale of the label' } },
    {
      name: 'length',
      type: 'number | string',
      description: {
        ko: '선이 뻗는 길이. 숫자는 픽셀이고 문자열은 임의의 CSS 길이입니다',
        en: 'How far the rule runs. A number is pixels; a string is any CSS length'
      }
    },
    {
      name: 'thickness',
      type: 'number | string',
      default: '1',
      description: { ko: '선의 두께', en: 'How thick the rule is' }
    },
    {
      name: 'textAlign',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: {
        ko: '라벨이 놓이는 자리. 라벨이 없으면 아무 일도 하지 않습니다',
        en: 'Where the label sits. Ignored without a label'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '선 안에 끼워 넣는 라벨 — 두 로그인 방법 사이의 "또는"',
        en: 'A label set into the line — "OR" between two sign-in options'
      }
    }
  ],

  MPTextLink: [
    {
      name: 'href',
      type: 'string',
      required: true,
      description: { ko: '링크가 가리키는 곳', en: 'Where the link goes' }
    },
    {
      name: 'underline',
      type: "'always' | 'hover' | 'none'",
      default: "'always'",
      description: {
        ko: '밑줄이 그어지는 시점',
        en: 'When the underline is drawn'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '읽어들일 강조 색 계열. **기본값이 없습니다** — 문장 속 링크는 보통 문장과 같은 색입니다',
        en: 'Which accent family to read. **No default** — a link in a paragraph is usually the paragraph’s own colour'
      }
    },
    {
      ...size,
      default: undefined,
      description: {
        ko: '타입 스케일. 역시 기본값이 없습니다 — 문장 안의 링크는 문장의 크기입니다',
        en: 'The type scale. Also no default: a link inside a sentence is the size of the sentence'
      }
    },
    {
      name: 'newTab',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '새 탭에서 엽니다. `rel`과 스크린 리더용 안내, 그리고 `icon`까지 함께 켜집니다',
        en: 'Opens in a new tab, with the `rel`, the note for a screen reader and `icon` all turned on'
      }
    },
    {
      name: 'icon',
      type: `${NODE} | boolean`,
      description: {
        ko: '라벨 뒤의 표시. 생략하면 `newTab`을 따릅니다',
        en: 'The mark after the label. Left out, it follows `newTab`'
      }
    },
    {
      name: 'newTabLabel',
      type: 'string',
      default: "'Opens in a new tab'",
      description: {
        ko: '`newTab`일 때 스크린 리더가 라벨 뒤에 읽는 문장',
        en: 'What a screen reader hears after the label when `newTab` is on'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<a>` 대신 라우터의 `Link` 같은 것으로 렌더링합니다',
        en: 'Renders something other than an `<a>` — a router’s own `Link`, most of the time'
      }
    }
  ],

  MPBlockquote: [
    {
      name: 'variant',
      type: VARIANT,
      default: "'text'",
      description: {
        ko: '인용문 뒤에 칠하는 면의 양. `elevated`와 `outlined`는 면을 물들이지 않습니다',
        en: 'How much surface the quote paints. `elevated` and `outlined` leave the sheet neutral'
      }
    },
    size,
    {
      ...color,
      description: {
        ko: '앞쪽 세로선의 색 계열. `filled`와 `tonal`에서는 배경까지 물들입니다',
        en: 'Which family the leading rule is drawn in — and, on `filled` and `tonal`, the surface behind the words'
      }
    },
    {
      name: 'author',
      type: NODE,
      description: {
        ko: '말한 사람. 이 값이 있으면 `<figure>` + `<figcaption>` 구조가 됩니다',
        en: 'Who said it. Its presence is what turns the quote into a `<figure>` with a `<figcaption>`'
      }
    },
    {
      name: 'source',
      type: NODE,
      description: {
        ko: '출처가 된 작품. `<cite>` 안에 들어갑니다 — 사람 이름은 여기가 아니라 `author`입니다',
        en: 'Where it is from. Rendered inside a `<cite>`, which is never for the name of a person'
      }
    },
    {
      name: 'cite',
      type: 'string',
      description: {
        ko: '인용 출처 URL. `<blockquote>`의 `cite` 속성에 실리고 화면에는 보이지 않습니다',
        en: 'URL of the source document. Lands on the `<blockquote>`’s own `cite` attribute and is shown to nobody'
      }
    },
    {
      name: 'icon',
      type: `${NODE} | false`,
      description: {
        ko: '인용 부호. 생략하면 기본 표시, `false`면 없음, 노드를 주면 교체됩니다',
        en: 'The mark before the quote. Omit for the house glyph, `false` to drop it, a node to replace it'
      }
    }
  ],

  MPAvatar: [
    { name: 'src', type: 'string', description: { ko: '사진', en: 'The picture' } },
    {
      name: 'srcSet',
      type: 'string',
      description: { ko: '다른 해상도 후보들', en: 'Candidate images at other resolutions' }
    },
    {
      name: 'alt',
      type: 'string',
      description: {
        ko: '사진이 말하는 것. 기본값은 `name`이고, 이름도 없으면 빈 문자열입니다',
        en: 'What the picture says. Defaults to `name`, and to an empty string when there is none'
      }
    },
    {
      name: 'name',
      type: 'string',
      description: {
        ko: '누구인지. 사진의 이름이 되고, 이니셜이 여기서 파생되며, 스크린 리더가 읽는 문장이 됩니다',
        en: 'Who or what this is. One prop naming the picture, deriving the initials and speaking for them'
      }
    },
    {
      name: 'initials',
      type: 'string',
      description: {
        ko: '이니셜을 직접 씁니다. 파생 규칙이 틀렸을 때',
        en: 'The initials, written out, for when the rule derived the wrong ones'
      }
    },
    {
      name: 'shape',
      type: "'circle' | 'square'",
      default: "'circle'",
      description: { ko: '잘라내는 모양', en: 'The crop' }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'tonal'",
      description: {
        ko: '대체 표시 뒤에 칠하는 면의 양. `tonal`이 머터리얼이 모노그램을 올리는 면입니다',
        en: 'How much surface is painted behind the fallback. `tonal` is what MD3 draws a monogram on'
      }
    },
    size,
    color,
    {
      name: 'delay',
      type: 'number',
      description: {
        ko: '대체 표시를 그리기까지 기다리는 밀리초',
        en: 'How long to wait before drawing the fallback, in milliseconds'
      }
    },
    {
      name: 'imageProps',
      type: "Omit<ImgHTMLAttributes, 'src' | 'srcSet' | 'alt'>",
      description: {
        ko: '`<img>`에 필요한 나머지 — `loading`, `crossOrigin` 등',
        en: 'Anything else the `<img>` needs — `loading`, `crossOrigin`, `referrerPolicy`'
      }
    },
    {
      name: 'onLoadingStatusChange',
      type: '(status: MPAvatarLoadingStatus) => void',
      description: {
        ko: '사진이 `idle`·`loading`·`loaded`·`error` 사이를 오갈 때 호출됩니다',
        en: 'Called as the picture moves between `idle`, `loading`, `loaded` and `error`'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '이니셜 대신 그릴 대체 표시 — 아이콘, 로고, 이모지 하나',
        en: 'The fallback, drawn instead of the initials — an icon, a logo, a single emoji'
      }
    }
  ],

  MPBadge: [
    {
      name: 'content',
      type: NODE,
      description: {
        ko: '배지가 말하는 것. 생략하면 점을 그립니다',
        en: 'What the badge says. Omit it and the badge draws a dot instead'
      }
    },
    {
      name: 'max',
      type: 'number',
      default: '99',
      description: {
        ko: '숫자 `content`의 상한. 넘으면 `+`가 붙습니다',
        en: 'Caps a numeric `content` and adds a `+`'
      }
    },
    {
      name: 'dot',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '내용이 있어도 점으로 그립니다. 내용은 스크린 리더용으로 남습니다',
        en: 'Draws a dot even when there is content, keeping the content for screen readers'
      }
    },
    {
      name: 'showZero',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`content`가 `0`일 때도 보여줍니다',
        en: 'Whether a `content` of `0` is shown'
      }
    },
    {
      name: 'invisible',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '자리는 그대로 두고 표시만 감춥니다',
        en: 'Hides the marker without unmounting the anchor'
      }
    },
    {
      name: 'placement',
      type: "'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
      default: "'top-end'",
      description: { ko: '붙는 모서리', en: 'Which corner of the anchor it sits on' }
    },
    {
      name: 'overlap',
      type: "'square' | 'circle'",
      default: "'square'",
      description: {
        ko: '밑에 깔린 것의 모양. 얼마나 안쪽으로 파고들지를 정합니다',
        en: 'The shape of the thing underneath, which decides how far the marker tucks in'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'filled'",
      description: { ko: '표시가 칠하는 면의 양', en: 'How much surface the marker paints' }
    },
    size,
    {
      ...color,
      default: "'error'",
      description: {
        ko: '읽어들일 강조 색 계열. 라이브러리에서 유일하게 `error`가 기본값입니다 — MD3의 배지가 그렇습니다',
        en: 'Which accent family to read. The one component that defaults to `error`, because MD3’s badge does'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '스크린 리더가 숫자 대신 듣는 문장',
        en: 'What a screen reader hears instead of the raw content'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '배지가 붙는 대상. 없으면 인라인으로 놓이는 독립 표시가 됩니다',
        en: 'What the badge is pinned to. Without it the badge lays out inline'
      }
    }
  ],

  MPChip: [
    {
      name: 'variant',
      type: VARIANT,
      default: "'outlined'",
      description: {
        ko: '칩이 칠하는 면의 양. MD3의 칩은 기본이 outlined입니다',
        en: 'How much surface the chip paints. MD3’s chip is outlined at rest'
      }
    },
    size,
    color,
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 내용', en: 'Content placed before the label' }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: { ko: '라벨 뒤의 내용', en: 'Content placed after the label' }
    },
    {
      name: 'count',
      type: NODE,
      description: {
        ko: '칩 끝에 얹히는 숫자. 자기 작은 판 위에 그려집니다',
        en: 'A number set into the end of the chip, on its own small plate'
      }
    },
    {
      name: 'onDelete',
      type: '(event: MouseEvent) => void',
      description: {
        ko: '삭제 버튼이 눌렸을 때. 이 prop을 주는 것이 버튼을 만드는 방법입니다',
        en: 'Called when the delete affordance is pressed. Passing it is what makes it appear'
      }
    },
    {
      name: 'deleteLabel',
      type: 'string',
      default: "'Remove'",
      description: { ko: '삭제 버튼이 읽히는 이름', en: 'Accessible name of the delete button' }
    },
    {
      name: 'selected',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '고른 상태. 색 계열을 바꾸는 대신 그 계열의 container 색으로 채웁니다',
        en: 'Marks the chip as chosen. Fills with the family’s container tone rather than changing family'
      }
    },
    disabled,
    { name: 'children', type: NODE, description: { ko: '라벨', en: 'The label' } }
  ],

  MPSkeleton: [
    {
      name: 'shape',
      type: "'line' | 'rect' | 'circle'",
      default: "'line'",
      description: { ko: '무엇을 대신하고 있는지', en: 'What the placeholder is standing in for' }
    },
    {
      name: 'lines',
      type: 'number',
      default: '1',
      description: {
        ko: '`shape="line"`일 때 그릴 줄 수. 마지막 줄은 짧게 그려집니다',
        en: 'How many lines to draw for `shape="line"`. The last one is drawn short'
      }
    },
    size,
    {
      ...color,
      default: undefined,
      description: {
        ko: '대체 표시를 물들일 계열. **기본값이 없습니다** — 지정하지 않으면 `surface-container-highest`입니다',
        en: 'Which family tints the placeholder. **No default** — left unset it is `surface-container-highest`'
      }
    },
    {
      name: 'width',
      type: 'number | string',
      description: { ko: '너비. 숫자는 픽셀입니다', en: 'An explicit width. Numbers are pixels' }
    },
    {
      name: 'height',
      type: 'number | string',
      description: { ko: '높이. 숫자는 픽셀입니다', en: 'An explicit height. Numbers are pixels' }
    },
    {
      name: 'animated',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '맥동 애니메이션. 모션 감소 설정은 이것과 무관하게 이미 존중됩니다',
        en: 'The pulse. A reduced-motion preference already stops it without being asked'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '스크린 리더에게 알릴 문장. 없으면 `aria-hidden`이고, 있으면 살아 있는 `status`가 됩니다',
        en: 'What a screen reader is told. Without it the placeholder is `aria-hidden`; with it, a live `status`'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 아닌 것으로 렌더링합니다',
        en: 'Renders something other than a `<div>`'
      }
    }
  ],

  MPEmpty: [
    {
      name: 'title',
      type: `${NODE} | false`,
      default: "'Nothing here'",
      description: {
        ko: '제목. `false`를 주면 제목 없이 글리프와 문장만 남습니다',
        en: 'The headline. Pass `false` for a state that is a glyph and a sentence with no heading'
      }
    },
    {
      name: 'icon',
      type: `${NODE} | false`,
      description: {
        ko: '제목 위의 글리프. 생략하면 빈 쟁반, `false`면 없음, 노드를 주면 교체됩니다',
        en: 'The glyph above the headline. Omit for the empty tray, `false` to drop it, a node to replace it'
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '글 아래에서 할 수 있는 일 — "첫 항목 만들기" 버튼, "필터 지우기" 링크',
        en: 'What to do about it: a "Create the first one" button, a "Clear filters" link'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'text'",
      description: {
        ko: '칠하는 면의 양. 어떤 값이든 면은 중립 색으로 남습니다',
        en: 'How much surface the state paints. The sheet stays neutral whichever it is'
      }
    },
    size,
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 아닌 것으로 렌더링합니다: `render={<td colSpan={5} />}`',
        en: 'Renders something other than a `<div>`: `render={<td colSpan={5} />}`'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '제목 아래 문장 — 왜 비어 있는지, 다음에 무엇을 할지',
        en: 'The sentence under the headline: why it is empty, or what to do next'
      }
    }
  ],

  MPList: [
    {
      name: 'variant',
      type: VARIANT,
      default: "'outlined'",
      description: {
        ko: '행 뒤의 면이 칠해지는 양. 어떤 값이든 면은 중립 색으로 남습니다',
        en: 'How much surface the sheet paints behind the rows. It stays neutral whichever it is'
      }
    },
    {
      ...size,
      description: {
        ko: '행의 높이와 타입 스케일. 한 줄짜리 행은 같은 이름의 컨트롤 높이에 정확히 맞습니다',
        en: 'The row height and type scale. A one-line row lands on the control height of the same name'
      }
    },
    {
      ...color,
      description: {
        ko: '고르거나 가리킨 행이 읽어들일 계열. 면 자체는 물들지 않습니다',
        en: 'Which family a selected or hovered row reads. The sheet itself stays neutral'
      }
    },
    {
      name: 'dividers',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '행 사이를 여백 대신 실선으로 나눕니다. 안쪽 여백과 행의 둥근 모서리가 함께 사라집니다',
        en: 'Separates the rows with a hairline instead of with space, giving up the padding and the rounded rows'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<ul>` 아닌 것으로 — 순서가 중요하면 `render={<ol />}`',
        en: 'Renders something other than a `<ul>` — `render={<ol />}` where the order is the point'
      }
    }
  ],

  MPListItem: [
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description: {
        ko: '이 값을 주면 행이 진짜 `<button>`이 됩니다',
        en: 'Passing it is what turns the row into a real `<button>`'
      }
    },
    {
      name: 'href',
      type: 'string',
      description: { ko: '행을 링크로 렌더링합니다', en: 'Renders the row as a link' }
    },
    {
      name: 'target',
      type: 'string',
      description: {
        ko: '링크가 열리는 곳. `_blank`이면 `rel`이 따라 붙습니다',
        en: 'Where the link opens. `rel` follows on its own for `_blank`'
      }
    },
    {
      name: 'rel',
      type: 'string',
      description: {
        ko: '`_blank`가 받게 될 `noopener noreferrer`를 **대체합니다** — 덧붙이는 게 아닙니다',
        en: '**Replaces** the `noopener noreferrer` a `_blank` link would otherwise get rather than extending it'
      }
    },
    {
      name: 'render',
      type: 'ReactElement | ((props, state) => ReactElement)',
      description: {
        ko: '행에서 누를 수 있는 엘리먼트를 다른 것으로 — 대개 라우터의 `Link`. **라이브러리에서 유일하게 바깥 엘리먼트가 아닌 `render`입니다**: 행의 껍데기는 `<ul>` 안에 있어서 `<li>`여야 하고, 실제로 바꾸고 싶은 것은 그 안의 `<a>`이기 때문입니다',
        en: 'Renders the row’s pressable element as something else — a router’s `Link`, most of the time. **The one `render` in the library that is not the outermost element**: a row’s shell is an `<li>` because it is inside a `<ul>`, and what you actually want to replace is the `<a>` inside it'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 내용', en: 'Content before the label' }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: {
        ko: '라벨 뒤, 누를 수 있는 영역 안쪽의 내용',
        en: 'Content after the label, inside the pressable area'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '라벨 아래 두 번째 줄. MD3가 supporting text라 부르는 것입니다',
        en: 'A second line under the label — what MD3 calls the supporting text'
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '행 끝에 고정되는 컨트롤. 누를 수 있는 영역 **바깥**입니다',
        en: 'A control pinned to the end of the row, deliberately outside the pressable area'
      }
    },
    {
      name: 'selected',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '고른 행 — 열려 있는 페이지, 지금 걸린 필터',
        en: 'Marks the row as the chosen one — the open page, the current filter'
      }
    },
    disabled,
    { name: 'children', type: NODE, description: { ko: '라벨', en: 'The label' } }
  ],

  MPTable: [
    {
      name: 'headers',
      type: 'MPTableColumn<Row>[]',
      required: true,
      description: {
        ko: '열 정의. 나타나는 순서대로입니다',
        en: 'The columns, in the order they appear'
      }
    },
    { name: 'items', type: 'Row[]', required: true, description: { ko: '행', en: 'The rows' } },
    {
      name: 'getRowKey',
      type: '(row: Row, index: number) => Key',
      description: {
        ko: '행마다 안정적인 key. 기본값은 인덱스이며, 정렬하거나 거르는 표에서는 틀립니다',
        en: 'A stable key per row. Defaults to the index, which is wrong for a table that sorts or filters'
      }
    },
    {
      name: 'caption',
      type: NODE,
      description: {
        ko: '표 위에 놓이고, 표의 접근성 이름이 됩니다',
        en: 'Shown above the table, and read out as its accessible name'
      }
    },
    {
      name: 'empty',
      type: NODE,
      default: "'No data'",
      description: {
        ko: '`items`가 비었을 때 행 대신 보여줄 것',
        en: 'What to show instead of rows when `items` is empty'
      }
    },
    {
      name: 'striped',
      type: 'boolean',
      default: 'false',
      description: { ko: '한 줄 걸러 색을 입힙니다', en: 'Tints every other row' }
    },
    {
      name: 'hoverable',
      type: 'boolean',
      default: 'false',
      description: { ko: '포인터가 놓인 행을 밝힙니다', en: 'Lights the row under the pointer' }
    },
    {
      name: 'stickyHeader',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '본문이 스크롤되는 동안 헤더를 고정합니다',
        en: 'Pins the header while the body scrolls'
      }
    },
    {
      name: 'onRowClick',
      type: '(row: Row, index: number) => void',
      description: {
        ko: '행을 누를 수 있게 만듭니다. hover 처리도 함께 켜집니다',
        en: 'Makes rows activatable. Also turns on the hover treatment'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'outlined'",
      description: {
        ko: '표를 감싼 면이 칠해지는 양. 셀은 중립 색으로 남습니다',
        en: 'How much surface the sheet around the table paints. The cells stay neutral'
      }
    },
    size,
    {
      ...color,
      description: {
        ko: '행이 반응할 때 읽어들일 계열',
        en: 'Which family a hovered or pressed row reads'
      }
    }
  ],

  MPTableColumn: [
    {
      name: 'key',
      type: 'string',
      required: true,
      description: {
        ko: '열을 식별하고, `render`가 없으면 각 행에서 읽을 속성 이름이 됩니다',
        en: 'Identifies the column and — unless `render` says otherwise — names the property to read'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '열 제목. 기본값은 `key`입니다', en: 'The heading. Defaults to the `key`' }
    },
    {
      name: 'width',
      type: 'number | string',
      description: {
        ko: '열의 기본 너비. 표는 여전히 폭을 맞추므로 시작 비율에 가깝습니다',
        en: 'The column’s default width. The table still balances columns, so this is a starting proportion'
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: {
        ko: '글의 정렬. 숫자 열은 보통 `end`입니다',
        en: 'Text alignment. Numbers usually want `end`'
      }
    },
    {
      name: 'render',
      type: '(row: Row, index: number) => ReactNode',
      description: {
        ko: '셀을 직접 그립니다. 없으면 `row[key]`를 그대로 씁니다',
        en: 'Renders the cell. Without it the cell is `row[key]` rendered as-is'
      }
    }
  ],

  MPImage: [
    {
      name: 'src',
      type: 'string',
      description: { ko: '그림이 있는 곳', en: 'Where the picture is' }
    },
    {
      name: 'alt',
      type: 'string',
      required: true,
      description: {
        ko: '그림을 볼 수 없는 사람에게 그림이 하는 말. 여기서 유일하게 필수인 prop이며, `MPIconButton`의 `label`이 필수인 이유와 같습니다 — 텍스트 대체가 없는 그림은 라이브러리가 실제로 도울 수 있는 가장 흔한 접근성 결함이고, 그 도움은 컴파일 거부입니다. 장식이라면 `alt=""`',
        en: 'What the picture says for a reader who cannot see it. The one required prop here, for the reason `MPIconButton`\'s `label` is required — a picture with no text alternative is the most common accessibility defect a library can help with, and the help is refusing to compile. `alt=""` for decoration'
      }
    },
    {
      name: 'ratio',
      type: 'number | string',
      description: {
        ko: "상자가 지키는 비율. CSS가 쓰는 대로 숫자(`1.5`)나 비(`'16 / 9'`)로. 생략하면 상자는 그림이 밝혀진 크기가 되고 도착할 때 페이지가 **다시 흐릅니다** — 자리를 잡아 두는 것이 이 prop입니다",
        en: 'The proportion the box holds, written the way CSS writes it. Left out, the box is whatever the picture turns out to be and the page **reflows** when it arrives — giving a ratio is what reserves the room'
      }
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'fill' | 'none'",
      default: "'cover'",
      description: {
        ko: '그림을 상자에 어떻게 맞출지',
        en: 'How the picture is fitted into that box'
      }
    },
    {
      name: 'placeholder',
      type: `${NODE} | false`,
      description: {
        ko: '오는 중에 그리는 것. 기본은 반짝임이고, `false`는 아무것도 그리지 않습니다 — 이미 자체 로딩 처리를 가진 것 안의 그림이 원하는 값입니다',
        en: 'Drawn while the picture is on its way. A shimmer by default; `false` draws nothing, which is what a picture inside something with its own loading treatment wants'
      }
    },
    {
      name: 'fallback',
      type: NODE,
      description: {
        ko: '도착하지 않았을 때 그림 대신 그리는 것. 기본은 중립 면 위의 깨진 그림 글리프입니다. 이 컴포넌트를 가질 만하게 만드는 prop입니다 — `src`가 404인 맨 `<img>`는 브라우저 자신의 표시를 그리고, 그건 브라우저마다 다르며 어느 것에도 속하지 않습니다',
        en: "Drawn instead of the picture when it does not arrive. A broken-picture glyph on a neutral surface by default. This is the prop that makes the component worth having: a bare `<img>` whose `src` 404s draws the browser's own mark, which is different in every browser and belongs to none of them"
      }
    },
    {
      name: 'preview',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '누르면 그림을 스크림 위에 엽니다. 상자가 버튼이 되므로 키보드로 닿고 무엇을 하는지 말합니다. 기본이 꺼짐인 이유는, 페이지의 그림 대부분은 열 가치가 없고 조용히 눌리게 된 것은 아무도 선언하지 않은 컨트롤이기 때문입니다. 실패한 그림은 열리기를 거부합니다',
        en: 'Opens the picture over a scrim when pressed. The box becomes a button, so it is reachable by keyboard and says what it does. Off by default: most pictures are not worth opening, and one that silently became pressable would be a control nobody declared. A failed picture refuses to open'
      }
    },
    {
      name: 'previewSrc',
      type: 'string',
      default: '`src`',
      description: {
        ko: '미리보기가 여는 파일이 `src`와 다를 때 — 썸네일 뒤의 원본. 썸네일을 썸네일답게 만드는 값입니다',
        en: 'What the preview loads when that is not `src` — the full-resolution file behind a thumbnail'
      }
    },
    {
      name: 'previewLabel',
      type: 'string',
      default: '`alt`',
      description: {
        ko: '`preview`가 만든 버튼의 이름',
        en: 'The label on the button `preview` turns the box into'
      }
    },
    {
      name: 'onStateChange',
      type: "(state: 'loading' | 'loaded' | 'error') => void",
      description: {
        ko: '상태가 바뀔 때 호출됩니다',
        en: 'Called when the state changes'
      }
    },
    size,
    id
  ],

  MPStepper: [
    {
      name: 'active',
      type: 'number',
      description: {
        ko: '지금 밟고 있는 스텝의 인덱스(0부터). 그 앞은 완료, 그 뒤는 아직입니다. 값이 아니라 인덱스인 이유는 `MPTimeline`과 같습니다 — 자기 자리를 들어야 하는 스텝은 잘못 놓일 수 있는 스텝입니다',
        en: "Which step is being worked on now, counting from zero. Everything before it is complete and everything after is still to come. An index rather than a value, for the reason `MPTimeline`'s is"
      }
    },
    {
      name: 'defaultActive',
      type: 'number',
      default: '0',
      description: {
        ko: 'uncontrolled 스테퍼가 시작하는 곳',
        en: 'Where an uncontrolled stepper starts'
      }
    },
    {
      name: 'onActiveChange',
      type: '(active: number) => void',
      description: {
        ko: '눌린 스텝으로 호출됩니다. **이걸 빼면 스텝이 눌리지 않게 됩니다** — 핸들러 없는 스테퍼는 진행 표시기이고, 그건 애플리케이션이 자기 Next·Back으로 모는 순서에 맞는 모양입니다',
        en: 'Called with the step that was pressed. **Leaving it out is what makes the steps unpressable** — a stepper with no handler is a progress indicator, which is the right shape for a sequence the application drives with its own Next and Back'
      }
    },
    {
      name: 'linear',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '앞 스텝들이 끝나야 다음에 닿을 수 있는지. 뒤로 가는 것은 언제나 허용되며, 거절하는 것은 실제로 도달한 지점보다 앞으로 건너뛰는 것뿐입니다. 그 "도달한"은 현재가 아니라 가장 멀리 간 스텝입니다',
        en: 'Whether a step can only be reached once the ones before it are done. Going back is always allowed; what it refuses is jumping forward past the step the reader has actually got to — the *furthest* one, not the current one'
      }
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '순서가 흐르는 방향. 기본이 `MPTimeline`과 반대인 것은 일부러입니다 — 스테퍼는 작업 위쪽을 가로지르는 짧은 라벨 몇 개이고, 타임라인은 각각 할 말이 많은 항목이 임의 개수 있는 것입니다',
        en: "Which way the sequence runs. The default disagrees with `MPTimeline`'s on purpose: a stepper is a few short labels across the top of a task, a timeline an arbitrary number of entries with an arbitrary amount to say"
      }
    },
    size,
    color,
    {
      name: 'children',
      type: '`MPStep` elements',
      description: { ko: '`MPStep` 엘리먼트들', en: '`MPStep` elements' }
    },
    id
  ],

  MPStep: [
    {
      name: 'label',
      type: NODE,
      description: { ko: '스텝의 이름', en: 'What the step is called' }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '아래에 붙는 둘째 줄 — 무엇을 위한 스텝인지, 무엇을 기다리는지',
        en: 'A second line under it — what the step is for, or what it is waiting on'
      }
    },
    {
      name: 'bullet',
      type: NODE,
      description: {
        ko: '불릿 안에 들어가는 것. 비워 두면 완료는 체크, 실패는 에러 글리프, 나머지는 번호를 그립니다',
        en: 'What goes inside the bullet. Left out, a complete step draws a tick, a failed one its error glyph, and every other one its number'
      }
    },
    {
      name: 'error',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '실패한 스텝. `error`로 칠하고 순서 안에 그대로 둡니다 — 구멍 난 순서는 읽는 사람이 셀 수 없습니다',
        en: 'Marks the step failed. Drawn in `error` and kept in the sequence — a sequence with a hole in it is one the reader cannot count'
      }
    },
    {
      name: 'optional',
      type: NODE,
      description: {
        ko: '라벨 아래의 한마디 — *Optional*, *건너뜀*, *3 중 2 완료*. boolean이 아니라 노드인 이유는, boolean이면 라이브러리가 그 **단어**를 열여덟 개 언어로 실어야 하기 때문입니다',
        en: 'A note under the label — *Optional*, *Skipped*, *2 of 3 done*. A node rather than a boolean, because a boolean would mean this library shipping the **word** in eighteen languages'
      }
    },
    {
      ...disabled,
      description: {
        ko: '닿을 수 있는지와 무관하게 누름을 거절합니다',
        en: 'Refuses the press whatever the reachability rule says'
      }
    },
    {
      name: 'connector',
      type: "'solid' | 'dashed' | 'dotted' | 'none'",
      default: "'solid'",
      description: {
        ko: '다음 스텝으로 가는 선을 어떻게 그릴지. 마지막 스텝은 그리지 않습니다',
        en: 'How the line to the next step is drawn. The last step never draws one'
      }
    },
    {
      ...color,
      description: {
        ko: '이 스텝만의 강조색. `error`가 정하는 것을 덮어씁니다',
        en: "This step's own accent, overriding what `error` would set"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '이 스텝의 패널. **활성일 때만** 그려지고, 그때만 마운트됩니다',
        en: "The step's own panel, drawn — and mounted — **only while the step is active**"
      }
    },
    id
  ],

  MPTimeline: [
    {
      name: 'active',
      type: 'number',
      description: {
        ko: '지금 진행 중인 항목의 인덱스. 그 앞은 완료, 뒤는 예정입니다',
        en: 'The index of the item being worked on now. Before it is complete, after it is upcoming'
      }
    },
    size,
    color,
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'vertical'",
      description: {
        ko: '진행 방향. `horizontal`은 라벨이 짧을 때만 정직합니다',
        en: 'Which way the sequence runs. `horizontal` is only honest while every label is short'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<ol>` 아닌 것으로 렌더링합니다',
        en: 'Renders something other than an `<ol>`'
      }
    }
  ],

  MPTimelineItem: [
    {
      name: 'title',
      type: NODE,
      description: { ko: '이 단계의 제목', en: 'The heading of this step' }
    },
    {
      name: 'meta',
      type: NODE,
      description: {
        ko: '언제 있었는지 — 날짜, 기간, 이름',
        en: 'When it happened — a date, a duration, a name'
      }
    },
    {
      name: 'bullet',
      type: NODE,
      description: {
        ko: '동그라미 안에 들어갈 것 — 숫자, 아이콘, 아바타',
        en: 'What goes inside the bullet: a number, an icon, an avatar'
      }
    },
    {
      name: 'status',
      type: "'complete' | 'current' | 'upcoming'",
      description: {
        ko: '`active`가 계산한 상태를 덮어씁니다 — 실패한 단계, 건너뛴 단계',
        en: 'Overrides what `active` would have computed — a step that failed, a step that was skipped'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '이 항목만 타임라인의 계열을 덮어씁니다',
        en: 'Overrides the timeline’s accent family for this item alone'
      }
    },
    {
      name: 'connector',
      type: "'solid' | 'dashed' | 'dotted' | 'none'",
      default: "'solid'",
      description: {
        ko: '다음 항목까지 이어지는 선',
        en: 'How the line to the next item is drawn'
      }
    },
    { name: 'children', type: NODE, description: { ko: '단계의 본문', en: 'The body of the step' } }
  ],

  MPBreadcrumb: [
    size,
    {
      ...color,
      description: {
        ko: '단계에 포인터가 놓였을 때 읽어들일 계열',
        en: 'The accent family a step picks up when it is hovered'
      }
    },
    {
      name: 'separator',
      type: `'chevron' | 'arrow' | 'slash' | 'dot' | ${NODE}`,
      default: "'chevron'",
      description: {
        ko: '두 단계 사이의 표시. 네 이름 중 하나이거나 임의의 노드입니다',
        en: 'The mark between two steps. One of the four names, or any node'
      }
    },
    {
      name: 'maxItems',
      type: 'number',
      description: {
        ko: '가운데를 `…`로 접기 전에 보여줄 단계 수. 생략하면 접지 않습니다',
        en: 'How many steps to show before the middle is folded away. Left out, nothing folds'
      }
    },
    {
      name: 'itemsBeforeCollapse',
      type: 'number',
      default: '1',
      description: { ko: '접힌 길 앞쪽에 남을 단계 수', en: 'How many steps stay at the front' }
    },
    {
      name: 'itemsAfterCollapse',
      type: 'number',
      default: '1',
      description: { ko: '뒤쪽에 남을 단계 수', en: 'How many stay at the end' }
    },
    {
      name: 'expandable',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '`…`를 누르면 그 자리에서 펼칩니다',
        en: 'Whether pressing the `…` unfolds the trail in place'
      }
    },
    {
      name: 'label',
      type: 'string',
      default: "'Breadcrumb'",
      description: { ko: '길이 읽히는 이름', en: 'The name the trail is announced by' }
    },
    {
      name: 'expandLabel',
      type: 'string',
      default: "'Show hidden steps'",
      description: { ko: '`…`가 읽히는 이름', en: 'What the `…` is announced as' }
    },
    {
      name: 'structuredData',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '트레일을 schema.org `BreadcrumbList` 마이크로데이터로 게시합니다. 켜면 `maxItems`가 꺼집니다',
        en: 'Publishes the trail as schema.org `BreadcrumbList` microdata. Turning it on turns `maxItems` off'
      }
    }
  ],

  MPBreadcrumbItem: [
    {
      name: 'href',
      type: 'string',
      description: { ko: '단계를 링크로 렌더링합니다', en: 'Renders the step as a link' }
    },
    {
      name: 'onClick',
      type: '(event: MouseEvent) => void',
      description: {
        ko: '눌렸을 때. `href`가 없으면 버튼으로 렌더링됩니다',
        en: 'Fires when the step is pressed. Renders it as a button when there is no `href`'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 내용', en: 'Content before the label' }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: { ko: '라벨 뒤의 내용', en: 'Content after the label' }
    },
    {
      name: 'current',
      type: 'boolean',
      description: {
        ko: '이 단계가 지금 보고 있는 페이지임을 표시합니다. 마지막 단계는 기본적으로 그렇습니다',
        en: 'Marks this step as the page you are on. The last step is that on its own'
      }
    },
    disabled,
    { name: 'children', type: NODE, description: { ko: '단계의 라벨', en: 'The step’s label' } }
  ],

  MPShortcut: [
    {
      name: 'keys',
      type: 'string | string[]',
      required: true,
      description: {
        ko: '키들. 문자열은 `+`로 나뉩니다 — `Mod+Shift+P`. 키 자체가 `+`이면 배열로 주세요',
        en: 'The keys. A string is split on `+` — `Mod+Shift+P`. Use the array form for a key that *is* a plus'
      }
    },
    {
      name: 'os',
      type: "'auto' | 'mac' | 'windows' | 'linux'",
      default: "'auto'",
      description: {
        ko: '어느 키보드 기준으로 이름 붙일지. `auto`는 브라우저에 물어봅니다',
        en: 'Which keyboard to name the modifiers for. `auto` asks the browser'
      }
    },
    {
      name: 'separator',
      type: NODE,
      description: {
        ko: '키 사이에 들어갈 것. 생략하면 플랫폼 관례 — 윈도우·리눅스는 `+`, 맥은 아무것도 없음',
        en: 'What goes between two keys. Omit it for the platform’s own convention'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'outlined'",
      description: { ko: '키 캡이 칠하는 면의 양', en: 'How much surface a key cap paints' }
    },
    size,
    { ...color, default: "'secondary'" }
  ],

  MPTooltip: [
    {
      name: 'content',
      type: NODE,
      required: true,
      description: {
        ko: '툴팁이 말하는 것. 짧은 구절입니다 — 툴팁은 컨테이너가 아닙니다',
        en: 'What the tooltip says. A short phrase — a tooltip is not a container'
      }
    },
    {
      name: 'children',
      type: 'ReactElement',
      required: true,
      description: {
        ko: '툴팁이 매달리는 엘리먼트. 정확히 하나여야 합니다',
        en: 'The element the tooltip hangs off. Exactly one element'
      }
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'top'",
      description: {
        ko: '어느 변에 나타날지. 자리가 없으면 반대쪽으로 넘어갑니다',
        en: 'Which edge of the trigger it appears on. May flip when there is no room'
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: { ko: '그 변에서의 위치', en: 'Where it sits along that edge' }
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '6',
      description: { ko: '트리거와의 거리(px)', en: 'Distance from the trigger, in pixels' }
    },
    {
      name: 'delay',
      type: 'number',
      description: {
        ko: '열리기까지 포인터가 머물러야 하는 시간(ms)',
        en: 'How long the pointer has to rest before it opens, in milliseconds'
      }
    },
    {
      name: 'closeDelay',
      type: 'number',
      description: {
        ko: '포인터가 떠난 뒤 닫히기까지의 시간(ms)',
        en: 'How long it waits before closing once the pointer leaves'
      }
    },
    {
      name: 'arrow',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '트리거를 가리키는 작은 쐐기',
        en: 'Draws the little wedge pointing at the trigger'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '열림 여부. controlled로 쓸 때',
        en: 'Whether the tooltip is open, for a controlled one'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 열려 있을지',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열림 상태가 바뀔 때', en: 'Called as the open state changes' }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '트리거는 그대로 두고 툴팁만 열리지 않게 합니다',
        en: 'Stops the tooltip from opening at all, without disabling the trigger'
      }
    },
    size,
    {
      ...color,
      default: undefined,
      description: {
        ko: '판을 칠할 계열. **기본값이 없습니다** — 지정하지 않으면 MD3의 `inverse-surface`입니다',
        en: 'Which family the plate is painted in. **No default** — left unset it is MD3’s `inverse-surface`'
      }
    }
  ],

  MPHighlight: [
    {
      name: 'query',
      type: 'string | string[] | RegExp',
      required: true,
      description: {
        ko: '찾을 것. 배열이면 긴 것부터 시도하므로 `["data", "database"]`는 단어 전체를 표시합니다. `RegExp`는 그대로 쓰이고 `g` 플래그만 강제됩니다',
        en: 'What to find. An array tries the longest term first, so `["data", "database"]` marks the whole word. A `RegExp` is used as written, with the global flag forced on'
      }
    },
    {
      name: 'variant',
      type: "'filled' | 'tonal' | 'outlined' | 'text'",
      default: "'tonal'",
      description: {
        ko: '표시의 세기. `tonal`이 기본값이고, 넷 중 형광펜인 것은 그것뿐입니다 — container 톤은 어두운 글자 아래의 옅은 칠이지, 색 덩어리로 바뀐 단어가 아닙니다',
        en: 'How much surface the mark paints. `tonal` is the default and the only one of the four that is actually a highlighter pen: a container tone is a pale wash under dark ink, not a word replaced by a block of colour'
      }
    },
    {
      ...color,
      default: "'tertiary'",
      description: {
        ko: '어떤 강조 계열을 읽을지. `primary`가 아니라 `tertiary`가 기본값입니다 — `primary`는 페이지가 누르라고 말하는 것이고, 검색 결과는 그것이 아닙니다',
        en: 'Which accent family the mark reads. `tertiary` rather than `primary`: `primary` is what a page uses for the thing it wants pressed, and a search match is not that'
      }
    },
    {
      name: 'caseSensitive',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`a`와 `A`를 다른 글자로 볼지',
        en: 'Whether `a` and `A` are different letters'
      }
    },
    {
      name: 'wholeWord',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '단어 하나로 서 있을 때만 표시할지 — `cat`이 "cat"은 표시하고 "concatenate"는 표시하지 않게. 띄어쓰기로 단어를 나누지 않는 한국어·일본어에서는 의미가 거의 없고, 그래서 기본값이 꺼짐입니다',
        en: 'Whether a term has to be a word on its own — `cat` marking "cat" but not "concatenate". It means very little for Korean or Japanese, where a phrase is not delimited by spaces, which is why it is off by default'
      }
    },
    {
      name: 'underline',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '밑줄도 함께 긋습니다. 모든 variant와 조합됩니다',
        en: 'Underlines the mark as well. Combines with every variant'
      }
    },
    {
      name: 'weight',
      type: "'regular' | 'medium' | 'semibold' | 'bold'",
      description: {
        ko: '표시의 굵기. 지정하지 않으면 주위 텍스트의 굵기를 따릅니다 — 면이 이미 "이것"이라고 말하고 있고, 문장 속에서 굵어진 단어는 줄 전체의 리듬을 바꿉니다',
        en: "Sets the mark's weight. Omit it and the mark is the weight of the text around it — the surface is already saying “this one”, and a bolded word inside a sentence changes the rhythm of the whole line"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '검색할 텍스트. 엘리먼트는 안으로 들어가되 그대로 남으므로 `<strong>` 안의 일치도 표시되고 `<strong>`도 살아남습니다',
        en: 'The text to search. Elements are walked into and left otherwise untouched, so a match inside a `<strong>` is still marked and the `<strong>` survives'
      }
    }
  ],

  MPDialog: [
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '열림 여부. controlled로 쓸 때',
        en: 'The dialog is shown, for a controlled dialog'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 열려 있을지',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열림 상태가 바뀔 때', en: 'Called as the open state changes' }
    },
    {
      name: 'trigger',
      type: 'ReactElement',
      description: {
        ko: '대화상자를 여는 엘리먼트. Base UI가 연결합니다. 선택 사항입니다 — 다른 곳에서 여는 controlled 대화상자에는 트리거가 필요 없습니다',
        en: 'The element that opens the dialog, wired up by Base UI. Optional — a controlled dialog opened from elsewhere needs no trigger at all'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '헤드라인 위의 글리프. MD3의 hero icon이고, 넣으면 헤더가 가운데 정렬됩니다 — 아이콘이 있는 대화상자는 *알리고* 있고, 없는 대화상자는 *묻고* 있습니다',
        en: "A glyph above the headline. MD3's own hero icon, and passing one is what centres the header: a dialog with an icon is announcing something, and a dialog without one is asking something"
      }
    },
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '헤드라인. 대화상자의 이름이 되는 `<h2>`로 렌더됩니다',
        en: 'The headline. Rendered as the `<h2>` that names the dialog'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '헤드라인 아래 보조 텍스트이자 대화상자의 접근성 설명',
        en: 'The supporting text under it, and the dialog’s accessible description'
      }
    },
    {
      name: 'actions',
      type: NODE,
      description: {
        ko: '아래 줄. 끝 정렬이므로 버튼 두 개에 래퍼가 필요 없고, `MPDialogClose`가 그중 하나를 닫기 버튼으로 만듭니다',
        en: 'The bottom row. End-aligned, so a pair of buttons needs no wrapper of its own — and `MPDialogClose` is what makes one of them dismiss'
      }
    },
    {
      name: 'dividers',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '헤더·본문·액션 사이를 여백 대신 얇은 선으로 나눕니다. 본문이 스크롤되기 시작하면 켤 만합니다 — 헤더가 그대로 있다는 것을 말해 주는 것이 그 선입니다',
        en: 'Draws a hairline between the header, the body and the actions instead of separating them with space. Worth turning on the moment the body scrolls: the lines are what say the header stayed put'
      }
    },
    {
      name: 'showClose',
      type: 'boolean',
      default: 'fullScreen',
      description: {
        ko: '모서리의 ×. 기본값이 `fullScreen`을 따르는 것은 MD3의 구분입니다 — 기본 대화상자는 액션으로 답하고, 전체 화면 대화상자는 누를 스크림이 없어 ×를 답니다',
        en: "Shows the × in the corner. Defaults to whatever `fullScreen` is, which is MD3's own split: a basic dialog is answered by its actions, while a full-screen one carries a × because there is no scrim left to click"
      }
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Close'",
      description: { ko: '× 버튼의 접근성 이름', en: 'Accessible name of the × button' }
    },
    {
      name: 'width',
      type: 'number | string',
      description: {
        ko: '`size`가 정하는 최대 너비를 덮어쓰는 상한. 숫자는 픽셀입니다. 내용이 너비를 정하는 대화상자를 위한 것이지, 스케일을 손보는 용도가 아닙니다 — 그쪽은 `size`입니다',
        en: "A hard cap on the sheet's width, overriding the one `size` implies. Numbers are pixels. For the dialog whose *content* decides its width, rather than for tuning the scale, which is `size`"
      }
    },
    {
      name: 'fullWidth',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '`size`가 허용하는 너비를 가득 채웁니다. 라이브러리에서 유일하게 기본값이 켜짐인 `fullWidth`입니다 — 대화상자의 컨테이너는 뷰포트이고, 두 단어에 맞춰 줄어든 대화상자는 툴팁입니다',
        en: "The sheet takes the full width its `size` allows. On by default, which is the other way round from every other component: a dialog's container is the viewport, and a dialog that shrank to fit two words would be a tooltip"
      }
    },
    {
      name: 'fullScreen',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '뷰포트를 가장자리까지 채웁니다. 휴대폰 크기 화면이나 에디터를 위한 것',
        en: 'Fills the viewport edge to edge. For a phone-sized screen, or an editor'
      }
    },
    {
      name: 'modal',
      type: "boolean | 'trap-focus'",
      default: 'true',
      description: {
        ko: '뒤 페이지를 가져갈지. `trap-focus`는 페이지를 스크롤·클릭 가능하게 두면서 포커스만 안에 잡아 둡니다',
        en: "Whether the page behind is taken away. `'trap-focus'` keeps the page scrollable and clickable while still holding focus inside"
      }
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description: {
        ko: 'Escape나 바깥 클릭으로 닫을지. 반드시 답해야 하는 대화상자에서는 끄되, 답할 액션을 주세요 — 다른 출구가 없어집니다',
        en: 'Whether Escape or a click outside closes the dialog. Turn it off for the dialog that has to be answered — and then give it actions that answer it, because there will be no other way out'
      }
    },
    size,
    {
      ...color,
      default: "'secondary'",
      description: {
        ko: 'hero icon이 읽는 계열. 시트 자체는 MD3와 마찬가지로 중립으로 남습니다 — 이미 화면에 그것뿐인데 강조 색으로 칠하는 것은 다른 곳을 보고 있지도 않은 사람에게 소리치는 일입니다',
        en: 'Which accent family the hero icon reads. The sheet itself stays neutral, exactly as MD3’s does — a dialog is already the only thing on the screen'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '본문. 스크롤되는 유일한 부분입니다',
        en: 'The body. The only part that scrolls'
      }
    }
  ],

  MPOverlay: [
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '표시 여부. controlled로 쓸 때',
        en: 'The overlay is shown, for a controlled overlay'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 표시되어 있을지',
        en: 'Whether it starts shown, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '표시 상태가 바뀔 때', en: 'Called as the open state changes' }
    },
    {
      name: 'tone',
      type: "'scrim' | 'blur' | 'solid' | 'clear'",
      default: "'scrim'",
      description: {
        ko: '페이지를 얼마나 가져가는지. 한 축의 네 단계입니다 — `clear`는 아무것도 그리지 않고도 클릭을 모두 받아냅니다',
        en: 'How much of the page is taken away. One axis, four steps — `clear` draws nothing at all and still catches every click'
      }
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '오버레이를 클릭하거나 Escape로 닫을 수 있을지. 기본값이 꺼짐이고, 이것이 `MPDialog`와 반대입니다 — 오버레이는 묻고 있는 것이 아니라 *기다리라*고 말하고 있습니다',
        en: 'Whether clicking the overlay or pressing Escape closes it. Off by default, which is the other way round from `MPDialog`: an overlay is not asking anything, it is saying *wait*'
      }
    },
    {
      name: 'modal',
      type: "boolean | 'trap-focus'",
      default: 'true',
      description: {
        ko: '키보드에서도 뒤 페이지를 가져갈지. `trap-focus`는 보통 `clear` 오버레이가 원하는 쪽입니다',
        en: "Whether the page behind is taken away for the keyboard too. `'trap-focus'` is usually what a `clear` overlay wants"
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: {
        ko: '내용이 뷰포트 세로 어디에 놓일지',
        en: 'Where the content sits down the viewport'
      }
    },
    {
      ...size,
      description: {
        ko: '내용과 뷰포트 가장자리 사이의 여백. 여기서 `size`가 정하는 것은 그것뿐입니다 — 오버레이에는 크기를 잴 면이 없습니다',
        en: 'The room between the content and the edge of the viewport. The one thing `size` decides here — an overlay has no surface of its own to scale'
      }
    },
    {
      name: 'label',
      type: 'string',
      default: "'Overlay'",
      description: {
        ko: '오버레이의 접근성 이름. 라이브러리에서 거의 유일하게 기본값이 있는 라벨입니다 — 읽을 것이 없는 오버레이도 자신이 무엇인지는 말해야 합니다',
        en: 'The accessible name of the overlay. It has a default rather than being optional, which almost nothing else here does: an overlay that holds nothing readable still has to say what it is'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '스크림 위에 놓이는 것 — 스피너, 한 줄, 작은 카드',
        en: 'What sits on top — a spinner, a line of text, a small card'
      }
    }
  ],

  MPProgressLinear: [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: {
        ko: '`min`과 `max` 사이의 진행도. `null`이 기본값이자 indeterminate입니다 — 값을 듣지 못한 표시기는 빈 바를 그릴 것이 아니라 모른다고 말해야 합니다',
        en: 'How far along, between `min` and `max`. `null` — the default — is the indeterminate case: an indicator that has not been told a value should say so rather than draw an empty track'
      }
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: { ko: '범위의 시작', en: 'The start of the range' }
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: { ko: '범위의 끝', en: 'The end of the range' }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '무엇이 진행 중인지의 이름. 스크린 리더가 값과 함께 읽습니다',
        en: 'A name for what is loading. Read out with the value by a screen reader'
      }
    },
    {
      name: 'hideLabel',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '그 이름을 스크린 리더에는 남기고 화면에서만 뺍니다. 주변이 이미 이름을 말하고 있는 표시기를 위한 것입니다 — 이름을 *지우면* `progressbar`가 "63%"로만 읽히는데, 그것은 주어 없는 숫자입니다',
        en: 'Keeps that name for a screen reader and takes it off the screen, for the indicator already labelled by what is around it. *Removing* it instead leaves a `progressbar` announced as “63%” and nothing else, which is a number with no subject'
      }
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '값을 도형 옆에 글자로 보여줍니다. `format`이 없으면 범위의 백분율입니다',
        en: 'Shows the value as text beside the shape. A percentage of the range unless `format` says otherwise'
      }
    },
    {
      name: 'format',
      type: 'Intl.NumberFormatOptions',
      description: {
        ko: '값을 보여줄 때의 표기. `Intl.NumberFormat` 옵션이므로 바이트나 통화도 됩니다. 없으면 백분율인데, 아무도 설명하지 않은 범위에 대해 성립하는 유일한 표기가 그것입니다',
        en: 'How the value is written when it is shown — `Intl.NumberFormat` options, so bytes and currencies work as well as plain numbers. Without it the value is a percentage, which is the only formatting that holds for a range nobody described'
      }
    },
    {
      ...size,
      description: {
        ko: '홈의 두께. `md`가 MD3의 4dp이고, 바에서 크기를 갖는 것은 그것뿐입니다',
        en: "Thickness of the track. `md` is MD3's own 4dp, and nothing else on a bar has a size"
      }
    },
    color
  ],

  MPProgressCircular: [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: {
        ko: '`min`과 `max` 사이의 진행도. `null`이 기본값이자 indeterminate입니다',
        en: 'How far along, between `min` and `max`. `null` — the default — is the indeterminate case'
      }
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: { ko: '범위의 시작', en: 'The start of the range' }
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: { ko: '범위의 끝', en: 'The end of the range' }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '무엇이 진행 중인지의 이름', en: 'A name for what is loading' }
    },
    {
      name: 'hideLabel',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '그 이름을 스크린 리더에는 남기고 화면에서만 뺍니다. 주변이 이미 이름을 말하고 있는 표시기를 위한 것입니다 — 이름을 *지우면* `progressbar`가 "63%"로만 읽히는데, 그것은 주어 없는 숫자입니다',
        en: 'Keeps that name for a screen reader and takes it off the screen, for the indicator already labelled by what is around it. *Removing* it instead leaves a `progressbar` announced as “63%” and nothing else, which is a number with no subject'
      }
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '값을 링 옆에 글자로 보여줍니다',
        en: 'Shows the value as text beside the ring'
      }
    },
    {
      name: 'format',
      type: 'Intl.NumberFormatOptions',
      description: { ko: '값을 보여줄 때의 표기', en: 'How the value is written when it is shown' }
    },
    {
      ...size,
      description: {
        ko: '링의 지름. `md`가 MD3의 48dp이고, 모든 단계가 같은 이름의 컨트롤 높이 안에 들어갑니다 — 버튼이나 표 행에 넣어도 행이 높아지지 않습니다',
        en: "Diameter of the ring. `md` is MD3's own 48dp, and every rung sits inside the control height of the same name — so a spinner dropped into a button or a table row never makes it taller"
      }
    },
    color
  ],

  MPProgressBox: [
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description: {
        ko: '`min`과 `max` 사이의 진행도. `null`이 기본값이자 indeterminate입니다',
        en: 'How far along, between `min` and `max`. `null` — the default — is the indeterminate case'
      }
    },
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: { ko: '범위의 시작', en: 'The start of the range' }
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: { ko: '범위의 끝', en: 'The end of the range' }
    },
    {
      name: 'count',
      type: 'number',
      default: '4',
      description: {
        ko: '조각의 개수. 넷이면 물결이 물결로 읽히면서도 한눈에 셀 수 있습니다. 기다리는 일에 진짜 단계가 있다면 그 수로 두세요',
        en: 'How many segments the row is made of. Four is enough that the wave reads as a wave and few enough to count at a glance. Set it to the number of steps when the thing being waited on genuinely has steps'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: { ko: '무엇이 진행 중인지의 이름', en: 'A name for what is loading' }
    },
    {
      name: 'hideLabel',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '그 이름을 스크린 리더에는 남기고 화면에서만 뺍니다. 주변이 이미 이름을 말하고 있는 표시기를 위한 것입니다 — 이름을 *지우면* `progressbar`가 "63%"로만 읽히는데, 그것은 주어 없는 숫자입니다',
        en: 'Keeps that name for a screen reader and takes it off the screen, for the indicator already labelled by what is around it. *Removing* it instead leaves a `progressbar` announced as “63%” and nothing else, which is a number with no subject'
      }
    },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '값을 조각 줄 위에 글자로 보여줍니다',
        en: 'Shows the value as text above the row'
      }
    },
    {
      name: 'format',
      type: 'Intl.NumberFormatOptions',
      description: { ko: '값을 보여줄 때의 표기', en: 'How the value is written when it is shown' }
    },
    { ...size, description: { ko: '조각 하나의 크기', en: 'Size of one segment' } },
    color
  ],

  MPSnackbarProvider: [
    {
      ...color,
      default: undefined,
      description: {
        ko: '판을 칠할 계열. **기본값이 없습니다** — 지정하지 않으면 MD3의 `inverse-surface`이고, 액션은 `inverse-primary`입니다. 페이지를 뒤집은 판 위에서 `primary`는 읽히지 않도록 만들어진 색입니다',
        en: 'Which family the plate is painted in. **No default** — left unset it is MD3’s `inverse-surface`, with the action in `inverse-primary`: on a plate that inverts the page, `primary` is the one colour guaranteed not to read'
      }
    },
    {
      name: 'position',
      type: "`top-${'start' | 'center' | 'end'}` | `bottom-${'start' | 'center' | 'end'}`",
      default: "'bottom-start'",
      description: {
        ko: '스택이 붙는 자리. `bottom-start`가 MD3의 배치입니다. 한 단어가 아니라 두 단어인 것은 둘이 독립이 아니기 때문입니다 — 스낵바 스택은 언제나 위나 아래에 붙지, 옆에 붙지 않습니다',
        en: "Where the stack is pinned. `bottom-start` is MD3's own placement. Two words rather than a `side` and an `align`, because they are not independent: a snackbar stack is always pinned to the top or the bottom, never to a side"
      }
    },
    {
      name: 'timeout',
      type: 'number',
      default: '5000',
      description: {
        ko: '기본 유지 시간(ms). `0`이면 닫힐 때까지 남습니다 — 사용자가 행동해야 하는 메시지에는 그쪽이 맞습니다',
        en: 'How long a snackbar lasts by default, in milliseconds. `0` keeps it up until it is closed, which is the right answer for anything the reader has to act on'
      }
    },
    {
      name: 'limit',
      type: 'number',
      default: '3',
      description: {
        ko: '한 번에 보이는 개수. 나머지는 버려지지 않고 스택이 비는 대로 올라옵니다',
        en: 'How many are shown at once. The rest are kept and revealed as the stack drains rather than being thrown away'
      }
    },
    {
      name: 'width',
      type: 'number | string',
      default: '600',
      description: {
        ko: '스낵바의 최대 너비. 숫자는 픽셀이고, 600은 MD3의 최대치입니다',
        en: "How wide a snackbar may get. Numbers are pixels; 600 is MD3's own maximum"
      }
    },
    {
      ...size,
      description: { ko: '판이 그려지는 타입 스케일', en: 'The type scale the plate is drawn at' }
    },
    {
      name: 'showClose',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '모든 스낵바에 ×를 답니다. 기본값이 켜짐인 이유는 `timeout: 0`에 액션도 없는 스낵바에는 다른 출구가 없기 때문입니다',
        en: 'Shows the × on every snackbar. On by default, because a snackbar with `timeout: 0` and no action would otherwise have no way out at all'
      }
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Close'",
      description: {
        ko: '× 버튼의 접근성 이름',
        en: 'Accessible name of every snackbar’s × button'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '앱. 한 번만 감싸면 됩니다', en: 'The application. Wrap it once' }
    }
  ],

  MPSnackbarOptions: [
    {
      name: 'message',
      type: NODE,
      description: {
        ko: '스낵바가 말하는 것. 제목과 본문이 아니라 한 칸입니다 — MD3의 스낵바에는 보조 텍스트 한 줄(최대 두 줄)뿐이고, 제목이 필요한 메시지는 스낵바가 아니라 아직 보여주지 않은 대화상자입니다',
        en: "What it says. One slot, not a title and a body: MD3's snackbar has a single run of supporting text and nothing else. A message that needs a heading is not a snackbar — it is a dialog the reader has not been shown yet"
      }
    },
    {
      name: 'id',
      type: 'string',
      description: {
        ko: '같은 id를 다시 쓰면 그 스낵바를 제자리에서 갱신하고 타이머를 다시 시작합니다 — "업로드 중… / 업로드됨"이 원하는 것이 이것입니다',
        en: 'Reusing an id updates that snackbar in place and restarts its timer, which is what “uploading… / uploaded” wants: one message that changed its mind, not two stacked on each other'
      }
    },
    {
      name: 'actionLabel',
      type: NODE,
      description: {
        ko: '액션의 라벨. 넘기는 것이 곧 액션을 만드는 일입니다',
        en: 'The label of the action. Passing it is what makes the action appear'
      }
    },
    {
      name: 'onAction',
      type: '(event: React.MouseEvent<HTMLButtonElement>) => void',
      description: { ko: '액션을 눌렀을 때', en: 'Called when the action is pressed' }
    },
    {
      name: 'timeout',
      type: 'number',
      description: {
        ko: '이 스낵바만의 유지 시간(ms). `0`이면 닫힐 때까지',
        en: 'How long this one lasts, in milliseconds. `0` keeps it up until it is closed'
      }
    },
    {
      name: 'priority',
      type: "'low' | 'high'",
      default: "'low'",
      description: {
        ko: '`high`는 스크린 리더를 끊고, `low`는 쉬는 지점을 기다립니다. 오류는 끊을 만하고 저장 확인은 아닙니다',
        en: '`high` interrupts a screen reader; `low` waits for a pause. An error is worth interrupting for and a save confirmation is not'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '이 스낵바만의 계열. provider의 값을 덮어씁니다',
        en: 'This one’s family, overriding the provider’s'
      }
    },
    {
      name: 'icon',
      type: `${NODE} | false`,
      description: { ko: '메시지 앞의 글리프', en: 'A glyph before the message' }
    },
    {
      name: 'position',
      type: "`top-${'start' | 'center' | 'end'}` | `bottom-${'start' | 'center' | 'end'}`",
      description: {
        ko: '이 스낵바만 다른 줄에 붙입니다. provider의 `position`을 덮어씁니다 — 툴바가 있는 화면 아래쪽을 피해야 하는 오류처럼, 무엇인지 때문에 자리가 달라져야 하는 메시지를 위한 것입니다. 여섯 줄은 처음부터 모두 페이지에 있습니다: 각 줄이 자기 `aria-live` 영역이고, 안의 메시지와 같은 순간에 생긴 영역은 스크린 리더가 읽지 않습니다',
        en: 'Puts this one in a different stack, overriding the provider’s `position` — for the message that has to be somewhere else because of *what it is*, such as an error on a page whose bottom corner is a toolbar. All six stacks are on the page from the start: each is its own `aria-live` region, and a region added at the same instant as the message inside it is one a screen reader does not read'
      }
    },
    {
      name: 'className',
      type: 'string',
      description: {
        ko: '이 스낵바의 판 — 줄이 아니라 면을 그리는 엘리먼트 — 에 붙습니다',
        en: 'Added to this snackbar’s plate: the element that draws the surface, not the stack around it'
      }
    },
    {
      name: 'onClose',
      type: '() => void',
      description: {
        ko: '어떤 방식으로든 닫혔을 때',
        en: 'Called when it closes, however it closed'
      }
    },
    {
      name: 'onRemove',
      type: '() => void',
      description: {
        ko: '사라지는 애니메이션까지 끝나고 DOM에서 빠졌을 때',
        en: 'Called once it has finished animating out and left the DOM'
      }
    }
  ],

  MPCombobox: [
    {
      name: 'items',
      type: 'readonly MPComboboxOption[]',
      required: true,
      description: {
        ko: '선택지를 데이터로. `MPSelect`와 같은 모양이고 이유도 같습니다 — 호출자가 이미 가진 것은 거의 언제나 배열입니다',
        en: 'The options, as data — the same shape `MPSelect` takes, and for the same reason: what a caller has is almost always an array already'
      }
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '값을 여러 개 가질 수 있는지. 고른 값은 필드 안의 `MPChip`이 되고, 입력은 그 뒤로도 계속 필터링합니다',
        en: 'Whether more than one value may be held. The chosen ones become `MPChip`s inside the field, and the input goes on filtering after each'
      }
    },
    {
      name: 'value',
      type: 'MPComboboxValue | MPComboboxValue[] | null',
      description: {
        ko: '고른 값. `onValueChange`와 함께 controlled로',
        en: 'The chosen value. Use with `onValueChange` for a controlled combobox'
      }
    },
    {
      name: 'defaultValue',
      type: 'MPComboboxValue | MPComboboxValue[] | null',
      description: {
        ko: '처음에 고른 값. uncontrolled로 쓸 때',
        en: 'The initially chosen value, for an uncontrolled combobox'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: MPComboboxValue | MPComboboxValue[] | null) => void',
      description: {
        ko: '새로 고른 값과 함께 — 이벤트가 아니라 값입니다',
        en: 'Called with the newly chosen value — a value, not an event'
      }
    },
    {
      name: 'onInputValueChange',
      type: '(inputValue: string) => void',
      description: {
        ko: '입력 텍스트가 바뀔 때. 값이 아니라 필터 질의입니다',
        en: 'Called as the text in the input changes — the filter query, not the value'
      }
    },
    {
      name: 'allowCustom',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '목록에 없는 값을 확정할 수 있는지. 기본값이 켜짐이고, 이것이 검색되는 Select와의 차이입니다 — 입력한 텍스트가 목록 끝에 한 행으로 제시되므로 확정은 blur에서 일어나는 일이 아니라 사용자의 선택입니다',
        en: 'Whether a value the list does not contain may be committed. On by default, and it is what separates this from a searchable select: the typed text is offered as its own row at the end of the list, so committing it is a choice the reader makes rather than something that happens to them on blur'
      }
    },
    {
      name: 'customLabel',
      type: '(query: string) => ReactNode',
      description: {
        ko: '그 행이 말하는 문구. 다듬어진 질의를 받습니다',
        en: 'What that row says. Receives the trimmed query'
      }
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '필드를 비우는 ×를 답니다. 기본값이 꺼짐인 이유는 한 번 클릭으로 비워지는 필드는 실수로도 비워지기 때문입니다',
        en: 'Shows a × that empties the field. Off by default — a field that can be cleared in one click is a field that can be emptied by accident'
      }
    },
    {
      name: 'emptyMessage',
      type: NODE,
      default: "'No matches'",
      description: {
        ko: '일치하는 것도 없고 추가할 수도 없을 때 팝업에 보이는 것',
        en: 'Shown in the popup when nothing matches and no value may be added'
      }
    },
    {
      name: 'limit',
      type: 'number',
      default: '-1',
      description: {
        ko: '한 번에 보여줄 최대 행 수. `-1`은 전부',
        en: 'The most rows the list will show at once. `-1` is all of them'
      }
    },
    {
      name: 'filter',
      type: '((option: MPComboboxOption, query: string) => boolean) | null',
      description: {
        ko: '질의를 통과할 행을 이 컴포넌트의 매칭 대신 정합니다. **`null`이면 필터링을 아예 끕니다** — 키 입력마다 서버가 이미 골라 준 목록에 여기서 한 번 더 거르면 서버가 일치라고 판단한 행을 지우는 일밖에 할 수 없습니다. 입력한 값을 제안하는 행은 어느 쪽이든 예외입니다',
        en: 'Which rows survive the query, in place of the matching this does on its own. **`null` turns the filtering off entirely** — for a list already matched per keystroke by a server, where a second pass here can only take away rows that server decided were hits. The row offering what was typed is exempt either way'
      }
    },
    {
      name: 'chipVariant',
      type: VARIANT,
      description: {
        ko: '`multiple`일 때 필드 안 칩이 칠해지는 방식. 기본값은 `tonal`이고 오류 상태에서는 `outlined`입니다. 칩 여섯 개가 꽉 찬 필드는 값이 아니라 버튼 줄로 읽히니 그때는 `outlined`가 낫습니다',
        en: 'How the chips inside a `multiple` field are painted. The default is `tonal`, or `outlined` while the field is in its error state — a field holding six filled chips reads as a row of buttons rather than as a value, which is what `outlined` throughout is for'
      }
    },
    {
      name: 'chipColor',
      type: COLOR,
      description: {
        ko: '그 칩들이 읽는 강조 색 계열. 기본값은 `primary`이고 오류 상태에서는 `error`입니다',
        en: 'Which accent family those chips read. Defaults to `primary`, or `error` while the field is in its error state'
      }
    },
    {
      name: 'placeholder',
      type: 'string',
      description: {
        ko: '아무것도 입력되지 않았을 때 보이는 것',
        en: 'Shown in the input while nothing is typed'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '외곽선 노치 안의 라벨. 고른 것도 입력한 것도 없고 포커스도 없고 `startIcon`도 없는 동안에는 입력 줄 위에 내려와 있습니다 — `floatingLabel` 참고',
        en: "Label in the outline's notch, resting on the input's own line while nothing is chosen or typed, the control is unfocused and there is no `startIcon`. See `floatingLabel`"
      }
    },
    {
      name: 'floatingLabel',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '비어 있는 동안 라벨을 입력 줄에 내려두고 포커스·첫 글자·첫 칩에서 홈으로 올릴지 여부. `false`면 홈에 고정됩니다. `startIcon`이 있으면 언제나 홈에 있습니다',
        en: "Whether the label rests on the input's line while it is empty and rises into the notch on focus, on the first character or on the first chip. `false` pins it in the notch, and a `startIcon` holds it up regardless"
      }
    },
    description,
    errorMessage,
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '입력 앞에 놓이는 내용 — 보통 `MPIcon`',
        en: 'Content placed before the input — an `MPIcon`, usually'
      }
    },
    size,
    fullWidth,
    required,
    disabled,
    readOnly,
    name,
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '팝업의 열림 여부. controlled로 쓸 때',
        en: 'The popup is open, for a controlled popup'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: { ko: '팝업이 처음에 열려 있을지', en: 'Whether the popup starts open' }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '팝업 상태가 바뀔 때', en: 'Called as the popup opens and closes' }
    },
    {
      name: 'clearLabel',
      type: 'string',
      default: "'Clear'",
      description: { ko: '× 버튼의 접근성 이름', en: 'Accessible name of the clear button' }
    },
    {
      name: 'openLabel',
      type: 'string',
      default: "'Open'",
      description: {
        ko: '`label`이 없는 콤보박스에서 목록을 여는 셰브런의 접근성 이름. 라벨이 있으면 Base UI가 셰브런을 필드 이름으로 부르고, `aria-labelledby`가 `aria-label`을 이깁니다',
        en: 'Accessible name of the chevron, **for a combobox with no `label`**. With a label, Base UI names the chevron after the field itself and that name wins — `aria-labelledby` outranks `aria-label`'
      }
    },
    {
      name: 'removeLabel',
      type: '(label: string) => string',
      description: {
        ko: '칩의 제거 버튼 접근성 이름. 칩의 라벨을 받습니다',
        en: 'Accessible name of a chip’s remove button. Receives the chip’s label'
      }
    },
    {
      name: 'inputRef',
      type: 'React.Ref<HTMLInputElement>',
      description: {
        ko: '사용자가 입력하는 텍스트 입력에 대한 ref',
        en: 'A ref to the text input the reader types into'
      }
    },
    id
  ],

  MPComboboxOption: [
    {
      name: 'value',
      type: 'string | number',
      required: true,
      description: {
        ko: '제출되는 값이자 `value`/`onValueChange`가 말하는 것',
        en: 'Submitted, and what `value` and `onValueChange` speak in'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '목록·입력·칩에 보이는 것. 기본값은 값 자체입니다. `MPSelect`와 달리 `ReactNode`가 아닌 `string`인 이유는 이 라벨이 필터가 비교하는 대상이자 텍스트 입력에 써 넣는 값이기 때문입니다',
        en: 'Shown in the list, in the input and on the chip. Defaults to the value. A `string` rather than a `ReactNode` — the one place this differs from `MPSelect` — because the label is what the filter matches against and what is written into a text input. `content` is how a row draws as something richer'
      }
    },
    {
      name: 'content',
      type: NODE,
      description: {
        ko: '팝업의 행이 라벨보다 더 많은 것을 그릴 때 그 내용 — 썸네일, 글리프, 두 번째 줄. **팝업에서만** 라벨을 대신합니다: 입력칸과 칩은 여전히 `label`을 받고 필터도 `label`을 비교합니다',
        en: 'What the row in the popup draws when that is more than the label — a thumbnail, a glyph, a second line. It replaces the label **in the popup only**: the input and the chip still receive `label`, and the filter still matches against it'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: {
        ko: '고를 수 없지만 목록에는 남습니다',
        en: 'Unavailable, but still listed — the option exists, it just cannot be picked'
      }
    }
  ],

  MPOtpField: [
    {
      name: 'length',
      type: 'number',
      default: '6',
      description: {
        ko: '코드의 글자 수. 2–12로 제한됩니다 — 한 칸은 `MPTextField`이고, 열둘을 넘으면 줄이 휴대폰에 들어가지 않습니다',
        en: 'How many characters the code has. Clamped to 2–12: a single box is an `MPTextField`, and past twelve the row stops fitting a phone'
      }
    },
    {
      name: 'charset',
      type: "'numeric' | 'alpha' | 'alphanumeric' | 'any'",
      default: "'numeric'",
      description: {
        ko: '입력할 수 있는 것. 거부된 글자는 보여주지 않고 버려지며 `onValueInvalid`로 알립니다. `numeric`이 기본값인 이유는 문자로 오는 코드가 그것이고, 휴대폰에 숫자판을 띄우는 것도 그것이기 때문입니다',
        en: 'What may be typed. Anything rejected is dropped rather than shown, and `onValueInvalid` reports it. `numeric` is the default because that is what a texted code is, and it is what puts a number pad in front of a phone'
      }
    },
    {
      name: 'mask',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '비밀번호 필드처럼 글자를 가립니다',
        en: 'Hides the characters, the way a password field does'
      }
    },
    {
      name: 'groupSize',
      type: 'number',
      description: {
        ko: '`groupSize`칸마다 구분자로 줄을 나눕니다. 여섯 자리에 `3`이면 익숙한 세 자리 두 묶음',
        en: 'Splits the row every `groupSize` slots with a separator. `3` on a six-digit code gives the familiar two blocks of three'
      }
    },
    {
      name: 'separator',
      type: NODE,
      default: "'–'",
      description: { ko: '두 묶음 사이에 그려지는 것', en: 'What is drawn between two groups' }
    },
    {
      name: 'value',
      type: 'string',
      description: {
        ko: '코드. `onValueChange`와 함께 controlled로',
        en: 'The code. Use with `onValueChange` for a controlled field'
      }
    },
    {
      name: 'defaultValue',
      type: 'string',
      description: {
        ko: '처음 값. uncontrolled로 쓸 때',
        en: 'What it starts as, for an uncontrolled one'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: { ko: '값이 바뀔 때', en: 'Called as the value changes' }
    },
    {
      name: 'onComplete',
      type: '(value: string) => void',
      description: {
        ko: '모든 칸이 채워지는 순간 — 코드를 확인할 시점',
        en: 'Fires once every slot is filled — the moment to verify the code'
      }
    },
    {
      name: 'onValueInvalid',
      type: '(value: string) => void',
      description: {
        ko: '입력하거나 붙여넣은 텍스트에 charset이 거부한 글자가 있었을 때',
        en: 'Fires when typed or pasted text held characters the charset rejects'
      }
    },
    {
      name: 'autoSubmit',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '코드가 완성되면 폼을 바로 제출합니다',
        en: 'Submits the owning form as soon as the code is complete'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '줄 위의 라벨. 노치가 아니라 위에 붙는 것이 이 컨트롤이 `MPTextField`의 껍데기에서 벗어나는 유일한 지점입니다 — 노치 라벨은 외곽선 상자 *하나*의 것이고, 코드는 여섯 개입니다',
        en: "The label above the row. Above it rather than in a notch, which is the one place this control departs from `MPTextField`'s shell: a notched label belongs to *one* outlined box, and a code is six of them"
      }
    },
    description,
    errorMessage,
    size,
    fullWidth,
    required,
    disabled,
    readOnly,
    name,
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '마운트할 때 첫 칸에 캐럿을 둡니다',
        en: 'Puts the caret in the first slot on mount'
      }
    }
  ],

  MPMenu: [
    {
      name: 'trigger',
      type: 'ReactElement',
      description: {
        ko: '메뉴를 여는 엘리먼트. Base UI가 연결합니다. 선택 사항입니다 — 다른 곳에서 여는 controlled 메뉴에는 트리거가 필요 없습니다',
        en: 'The element that opens the menu, wired up by Base UI. Optional — a controlled menu opened from elsewhere needs no trigger of its own'
      }
    },
    {
      name: 'nativeButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '트리거가 진짜 `<button>`을 그리는지. 대개 그렇습니다 — `MPButton`, `MPIconButton`, `onClick`이 있는 `MPChip`. 아바타나 카드처럼 일부러 다른 것을 트리거로 줄 때 `false`로 두면 Base UI가 role과 탭 스톱, Enter/Space 처리를 대신 붙여 줍니다',
        en: 'Whether the trigger renders a real `<button>`. It nearly always does — an `MPButton`, an `MPIconButton`, an `MPChip` with an `onClick`. Set it `false` for a trigger that is deliberately something else, and Base UI supplies the role, the tab stop and the Enter/Space handling a `<button>` would have brought'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '열림 여부. controlled로 쓸 때',
        en: 'Whether the menu is open, for a controlled menu'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 열려 있을지',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열림 상태가 바뀔 때', en: 'Called as the open state changes' }
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: {
        ko: '트리거의 어느 변에 매달릴지',
        en: 'Which edge of the trigger it hangs off'
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: { ko: '그 변을 따라 어디에 놓일지', en: 'Where it sits along that edge' }
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '4',
      description: { ko: '트리거와의 거리(px)', en: 'Distance from the trigger, in pixels' }
    },
    {
      name: 'modal',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '메뉴가 열려 있는 동안 뒤 페이지를 가져갈지',
        en: 'Whether the page behind is taken away while the menu is open'
      }
    },
    {
      name: 'openOnHover',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '클릭뿐 아니라 hover로도 엽니다. 메뉴 하나를 연 채로 줄을 가로지르면 닫히는 대신 옆으로 넘어가야 하는 메뉴 바를 위한 것',
        en: 'Opens on hover as well as on click. For a menu bar, where crossing the row with one menu open should walk through the others rather than close them'
      }
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '화살표 키가 마지막에서 첫 행으로 돌아갈지',
        en: 'Whether the arrow keys wrap from the last row back to the first'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '트리거가 아무것도 열지 않게 합니다',
        en: 'Unavailable. The trigger stops opening anything'
      }
    },
    {
      ...size,
      description: {
        ko: '행 높이와 타입 스케일. `md`가 MD3의 48dp입니다',
        en: "The row height and type scale. `md` is MD3's own 48dp"
      }
    },
    {
      ...color,
      description: {
        ko: '체크되거나 선택된 행이 읽는 계열. 팝업 자체는 MD3와 마찬가지로 중립으로 남습니다',
        en: 'Which accent family a ticked or chosen row reads. The popup itself stays neutral, as MD3’s does'
      }
    },
    { name: 'children', type: NODE, description: { ko: '행들', en: 'The rows' } }
  ],

  MPMenuItem: [
    {
      name: 'onClick',
      type: '(event: React.MouseEvent<HTMLElement>) => void',
      description: {
        ko: '행이 하는 일. 이것도 없고 링크도 아니면 그 행은 라벨입니다',
        en: 'What the row does. Not given, and not a link, the row is a label'
      }
    },
    {
      name: 'href',
      type: 'string',
      description: {
        ko: '행을 진짜 `<a>`로 렌더합니다. 링크의 메뉴는 링크여야 합니다 — 아닌 것은 새 탭으로 열 수도, 복사할 수도 없고, 스크린 리더에게 매번 틀린 것을 말합니다',
        en: 'Renders the row as a real `<a>`. A menu of links has to be links: one that is not cannot be opened in a new tab, cannot be copied, and tells a screen reader the wrong thing about every row'
      }
    },
    {
      name: 'target',
      type: 'string',
      description: {
        ko: '링크가 열리는 곳. `href` 없이는 무시됩니다',
        en: 'Where the link opens. Ignored without `href`'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '라벨 앞의 내용 — 아이콘, 스와치, 아바타',
        en: 'Content before the label — an icon, a swatch, an avatar'
      }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: {
        ko: '라벨 뒤, `shortcut` 앞의 내용',
        en: 'Content after the label, before any `shortcut`'
      }
    },
    {
      name: 'shortcut',
      type: NODE,
      description: {
        ko: '같은 일을 하는 키 조합. 행 끝에 흐리게 놓입니다. 텍스트일 뿐이고 — 바인딩하는 것은 행이 아니라 애플리케이션입니다',
        en: 'The keystroke that does the same thing, set at the end of the row and muted. Text only — the row does not bind it, the application does'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '라벨 아래 한 줄. 한 단계 작고 흐립니다',
        en: 'A second line under the label, one step down the type scale and muted'
      }
    },
    {
      ...color,
      default: undefined,
      description: {
        ko: '행의 계열을 다시 겨눕니다 — 삭제하는 행에는 `error`. 기본값은 메뉴의 것입니다',
        en: 'Re-points the row’s family — `error` for the one that deletes. Defaults to the menu’s own'
      }
    },
    {
      name: 'closeOnClick',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '행을 고르면 메뉴가 닫힐지',
        en: 'Whether picking the row closes the menu'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '고를 수 없지만 목록에 남고 typeahead에도 걸립니다',
        en: 'Unavailable. Still listed, and still found by typeahead'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '라벨이 문자열이 아닐 때 typeahead가 비교할 문자열',
        en: 'What typeahead matches against, when the label is not a plain string'
      }
    },
    { name: 'children', type: NODE, description: { ko: '라벨', en: 'The label' } }
  ],

  MPMenuCheckboxItem: [
    {
      name: 'checked',
      type: 'boolean',
      description: {
        ko: '체크 여부. controlled로 쓸 때',
        en: 'Whether the row is ticked, for a controlled row'
      }
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      description: {
        ko: '처음에 체크되어 있을지',
        en: 'Whether it starts ticked, for an uncontrolled one'
      }
    },
    {
      name: 'onCheckedChange',
      type: '(checked: boolean) => void',
      description: { ko: '체크 상태가 바뀔 때', en: 'Called as the ticked state changes' }
    },
    {
      name: 'closeOnClick',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '체크하면 메뉴가 닫힐지. 일반 행의 `true`가 아니라 `false`인 이유는 체크하는 목록은 하나 이상 체크하는 목록이기 때문입니다',
        en: 'Whether ticking the row closes the menu. `false` here rather than the `true` a plain row takes: a list of things to tick is a list you tick more than one of'
      }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: { ko: '라벨 뒤의 내용', en: 'Content after the label' }
    },
    {
      name: 'shortcut',
      type: NODE,
      description: { ko: '행 끝의 키 조합', en: 'The keystroke at the end of the row' }
    },
    {
      name: 'description',
      type: NODE,
      description: { ko: '라벨 아래 한 줄', en: 'A second line under the label' }
    },
    { ...color, default: undefined, description: { ko: '행의 계열', en: 'The row’s family' } },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: { ko: '고를 수 없습니다', en: 'Unavailable' }
    },
    { name: 'children', type: NODE, description: { ko: '라벨', en: 'The label' } }
  ],

  MPMenuRadioItem: [
    {
      name: 'value',
      type: 'string | number',
      required: true,
      description: { ko: '이 행이 그룹에 설정하는 값', en: 'What this row sets the group to' }
    },
    {
      name: 'closeOnClick',
      type: 'boolean',
      default: 'false',
      description: { ko: '고르면 메뉴가 닫힐지', en: 'Whether choosing the row closes the menu' }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: { ko: '라벨 뒤의 내용', en: 'Content after the label' }
    },
    {
      name: 'shortcut',
      type: NODE,
      description: { ko: '행 끝의 키 조합', en: 'The keystroke at the end of the row' }
    },
    {
      name: 'description',
      type: NODE,
      description: { ko: '라벨 아래 한 줄', en: 'A second line under the label' }
    },
    { ...color, default: undefined, description: { ko: '행의 계열', en: 'The row’s family' } },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: { ko: '고를 수 없습니다', en: 'Unavailable' }
    },
    { name: 'children', type: NODE, description: { ko: '라벨', en: 'The label' } }
  ],

  MPMenuSubmenu: [
    {
      name: 'label',
      type: NODE,
      description: { ko: '하위 메뉴를 여는 행의 라벨', en: 'The label on the row that opens it' }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 내용', en: 'Content before the label' }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: { ko: '열 수 없습니다', en: 'Unavailable' }
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'right'",
      description: {
        ko: '부모 행의 어느 변에 열릴지',
        en: 'Which edge of the parent row it opens against'
      }
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '0',
      description: { ko: '부모 메뉴와의 거리(px)', en: 'Distance from the parent menu, in pixels' }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '중첩된 행들. 하위 메뉴 안의 하위 메뉴도 같은 컴포넌트입니다',
        en: 'The nested rows. A submenu of a submenu needs no different component'
      }
    }
  ],

  MPContextMenu: [
    {
      name: 'content',
      type: NODE,
      required: true,
      description: {
        ko: '행들. `MPMenu` 안에 쓰는 것과 똑같이 씁니다',
        en: 'The rows, exactly as they are written inside an `MPMenu`'
      }
    },
    {
      name: 'children',
      type: NODE,
      required: true,
      description: {
        ko: '오른쪽 클릭이나 길게 누르기에 답하는 영역. 여기서 트리거는 넘겨받는 엘리먼트 하나가 아니라 페이지의 한 구역이고, 감싸는 대상이 그 구역입니다',
        en: 'The area that answers a right-click or a long press. Here the trigger is not one element handed over, it is a region of the page — and the region is the thing being wrapped'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '열림 여부. controlled로 쓸 때',
        en: 'Whether the menu is open, for a controlled menu'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: { ko: '처음에 열려 있을지', en: 'Whether it starts open' }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열림 상태가 바뀔 때', en: 'Called as the open state changes' }
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '화살표 키가 마지막에서 첫 행으로 돌아갈지',
        en: 'Whether the arrow keys wrap from the last row back to the first'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: { ko: '아무것도 열지 않습니다', en: 'Unavailable' }
    },
    size,
    color
  ],

  MPColorPicker: [
    {
      name: 'value',
      type: 'string',
      description: {
        ko: '색. CSS 문자열입니다. 넘기면 picker를 직접 몰게 됩니다',
        en: 'The colour, as a CSS string. Pass it to drive the picker yourself'
      }
    },
    {
      name: 'defaultValue',
      type: 'string',
      default: "'#00639b'",
      description: { ko: 'uncontrolled picker의 시작값', en: 'Where an uncontrolled picker starts' }
    },
    {
      name: 'onValueChange',
      type: '(value: string) => void',
      description: {
        ko: '`format`으로 쓰인 새 색과 함께',
        en: 'Called with the new colour, written in `format`'
      }
    },
    {
      name: 'format',
      type: "'hex' | 'rgb' | 'hsl'",
      default: "'hex'",
      description: {
        ko: '값이 어떤 표기로 나갈지',
        en: 'Which notation the value is written in on the way out'
      }
    },
    {
      name: 'alpha',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '불투명도 레일을 더하고, 값이 네 번째 채널을 갖게 합니다',
        en: 'Offers an opacity rail, and lets the value carry a fourth channel'
      }
    },
    {
      name: 'swatches',
      type: 'readonly string[] | false',
      description: {
        ko: '패널 아래의 미리 준비된 색. `false`면 그리지 않고, 배열이면 기본 세트를 대체합니다. 기본 세트가 라이브러리의 네 계열이 *아닌* 것은 그것들이 의미를 가진 role이고, picker에게 묻는 것은 의미가 아니라 색이기 때문입니다',
        en: 'The ready-made colours under the panel. `false` draws none; an array replaces the built-in set. The built-in set is deliberately *not* the library’s four families: those are roles that mean something, and a picker is being asked for a colour'
      }
    },
    {
      name: 'inline',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '팝업 대신 페이지 안에 패널을 그립니다. 트리거가 없습니다',
        en: 'Draws the panel in the page instead of in a popup, with no trigger'
      }
    },
    {
      name: 'editable',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '패널 아래에 값을 직접 입력할 수 있는 필드',
        en: 'The field under the panel the value can be typed into'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '외곽선 노치 안의 라벨. `inline`이면 패널 위. 고른 색이 없고 포커스도 없는 동안에는 트리거 줄 위에 내려와 있습니다 — `floatingLabel` 참고',
        en: 'Label in the outline’s notch, or above the panel when `inline`. While nothing is chosen and the trigger is unfocused it rests on the trigger’s own line — see `floatingLabel`'
      }
    },
    {
      name: 'floatingLabel',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '비어 있는 동안 라벨을 트리거 줄에 내려두고 포커스나 첫 색에서 홈으로 올릴지 여부. 견본은 라벨과 함께 내려갑니다 — 색이 없는 견본은 빈 고리일 뿐이라, 라이브러리에서 유일하게 내려온 라벨에게 자리를 내주는 앞머리 표식입니다. `inline`이면 무시됩니다',
        en: "Whether the label rests on the trigger's line while it is empty and rises into the notch on focus or on the first colour. The swatch comes down with it — with no colour it is an empty ring, which makes it the one leading mark in the library that gives its place up to a resting label. Ignored when `inline`"
      }
    },
    description,
    errorMessage,
    size,
    fullWidth,
    required,
    disabled,
    readOnly,
    {
      name: 'clearable',
      type: 'boolean',
      default: 'false',
      description: { ko: '컨트롤을 비우는 ×를 답니다', en: 'Offers the × that empties the control' }
    },
    {
      ...name,
      description: {
        ko: '폼 컨트롤의 이름. 값은 `format`으로 쓰인 문자열로 제출됩니다',
        en: 'Name of the form control. Submits the value as written in `format`'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '팝업의 열림 여부. controlled로 쓸 때',
        en: 'Whether the popup is open, for a controlled popup'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: { ko: '팝업이 처음에 열려 있을지', en: 'Whether it starts open' }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '팝업 상태가 바뀔 때', en: 'Called as the popup opens and closes' }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '피커가 자기 이름들을 말할 언어 — 레일, 사각형, ×, 그리고 색을 고르기 전 트리거가 보여 주는 단어. 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다',
        en: "Which language the picker's own names are written in — the rails, the square, the × and the word the trigger shows before a colour has been chosen. Falls back to the nearest `MPLocaleProvider`, then to English"
      }
    },
    {
      name: 'labels',
      type: 'Partial<MPColorPickerLabels>',
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다. 채도 사각형에는 이름을 가져올 데가 없어 라이브러리가 지어낸 일곱 문자열입니다',
        en: 'Overrides for the words themselves. They win over the translation, and anything not named stays translated — the seven strings the picker has to invent because a colour square has nowhere to take a name from'
      }
    },
    id
  ],

  MPAlert: [
    {
      name: 'variant',
      type: VARIANT,
      default: "'tonal'",
      description: {
        ko: '표면을 얼마나 칠할지. 버튼과 달리 `tonal`이 기본값입니다 — 컨테이너 톤은 옆에 놓인 주요 액션과 경쟁하지 않으면서 페이지에서 분리됩니다',
        en: "How much surface the alert paints. `tonal` rather than the button's `filled`: a container tone separates itself from the page without competing with the primary action beside it"
      }
    },
    {
      ...color,
      description: {
        ko: '어떤 강조 색 계열을 읽을지. 심각도 사다리가 아니라 머터리얼의 네 역할입니다 — `success`나 `warning`은 토큰 시트가 만들어 낼 수 없으므로 제공하지 않습니다',
        en: 'Which accent family it reads. Four roles, not a severity ladder: there is no `success` or `warning`, because the token sheet has no way to derive them'
      }
    },
    size,
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '제목 줄. 있으면 제목과 그 아래 상세의 두 부분이 되고, 없으면 전체가 한 줄입니다',
        en: 'The heading line. With it the alert is two-part; without it the whole thing is one line'
      }
    },
    {
      name: 'icon',
      type: `${NODE} | false`,
      description: {
        ko: '앞에 놓이는 글리프. `color`에 맞는 기본 글리프가 들어가며, `false`로 없애거나 노드로 바꿀 수 있습니다',
        en: 'The glyph at the start. Defaults to the one that goes with `color`; pass `false` to drop it, or a node to replace it'
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '행 끝에 고정되는 내용 — "다시 시도" 버튼, 링크. 메시지가 줄바꿈되어도 첫 줄에 남도록 `children`과 분리했습니다',
        en: 'Content pinned to the end of the row — a "Retry" button, a link. Kept out of `children` so it stays on the first line while the message wraps'
      }
    },
    {
      name: 'onClose',
      type: '(event: MouseEvent) => void',
      description: {
        ko: '이 prop을 넘기는 것이 곧 닫기 버튼을 만드는 일입니다',
        en: 'Passing it is what makes the dismiss button appear'
      }
    },
    {
      name: 'closeLabel',
      type: 'string',
      description: {
        ko: '닫기 버튼의 접근성 이름. 기본값은 `locale`에 해당하는 언어의 "닫기"입니다',
        en: 'The accessible name of the dismiss button. Defaults to the word for "dismiss" in `locale`'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '닫기 버튼 기본 이름의 언어. 생략하면 가장 가까운 `MPLocaleProvider`, 그다음 영어입니다',
        en: "Which language the dismiss button's default name is written in. Falls back to the nearest `MPLocaleProvider`, then to English"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '메시지', en: 'The message' }
    }
  ],

  MPIconButton: [
    {
      name: 'icon',
      type: NODE,
      required: true,
      description: {
        ko: '글리프. 라벨이 붙은 버튼의 `startIcon`과 똑같이 배치되므로 같은 글리프가 같은 크기로 그려집니다',
        en: "The glyph. Laid out exactly as a labelled button's `startIcon` is, so the same glyph draws at the same size on both"
      }
    },
    {
      name: 'label',
      type: 'string',
      required: true,
      description: {
        ko: '이 버튼이 무엇을 하는지, 말로. 여기서 유일하게 필수인 prop입니다 — 라벨이 그림뿐인 버튼은 접근성 이름이 아예 없습니다',
        en: 'What the button does, in words. The one required prop here: a button whose whole label is a drawing has no accessible name at all'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'text'",
      description: {
        ko: '표면을 얼마나 칠할지. MD3의 *standard* 아이콘 버튼이 기본이라 `MPButton`의 `filled`와 다릅니다 — 툴바에 채워진 원반 다섯 개는 강조가 하나도 없는 줄입니다',
        en: "How much surface it paints. MD3's *standard* icon button is the default, unlike `MPButton`'s `filled`: five filled discs in a toolbar is a row with no emphasis left in it"
      }
    },
    color,
    size,
    disabled,
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '글리프를 스피너로 바꾸고 클릭을 막되, 포커스는 그대로 둡니다',
        en: 'Swaps the glyph for a spinner and stops the button firing, while leaving it focusable'
      }
    },
    {
      name: 'loadingLabel',
      type: 'string',
      default: "'Loading'",
      description: {
        ko: '`loading` 중 읽히는 스피너의 접근성 이름',
        en: 'The accessible name of the spinner, announced while `loading`'
      }
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: {
        ko: '`submit`이 아니라 `button`입니다. 폼 안의 무관한 버튼이 폼을 제출하게 두지 않기 위해서입니다',
        en: '`button`, not `submit` — otherwise every unrelated button inside a form becomes one that submits it'
      }
    }
  ],

  MPAspectRatio: [
    {
      name: 'ratio',
      type: 'number | string',
      default: '1',
      description: {
        ko: 'CSS가 쓰는 방식 그대로의 비율 — 숫자(`1.5`)나 비(`"16 / 9"`). 둘 다 `aspect-ratio`로 그대로 갑니다',
        en: 'The proportion, written the way CSS writes it — a number (`1.5`) or a ratio (`"16 / 9"`). Both reach `aspect-ratio` untouched'
      }
    },
    {
      name: 'fit',
      type: "'cover' | 'contain' | 'fill' | 'none'",
      default: "'cover'",
      description: {
        ko: '안의 미디어를 어떻게 맞출지. 직계 자식인 `img`, `video`, `canvas`, `svg`, `picture`, `iframe`에 적용됩니다',
        en: 'How a single piece of media inside is fitted. Applies to an `img`, `video`, `canvas`, `svg`, `picture` or `iframe` that is a direct child'
      }
    },
    {
      name: 'rounded',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`size` 단계의 모서리로 다듬습니다. 레이아웃 컴포넌트는 아무것도 그리지 않으므로 기본은 꺼짐입니다',
        en: 'Rounds the corners to the `size` rung. Off by default: a layout component draws nothing'
      }
    },
    {
      ...size,
      description: {
        ko: '`rounded`가 쓰는 모서리 단계. 비율만 지키는 상자에는 높이도 타입 스케일도 없으므로 `size`의 축은 이것뿐입니다',
        en: 'Which corner `rounded` uses. There is no height and no type scale on a box whose whole job is a proportion, so this is the one axis `size` has here'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 것을 렌더링합니다 — `render={<figure />}`',
        en: 'Renders something other than a `<div>`: `render={<figure />}`'
      }
    }
  ],

  MPPanes: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '패널이 놓이는 방향. `horizontal`은 나란히, `vertical`은 위아래로 쌓습니다',
        en: 'Which way the panes run. `horizontal` puts them side by side, `vertical` stacks them'
      }
    },
    {
      name: 'resizable',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '핸들을 끌 수 있는지. 컨트롤이 아니라 레이아웃인 분할이라면 꺼 두세요',
        en: 'Whether the handles can be dragged. Turn it off for a split that is a layout rather than a control'
      }
    },
    {
      ...color,
      description: {
        ko: '핸들이 반응할 때 쓰는 강조 색 계열. 분할은 시트를 그리지 않으므로 계열이 닿는 곳은 실선, 호버 틴트, 포커스 링 세 군데뿐입니다',
        en: 'Which accent family the handles light up in. A split draws no sheet, so the family only reaches three marks: the hairline, the wash under a hovered handle, and the focus ring'
      }
    },
    {
      ...size,
      description: {
        ko: '핸들의 두께와 손이 닿는 폭. 1픽셀짜리 선은 1픽셀짜리 과녁이므로, 그려지는 것과 잡히는 것을 나눕니다',
        en: 'How thick a handle is, and how wide the target is. A line one pixel wide is a target one pixel wide, so what is drawn and what can be grabbed are separated'
      }
    },
    {
      name: 'onResize',
      type: '(sizes: number[]) => void',
      description: {
        ko: '핸들을 끄는 동안 각 패널의 비율(퍼센트)로 계속 호출됩니다',
        en: "Fires with every pane's share, in percent, while a handle is dragged"
      }
    },
    {
      name: 'onResizeEnd',
      type: '(sizes: number[]) => void',
      description: {
        ko: '같은 모양으로, 핸들을 놓을 때 한 번. 화살표 키는 그 자체로 하나의 제스처이므로 이쪽도 함께 호출됩니다',
        en: 'Fires once, with the same shape, when the handle is let go. An arrow key is a whole gesture on its own, so it fires with that too'
      }
    }
  ],

  MPPane: [
    {
      name: 'defaultSize',
      type: 'number | string',
      description: {
        ko: '이 패널이 처음 갖는 몫. 맨 숫자는 퍼센트, 문자열은 절대 길이(`"240px"`)입니다. 지정하지 않은 패널끼리 남은 공간을 똑같이 나눕니다',
        en: 'The share this pane starts with. A bare number is a percentage, a string is an absolute length (`"240px"`). Panes with none split whatever is left over equally'
      }
    },
    {
      name: 'minSize',
      type: 'number | string',
      default: '0',
      description: { ko: '얼마나 작게까지 끌 수 있는지', en: 'How small it may be dragged' }
    },
    {
      name: 'maxSize',
      type: 'number | string',
      description: {
        ko: '얼마나 크게까지 끌 수 있는지. 생략하면 제한이 없습니다',
        en: 'How large it may be dragged. Unbounded when left out'
      }
    }
  ],

  MPAccordion: [
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '동시에 두 개 이상 열릴 수 있는지. 기본이 꺼짐인 것이 아코디언이 콜랩서블 더미가 아닌 이유입니다 — 다음이 열릴 때 이전 것을 닫는 일이 페이지가 읽는 사람 밑에서 자라나지 않게 합니다',
        en: 'Whether more than one section may be open at once. `false` by default, which is the whole reason an accordion is not a stack of collapsibles: closing the last as the next opens is what keeps the page from growing under the reader'
      }
    },
    {
      name: 'value',
      type: '(string | number)[]',
      description: {
        ko: '열려 있는 구획들. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'Which sections are open. Use with `onValueChange` for a controlled accordion'
      }
    },
    {
      name: 'defaultValue',
      type: '(string | number)[]',
      description: {
        ko: '처음 열려 있는 구획들. uncontrolled일 때 씁니다',
        en: 'Which start open, for an uncontrolled one'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: (string | number)[]) => void',
      description: {
        ko: '움직인 구획이 아니라 열려 있는 집합 전체로 호출됩니다',
        en: 'Called with the whole open set rather than with the section that moved'
      }
    },
    {
      name: 'dividers',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '구획 사이를 여백 대신 실선으로 나눕니다. 켜면 시트가 여백을 내놓아 선이 양 끝까지 닿고, 끄면 구획이 한 단계 작은 모서리의 타일이 됩니다',
        en: 'Separates the sections with a hairline rather than with space. On, the sheet gives up its padding so the rules reach both edges; off, each section becomes a tile with a corner one step down from the sheet'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '모든 구획이 한 번에 응답을 멈춥니다',
        en: 'Unavailable. Every section stops answering'
      }
    },
    containerVariant,
    {
      ...size,
      description: {
        ko: '모든 구획의 안쪽 여백과 헤더·본문의 타입 스케일. 묶음의 값이지 구획의 값이 아닙니다',
        en: "The room inside every section, and the type scale of its header and body. The stack's value, not the section's"
      }
    },
    {
      name: 'hiddenUntilFound',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '닫힌 패널을 DOM에 남겨, 브라우저의 페이지 검색이 찾아서 열 수 있게 합니다. `keepMounted`보다 우선합니다',
        en: "Keeps closed panels in the DOM so the browser's own page search can find and open them. Overrides `keepMounted`"
      }
    },
    {
      name: 'keepMounted',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '닫힌 패널을 DOM에 남깁니다. 만드는 비용이 크거나, 접혀 있는 동안에도 살아남아야 하는 폼 상태를 담은 내용에 씁니다',
        en: 'Keeps closed panels in the DOM. For content that is expensive to build, or that holds form state which should survive being folded away'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '`MPAccordionItem`들', en: 'The `MPAccordionItem`s' }
    }
  ],

  MPAccordionItem: [
    {
      name: 'value',
      type: 'string | number',
      description: {
        ko: '`value` / `defaultValue`에 대해 이 구획을 식별합니다. 생략하면 Base UI가 하나 만들어 주며, 코드로 조작하지 않는 아코디언에는 그것으로 충분합니다',
        en: 'Identifies the section to `value` / `defaultValue`. Base UI generates one when it is left out, which is enough for an accordion nobody drives from code'
      }
    },
    {
      name: 'title',
      type: NODE,
      description: { ko: '접힘 위의 제목', en: 'The heading on the fold' }
    },
    {
      name: 'subtitle',
      type: NODE,
      description: {
        ko: '제목 아래 한 줄. 타입 스케일 한 단계 아래이고 한 톤 물러납니다',
        en: 'A second line under it, one step down the type scale and muted'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '제목 앞에 놓이는 내용 — 글리프, 상태 점, 개수',
        en: 'Content before the title — a glyph, a status dot, a count'
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '헤더 끝에 고정되는 컨트롤. 트리거 *바깥*이라, 눌러도 구획이 접히지 않습니다',
        en: 'A control pinned to the end of the header, *outside* the trigger — so pressing it does not fold the section'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '이 구획만 접히지 않습니다. 나머지는 그대로 동작합니다',
        en: 'Unavailable. This section stops folding; the rest keep working'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '본문', en: 'The body' }
    }
  ],

  MPBox: [
    containerVariant,
    {
      ...size,
      description: {
        ko: '안쪽 여백, 그리고 **그것뿐입니다**. 높이도 타입 스케일도 정하지 않는 유일한 컴포넌트입니다 — 박스는 담은 것만큼 높고, 자식들은 자기 타이포그래피를 가지고 옵니다. 모서리도 사다리에 없어서 어느 단계에서나 `corner-medium`입니다',
        en: 'The room inside, and **nothing else**. The one component where a rung sets no height and no type scale: a box is as tall as what it holds, and its children bring their own typography. The corner is not on the ladder either — a sheet is `corner-medium` at every rung'
      }
    },
    {
      ...padded,
      description: {
        ko: '안쪽 여백. 가장자리까지 닿아야 하는 내용 — 사진, 테이블, 자기 행을 그리는 리스트 — 에는 꺼 두세요. 모서리는 그래도 내용을 잘라냅니다',
        en: 'Inner padding. Turn it off for full-bleed content — a picture, a table, a list that draws its own rows. The corner still clips it'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 엘리먼트로 렌더링합니다 — `render={<section />}`, `render={<li />}`. Base UI 자신의 탈출구입니다',
        en: "Renders something other than a `<div>`: `render={<section />}`, `render={<li />}`. Base UI's own escape hatch"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '시트 위에 놓이는 것', en: 'What sits on the sheet' }
    }
  ],

  MPGrid: [
    {
      name: 'columns',
      type: 'MPResponsive<number>',
      default: '12',
      description: {
        ko: '한 행을 몇 개의 열로 나눌지. 안쪽의 모든 `span`과 `offset`이 이 숫자를 기준으로 읽히므로 `columns={24}`에서는 `span={12}`가 절반입니다. MD3 자신의 그리드는 `{ compact: 4, medium: 12 }`입니다',
        en: "How many columns a row is divided into. Every `span` and `offset` inside is read against it, so `columns={24}` makes `span={12}` a half. MD3's own grid is `{ compact: 4, medium: 12 }`"
      }
    },
    {
      name: 'spacing',
      type: 'MPResponsive<number>',
      default: '4',
      description: {
        ko: '아이템 사이 간격. Tailwind의 spacing 스케일이라 `4`는 `gap-4`와 같은 `1rem`입니다. 소수도 됩니다. MD3 자신의 간격은 `{ compact: 4, medium: 6 }` — 휴대폰에서 16dp, medium부터 24dp입니다',
        en: "The gutter between items, on Tailwind's spacing scale: `4` is `1rem`, the same length `gap-4` is. Fractions allowed. MD3's own gutter is `{ compact: 4, medium: 6 }` — 16dp on a phone, 24dp from a medium window up"
      }
    },
    {
      name: 'rowSpacing',
      type: 'MPResponsive<number>',
      description: {
        ko: '행 사이 간격만. 없으면 `spacing`을 따릅니다',
        en: 'The gutter between rows only. Falls back to `spacing`'
      }
    },
    {
      name: 'columnSpacing',
      type: 'MPResponsive<number>',
      description: {
        ko: '열 사이 간격만. 없으면 `spacing`을 따릅니다',
        en: 'The gutter between columns only. Falls back to `spacing`'
      }
    },
    {
      name: 'justifyContent',
      type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'",
      description: {
        ko: '아이템이 쓰지 않은 폭을 행이 어떻게 나눌지',
        en: 'How a row distributes the width its items did not use'
      }
    },
    {
      name: 'alignItems',
      type: "'start' | 'center' | 'end' | 'stretch' | 'baseline'",
      default: "'stretch'",
      description: {
        ko: '아이템들이 행을 가로질러 서로 어떻게 놓일지',
        en: 'How items sit against each other across a row'
      }
    },
    {
      name: 'alignContent',
      type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly' | 'stretch'",
      description: {
        ko: '그리드가 자기를 담은 상자보다 짧을 때 행들이 어디에 놓일지. 높이를 가진 그리드에서만 보입니다',
        en: 'Where the rows sit when the grid is shorter than the box holding it. Only visible on a grid with a height of its own'
      }
    },
    {
      name: 'wrap',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '열이 모자란 행이 다음 줄로 이어질지. 끄면 넘치는 한 줄이 되며, 가로로 스크롤되는 띠가 원하는 동작입니다',
        en: 'Whether a row that runs out of columns continues on the next one. Turned off it is one row that overflows, which is what a horizontally scrolling strip wants'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 엘리먼트로 렌더링합니다 — `render={<section />}`, `render={<ul />}`. Base UI 자신의 탈출구입니다',
        en: "Renders something other than a `<div>`: `render={<section />}`, `render={<ul />}`. Base UI's own escape hatch"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '`MPGridItem`들', en: 'The `MPGridItem`s' }
    }
  ],

  MPRating: [
    {
      name: 'value',
      type: 'number',
      description: {
        ko: '점수. controlled로 쓰려면 `onValueChange`와 함께 쓰세요',
        en: 'The score. Use with `onValueChange` for a controlled rating'
      }
    },
    {
      name: 'defaultValue',
      type: 'number',
      default: '0',
      description: {
        ko: 'uncontrolled일 때 시작하는 점수',
        en: 'Where an uncontrolled rating starts'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: number) => void',
      description: {
        ko: '새 점수로 호출됩니다. 지워진 별점은 `0`을 보고합니다',
        en: 'Called with the new score. `0` is what a cleared rating reports'
      }
    },
    {
      name: 'count',
      type: 'number',
      default: '5',
      description: {
        ko: '별의 개수, 곧 최고 점수',
        en: 'How many stars there are, and therefore the highest score'
      }
    },
    {
      name: 'precision',
      type: 'number',
      default: '1',
      description: {
        ko: '**고를 수 있는** 최소 단위. 별 하나의 비율입니다 — `0.5`면 반 개씩, `1`이면 한 개씩. 그려지는 것에는 관여하지 않아서 `4.3`은 어느 값에서든 별 넷과 3분의 1로 그려집니다. 평균은 선택이 아니기 때문입니다',
        en: 'The smallest step that can be **chosen**, as a fraction of one star — `0.5` gives half stars, `1` whole ones. It does not bound what is *drawn*: a `4.3` is four stars and a third at every precision, because an average is not a choice'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: { ko: '채워진 별의 글리프', en: 'The glyph a filled star is drawn with' }
    },
    {
      name: 'emptyIcon',
      type: NODE,
      description: {
        ko: '빈 별의 글리프. 같은 모양이어야 합니다',
        en: 'And the one an empty star is drawn with. It has to be the same shape'
      }
    },
    {
      name: 'clearable',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '이미 선택된 점수를 다시 고르면 `0`으로 지워집니다',
        en: 'Choosing the score that is already chosen clears it back to `0`'
      }
    },
    {
      name: 'readOnly',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '바꿀 수 없는 점수 표시 — 상품의 평균, 남이 남긴 평가. 입력도 라디오 그룹도 없이 점수를 문장으로 든 `role="img"` 하나가 됩니다. 채도를 빼지 않는 이 라이브러리의 유일한 `readOnly`입니다. 붙잡아 둔 컨트롤이 아니라 숫자의 그림이기 때문입니다',
        en: 'Shows the score without letting it be changed — a product’s average, a rating somebody else left. No inputs and no radio group: one `role="img"` with the score as a sentence. The one `readOnly` in the library that does not drain the saturation, because it is a picture of a number rather than a control being held still'
      }
    },
    {
      ...disabled,
      description: {
        ko: '사용할 수 없음. 강조 색이 사라지고 명세의 비활성 잉크가 들어옵니다',
        en: 'Unavailable. Drops the accent for the specification’s disabled ink'
      }
    },
    {
      name: 'name',
      type: 'string',
      description: {
        ko: '폼이 제출될 때 값을 식별합니다. 없으면 하나가 생성되므로 한 페이지의 별점 둘이 실수로 같은 그룹을 공유하지 않습니다',
        en: 'Identifies the value when a form is submitted. One is generated without it, so two ratings on a page never share a radio group by accident'
      }
    },
    {
      name: 'required',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '별을 고르기 전에는 폼이 제출되지 않습니다',
        en: 'A form will not submit until a star has been chosen'
      }
    },
    {
      ...size,
      description: {
        ko: '별 하나의 높이, 글리프 사다리 위에서. `md`가 24dp입니다 — 별에는 옆에 붙는 라벨도 감싸는 컨테이너도 없어서 크기가 정해지는 대상이 곧 그림입니다',
        en: 'One star’s height, on the glyph ladder — `md` is 24dp. A star has no label beside it and no container around it, so the thing being sized *is* the drawing'
      }
    },
    {
      ...color,
      description: {
        ko: '채워진 별이 읽는 강조 색 계열. 호박색이 없는 이유는 MD3의 색 체계에 없기 때문입니다 — 금색 별을 원하면 토큰을 설정하고 그 계열을 요청하세요',
        en: 'Which accent family the filled stars read. There is no amber because MD3’s colour system has none: for gold stars, set the token and ask for that family'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '말로 된 이름을 쓸 언어 — `ko`, `pt-BR`, `zh-Hant` 같은 BCP 47 태그',
        en: 'Which language the spoken names are written in — a BCP 47 tag such as `ko`, `pt-BR` or `zh-Hant`'
      }
    },
    {
      name: 'labels',
      type: 'Partial<MPRatingLabels>',
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 번역보다 우선합니다',
        en: 'Overrides for the words themselves. They win over the translation'
      }
    },
    {
      name: 'structuredData',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '점수를 schema.org `Rating` 마이크로데이터로 게시합니다. `readOnly`일 때만 동작하며, 관계를 이름 짓는 `itemProp`은 직접 넘겨야 합니다',
        en: 'Publishes the score as schema.org `Rating` microdata. `readOnly` only, and the `itemProp` naming the relationship is yours to pass'
      }
    }
  ],

  MPPagination: [
    {
      name: 'count',
      type: 'number',
      required: true,
      description: {
        ko: '전체 페이지 수. 둘보다 적으면 컨트롤 전체가 아무것도 렌더링하지 않습니다 — 한 페이지는 페이지의 묶음이 아닙니다',
        en: 'How many pages there are. Fewer than two and the whole control renders nothing: one page is not a set of pages'
      }
    },
    {
      name: 'page',
      type: 'number',
      description: {
        ko: '현재 페이지, 1부터 셉니다. controlled로 쓰려면 `onPageChange`와 함께 쓰세요',
        en: 'The current page, 1-based. Use with `onPageChange` for a controlled row'
      }
    },
    {
      name: 'defaultPage',
      type: 'number',
      default: '1',
      description: {
        ko: '처음 현재가 되는 페이지. uncontrolled일 때 씁니다',
        en: 'Which page starts current, for an uncontrolled row'
      }
    },
    {
      name: 'onPageChange',
      type: '(page: number) => void',
      description: { ko: '선택된 페이지로 호출됩니다', en: 'Called with the page that was chosen' }
    },
    {
      name: 'siblingCount',
      type: 'number',
      default: '1',
      description: {
        ko: '현재 페이지 양옆에 항상 보이는 페이지 수',
        en: 'How many pages are always shown on either side of the current one'
      }
    },
    {
      name: 'boundaryCount',
      type: 'number',
      default: '1',
      description: {
        ko: '어느 페이지에 있든 양 끝에 항상 보이는 페이지 수. `0`이면 첫 페이지와 마지막 페이지가 빠지고 창만 남습니다',
        en: 'How many pages are always shown at each end, whatever page is current. `0` drops the first and last page, leaving only the window'
      }
    },
    {
      name: 'showEdges',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '첫 페이지와 마지막 페이지로 건너뛰는 스테퍼 두 개를 보여 줍니다',
        en: 'Shows the two steppers that jump to the first and last page'
      }
    },
    {
      name: 'showArrows',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '한 페이지씩 움직이는 스테퍼 두 개를 보여 줍니다',
        en: 'Shows the two steppers that move by one page'
      }
    },
    {
      ...size,
      description: {
        ko: '칸의 높이와 타입 스케일. 다른 모든 컨트롤과 같은 사다리라서 `sm` 페이지네이션은 옆의 `sm` 버튼과 줄이 맞습니다. 테이블 푸터에는 보통 `sm`이 맞습니다',
        en: "The cells' height and type scale, on the same ladder as every other control — so a `sm` pagination lines up with a `sm` button beside it. `sm` is usually what a table footer wants"
      }
    },
    {
      ...color,
      description: {
        ko: '현재 페이지를 채우는 강조 색 계열',
        en: 'Which accent family the current page is filled with'
      }
    },
    {
      ...fullWidth,
      description: {
        ko: '행을 컨테이너 폭에 맞추고 가운데로 놓습니다',
        en: 'Stretches the row to its container and centres it in the space'
      }
    },
    {
      ...disabled,
      description: {
        ko: '행의 모든 칸이 응답을 멈춥니다',
        en: 'Every cell in the row stops answering'
      }
    },
    {
      name: 'getPageHref',
      type: '(page: number) => string',
      description: {
        ko: '페이지의 주소. 행의 모든 숫자를 진짜 링크로 만듭니다. 이것이 없으면 크롤러가 누를 수 없어 페이지 목록이 1페이지에서 끝납니다. `onPageChange`는 그대로 호출되고 이동은 먼저 취소되므로 클라이언트 라우터도 그대로 동작합니다',
        en: 'The address of a page, which turns every number into a real link. Without it a crawler cannot press one, so a paged list stops at page one for everything but a reader. `onPageChange` still fires and the navigation is cancelled first, so a client-side router keeps working'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '행이 자기를 말할 언어 — `ko`, `pt-BR`, `zh-Hant` 같은 BCP 47 태그. 여기서 그려지는 것은 숫자뿐이므로, 이 표의 단어들은 전부 스크린 리더만 듣습니다',
        en: 'Which language the row names itself in — a BCP 47 tag such as `ko`, `pt-BR` or `zh-Hant`. Nothing here is drawn but the numbers, so every word in the table is one only a screen reader hears'
      }
    },
    {
      name: 'labels',
      type: 'Partial<MPPaginationLabels>',
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다',
        en: 'Overrides for the words themselves. They win over the translation, and anything not named stays translated'
      }
    }
  ],

  MPBottomNavigation: [
    {
      name: 'value',
      type: 'string | number | null',
      description: {
        ko: '지금 있는 목적지. controlled로 쓰려면 `onValueChange`와 함께 쓰세요',
        en: 'The destination the reader is on. Use with `onValueChange` for a controlled bar'
      }
    },
    {
      name: 'defaultValue',
      type: 'string | number | null',
      description: {
        ko: '처음에 있는 목적지. uncontrolled일 때 씁니다',
        en: 'Which starts current, for an uncontrolled bar'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string | number) => void',
      description: {
        ko: '눌린 목적지의 값으로 호출됩니다',
        en: 'Called with the value of the destination that was pressed'
      }
    },
    {
      name: 'position',
      type: "'static' | 'absolute' | 'sticky' | 'fixed'",
      default: "'fixed'",
      description: {
        ko: '페이지의 스크롤 안에서 어떻게 놓일지. 기본값 `fixed`가 바텀 내비게이션 그 자체입니다 — 아래 페이지가 무엇을 하든 창의 아래 가장자리에 붙어 있습니다',
        en: 'How the bar sits in the page’s scroll. `fixed` — the default — is what a bottom navigation bar is: held against the bottom edge of the window whatever the page does'
      }
    },
    {
      name: 'labels',
      type: "'all' | 'selected' | 'none'",
      default: "'all'",
      description: {
        ko: '어떤 이름을 그릴지. 그리지 않는다고 말하지 않는 것은 아니어서, 어느 값에서도 이름은 스크린 리더를 위해 문서에 남습니다',
        en: 'Which names are drawn. Undrawn is never unsaid: the names stay in the document for a screen reader at every setting'
      }
    },
    {
      ...size,
      description: {
        ko: '바의 높이와 타입 스케일. `md`가 MD3 자신의 80dp입니다',
        en: "The bar's height and type scale. `md` is MD3's own 80dp"
      }
    },
    {
      name: 'divider',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '위쪽 가장자리의 실선. 꺼져 있는 이유는 MD3가 바를 선이 아니라 톤으로 분리하기 때문입니다 — 페이지의 `surface`에 대한 `surface-container`. 뒤의 페이지가 같은 톤일 때 켜세요',
        en: "A hairline along the top edge. Off, because MD3 separates the bar by *tone* — `surface-container` against the page's `surface` — rather than by a rule. Turn it on when the page behind it is the same tone"
      }
    },
    {
      name: 'safeArea',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '행 아래에 `env(safe-area-inset-bottom)`을 더해 휴대폰의 홈 인디케이터를 피합니다. 컨테이너는 화면 맨 아래까지 그대로 닿고 행만 올라갑니다',
        en: "Keeps the destinations clear of a phone's home indicator with `env(safe-area-inset-bottom)`. The container still reaches the bottom of the screen — only the row moves up"
      }
    },
    {
      ...disabled,
      description: {
        ko: '모든 목적지가 응답을 멈춥니다',
        en: 'Every destination stops answering'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '바가 읽히는 이름 — "주 메뉴", "섹션". 이름 없는 랜드마크는 스크린 리더가 그냥 "탐색"이라고 읽습니다',
        en: 'The name the bar is announced by — "Main", "Sections". A landmark with no name is one a screen reader lists as "navigation"'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<nav>` 대신 다른 엘리먼트로 렌더링합니다. 목적지의 행은 탐색이므로 여기서는 좀처럼 필요하지 않습니다',
        en: 'Renders something other than a `<nav>`. Rarely what you want here: a row of destinations is navigation'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`MPBottomNavigationItem`들 — 셋에서 다섯 개',
        en: 'The `MPBottomNavigationItem`s — three to five of them'
      }
    }
  ],

  MPBottomNavigationItem: [
    {
      name: 'value',
      type: 'string | number',
      required: true,
      description: {
        ko: '목적지를 식별합니다. `onValueChange`가 알려 주는 값입니다',
        en: 'Identifies the destination. What `onValueChange` reports'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '액티브 인디케이터 안에 그려지는 글리프',
        en: 'The glyph, drawn inside the active indicator'
      }
    },
    {
      name: 'activeIcon',
      type: NODE,
      description: {
        ko: '지금 있는 목적지일 때의 두 번째 글리프. MD3는 선택된 아이콘을 채우고 나머지는 외곽선으로 두는데, 곁눈질로도 살아남는 신호입니다. 없으면 `icon`으로 돌아갑니다',
        en: 'A second glyph for while this is the destination the reader is on — MD3 fills the selected icon and outlines the rest, a signal that survives being seen out of the corner of an eye. Falls back to `icon`'
      }
    },
    {
      name: 'href',
      type: 'string',
      description: {
        ko: '목적지를 진짜 링크로 렌더링합니다. 길게 누르면 "새 탭에서 열기"가 나오고 주소가 상태 표시줄에 보이는데, `router.push`를 호출하는 버튼으로는 되지 않는 것들입니다. `onValueChange`는 그대로 호출됩니다',
        en: 'Renders the destination as a real link: a long press offers "open in a new tab" and the address shows in the status bar, neither of which a button calling `router.push` can do. `onValueChange` still fires'
      }
    },
    {
      name: 'target',
      type: 'string',
      description: {
        ko: '링크가 열리는 곳. `_blank`이면 `rel`이 따라 붙습니다',
        en: 'Where the link opens. `rel` follows on its own for `_blank`'
      }
    },
    {
      name: 'rel',
      type: 'string',
      description: {
        ko: '`_blank`가 받게 될 `noopener noreferrer`를 **대체합니다** — 덧붙이는 게 아닙니다',
        en: '**Replaces** the `noopener noreferrer` a `_blank` destination would otherwise get rather than extending it'
      }
    },
    {
      name: 'render',
      type: 'ReactElement | ((props, state) => ReactElement)',
      description: {
        ko: '목적지를 다른 엘리먼트로 — 라우터의 `Link`를 주면 탭 한 번이 전체 페이지 로드가 아니라 클라이언트 내비게이션이 됩니다. `href`가 없으면 `<button>` 쪽을 대신하며, 어느 쪽이든 바의 `onValueChange`는 그대로 불립니다',
        en: 'Renders the destination as something else — a router’s `Link`, so a tap is a client-side navigation rather than a full page load. Without an `href` it replaces the `<button>` instead, and the bar’s `onValueChange` fires either way'
      }
    },
    {
      ...disabled,
      description: {
        ko: '사용할 수 없지만 묶음에는 남습니다. `href`가 있었다면 함께 사라집니다 — `disabled`는 `<a>`가 가질 수 있는 상태가 아닙니다',
        en: 'Unavailable, but still part of the set. An `href` goes with it: `disabled` is not something an `<a>` can be'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '목적지의 이름. `labels`가 그리지 않을 때에도 읽힙니다',
        en: "The destination's name. Read out even when `labels` keeps it undrawn"
      }
    }
  ],

  MPFloatingActionButton: [
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '글리프. 크기를 따로 정해야 하면 [MPIcon](../display/icon)으로 감싸고, 그냥 넘기면 단계가 정한 글리프 크기로 그려집니다',
        en: 'The glyph. Wrap it in an [MPIcon](../display/icon) when it needs a size of its own; passed bare it is drawn at the rung’s own glyph size'
      }
    },
    {
      name: 'label',
      type: 'string',
      required: true,
      description: {
        ko: '버튼이 무슨 일을 하는지, 말로. 여기서 유일한 필수 prop입니다 — 라벨 전체가 그림인 버튼에는 접근성 이름이 없습니다. `extended`일 때는 버튼에 쓰이는 단어이기도 해서 둘이 다른 말을 할 수 없습니다',
        en: 'What the button does, in words. The one required prop here: a button whose whole label is a drawing has no accessible name at all. With `extended` it is also the word written on the button, so the two can never say different things'
      }
    },
    {
      name: 'extended',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`label`을 글리프 옆에 씁니다. 원반이 스타디움이 되는 MD3의 extended 플로팅 버튼이고, 화면이 다루는 그 하나의 액션을 위한 것입니다',
        en: "Writes `label` beside the glyph, which turns the disc into a stadium — MD3's extended floating button, for the one action a screen is about"
      }
    },
    {
      name: 'variant',
      type: "'filled' | 'tonal' | 'elevated'",
      default: "'tonal'",
      description: {
        ko: '어떤 컨테이너를 칠할지. `tonal`이 명세의 기본값(강조 색 컨테이너), `filled`가 강조 색 자체, `elevated`가 MD3의 surface FAB입니다. 플로팅 버튼은 곧 자기 컨테이너이므로 `outlined`와 `text`는 없습니다',
        en: "Which container it paints. `tonal` is the specification's default (the accent container), `filled` is the accent itself, `elevated` is MD3's surface FAB. `outlined` and `text` are absent because a floating button *is* its container"
      }
    },
    color,
    {
      ...size,
      description: {
        ko: '버튼의 크기. `md`가 MD3 자신의 56dp이고, `xs`와 `xl`이 명세의 small(40dp)과 large(96dp)입니다. 모서리도 함께 움직이는데, 이 라이브러리에서 그런 유일한 컴포넌트입니다',
        en: "The button's size. `md` is MD3's own 56dp; `xs` and `xl` are the specification's small and large floating buttons at 40 and 96dp. The corner moves with it, which is the one place in this library it does"
      }
    },
    {
      name: 'position',
      type: "'static' | 'absolute' | 'sticky' | 'fixed'",
      default: "'fixed'",
      description: {
        ko: '페이지 안에서 어떻게 놓일지. 기본값 `fixed`가 플로팅 버튼 그 자체입니다 — 아래 페이지가 무엇을 하든 창의 한 모서리에 붙어 있습니다. `absolute`는 가장 가까운 위치 지정 조상에 고정하고, `static`은 흐름으로 되돌립니다',
        en: 'How it sits in the page. `fixed` — the default — is what a floating button *is*: held against a corner of the window whatever the page does. `absolute` pins it to the nearest positioned ancestor instead, and `static` puts it back in the flow'
      }
    },
    {
      name: 'corner',
      type: "'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
      default: "'bottom-end'",
      description: {
        ko: '어느 모서리에 붙일지. 논리 방향이라 `bottom-end`는 RTL에서 왼쪽 아래입니다. `position`이 `static`이면 효과가 없습니다',
        en: 'Which corner it is pinned to. Logical, so `bottom-end` is bottom-left under RTL. No effect while `position` is `static`'
      }
    },
    {
      name: 'offset',
      type: 'number | string',
      default: '16',
      description: {
        ko: '양쪽 가장자리로부터의 거리. CSS 길이나 픽셀 수입니다. MD3 자신의 값은 16dp입니다',
        en: "How far in from both edges, as a CSS length or a number of pixels. MD3's own is 16dp"
      }
    },
    {
      ...disabled,
      description: {
        ko: '사용할 수 없음. 자리는 지키고, 응답을 멈추고, 떠 있기를 멈춥니다 — 누를 수 없는데도 그림자를 드리우는 버튼은 여전히 자기가 할 일이라고 주장하는 버튼입니다',
        en: 'Unavailable. It keeps its place, stops answering, and stops floating — a button still casting a shadow while it cannot be pressed is one still claiming to be the thing to do'
      }
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      default: "'button'",
      description: {
        ko: '`submit`이 아니라 `button`입니다. 네이티브 버튼은 기본적으로 자기를 감싼 폼을 제출합니다',
        en: '`button`, not `submit`. A native button defaults to submitting the form around it'
      }
    }
  ],

  MPTabs: [
    {
      name: 'variant',
      type: "'primary' | 'secondary'",
      default: "'primary'",
      description: {
        ko: 'MD3의 두 가지 탭 중 어느 쪽인지. 화면의 최상위 층이면 `primary`, 그 패널 안의 구분이면 `secondary`입니다. 세기가 아니라 깊이의 구분이며, 인디케이터·선택된 라벨 색·글리프 위치 세 가지가 함께 바뀝니다',
        en: "Which of MD3's two kinds of tab bar this is: `primary` for the top level of a screen, `secondary` for a division inside one of its panels. A difference of depth rather than emphasis, and it moves the indicator, the chosen label's colour and the glyph together"
      }
    },
    color,
    {
      name: 'value',
      type: 'string | number | null',
      description: {
        ko: '선택된 탭. controlled로 쓰려면 `onValueChange`와 함께 쓰세요',
        en: 'The chosen tab. Use with `onValueChange` for a controlled set'
      }
    },
    {
      name: 'defaultValue',
      type: 'string | number | null',
      description: {
        ko: '처음 선택되는 탭. uncontrolled일 때 씁니다',
        en: 'Which starts chosen, for an uncontrolled set'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string | number | null) => void',
      description: {
        ko: '선택된 탭의 값으로 호출됩니다',
        en: "Called with the chosen tab's value"
      }
    },
    {
      name: 'iconPosition',
      type: "'top' | 'start'",
      description: {
        ko: '글리프가 놓이는 자리. 기본값은 명세가 하는 대로입니다 — primary는 라벨 위, secondary는 라벨 앞',
        en: "Where a tab's glyph sits. Defaults to what the variant does in the specification: above the label on a primary tab, before it on a secondary one"
      }
    },
    {
      name: 'activateOnFocus',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '방향키가 지나가는 탭을 그대로 선택할지. 꺼 두는 이유는 패널 하나가 데이터를 가져오는 순간 탭 넷을 지나가는 것이 요청 넷이 되기 때문입니다',
        en: 'Whether an arrow key also chooses the tab it lands on. Off, because the moment one panel fetches, walking past four tabs fires four requests'
      }
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '방향키가 마지막 탭에서 첫 탭으로 돌아갈지',
        en: 'Whether the arrow keys wrap from the last tab back to the first'
      }
    },
    {
      name: 'divider',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '바 아래의 실선. 탭 바와 그 내용을 가르는 MD3 자신의 구분선입니다. 이미 테두리가 있는 카드 안에서는 꺼 두세요',
        en: "The hairline under the bar — MD3's own divider between a tab bar and the content it is about. Turn it off inside a card that already has an edge"
      }
    },
    {
      ...size,
      description: {
        ko: '탭의 높이와 타입 스케일. `md`가 MD3 자신의 48dp이고, 글리프가 라벨 위에 놓이면 명세대로 64dp입니다',
        en: "The tab's height and type scale. `md` is MD3's own 48dp, or the specification's 64dp once a glyph sits above the label"
      }
    },
    {
      ...fullWidth,
      description: {
        ko: '탭들이 바의 폭을 똑같이 나눠 가집니다',
        en: "The tabs share the bar's full width, each taking an equal part of it"
      }
    },
    {
      name: 'aria-label',
      type: 'string',
      description: {
        ko: '바의 접근성 이름. 탭들은 자기 이름만 말하므로 바에는 이름이 따로 필요합니다',
        en: 'The accessible name of the bar. The set needs a name; the tabs only name themselves'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`MPTab`들과 `MPTabPanel`들. 바와 본문으로 알아서 나뉩니다',
        en: 'The `MPTab`s and the `MPTabPanel`s, sorted into the bar and the body for you'
      }
    }
  ],

  MPTab: [
    {
      name: 'value',
      type: 'string | number',
      required: true,
      description: {
        ko: '탭을 식별하고, 같은 값을 가진 패널을 골라냅니다',
        en: 'Identifies the tab, and picks out the panel with the same value'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '글리프. 바의 `iconPosition`에 따라 라벨 위나 앞에 그려지고, 크기는 바의 단계를 따릅니다',
        en: "The glyph. Drawn above or before the label depending on the bar's `iconPosition`, and sized by the bar's rung"
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '사용할 수 없지만 목록에는 남습니다',
        en: 'Unavailable, but still listed'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '탭의 라벨', en: "The tab's label" }
    }
  ],

  MPTabPanel: [
    {
      name: 'value',
      type: 'string | number',
      required: true,
      description: {
        ko: '어느 탭이 이 패널을 보여 줄지',
        en: 'Which tab shows this panel'
      }
    },
    {
      name: 'keepMounted',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '숨겨져 있는 동안에도 DOM에 남깁니다. 만드는 비용이 큰 패널이나, 탭을 옮겨도 살아 있어야 하는 폼 상태를 가진 패널에 씁니다',
        en: 'Keeps the panel in the DOM while it is hidden — for a panel that is expensive to build, or that holds form state which should survive being switched away from'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '패널의 내용', en: "The panel's content" }
    }
  ],

  MPContainer: [
    {
      name: 'maxWidth',
      type: `${SIZE} | 'none'`,
      default: "'none'",
      description: {
        ko: "내용이 넓어질 수 있는 한계. MD3의 윈도우 크기 클래스 경계에 맞춘 사다리입니다 — `sm` 600dp, `md` 840dp, `lg` 1200dp, `xl` 1600dp, `xs` 480dp. 기본값 `'none'`은 제한 없음이며, 컨테이너의 일은 여백이고 본문 폭은 따로 요청해야 하는 두 번째 결정이기 때문입니다",
        en: "How wide the content may get, on a ladder pinned to MD3's window size class boundaries — `sm` 600dp, `md` 840dp, `lg` 1200dp, `xl` 1600dp, `xs` 480dp. `'none'`, the default, is no limit: a container's job is the margin, and a measure is a second decision a page should have to ask for"
      }
    },
    {
      ...padded,
      description: {
        ko: '페이지 여백. 끄면 중앙 정렬과 본문 폭은 그대로 두고 여백만 없앱니다 — 전체 폭 히어로, 스스로 여백을 갖는 구획',
        en: 'The page margin. Turn it off to keep the centring and the measure without the gutter — a full-bleed hero, a section that pads itself'
      }
    },
    {
      ...size,
      description: {
        ko: '여백의 단계. `md`는 16dp로 MD3 자신의 compact 여백이고, 명세가 medium 윈도우부터 넓히는 24dp는 여기서 `size="lg"`입니다. [MPBox](./box)에서처럼 높이도 타입 스케일도 정하지 않으며, `maxWidth`와는 독립적입니다',
        en: 'The margin\'s rung. `md` is 16dp, MD3\'s own compact margin; the 24dp the specification uses from a medium window up is `size="lg"` here. As on [MPBox](./box) it sets no height and no type scale, and it is independent of `maxWidth`'
      }
    },
    {
      name: 'centered',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '`maxWidth`가 페이지보다 좁아진 뒤 내용을 가운데로 놓습니다. `maxWidth`가 `none`인 동안에는 가운데로 놓을 여백 자체가 없으므로 아무 효과도 없습니다',
        en: 'Centres the content once `maxWidth` is narrower than the page. No effect while `maxWidth` is `none`, because there is nothing left over to centre in'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 엘리먼트로 렌더링합니다 — `render={<main />}`, `render={<section />}`. Base UI 자신의 탈출구입니다',
        en: "Renders something other than a `<div>`: `render={<main />}`, `render={<section />}`. Base UI's own escape hatch"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '페이지 내용', en: "The page's content" }
    }
  ],

  MPGridItem: [
    {
      name: 'span',
      type: "MPResponsive<number | 'grow'>",
      description: {
        ko: "그리드의 열 중 몇 개를 가져갈지. 그리드의 `columns` 기준이라 기본 12열에서 `span={6}`은 절반입니다. `{ compact: 12, medium: 6 }`처럼 윈도우 크기 클래스별로 줄 수 있고, 행보다 넓으면 넘치는 대신 행에 맞춰 잘립니다. `'grow'`는 열의 개수가 아니라 **행에 남은 폭**이라 썸네일 옆 본문이 원하는 값입니다. 기본값은 행 전체입니다",
        en: "How many of the grid's columns the item takes, read against `columns` — `span={6}` is half of the default twelve. Responsive as `{ compact: 12, medium: 6 }`, and a span wider than the row is clamped to it rather than overflowing. `'grow'` is not a column count but **the width the row has left**, which is what the body of text beside a thumbnail wants. Defaults to the whole row"
      }
    },
    {
      name: 'offset',
      type: 'MPResponsive<number>',
      default: '0',
      description: {
        ko: '아이템 **앞에** 비워 두는 열. 행 안의 절대 위치가 아니라 앞으로 밀어 넣는 공간입니다 — 12열 행의 첫 번째에서 `offset={4}`에 `span={4}`면 가운데 3분의 1입니다',
        en: 'Columns left empty *before* the item — space pushed in ahead of it, not an absolute position: first in a twelve-column row, `offset={4}` with `span={4}` is the middle third'
      }
    },
    {
      name: 'alignSelf',
      type: "'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'",
      description: {
        ko: '이 아이템 하나에 대해 행의 `alignItems`를 덮어씁니다',
        en: "Overrides the row's `alignItems` for this item alone"
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 엘리먼트로 렌더링합니다 — `render={<li />}`, `render={<article />}`',
        en: 'Renders something other than a `<div>`: `render={<li />}`, `render={<article />}`'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '셀 안의 내용', en: 'What goes in the cell' }
    }
  ],

  MPCard: [
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '카드의 제목. 평범한 문자열은 카드의 제목 역할로 그려지고, 문서 개요에 나타나야 한다면 진짜 제목 엘리먼트(`title={<h3>…</h3>}`)를 넘기세요 — 브라우저가 아니라 카드의 타이포그래피를 물려받습니다',
        en: "The card's heading. A plain string is set in the card's own title role; pass a real heading element (`title={<h3>…</h3>}`) when the card should appear in the document outline — it inherits the card's typography rather than the browser's"
      }
    },
    {
      name: 'subtitle',
      type: NODE,
      description: {
        ko: '제목 아래 한 줄. 타입 스케일 한 단계 아래이고 한 톤 물러납니다',
        en: 'A second line under it, one step down the type scale and muted'
      }
    },
    {
      name: 'headerAction',
      type: NODE,
      description: {
        ko: '헤더 행 끝에 고정되는 내용 — 메뉴 버튼, 상태 칩. 제목이 옆에서 줄바꿈되는 동안에도 제목의 줄에 남습니다',
        en: 'Content pinned to the end of the header row — a menu button, a status chip. It stays on the title’s line while the title wraps beside it'
      }
    },
    {
      name: 'media',
      type: NODE,
      description: {
        ko: '사진, 차트, 지도. 위쪽에 가장자리까지 그려져 카드의 모서리가 잘라냅니다. 여백이 붙으면 안 되는 유일한 부분이라서 독립된 슬롯입니다',
        en: "A picture, a chart, a map: drawn edge to edge across the top so the card's own corners crop it. A slot of its own because it is the one part of a card that must not be padded"
      }
    },
    {
      name: 'footer',
      type: NODE,
      description: {
        ko: '아래 영역. 줄바꿈되는 행으로 배치되므로 버튼 두 개에 별도의 래퍼가 필요 없습니다',
        en: 'The bottom area. Laid out as a wrapping row, so a pair of buttons needs no wrapper of its own'
      }
    },
    {
      name: 'dividers',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '구획 사이를 여백 대신 실선으로 나눕니다. 선이 시트의 양 끝까지 닿아야 하므로 세로 여백이 카드에서 각 구획으로 옮겨 갑니다',
        en: 'Draws a hairline between the sections instead of separating them with space. The rules run the full width of the sheet, so the vertical padding moves off the card and onto each section'
      }
    },
    containerVariant,
    {
      ...size,
      description: {
        ko: '구획들의 안쪽 여백과 본문의 타입 스케일. 모서리는 사다리에 없습니다 — 카드는 어느 단계에서나 `corner-medium`입니다',
        en: "The room inside the sections, and the body's type scale. The corner is not on the ladder: a card is `corner-medium` at every rung"
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<div>` 대신 다른 엘리먼트로 렌더링합니다 — `render={<article />}`',
        en: 'Renders something other than a `<div>`: `render={<article />}`'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '카드의 본문', en: "The card's body" }
    }
  ],

  MPCarousel: [
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '슬라이드들. 최상위 자식 하나가 슬라이드 하나가 되며, 컴포넌트는 안에서 무엇을 렌더링하든 하나입니다. 조건부 슬라이드가 남긴 `null`과 `false`는 걸러집니다',
        en: 'The slides. Every top-level child becomes one — a component is a single slide whatever it renders inside. The `null`s and `false`s a conditional slide leaves behind are dropped'
      }
    },
    {
      name: 'value',
      type: 'number',
      description: {
        ko: '보이고 있는 슬라이드. 0부터 셉니다. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'Which slide is showing, counted from 0. Use with `onValueChange` for a controlled carousel'
      }
    },
    {
      name: 'defaultValue',
      type: 'number',
      default: '0',
      description: {
        ko: '처음 보이는 슬라이드. uncontrolled일 때 씁니다',
        en: 'Which starts showing, for an uncontrolled carousel'
      }
    },
    {
      name: 'onValueChange',
      type: '(index: number) => void',
      description: {
        ko: '인덱스가 움직이는 모든 경로에서 호출됩니다 — 화살표, 표시점, 새 스냅 포인트에 안착한 드래그까지',
        en: 'Called for every way the index can move: an arrow, a mark, or a drag that settled on a new snap point'
      }
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '화살표가 마지막에서 처음으로 감기는지. 끄면 양 끝에서 `disabled`가 됩니다 — 시작과 끝이 있는 묶음에는 그쪽이 정직합니다',
        en: 'Whether the arrows wrap from the last slide back to the first. With it off they go `disabled` at the ends instead, which is the honest thing for a set that has a beginning and an end'
      }
    },
    {
      name: 'autoPlay',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '스스로 넘어갑니다. 호버, 내부 포커스, 백그라운드 탭에서 멈추고, `prefers-reduced-motion`에서는 아예 시작하지 않습니다. live region도 그동안 조용해집니다',
        en: 'Advances on its own. It pauses on hover, on focus anywhere inside it, and while the tab is in the background, and it does not start at all under `prefers-reduced-motion`. The live region goes quiet with it'
      }
    },
    {
      name: 'interval',
      type: 'number',
      default: '5000',
      description: {
        ko: '각 슬라이드가 머무는 시간, 밀리초',
        en: 'How long each slide is held, in milliseconds'
      }
    },
    {
      name: 'arrows',
      type: 'boolean',
      default: 'true',
      description: { ko: '이전/다음 버튼', en: 'The previous/next buttons' }
    },
    {
      name: 'indicators',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '프레임 아래의 위치 표시. 현재 것은 더 큰 점이 아니라 짧은 막대라서, 이웃이 움직이지 않습니다',
        en: 'The row of position marks under the frame. The current one is a short bar rather than a bigger dot, so its neighbours never move'
      }
    },
    {
      name: 'label',
      type: 'string',
      default: "'Carousel'",
      description: { ko: '캐러셀의 접근성 이름', en: "The carousel's accessible name" }
    },
    {
      name: 'previousLabel',
      type: 'string',
      default: "'Previous slide'",
      description: {
        ko: '이전 버튼의 접근성 이름',
        en: 'The accessible name of the previous button'
      }
    },
    {
      name: 'nextLabel',
      type: 'string',
      default: "'Next slide'",
      description: { ko: '다음 버튼의 접근성 이름', en: 'The accessible name of the next button' }
    },
    {
      name: 'slideLabel',
      type: '(index: number, count: number) => string',
      default: '(index, count) => `Slide ${index} of ${count}`',
      description: {
        ko: '슬라이드 하나가 스크린 리더에 어떻게 불리는지, 그리고 그 표시점의 이름',
        en: 'How one slide is named to a screen reader, and how its mark is labelled'
      }
    },
    {
      ...containerVariant,
      description: {
        ko: '프레임이 슬라이드 뒤에 칠하는 면의 양. `text`는 프레임을 아예 그리지 않으므로, 슬라이드가 이미 자기 테두리를 가지고 있을 때 쓰세요',
        en: 'How much surface the frame paints behind the slides. `text` draws no frame at all, which is what to reach for when the slides already have edges of their own'
      }
    },
    {
      ...size,
      description: {
        ko: '화살표와 표시점의 크기, 그리고 화살표가 프레임 가장자리에서 들어온 정도. 슬라이드의 크기는 아닙니다 — 그건 프레임 그 자체입니다',
        en: 'The size of the arrows and the marks, and how far the arrows sit in from the frame’s edge. Not the size of a slide, which is whatever the frame is'
      }
    },
    {
      ...color,
      description: {
        ko: '현재 표시점과 화살표가 읽는 강조 색 계열. 프레임은 다른 컨테이너와 마찬가지로 중립으로 남습니다',
        en: 'Which accent family the current mark and the arrows read. The frame stays neutral, as every container does'
      }
    }
  ],

  MPChatBubble: [
    {
      name: 'children',
      type: NODE,
      description: { ko: '메시지', en: 'The message' }
    },
    {
      name: 'side',
      type: "'start' | 'end'",
      default: "'start'",
      description: {
        ko: '누구의 메시지인지. 행이 흐르는 방향과 어느 모서리가 잘리는지를 정합니다. `left`/`right`가 아닌 이유는 스레드가 언어가 흐르는 방향으로 흐르기 때문입니다',
        en: 'Whose message this is. Decides which way the row runs and which corner is cut short. Not `left`/`right`, because a thread runs the way the language does'
      }
    },
    {
      name: 'name',
      type: NODE,
      description: { ko: '보낸 사람. 말풍선 위에 놓입니다', en: 'Who sent it, above the bubble' }
    },
    {
      name: 'time',
      type: NODE,
      description: { ko: '보낸 시각. 이름 옆에 놓입니다', en: 'When it was sent, beside the name' }
    },
    {
      name: 'avatar',
      type: NODE,
      description: {
        ko: '보낸 사람의 사진 — 보통 `MPAvatar`. 생략하면 말풍선이 행 전체를 씁니다',
        en: "The sender's picture — an `MPAvatar`, usually. Left out, the bubble takes the whole row"
      }
    },
    {
      name: 'status',
      type: "'sending' | 'sent' | 'delivered' | 'read' | 'failed'",
      description: {
        ko: '메시지가 어디까지 갔는지. 말풍선 아래 표시로 그려집니다. 생략하면 아무것도 그려지지 않습니다 — 받은 메시지에는 보여 줄 전송 상태가 없습니다',
        en: 'How far the message has got, drawn as a mark under the bubble. Left out, nothing is drawn — a received message has no delivery state worth showing'
      }
    },
    {
      name: 'statusLabel',
      type: 'string',
      description: {
        ko: '표시가 읽히는 단어를 덮어씁니다. 기본값은 `locale`의 번역입니다',
        en: 'Overrides the word the mark is read out as. Defaults to the translation for `locale`'
      }
    },
    {
      name: 'typing',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '메시지 대신 점 세 개를 그립니다. `children`은 그대로 두므로, 메시지가 도착하면 같은 말풍선이 그리로 돌아갑니다',
        en: 'Draws the three dots instead of the message. Whatever is in `children` is left alone, so the same bubble can go back to it when the message arrives'
      }
    },
    {
      name: 'media',
      type: NODE,
      description: {
        ko: '사진, 영상, 지도. 텍스트 위에 가장자리까지 그려져 말풍선의 모서리가 잘라냅니다',
        en: "A picture, a video, a map — drawn edge to edge above the text, so the bubble's own corners crop it"
      }
    },
    {
      name: 'preview',
      type: 'MPChatBubblePreview',
      description: {
        ko: '메시지 속 링크를 텍스트 아래 카드로 펼칩니다 — `{ url, title?, description?, image?, site?, newTab? }`',
        en: 'A link in the message, unfurled into a card under the text — `{ url, title?, description?, image?, site?, newTab? }`'
      }
    },
    {
      name: 'actions',
      type: NODE,
      description: {
        ko: '메시지 자신의 액션. 말풍선 옆에 앉고, 행에 호버가 오거나 내부에 포커스가 들어오기 전까지 비켜서 있습니다',
        en: "The message's own actions. Sits beside the bubble and stays out of the way until the row is hovered or something in it takes focus"
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '전송 표시가 어느 언어로 읽히는지. 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다',
        en: 'Which language the marks are read out in. Falls back to the nearest `MPLocaleProvider`, then to English'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'tonal'",
      description: {
        ko: '말풍선이 칠하는 면의 양. 컨테이너가 아니라 **컨트롤**의 사다리라서 `filled`가 강조 색으로 채웁니다 — 말풍선은 스스로가 칠해지는 대상입니다. `text`만은 표면 없음이 아니라 가장 조용한 중립 컨테이너입니다',
        en: "How much surface the bubble paints. The **control** ladder rather than the container one, so `filled` floods it with the accent — a bubble is the thing being coloured. `text` is the one rung that is not 'no surface': it takes the quietest neutral container instead"
      }
    },
    {
      ...size,
      description: {
        ko: '메시지의 타입 스케일과 말풍선 안의 여백. 여백 트랙은 시트 사다리보다 좁습니다 — 여덟 단어 주위의 16px는 메시지가 아니라 카드입니다',
        en: 'The type scale of the message, and the room inside the bubble. A tighter padding track than the sheet ladder: 16px around eight words is a card, not a message'
      }
    },
    color
  ],

  MPPill: [
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '가운데의 헤드라인 — 이 필이 지금 무엇에 대한 것인지',
        en: 'The headline in the middle — what the pill is currently about'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '제목 아래 두 번째 줄. 한 단계 아래이고 더 조용합니다',
        en: 'The second line, under the title. One step down and quieter'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '앞쪽 슬롯 — 글리프, 아바타, 상태 점, 사진. 정사각형 상자에 담겨 원형으로 잘리므로 `<img>`도 아이콘처럼 들어갑니다',
        en: 'The leading slot — a glyph, an avatar, a status dot, a photograph. It gets a square box of its own, clipped to a circle, so an `<img>` lands in it as readily as an icon does'
      }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: {
        ko: '뒤쪽 슬롯. 누를 수 있는 영역 바깥이라 컨트롤이 들어갈 수 있습니다',
        en: 'The trailing slot. Outside the pressable area, so it can be a control'
      }
    },
    {
      name: 'details',
      type: NODE,
      description: {
        ko: '`expanded`일 때 드러나는 나머지 절반. 필은 다른 모양으로 바뀌는 대신 아래로 자라 들어갑니다. 높이는 `ResizeObserver`로 재므로, 열린 뒤에 내용이 자라도 함께 자랍니다',
        en: 'The second half, revealed when `expanded`. The pill grows downward into it rather than swapping to a different shape. The height is measured with a `ResizeObserver`, so details that change after they open grow with it'
      }
    },
    {
      name: 'expanded',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '`details`가 보이는지. 열리면 모서리도 `corner-full`에서 `corner-extra-large`로 옮겨 갑니다',
        en: 'Whether `details` is showing. Opening it also moves the corner from `corner-full` to `corner-extra-large`'
      }
    },
    {
      name: 'position',
      type: "'static' | 'sticky' | 'fixed'",
      default: "'static'",
      description: {
        ko: '페이지의 스크롤 속에서 어떻게 앉는지. `fixed`는 뷰포트에 고정하고 가운데로 보냅니다 — 이 모양이 존재하는 배치입니다',
        en: "How it sits in the page's scroll. `fixed` pins it against the viewport and centres it, which is the arrangement this shape exists for"
      }
    },
    {
      name: 'side',
      type: "'top' | 'bottom'",
      default: "'top'",
      description: {
        ko: '`position`이 `static`이 아닐 때 어느 가장자리에 붙는지',
        en: 'Which edge it is held against when `position` is not `static`'
      }
    },
    {
      name: 'onClick',
      type: 'MouseEventHandler<HTMLButtonElement>',
      description: {
        ko: '넘기는 것 자체가 가운데를 진짜 버튼으로 만듭니다. `endIcon`은 그 바깥에 남습니다',
        en: 'Passing it makes the middle a real button. `endIcon` stays outside it'
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'filled'",
      description: {
        ko: '알약이 칠하는 면의 양. **컨트롤**의 사다리라서 `filled`가 강조 색으로 채웁니다. 다섯 모두 그림자를 가지는데, 자기가 떠 있는 내용 위에 평평하게 놓인 알약은 실수처럼 읽히기 때문입니다',
        en: 'How much surface the lozenge paints. The **control** ladder, so `filled` takes the accent under its own ink. All five carry a shadow, because a lozenge floating flat on the content it is floating over reads as a mistake'
      }
    },
    {
      ...size,
      description: {
        ko: '행의 최소 높이와 그 안의 타입 스케일. 버튼과 같은 숫자라서, 접힌 필은 옆의 버튼과 줄이 맞습니다',
        en: "The row's minimum height and the type scale in it. The same numbers a button is drawn at, so a collapsed pill lines up with one beside it"
      }
    },
    { ...color, default: "'secondary'" },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`title`과 `description`으로 말할 수 없는 것 — 작은 수치, 살아 있는 카운터, 진행 표시. 그 아래 같은 열에 그려집니다',
        en: 'Anything the middle needs that `title` and `description` cannot say — a small readout, a live counter, a progress indicator. Rendered under them, in the same column'
      }
    }
  ],

  MPPopover: [
    {
      name: 'trigger',
      type: 'ReactElement',
      description: {
        ko: '팝업이 매달리고, 팝업을 여는 엘리먼트. ref와 prop spread를 받는 엘리먼트 하나여야 하며, 모든 Material Plus 컴포넌트가 그렇습니다. 선택 사항이지만, 없으면 위치를 잡을 대상이 없어 뷰포트에 붙습니다',
        en: 'The element the popup hangs off and that opens it. Exactly one element, which must accept a ref and spread props — every Material Plus component does. Optional, though a popover with none has nothing to position against and will sit against the viewport'
      }
    },
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '제목. 팝업의 이름이 되는 엘리먼트로 렌더링됩니다',
        en: 'The heading, rendered as the element that names the popup'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '제목 아래 한 줄이자 팝업의 접근성 설명',
        en: "A line under it, and the popup's accessible description"
      }
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: {
        ko: '트리거의 어느 변에 나타날지. 자리가 없으면 반대편으로 뒤집힙니다 — Base UI가 하는 일이고, 그게 옳습니다. 지시가 아니라 선호입니다',
        en: "Which edge of the trigger it appears on. Flips to the opposite side when there is no room, which is Base UI's doing and is the right behaviour — this is a preference, not an instruction"
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: {
        ko: '그 변을 따라 어디에 앉을지. 논리적입니다 — 변이 RTL에서 반대로 흐르기 때문입니다',
        en: 'Where it sits along that edge. Logical, because that edge runs the other way under RTL'
      }
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '8',
      description: { ko: '트리거와의 거리, 픽셀', en: 'Distance from the trigger, in pixels' }
    },
    {
      name: 'alignOffset',
      type: 'number',
      default: '0',
      description: { ko: '그 변을 따라 밀어내는 양, 픽셀', en: 'Shift along that edge, in pixels' }
    },
    {
      name: 'arrow',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '트리거를 가리키는 작은 쐐기를 그립니다. 기본이 꺼짐인 것은 MD3가 메뉴와 rich tooltip에 하는 것과 같습니다 — 8픽셀 떨어진 팝업은 자기가 무엇에 속하는지 말할 필요가 없습니다',
        en: 'Draws the little wedge pointing at the trigger. Off by default, which is what MD3 does with both the menu and the rich tooltip: a popup eight pixels from its trigger does not need to say what it belongs to'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '팝오버가 열려 있는지. `onOpenChange`와 함께 쓰면 controlled입니다',
        en: 'Whether the popover is open. Use with `onOpenChange` for a controlled one'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 열려 있을지. uncontrolled일 때 씁니다',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열리고 닫힐 때 호출됩니다', en: 'Called as the popup opens and closes' }
    },
    {
      name: 'modal',
      type: "boolean | 'trap-focus'",
      default: 'false',
      description: {
        ko: '뒤쪽 페이지를 가져갈지. `false`가 기본이고, 그것이 팝오버와 다이얼로그를 가릅니다 — 페이지 대신이 아니라 페이지 옆의 상세입니다. `trap-focus`는 스크롤을 잠그지 않고 포커스만 붙잡습니다',
        en: 'Whether the page behind is taken away. `false` is the default, and that is what separates a popover from a dialog: it is a detail beside the page, not instead of it. `trap-focus` holds focus inside without locking the scroll'
      }
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description: {
        ko: 'Escape와 바깥 클릭으로 닫히는지. 스스로 나갈 길이 있는 팝업에서만 끄세요. `MPPopoverClose`와 코드에 의한 닫기는 계속 동작합니다',
        en: 'Whether pressing Escape or clicking outside closes the popup. Turn it off only for a popup with its own way out — `MPPopoverClose` and an imperative close still work'
      }
    },
    {
      name: 'showClose',
      type: 'boolean',
      default: 'false',
      description: { ko: '모서리의 ×', en: 'Shows the × in the corner' }
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Close'",
      description: { ko: '× 버튼의 접근성 이름', en: 'Accessible name of the × button' }
    },
    {
      name: 'width',
      type: 'number | string',
      description: {
        ko: '`size`가 함의하는 너비 상한을 덮어씁니다. 숫자는 픽셀입니다. 스케일 조정이 아니라 *내용*이 너비를 정하는 팝오버를 위한 것입니다',
        en: "A hard cap on the popup's width, overriding the one `size` implies. Numbers are pixels. For the popover whose *content* decides its width, rather than for tuning the scale"
      }
    },
    {
      ...size,
      description: {
        ko: '팝업 안의 여백, 그 안의 타입 스케일, 그리고 최대 너비. 다이얼로그의 사다리보다 한 단계씩 좁습니다 — 팝오버는 페이지 한가운데의 시트가 아니라 컨트롤 옆의 상세입니다',
        en: 'The room inside the popup, the type scale in it, and how wide it may get. One rung narrower than the dialog at every step: a popover is a detail beside a control rather than a sheet in the middle of the page'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '본문', en: 'The body' }
    }
  ],

  MPSpoiler: [
    {
      name: 'children',
      type: NODE,
      description: { ko: '가려지는 것', en: 'What is being covered' }
    },
    {
      name: 'revealed',
      type: 'boolean',
      description: {
        ko: '내용이 드러나 있는지. `onRevealedChange`와 함께 쓰면 controlled입니다',
        en: 'Whether the content is uncovered. Use with `onRevealedChange` to control it'
      }
    },
    {
      name: 'defaultRevealed',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '처음에 드러나 있을지. uncontrolled일 때 씁니다',
        en: 'Where an uncontrolled spoiler starts'
      }
    },
    {
      name: 'onRevealedChange',
      type: '(revealed: boolean) => void',
      description: {
        ko: '보기 또는 가리기 버튼을 눌렀을 때 호출됩니다',
        en: 'Called when the reveal or hide button is pressed'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '덮개의 문구가 어느 언어로 쓰이는지. 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다. 이 라이브러리에서 컴포넌트 자신의 단어가 읽히기만 하는 게 아니라 *그려지는* 유일한 자리입니다',
        en: 'Which language the cover is written in. Falls back to the nearest `MPLocaleProvider`, then to English. This is the one place in the library where a component’s own words are *drawn* rather than only announced'
      }
    },
    {
      name: 'label',
      type: NODE,
      description: {
        ko: '공개 버튼의 문구. 기본값은 `locale`의 단어입니다',
        en: "The reveal button's label. Defaults to the `locale`'s word for it"
      }
    },
    {
      name: 'hideLabel',
      type: NODE,
      description: {
        ko: '`reversible`일 때 가리기 버튼의 문구',
        en: "The hide button's label, when `reversible` is on"
      }
    },
    {
      name: 'description',
      type: `${NODE} | false`,
      description: {
        ko: '버튼 위의 한 줄. 왜 가려졌는지를 말합니다. 기본값은 `locale`의 문구이고, `false`를 주면 아무것도 쓰이지 않은 덮개가 됩니다',
        en: "The line above the button, saying why the content is covered. Defaults to the `locale`'s wording; pass `false` for a cover with nothing written on it"
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '기본 공개 버튼 전체를 대체합니다. 대체한 컨트롤은 직접 연결해야 합니다 — `revealed`를 넘기고 자기 상태로 구동하세요',
        en: 'Replaces the default reveal button entirely. The replacement is yours to wire up: pass `revealed` and drive it from your own state'
      }
    },
    {
      name: 'reversible',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '한 번 열린 뒤 내용 아래에 다시 가리는 버튼이 나타납니다',
        en: 'Keeps the content coverable: once revealed, a hide button appears under it'
      }
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      description: {
        ko: '**가려진** 상자를 이 높이로 자릅니다. 숫자는 픽셀입니다. 열면 제한이 풀립니다 — 보여 주면서 스크롤바 달린 상자에 남겨 두는 건 엉뚱한 질문에 답하는 일입니다',
        en: 'Clamps the **covered** box to this height — a CSS length, or a number in pixels. Revealing releases it: showing something and leaving it in a box with a scrollbar is answering the wrong question'
      }
    },
    {
      name: 'blur',
      type: 'number',
      default: '10',
      description: {
        ko: '내용을 얼마나 세게 흐릴지, 픽셀',
        en: 'How hard the content is blurred, in pixels'
      }
    },
    {
      ...padded,
      description: {
        ko: '내용 주위의 안쪽 여백. 가장자리까지 닿아야 하는 것 — 사진, 영상 — 에는 꺼 두세요',
        en: 'Inner padding around the content. Turn it off for something that should reach the edges — a picture, a video'
      }
    },
    {
      ...containerVariant,
      description: {
        ko: '시트가 칠하는 면의 양. `text`는 상자를 아예 그리지 않는데, 문장 속에 놓인 스포일러가 보통 원하는 것입니다',
        en: 'How much surface the sheet paints. `text` draws no box at all, which is what a spoiler sitting inside running prose usually wants'
      }
    },
    {
      ...size,
      description: {
        ko: '안쪽 여백과 덮개 위 버튼의 크기',
        en: 'The room inside, and the size of the button on the cover'
      }
    },
    {
      ...color,
      description: {
        ko: '공개 버튼이 읽는 강조 색 계열. 시트는 다른 컨테이너와 마찬가지로 중립으로 남습니다',
        en: 'Which accent family the reveal button reads. The sheet stays neutral, as every container in this library does'
      }
    }
  ],

  MPCollapsible: [
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '패널이 보이는지. `onOpenChange`와 함께 쓰면 controlled입니다',
        en: 'Whether the panel is showing. Use with `onOpenChange` for a controlled one'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '처음에 열려 있을지. uncontrolled일 때 씁니다',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: {
        ko: '트리거가 패널을 열고 닫을 때 호출됩니다',
        en: 'Called when the trigger opens or closes the panel'
      }
    },
    {
      name: 'title',
      type: NODE,
      description: { ko: '트리거 위의 제목', en: 'The heading on the trigger' }
    },
    {
      name: 'subtitle',
      type: NODE,
      description: {
        ko: '제목 아래 한 줄. 타입 스케일 한 단계 아래이고 한 톤 물러납니다',
        en: 'A second line under it, one step down the type scale and muted'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: {
        ko: '제목 앞에 놓이는 내용 — 글리프, 상태 점, 개수',
        en: 'Content before the title — a glyph, a status dot, a count'
      }
    },
    {
      name: 'action',
      type: NODE,
      description: {
        ko: '헤더 끝에 고정되는 컨트롤. 트리거 *바깥*이라, 눌러도 구획이 접히지 않습니다 — `<button>` 안의 `<button>`은 브라우저가 파싱하면서 고쳐 쓰는 마크업입니다',
        en: 'A control pinned to the end of the header, *outside* the trigger — so pressing it does not fold the section. A `<button>` inside a `<button>` is markup the browser rewrites on parse'
      }
    },
    {
      name: 'trigger',
      type: 'ReactElement',
      description: {
        ko: '헤더 전체를 직접 만든 컨트롤로 바꿉니다. 넘긴 엘리먼트가 트리거가 되고, Base UI가 클릭 핸들러와 `aria-expanded`/`aria-controls`를 쥐여 줍니다',
        en: 'Replaces the header entirely with a control of your own. The element *becomes* the trigger, and Base UI hands it the click handler and the `aria-expanded` / `aria-controls` wiring'
      }
    },
    {
      name: 'indicator',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '헤더 끝의 셰브런. 상태를 알리기 위해 회전합니다',
        en: 'The chevron at the end of the header, turned to report the state'
      }
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '트리거가 응답을 멈추고 패널은 있던 상태 그대로 남습니다',
        en: 'Unavailable. The trigger stops answering and the panel stays as it is'
      }
    },
    padded,
    containerVariant,
    {
      ...size,
      description: {
        ko: '안쪽 여백, 그리고 헤더와 본문의 타입 스케일. 모서리는 사다리에 없습니다 — 시트는 어느 단계에서나 `corner-medium`입니다',
        en: 'The room inside, and the type scale of the header and the body. The corner is not on the ladder: a sheet is `corner-medium` at every rung'
      }
    },
    {
      name: 'hiddenUntilFound',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '닫힌 패널을 DOM에 남겨, 브라우저의 페이지 검색이 찾아서 열 수 있게 합니다. `keepMounted`보다 우선합니다',
        en: "Keeps a closed panel in the DOM so the browser's own page search can find and open it. Overrides `keepMounted`"
      }
    },
    {
      name: 'keepMounted',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '닫힌 패널을 DOM에 남깁니다. 만드는 비용이 크거나, 접혀 있는 동안에도 살아남아야 하는 폼 상태를 담은 내용에 씁니다',
        en: 'Keeps a closed panel in the DOM. For content that is expensive to build, or that holds form state which should survive being folded away'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '본문', en: 'The body' }
    }
  ],

  MPDrawer: [
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'left'",
      description: {
        ko: '어느 가장자리에 붙는지. 논리적이 아니라 물리적입니다 — 창 위쪽에 붙은 드로어는 어느 표기 방향에서든 위쪽입니다. 옆면은 내비게이션 드로어이고 위·아래는 시트라서, 둘의 모서리와 크기 규칙이 다릅니다',
        en: 'Which edge the panel is attached to. Physical rather than logical — a drawer along the top of the window is along the top in every writing direction. A side panel is a navigation drawer and a top or bottom one is a sheet, so the two take different corners and different sizing'
      }
    },
    {
      name: 'mode',
      type: "'modal' | 'standard'",
      default: "'modal'",
      description: {
        ko: 'MD3 자신의 두 단어입니다. `modal`은 스크림 위에 떠서 포커스를 붙잡는 드로어, `standard`는 레이아웃의 일부인 드로어 — 스크림도, 포털도, 포커스 트랩도, 닫을 것도 없습니다',
        en: "MD3's own two words. `modal` floats over the page on a scrim and holds the focus; `standard` is part of the layout — no scrim, no portal, no focus trap and nothing to dismiss"
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '드로어가 보이는지. `onOpenChange`와 함께 쓰면 controlled입니다',
        en: 'The drawer is shown. Use with `onOpenChange` for a controlled drawer'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: {
        ko: '처음에 열려 있을지. `modal`에서는 `false`, `standard`에서는 `true`가 기본값입니다 — 열어야만 나타나는 고정 사이드바는 고정 사이드바가 아닙니다',
        en: 'Whether it starts open. `false` in `modal` mode and `true` in `standard`, because a fixed sidebar that had to be opened before it appeared would not be a fixed sidebar'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: { ko: '열리고 닫힐 때 호출됩니다', en: 'Called as the drawer opens and closes' }
    },
    {
      name: 'trigger',
      type: 'ReactElement',
      description: {
        ko: '드로어를 여는 엘리먼트. Base UI가 연결합니다. `modal` 전용입니다 — `standard` 드로어는 여는 것이 아니라 레이아웃에 있는 것이라서, 트리거는 할 일이 없어 렌더링되지 않습니다',
        en: 'The element that opens the drawer, wired up by Base UI. `modal` only: a `standard` drawer is not opened — it is in the layout — so a trigger there has nothing to do and is not rendered'
      }
    },
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '제목. 드로어의 이름이 되는 엘리먼트로 렌더링됩니다',
        en: 'The heading. Rendered as the element that names the drawer'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '제목 아래 한 줄이자 드로어의 접근성 설명',
        en: "A line under it, and the drawer's accessible description"
      }
    },
    {
      name: 'actions',
      type: NODE,
      description: {
        ko: '패널 바닥에 고정되는 행. 끝 정렬이라 버튼 두 개에 래퍼가 필요 없고, `MPDrawerClose`가 그중 하나를 닫기 버튼으로 만듭니다',
        en: 'The bottom row, held against the foot of the panel. Laid out end-aligned, so a pair of buttons needs no wrapper — and `MPDrawerClose` is what makes one of them dismiss'
      }
    },
    {
      name: 'dividers',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '헤더·본문·액션 사이를 여백 대신 실선으로 나눕니다. 본문이 스크롤되기 시작하면 켜세요 — 선이 헤더가 제자리에 남았다고 말해 줍니다',
        en: 'Draws a hairline between the header, the body and the actions instead of separating them with space. Worth turning on the moment the body scrolls: the lines are what say the header stayed put'
      }
    },
    {
      name: 'showClose',
      type: 'boolean',
      description: {
        ko: '모서리의 ×. `modal`에서는 켜짐 — 페이지를 가져갔으니 나가는 길을 외우게 하면 안 됩니다. `standard`에서는 꺼짐 — 다시 열 방법 없이 고정 사이드바를 닫는 ×는 일방통행문입니다',
        en: 'Shows the × in the corner. On in `modal` mode, where the panel has taken the page and the way out should not have to be remembered; off in `standard`, where a × that closes a fixed sidebar with nothing to reopen it is a one-way door'
      }
    },
    {
      name: 'closeLabel',
      type: 'string',
      default: "'Close'",
      description: { ko: '× 버튼의 접근성 이름', en: 'Accessible name of the × button' }
    },
    {
      name: 'extent',
      type: 'number | string',
      description: {
        ko: '가장자리에서 얼마나 들어오는지 — `left`/`right`에는 **너비**, `top`/`bottom`에는 **높이**. 숫자는 픽셀입니다. 생략하면 옆면 패널은 `size`가 함의하는 너비를, 위·아래 패널은 내용만큼의 높이(최대 85%)를 씁니다',
        en: 'How far the panel reaches in from its edge: a **width** for `left` and `right`, a **height** for `top` and `bottom`. Numbers are pixels. Left alone, a side panel takes the width its `size` implies and a top or bottom panel is as tall as its content, up to 85% of the window'
      }
    },
    {
      name: 'rounded',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '페이지를 향한 가장자리의 모서리를 둥글립니다. 창에 맞닿은 모서리는 언제나 각집니다 — 보이는 끝이 없는 것에서 잘라낸 모서리는 아무것도 잘라내지 않은 모서리입니다',
        en: 'Rounds the corners on the edge that faces the page. The corners against the window are always square, because a corner cut off something that has no visible end is a corner cut off nothing'
      }
    },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description: {
        ko: 'Escape와 스크림 클릭으로 닫히는지. 반드시 대답을 받아야 하는 드로어에서만 끄고, 그때는 대답할 수 있는 액션을 함께 주세요. `modal` 전용입니다',
        en: 'Whether pressing Escape or clicking the scrim closes the drawer. Turn it off only for the drawer that has to be answered, and then give it actions that answer it. `modal` only'
      }
    },
    {
      ...size,
      description: {
        ko: '기본 도달 거리와 내부의 타입 스케일. `md`가 MD3 자신의 360dp 내비게이션 드로어입니다',
        en: "How far the panel reaches in by default, and the type scale inside it. `md` is MD3's own 360dp navigation drawer"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '본문. 스크롤되는 유일한 부분이라, 제목과 액션은 제자리에 남습니다',
        en: 'The body. The only part that scrolls, so the heading and the actions stay put'
      }
    }
  ],

  MPCalendar: [
    {
      name: 'value',
      type: 'Date | null',
      description: {
        ko: '고른 날. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'The chosen day. Use with `onValueChange` for a controlled calendar'
      }
    },
    {
      name: 'defaultValue',
      type: 'Date | null',
      description: {
        ko: '처음 고른 날. uncontrolled일 때 씁니다',
        en: 'The day the calendar starts on, for an uncontrolled one'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: Date) => void',
      description: {
        ko: '새로 고른 날로 호출됩니다. `MPDatePicker`와 달리 `null`은 오지 않습니다 — 달력에는 ×가 없고, 고른 날을 다시 눌러도 선택이 풀리지 않습니다',
        en: 'Called with the newly chosen day. Never `null`, unlike `MPDatePicker`: there is no × on a calendar and pressing the chosen day again does not unchoose it'
      }
    },
    {
      name: 'month',
      type: 'Date',
      description: {
        ko: '화면에 떠 있는 달. `onMonthChange`와 함께 쓰면 헤더를 직접 몹니다',
        en: 'The month on screen. Use with `onMonthChange` to drive the header yourself'
      }
    },
    {
      ...pickerDefaultMonth,
      description: {
        ko: '값이 없을 때 달력이 여는 달. 값이 있으면 그 달이 이깁니다',
        en: 'Which month it opens on when there is no value — the month of `value` wins when there is one'
      }
    },
    {
      name: 'onMonthChange',
      type: '(month: Date) => void',
      description: {
        ko: '헤더가 달을 넘기거나, 달·해를 골라 화면이 옮겨질 때 호출됩니다',
        en: 'Called when the header steps, or when choosing a month or a year moves it'
      }
    },
    {
      name: 'precision',
      type: "'day' | 'month' | 'year'",
      default: "'day'",
      description: {
        ko: '달력이 멈추는 단위이자 누름이 답하는 단위. `month`는 날짜 격자를 아예 그리지 않고 누른 달의 1일로, `year`는 1월 1일로 답합니다',
        en: 'Which unit the calendar stops at, and therefore what a press answers with. `month` never draws a day grid and answers with the 1st; `year` answers with 1 January'
      }
    },
    {
      name: 'minDate',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 이른 날. 날짜 단위라 시각은 무시합니다',
        en: 'The earliest day that may be chosen. Day-granular — the time is ignored'
      }
    },
    {
      name: 'maxDate',
      type: 'Date | null',
      description: { ko: '고를 수 있는 가장 늦은 날', en: 'The latest day that may be chosen' }
    },
    {
      ...pickerShouldDisableDate,
      description: {
        ko: '범위 안에 있지만 고를 수 없는 날을 막습니다 — 주말, 공휴일, 이미 예약된 방. 막힌 날도 지워지지 않고 그대로 그려집니다. 날에 대해서만 묻기 때문에 `precision`이 달이나 해면 호출하지 않습니다',
        en: 'Blocks individual days that are inside the range but still unavailable — weekends, holidays, a room already booked. A blocked day is still drawn. Asked about days only, so a calendar whose `precision` is a month or a year never consults it'
      }
    },
    {
      ...pickerLocale,
      description: {
        ko: 'BCP 47 태그. 월·요일 이름, 헤더 두 버튼의 순서, 주 시작 요일을 결정합니다. 생략하면 가장 가까운 `MPLocaleProvider`, 그다음 플랫폼 기본값을 따릅니다',
        en: "A BCP 47 tag deciding the month and weekday names, the order of the header's two buttons, and which day the week starts on. Falls back to the nearest `MPLocaleProvider`, then to the platform's own"
      }
    },
    pickerWeekStartsOn,
    {
      name: 'showOutsideDays',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '앞뒤 달에 속한 날들을 흐리게 함께 그립니다',
        en: 'Draws the leading and trailing days belonging to the neighbouring months'
      }
    },
    {
      name: 'showPreviousButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '헤더의 이전 스텝 버튼을 답니다. 끄면 버튼 크기의 빈칸이 남아 두 달력이 나란히 설 때 제목 중심선이 어긋나지 않습니다',
        en: "Offers the header's back stepper. Switched off it leaves a hole the size of the button, so two calendars side by side keep their headings on one centre line"
      }
    },
    {
      name: 'showNextButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '헤더의 다음 스텝 버튼을 답니다',
        en: "Offers the header's forward stepper"
      }
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '마운트하면서 포커스를 가져갑니다. 피커 안에서는 켜져 있고 여기서는 꺼져 있는데, 방금 열린 팝업은 읽는 사람의 현재 용무지만 페이지에 놓인 달력은 아니기 때문입니다',
        en: "Takes the focus on mount. `true` inside a picker and `false` here: a popup that has just opened is the reader's current business, and a calendar sitting in a page is not"
      }
    },
    {
      name: 'variant',
      type: VARIANT,
      default: "'text'",
      description: {
        ko: '아래에 얼마나 면을 칠할지. 기본값 `text`는 아무것도 칠하지 않으며, 그게 이 컴포넌트를 어디든 떨어뜨릴 수 있게 만드는 값입니다 — 독립 달력은 대개 이미 면인 곳(카드, 패널, 직접 만든 팝오버)에 놓이고, 두 번째 면을 칠하는 기본값은 흔한 경우에 상자 안의 상자가 됩니다',
        en: "How much surface it paints under itself. `'text'` — nothing — is the default and is what makes the component droppable: a standalone calendar almost always lands somewhere that is already a surface, and a default that painted a second one would be a box inside a box in the common case"
      }
    },
    {
      ...size,
      description: {
        ko: '셀 크기와 타입 스케일. 다른 컨트롤과 같은 사다리라, `size="sm"` 폼 옆의 달력은 같은 무게로 그려집니다',
        en: 'The cell size and the type scale. The same ladder every control is on, so a calendar beside a `size="sm"` form is drawn at the same weight'
      }
    },
    {
      ...color,
      description: {
        ko: '고른 날을 어떤 강조 색 계열로 칠할지',
        en: 'Which accent family the chosen day is painted in'
      }
    },
    pickerLabels,
    {
      ...name,
      description: {
        ko: '폼 제출에 쓰이는 이름. 값은 `YYYY-MM-DD`로, UTC가 아니라 로컬 날짜로 나갑니다. `precision`이 달이면 `YYYY-MM`, 해면 `YYYY`입니다. 지정하지 않으면 hidden input 자체가 없습니다',
        en: 'Identifies the value when a form is submitted, as `YYYY-MM-DD` — the local day, not a UTC instant. `YYYY-MM` or `YYYY` when `precision` asks for less. Without it there is no hidden input at all'
      }
    },
    id
  ],

  MPDatePicker: [
    {
      name: 'value',
      type: 'Date | null',
      description: {
        ko: '고른 날. `onValueChange`와 함께 쓰면 controlled입니다',
        en: 'The chosen day. Use with `onValueChange` for a controlled picker'
      }
    },
    {
      name: 'defaultValue',
      type: 'Date | null',
      description: {
        ko: '처음 고른 날. uncontrolled일 때 씁니다',
        en: 'The day the picker starts on, for an uncontrolled one'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: Date | null) => void',
      description: {
        ko: '새로 고른 날로 호출됩니다. 이벤트가 아니라 `Date`이며, 비우면 `null`입니다',
        en: 'Called with the newly chosen day — a `Date`, not an event. `null` when cleared'
      }
    },
    pickerLabel,
    pickerFloatingLabel,
    pickerPlaceholder,
    description,
    errorMessage,
    {
      name: 'precision',
      type: "'day' | 'month' | 'year'",
      default: "'day'",
      description: {
        ko: '피커가 묻는 단위. `month`는 달력을 열두 달 격자에서 멈추고 누른 달의 1일로, `year`는 연도 격자에서 멈추고 1월 1일로 답합니다. 더 잔 뷰는 숨는 게 아니라 아예 없습니다',
        en: "Which unit the picker asks for. `'month'` stops the calendar at its grid of twelve months and answers with the 1st of the one pressed; `'year'` stops at the years and answers with 1 January. The finer views are absent rather than hidden"
      }
    },
    pickerDefaultMonth,
    {
      name: 'minDate',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 이른 날. 날짜 단위라 시각은 무시합니다 — 7월 27일 09:00을 넘겨도 27일은 그대로 고를 수 있습니다. `precision`이 묻는 단위로 읽히므로 월 피커에서는 7월 10일이 최소여도 7월은 그대로 고를 수 있습니다',
        en: 'The earliest day that may be chosen. Day-granular: a bound of 27 July at 09:00 still leaves the 27th pickable — and read at whatever `precision` asks for, so a minimum of 10 July still leaves July pickable on a month picker'
      }
    },
    {
      name: 'maxDate',
      type: 'Date | null',
      description: { ko: '고를 수 있는 가장 늦은 날', en: 'The latest day that may be chosen' }
    },
    {
      ...pickerShouldDisableDate,
      description: {
        ko: '범위 안에 있지만 고를 수 없는 날을 막습니다 — 주말, 공휴일, 이미 예약된 방. 막힌 날도 지워지지 않고 그대로 그려집니다. 날에 대해서만 묻기 때문에 `precision`이 달이나 해인 피커는 호출하지 않습니다',
        en: 'Blocks individual days that are inside the range but still unavailable — weekends, holidays, a room already booked. A blocked day is still drawn. Asked about days only, so a picker whose `precision` is a month or a year never consults it'
      }
    },
    pickerLocale,
    pickerWeekStartsOn,
    {
      ...pickerFormat,
      default: "{ dateStyle: 'medium' }",
      description: {
        ko: '트리거가 값을 쓰는 방식. `Intl`에 그대로 넘어갑니다. 비워 두면 `precision`을 따라 중간 길이 날짜, `July 2026`, `2026` 중 하나가 됩니다',
        en: 'How the trigger writes the value. Passed straight to `Intl`. Left out, it follows `precision` — a medium date, `July 2026`, or `2026`'
      }
    },
    pickerClearable,
    {
      name: 'showTodayButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '푸터에 오늘로 가는 단축 버튼을 답니다. 묻는 단위에 따라 "오늘", "이번 달", "올해"로 이름이 바뀝니다',
        en: 'Offers the shortcut to today in the footer. It is named after the unit it lands on — *Today*, *This month* or *This year*'
      }
    },
    {
      name: 'closeOnSelect',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '날을 고르는 즉시 팝업을 닫습니다',
        en: 'Closes the popup as soon as a day is chosen'
      }
    },
    pickerOpen,
    pickerDefaultOpen,
    pickerOnOpenChange,
    pickerLabels,
    pickerStartIcon,
    size,
    color,
    fullWidth,
    required,
    disabled,
    readOnly,
    {
      ...name,
      description: {
        ko: '폼 제출에 쓰이는 이름. 값은 `YYYY-MM-DD`로, UTC가 아니라 로컬 날짜로 나갑니다. `precision`이 달이면 `YYYY-MM`, 해면 `YYYY`입니다',
        en: 'Identifies the field when a form is submitted, as `YYYY-MM-DD` — the local day, not a UTC instant. `YYYY-MM` or `YYYY` when `precision` asks for less'
      }
    },
    id
  ],

  MPDateRangePicker: [
    {
      name: 'value',
      type: 'MPDateRange | null',
      description: {
        ko: '고른 범위. `{ start, end }` 객체이며, 한쪽만 있는 상태도 실재하는 상태입니다',
        en: 'The chosen range, as `{ start, end }`. Half a range is a real state'
      }
    },
    {
      name: 'defaultValue',
      type: 'MPDateRange | null',
      description: { ko: '처음 고른 범위', en: 'The range the picker starts on' }
    },
    {
      name: 'onValueChange',
      type: '(value: MPDateRange) => void',
      description: {
        ko: '항상 객체로 호출됩니다. 비운 범위는 `null`이 아니라 `{ start: null, end: null }`입니다',
        en: 'Always called with an object. A cleared range is `{ start: null, end: null }` rather than `null`'
      }
    },
    pickerLabel,
    pickerFloatingLabel,
    {
      name: 'startPlaceholder',
      type: NODE,
      description: {
        ko: '시작이 비어 있을 때 트리거 왼쪽에 보이는 문구',
        en: 'Shown in the first half of the trigger while the start is unchosen'
      }
    },
    {
      name: 'endPlaceholder',
      type: NODE,
      description: {
        ko: '끝이 비어 있을 때 트리거 오른쪽에 보이는 문구',
        en: 'Shown in the second half while the end is unchosen'
      }
    },
    description,
    errorMessage,
    {
      name: 'monthCount',
      type: '1 | 2',
      default: '2',
      description: {
        ko: '한 번에 보이는 달의 수. 달을 넘나드는 범위가 예외가 아니라 일반적인 경우라 둘이 기본입니다',
        en: 'How many months are on screen at once. Two by default, because a range that crosses a month boundary is the ordinary case'
      }
    },
    {
      name: 'presets',
      type: 'MPDateRangePreset[]',
      description: {
        ko: '달력 옆에 놓이는 단축 범위 — "지난 7일", "이번 달". 오늘에 따라 달라지면 함수로 넘기세요',
        en: 'Shortcuts listed beside the calendars — "Last 7 days", "This month". Pass a function when it depends on today'
      }
    },
    pickerDefaultMonth,
    {
      name: 'minDate',
      type: 'Date | null',
      description: { ko: '고를 수 있는 가장 이른 날', en: 'The earliest day that may be chosen' }
    },
    {
      name: 'maxDate',
      type: 'Date | null',
      description: { ko: '고를 수 있는 가장 늦은 날', en: 'The latest day that may be chosen' }
    },
    pickerShouldDisableDate,
    pickerLocale,
    pickerWeekStartsOn,
    { ...pickerFormat, default: "{ dateStyle: 'medium' }" },
    pickerClearable,
    {
      name: 'closeOnSelect',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '양쪽 끝이 모두 정해지면 팝업을 닫습니다',
        en: 'Closes the popup once both ends are chosen'
      }
    },
    pickerOpen,
    pickerDefaultOpen,
    pickerOnOpenChange,
    pickerLabels,
    pickerStartIcon,
    size,
    color,
    fullWidth,
    required,
    disabled,
    readOnly,
    {
      ...name,
      description: {
        ko: '폼 제출에 쓰이는 이름. 같은 이름의 hidden input 두 개로 나가므로 서버에서는 `FormData.getAll(name)`으로 받습니다',
        en: 'Identifies the field when a form is submitted. Two hidden inputs of the same name, so the two ends arrive as `FormData.getAll(name)`'
      }
    },
    id
  ],

  MPTimePicker: [
    {
      name: 'value',
      type: 'Date | null',
      description: {
        ko: '고른 시각. `Date`라서 날짜도 함께 지닙니다 — `referenceDate`를 보세요',
        en: 'The chosen time. A `Date`, so it carries a day as well — see `referenceDate`'
      }
    },
    {
      name: 'defaultValue',
      type: 'Date | null',
      description: { ko: '처음 고른 시각', en: 'The time the picker starts on' }
    },
    {
      name: 'onValueChange',
      type: '(value: Date | null) => void',
      description: {
        ko: '새로 고른 시각으로 호출됩니다',
        en: 'Called with the newly chosen time'
      }
    },
    pickerLabel,
    pickerFloatingLabel,
    pickerPlaceholder,
    description,
    errorMessage,
    {
      name: 'referenceDate',
      type: 'Date',
      default: 'today',
      description: {
        ko: '값이 아직 없을 때 고른 시각이 얹힐 날. 피커가 살아 있는 동안 고정되므로, 자정을 넘겨 열어 두어도 값이 다른 날로 옮겨 가지 않습니다',
        en: 'The day a chosen time is written onto while there is no value yet. Held still for as long as the picker is mounted, so a popup left open across midnight does not move the value onto a new day'
      }
    },
    {
      name: 'minTime',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 이른 시각. 시계만 읽습니다. 열의 단위로 검사하므로, 09:30이 최소라면 시 `9`는 남고 분 `00`–`25`가 흐려집니다',
        en: 'The earliest time of day that may be chosen. Checked at the granularity of the column: with a minimum of 09:30 the hour `9` stays available and the minutes `00`–`25` grey out'
      }
    },
    {
      name: 'maxTime',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 늦은 시각',
        en: 'The latest time of day that may be chosen'
      }
    },
    pickerShouldDisableTime,
    pickerHour12,
    pickerShowSeconds,
    ...pickerSteps,
    pickerLocale,
    {
      ...pickerFormat,
      default: "{ hour: 'numeric', minute: '2-digit' }"
    },
    pickerClearable,
    {
      name: 'showNowButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '푸터에 현재 시각으로 가는 단축 버튼을 답니다',
        en: 'Offers the shortcut to the current time in the footer'
      }
    },
    {
      name: 'closeOnSelect',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '아무 열이든 건드리는 즉시 팝업을 닫습니다. `MPDatePicker`와 달리 기본이 꺼짐인 이유는, 시각은 답이 둘이라 첫 번째에서 닫으면 9시 30분을 고르려고 팝업을 두 번 열어야 하기 때문입니다',
        en: 'Closes the popup as soon as any column is touched. `false` by default and unlike `MPDatePicker`: a time is two answers, and closing after the first would make choosing 9:30 a matter of opening the popup twice'
      }
    },
    pickerOpen,
    pickerDefaultOpen,
    pickerOnOpenChange,
    pickerLabels,
    pickerStartIcon,
    size,
    color,
    fullWidth,
    required,
    disabled,
    readOnly,
    {
      ...name,
      description: {
        ko: '폼 제출에 쓰이는 이름. 값은 `HH:MM`(초를 보이면 `HH:MM:SS`)입니다',
        en: 'Identifies the field when a form is submitted, as `HH:MM` (`HH:MM:SS` when the seconds are shown)'
      }
    },
    id
  ],

  MPDateTimePicker: [
    {
      name: 'value',
      type: 'Date | null',
      description: { ko: '고른 순간', en: 'The chosen moment' }
    },
    {
      name: 'defaultValue',
      type: 'Date | null',
      description: { ko: '처음 고른 순간', en: 'The moment the picker starts on' }
    },
    {
      name: 'onValueChange',
      type: '(value: Date | null) => void',
      description: {
        ko: '새로 고른 순간으로 호출됩니다',
        en: 'Called with the newly chosen moment'
      }
    },
    pickerLabel,
    pickerFloatingLabel,
    pickerPlaceholder,
    description,
    errorMessage,
    pickerDefaultMonth,
    {
      name: 'minDate',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 이른 순간. `MPDatePicker`와 달리 **전체 정밀도**로 읽습니다 — 그 날은 달력에 남고, 그 이전 시각만 시계에서 흐려집니다',
        en: 'The earliest moment that may be chosen. Unlike `MPDatePicker`, read at **full precision**: the day it falls on stays available and the clock blocks the hours before it'
      }
    },
    {
      name: 'maxDate',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 늦은 순간. 마찬가지로 전체 정밀도입니다',
        en: 'The latest moment that may be chosen, likewise at full precision'
      }
    },
    pickerShouldDisableDate,
    pickerShouldDisableTime,
    pickerHour12,
    pickerShowSeconds,
    ...pickerSteps,
    pickerLocale,
    pickerWeekStartsOn,
    { ...pickerFormat, default: "{ dateStyle: 'medium', timeStyle: 'short' }" },
    pickerClearable,
    {
      name: 'showNowButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '푸터에 지금으로 가는 단축 버튼을 답니다',
        en: 'Offers the shortcut to this moment in the footer'
      }
    },
    {
      name: 'closeOnSelect',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '날을 고르는 즉시 팝업을 닫습니다. 순간은 날짜 *그리고* 시각이라 첫 번째에서 닫으면 두 번째가 답을 못 얻습니다',
        en: 'Closes the popup as soon as a day is chosen. `false` here, because a moment is a day *and* a time and closing on the first would leave the second unanswered'
      }
    },
    pickerOpen,
    pickerDefaultOpen,
    pickerOnOpenChange,
    pickerLabels,
    pickerStartIcon,
    size,
    color,
    fullWidth,
    required,
    disabled,
    readOnly,
    {
      ...name,
      description: {
        ko: '폼 제출에 쓰이는 이름. 값은 `YYYY-MM-DDTHH:MM`으로, 로컬 시각입니다',
        en: 'Identifies the field when a form is submitted, as `YYYY-MM-DDTHH:MM`, in local time'
      }
    },
    id
  ],

  MPAnimateFade: [
    animateMode,
    {
      name: 'from',
      type: 'number',
      default: '0',
      description: {
        ko: '어느 불투명도에서 시작할지, `0`과 `1` 사이. 완전히 사라지면 안 되는 내용이면 올리세요',
        en: 'The opacity it starts from, between `0` and `1`. Raise it for content that should never be completely gone'
      }
    },
    ...motion,
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '나타나거나 사라질 것', en: 'What arrives or leaves' }
    }
  ],

  MPAnimateGrow: [
    animateMode,
    {
      name: 'from',
      type: 'number',
      default: '0.8',
      description: {
        ko: '최종 크기의 몇 배에서 시작할지. `1`보다 크면 크게 도착해 페이지 위로 내려앉습니다',
        en: 'The scale it starts from, as a multiple of its final size. Above `1` it settles down onto the page instead of up out of it'
      }
    },
    {
      name: 'origin',
      type: 'string',
      default: "'center'",
      description: {
        ko: '무엇이 제자리에 남고 나머지가 움직일지 — CSS `transform-origin`이면 무엇이든. 내용이 나온 자리에 고정하세요',
        en: 'Which point stays put while the rest moves — any CSS `transform-origin`. Anchor it to the place the content came from'
      }
    },
    {
      name: 'fade',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '자라면서 함께 나타납니다. 이미 페이지에 있고 크기만 바뀌는 것에는 꺼 두세요',
        en: 'Fades in as it grows. Turn it off for something already on the page that is only changing size'
      }
    },
    ...motion,
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '펼쳐질 것', en: 'What unfolds' }
    }
  ],

  MPAnimateZoom: [
    animateMode,
    {
      name: 'from',
      type: 'number',
      default: '0.4',
      description: {
        ko: '최종 크기의 몇 배에서 시작할지. `1`보다 크면 크게 도착해 뒤로 물러앉습니다 — 읽는 사람 쪽으로 다가오는 몸짓입니다',
        en: 'The scale it starts from, as a multiple of its final size. Above `1` it arrives oversized and settles back, which reads as coming *towards* the reader'
      }
    },
    {
      name: 'fade',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '확대되면서 함께 나타납니다. 첫 프레임이 *작다*가 아니라 *아직 없다*로 읽히게 하는 것이 이쪽입니다',
        en: 'Fades in as it zooms. The opacity is what makes the first frames read as *not there yet* rather than as *tiny*'
      }
    },
    ...motion,
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '도착할 것', en: 'What arrives' }
    }
  ],

  MPAnimateSlide: [
    animateMode,
    {
      name: 'from',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: {
        ko: '어느 가장자리에서 이동해 오는지. 물리적입니다 — 창 위에서 내려오는 것은 어떤 쓰기 방향에서든 위에서 옵니다',
        en: 'Which edge it travels from. Physical: something sliding down from the top comes from the top in every writing direction'
      }
    },
    {
      name: 'distance',
      type: 'number | string',
      default: "'100%'",
      description: {
        ko: "얼마나 이동할지 — CSS 길이 또는 픽셀 숫자. `'100%'`는 요소 자신의 크기라서, 자기 가장자리 뒤에서 나타나게 합니다",
        en: "How far it travels — a CSS length, or a number in pixels. `'100%'` is the element's own size, which is what makes it appear from behind its own edge"
      }
    },
    {
      name: 'fade',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '이동하면서 함께 나타납니다',
        en: 'Fades in as it slides'
      }
    },
    ...motion,
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '들어오거나 나갈 것', en: 'What travels in or away' }
    }
  ],

  MPAnimateRotate: [
    animateMode,
    {
      name: 'from',
      type: 'number',
      default: '-180',
      description: {
        ko: '시작 각도(도). 음수는 반시계 방향입니다',
        en: 'The angle it starts at, in degrees. Negative is anticlockwise'
      }
    },
    {
      name: 'to',
      type: 'number',
      default: '0',
      description: {
        ko: '끝 각도(도). `from`과 함께 쓰면 한 컴포넌트가 도착과 끝없는 회전 둘 다가 됩니다',
        en: 'The angle it ends at, in degrees. Together with `from` this is what makes one component cover both an arrival and an endless spin'
      }
    },
    {
      name: 'origin',
      type: 'string',
      default: "'center'",
      description: {
        ko: '무엇을 축으로 도는지 — CSS `transform-origin`이면 무엇이든',
        en: 'Which point it turns about — any CSS `transform-origin`'
      }
    },
    {
      name: 'fade',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '돌면서 함께 나타납니다. 끝없는 회전에는 꺼 두세요 — 반복되는 페이드는 깜빡임으로 읽힙니다',
        en: 'Fades in as it turns. Turn it off for a continuous spin, where a repeating fade reads as flickering'
      }
    },
    ...motion,
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '돌아갈 것. 글자는 아닙니다', en: 'What turns. Not text' }
    }
  ],

  MPAnimateBlink: [
    {
      name: 'min',
      type: 'number',
      default: '0',
      description: {
        ko: '주기의 바닥에서 얼마나 흐려지는지, `0`과 `1` 사이. 맥동하는 동안에도 읽혀야 하는 것이면 올리세요',
        en: 'How faint it gets at the bottom of the cycle, between `0` and `1`. Raise it for something that has to stay readable while it pulses'
      }
    },
    ...motion.map((row) =>
      row.name === 'repeat'
        ? {
            ...row,
            default: "'infinite'",
            description: {
              ko: "몇 번 도는지. 여기서만 기본값이 `'infinite'`입니다 — 한 번의 깜빡임은 그냥 깜빡임이라서",
              en: "How many times it runs. `'infinite'` here and nowhere else, because a single blink is a flicker"
            }
          }
        : row.name === 'duration'
          ? {
              ...row,
              description: {
                ko: '한 주기의 길이(ms). 도착까지 걸리는 시간이 아니라 주기입니다',
                en: 'How long one cycle takes, in milliseconds. A period rather than the time something takes to arrive'
              }
            }
          : row
    ),
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '맥동할 것', en: 'What pulses' }
    }
  ],

  MPAnimateAppear: [
    {
      name: 'stagger',
      type: 'number',
      default: '80',
      description: {
        ko: '한 자식 다음 자식이 시작하기까지의 간격(ms). 이것이 효과의 전부이고, 나머지는 자식 하나가 하는 일입니다',
        en: 'How long after one child the next one starts, in milliseconds. This is the whole effect — everything else is what a single child does'
      }
    },
    {
      name: 'from',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: {
        ko: '각 자식이 어느 가장자리에서 흘러 들어오는지',
        en: 'Which edge each child drifts in from'
      }
    },
    {
      name: 'distance',
      type: 'number | string',
      default: "'0.75rem'",
      description: {
        ko: '각 자식이 이동하는 거리. 일부러 짧습니다 — 화면 밖에서의 등장이 아니라 자리잡음입니다',
        en: 'How far each child travels. Short on purpose: this is a settling, not an entrance from off screen'
      }
    },
    {
      name: 'fade',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '자리를 잡으면서 각 자식이 함께 나타납니다',
        en: 'Fades each child in as it settles'
      }
    },
    {
      name: 'reverse',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '목록을 마지막 자식부터 첫 자식까지 돌립니다',
        en: 'Runs the list from the last child to the first'
      }
    },
    ...motion,
    {
      ...animateRender,
      description: {
        ko: '`<div>` 아닌 것으로 렌더링합니다 — `<ul>`, 그리드. 자식은 그 요소의 직계 자식으로 남습니다',
        en: 'Renders something other than a `<div>` — a `<ul>`, a grid. The children stay its own direct children'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '차례로 나타날 것들. 지연은 자식 단위이므로 무엇을 넘기는지가 중요합니다',
        en: 'The things that appear, one after another. The stagger is per child, so what you pass matters'
      }
    }
  ],

  MPAnimateLighting: [
    {
      ...color,
      description: {
        ko: '빛이 어떤 계열로 그려지는지. 임의의 색상값은 받지 않습니다 — `primary`가 무엇인지 바꾸려면 토큰을 설정하세요',
        en: 'Which accent family the light is drawn in. Not an arbitrary colour: to change what `primary` *is*, set the token'
      }
    },
    {
      ...size,
      description: {
        ko: '빛이 따라 도는 반경. 안에 있는 것과 맞아야 합니다 — 그러지 않으면 내용이 이미 깎아 낸 모서리를 빛이 가로지릅니다',
        en: 'The radius the light follows. It has to match what is inside, or the glow will cut a corner the content has rounded off'
      }
    },
    {
      name: 'spread',
      type: 'number',
      default: '3',
      description: {
        ko: '빛이 내용 바깥으로 얼마나 나가는지(px)',
        en: 'How far past the content the light reaches, in pixels'
      }
    },
    {
      name: 'arc',
      type: 'number',
      default: '50',
      description: {
        ko: '한 번에 얼마만큼의 윤곽이 켜지는지(도). 작으면 지나가는 불꽃, 크면 쓸고 지나가는 빛입니다',
        en: 'How much of the outline is lit at once, in degrees. Small is a travelling spark; large is a sweep'
      }
    },
    {
      name: 'blur',
      type: 'number',
      default: '4',
      description: {
        ko: '빛이 얼마나 부드러운지(px). `0`이면 빛이 아니라 그래픽으로 읽히는 쐐기가 됩니다',
        en: 'How soft the light is, in pixels. At `0` it is a hard-edged wedge, which reads as a graphic rather than as light'
      }
    },
    {
      name: 'reverse',
      type: 'boolean',
      default: 'false',
      description: { ko: '빛을 반대 방향으로 돌립니다', en: 'Runs the light the other way round' }
    },
    ...motion.filter((row) => row.name !== 'easing'),
    animateRender,
    {
      name: 'children',
      type: NODE,
      description: { ko: '빛이 두를 것', en: 'What the light goes around' }
    }
  ],

  MPAnimateMarquee: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '띠가 어느 방향으로 흐르는지. 세로면 컨테이너에 높이를 주세요',
        en: 'Which way the strip runs. Give the container a height when it is vertical'
      }
    },
    {
      name: 'reverse',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '반대로 흘립니다 — 왼쪽에서 오른쪽으로, 또는 아래에서 위로',
        en: 'Runs it the other way — left to right, or bottom to top'
      }
    },
    {
      name: 'speed',
      type: 'number',
      default: '60',
      description: {
        ko: '내용이 흐르는 속도(초당 픽셀). duration이 아니라 속도라서, 넷짜리 띠와 마흔짜리 띠가 같은 속도로 움직입니다',
        en: 'How fast the content travels, in pixels per second. A speed rather than a duration, so a strip of four and a strip of forty move at the same pace'
      }
    },
    {
      name: 'gap',
      type: 'number | string',
      default: "'2rem'",
      description: {
        ko: '항목 사이, 그리고 한 사본의 끝과 다음 사본의 처음 사이의 간격',
        en: 'The gap between items, and between the last item and the first of the next pass'
      }
    },
    {
      name: 'copies',
      type: 'number',
      default: '2',
      description: {
        ko: '내용을 몇 벌 이어 붙일지. 내용이 짧아 뒤에 구멍을 남긴다면 올리세요',
        en: 'How many copies are laid end to end. Raise it when the content is short enough to leave a hole behind itself'
      }
    },
    {
      name: 'pauseOnHover',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '포인터가 올라오면 멈춥니다. 장식이 아닙니다 — 지나가는 링크는 아무도 따라갈 수 없습니다',
        en: 'Stops while the pointer is on it. Not decoration: a link that never stops is a link nobody can follow'
      }
    },
    ...motion,
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '흘러갈 것들. 첫 사본만 읽히고 나머지는 `aria-hidden`입니다',
        en: 'The things that scroll past. Only the first copy is read out; the rest are `aria-hidden`'
      }
    }
  ],

  MPAnimateHeadline: [
    {
      name: 'interval',
      type: 'number',
      default: '2600',
      description: {
        ko: '다음 줄이 올라오기 전에 한 줄을 얼마나 붙들지(ms). 줄이 도착한 순간부터 세므로 주기 길이가 아니라 읽는 시간입니다',
        en: 'How long each line is held before the next one comes up, in milliseconds. Counted from the moment a line arrives, so it is reading time rather than a cycle length'
      }
    },
    {
      name: 'index',
      type: 'number',
      description: {
        ko: '어느 줄이 보이는지. 넘기면 릴이 스스로 돌기를 멈추고 여러분의 타이머를 따릅니다',
        en: 'Which line is showing. Passing it stops the reel turning on its own and hands it to your timer'
      }
    },
    {
      name: 'defaultIndex',
      type: 'number',
      default: '0',
      description: {
        ko: '제어하지 않는 릴이 시작하는 자리',
        en: 'Where an uncontrolled reel starts'
      }
    },
    {
      name: 'onIndexChange',
      type: '(index: number) => void',
      description: {
        ko: '방금 올라온 줄과 함께 호출됩니다',
        en: 'Called with the line that has just come up'
      }
    },
    {
      name: 'loop',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '마지막 줄 다음에 다시 시작합니다. 끄면 마지막 줄에서 멈춰 그대로 있습니다',
        en: 'Starts again after the last line. Off, the reel stops on the last one and stays there'
      }
    },
    {
      name: 'rise',
      type: 'number | string',
      default: "'100%'",
      description: {
        ko: "줄이 올라오거나 나갈 때 이동하는 거리. `'100%'`는 줄 하나의 높이입니다",
        en: "How far a line travels as it comes up or leaves. `'100%'` is one line's own height"
      }
    },
    ...motion.filter((row) => row.name !== 'alternate'),
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '읽혀야 할 순서대로의 줄들',
        en: 'The lines, in the order they should be read'
      }
    }
  ],

  MPAnimateTyping: [
    {
      name: 'text',
      type: 'string',
      description: {
        ko: '중첩해 쓰기보다 넘기는 편이 쉬울 때의 텍스트. `children`보다 우선합니다',
        en: 'The text, when it is easier to pass than to nest. Overrides `children`'
      }
    },
    {
      name: 'speed',
      type: 'number',
      default: '24',
      description: {
        ko: '초당 몇 글자로 치는지. 긴 문단과 짧은 문단은 같은 시간이 아니라 같은 속도로 쳐져야 합니다',
        en: 'How fast it is typed, in characters per second. A long paragraph and a short one should be typed at the same pace, not in the same time'
      }
    },
    {
      name: 'hold',
      type: 'number',
      default: '1400',
      description: {
        ko: '다 친 텍스트를 반복 전에 얼마나 붙들지(ms)',
        en: 'How long the finished text is held before it repeats, in milliseconds'
      }
    },
    {
      name: 'erase',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '반복 전에 한 프레임에 지우지 않고 되지웁니다. `repeat`이 1보다 클 때만 의미가 있습니다',
        en: 'Deletes the text again before repeating, rather than clearing it in one frame. Only means anything when `repeat` is more than once'
      }
    },
    {
      name: 'eraseSpeed',
      type: 'number',
      default: 'twice `speed`',
      description: {
        ko: '초당 몇 글자로 지우는지. 사람은 보통 치는 것의 두 배 속도로 지웁니다',
        en: 'How fast it is deleted, in characters per second. Deleting is usually about twice as fast as typing'
      }
    },
    {
      name: 'caret',
      type: 'boolean',
      default: 'true',
      description: { ko: '텍스트 뒤의 블록', en: 'The block after the text' }
    },
    {
      name: 'caretChar',
      type: NODE,
      default: "'|'",
      description: { ko: '캐럿을 무엇으로 그릴지', en: 'What the caret is drawn as' }
    },
    ...motion.filter((row) => row.name !== 'alternate' && row.name !== 'easing'),
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '칠 텍스트. 텍스트만 쳐집니다 — 엘리먼트는 텍스트만 기여하고 마크업은 기여하지 않습니다',
        en: 'The text to type. Only text is typed — an element contributes its text and nothing about its markup'
      }
    }
  ],

  MPConfigProvider: [
    {
      name: 'size',
      type: SIZE,
      description: {
        ko: '아래의 모든 컨트롤이 시작하는 크기. 호출 지점의 prop과 그것을 감싼 그룹이 이 값을 이깁니다. `size`만은 CSS custom property가 될 수 없어서 — 리터럴 Tailwind 클래스 문자열로 풀리기 때문에 — 컨텍스트로 나릅니다',
        en: 'The size every control under this starts at. A prop at the call site and a group around it both beat it. `size` is the one axis that cannot be a custom property — it resolves to literal Tailwind class strings — which is why it travels by context'
      }
    },
    {
      name: 'color',
      type: COLOR,
      description: {
        ko: '아래의 모든 컨트롤이 읽는 강조 색 계열. 색이 아니라 역할 이름이라서, `primary`가 무엇인지 바꾸는 것은 여전히 토큰의 일입니다',
        en: 'The accent family every control under this reads. A role name rather than a colour: changing what `primary` *is* stays a token'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '컴포넌트가 쓰는 언어. `MPLocaleProvider`가 받는 그 값이며, 애플리케이션에 프로바이더가 하나면 되도록 여기 함께 실려 있습니다. 주지 않으면 위에 있는 것을 물려받습니다',
        en: 'The language the components speak — the same value `MPLocaleProvider` takes, carried here so an application needs one provider rather than two. Left out, it inherits whatever is above it'
      }
    },
    {
      name: 'dir',
      type: "'ltr' | 'rtl'",
      description: {
        ko: '아래의 글이 흐르는 방향. 여기서 유일하게 **두** 시스템에 닿는 prop입니다 — 스타일시트는 DOM의 `dir`을 읽고(패딩·마진·모서리가 전부 논리 속성이라 예전부터 동작했습니다), Base UI는 React 컨텍스트를 읽는데 그걸 넣어 주는 것이 없었습니다. 이걸 주면 `display: contents` 엘리먼트에 속성이 붙고 같은 값이 Base UI의 `DirectionProvider`로 들어갑니다. 주지 않으면 아무것도 렌더하지 않습니다',
        en: "Which way the text runs below. The one prop here that reaches **two** systems: the stylesheet reads the DOM's `dir` — every padding, margin and corner is already logical, so that half always worked — and Base UI reads a React context that nothing was putting there. Given, the attribute goes on a `display: contents` element and the same value goes into Base UI's own `DirectionProvider`. Left out, nothing is rendered"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '설정이 적용되는 트리', en: 'The tree the configuration applies to' }
    }
  ],

  MPConfirmProvider: [
    {
      name: 'defaults',
      type: "Omit<MPConfirmOptions, 'title' | 'description' | 'children'>",
      description: {
        ko: '이 아래에서 올라오는 모든 확인의 기본값 — 애플리케이션에 맞춘 `size`, 강조색, 직접 쓴 `cancelLabel`. 각 호출은 필요한 것을 여전히 말하고 그쪽이 이깁니다',
        en: 'Defaults for every confirmation raised under this — a `size` to match the application, an accent, a `cancelLabel` in your own words. Each call still says whatever it needs to and wins'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '`useMPConfirm`을 쓸 수 있는 트리',
        en: 'The tree `useMPConfirm` can be called from'
      }
    }
  ],

  MPConfirmOptions: [
    {
      name: 'title',
      type: NODE,
      description: { ko: '제목으로 놓이는 질문', en: 'The question, as a heading' }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '그 아래 한 문장 — 무엇이 일어나고 무엇에 일어나는지',
        en: 'The sentence under it — what happens, and to what'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '`MPDialog`가 그리는 방식대로 제목 위에 놓이는 글리프',
        en: 'A glyph above the title, the way `MPDialog` draws one'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '다이얼로그가 담을 그 밖의 것 — 필드, 지워질 목록, "다시 묻지 않기" 체크박스',
        en: 'Anything else the dialog should hold — a field, a list of what is about to be deleted, a "do not ask again" checkbox'
      }
    },
    {
      name: 'confirmLabel',
      type: NODE,
      default: 'the translation of `Confirm`',
      description: {
        ko: '"예" 버튼의 문구. *Delete*라고 적힌 버튼은 무엇을 하려는지 말해 주고, *Confirm*은 기억해 내라고 요구합니다',
        en: 'What the yes button says. A button that says *Delete* tells the reader what they are about to do; one that says *Confirm* asks them to remember'
      }
    },
    {
      name: 'cancelLabel',
      type: NODE,
      default: 'the translation of `Cancel`',
      description: { ko: '"아니오" 버튼의 문구', en: 'What the no button says' }
    },
    {
      name: 'color',
      type: COLOR,
      default: "'primary'",
      description: {
        ko: '확인 버튼을 칠하는 강조색. 파괴적인 확인은 `error`를 원하고, 그게 기본이 아닌 이유는 대부분의 확인이 파괴적이지 않기 때문입니다 — 전부에 빨간 버튼을 달면 더 이상 경고가 아닙니다',
        en: 'The accent the yes button is drawn in. `error` is what a destructive confirmation wants, and it is not the default: most confirmations are not destructive, and a red button on every one of them stops being a warning'
      }
    },
    { ...size, default: "'md'" },
    {
      name: 'dismissible',
      type: 'boolean',
      default: 'true',
      description: {
        ko: 'Escape와 바깥 누름이 **아니오**로 답하는지. 켜져 있는 이유는 나갈 수 없는 다이얼로그가 덫이고, "정말인가요"의 안전한 답이 아니오이기 때문입니다',
        en: 'Whether Escape and a press outside answer **no**. On by default, because a dialog a reader cannot leave is a trap and because the safe answer to "are you sure" is no'
      }
    }
  ],

  MPLocaleProvider: [
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: 'BCP 47 태그 — `ko`, `ja`, `pt-BR`, `zh-Hant`. 두 계통에 닿습니다: `Intl`은 플랫폼이 아는 모든 언어로 날짜와 숫자를 쓰고, 이 라이브러리의 표는 `Intl`이 의견을 갖지 않는 단어들을 채웁니다. 표에 없는 태그면 앞쪽은 그대로 동작하고 뒤쪽만 영어로 내려갑니다',
        en: "A BCP 47 tag — `ko`, `ja`, `pt-BR`, `zh-Hant`. It reaches two systems: `Intl` formats the dates and numbers in every language the platform speaks, and this library's table supplies the words `Intl` has no opinion about. For a tag the table does not carry, the first still works and only the second falls back to English"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '이 언어를 따를 트리',
        en: 'The tree that follows this language'
      }
    }
  ],

  MPPageLayout: [
    {
      name: 'header',
      type: NODE,
      description: {
        ko: '맨 위의 바. 보통 [MPHeader](./header)입니다',
        en: 'The bar across the top. An [MPHeader](./header), usually'
      }
    },
    {
      name: 'footer',
      type: NODE,
      description: {
        ko: '맨 끝의 시트. 보통 [MPFooter](./footer)입니다',
        en: 'The sheet at the end. An [MPFooter](./footer), usually'
      }
    },
    {
      name: 'sidebar',
      type: NODE,
      description: {
        ko: '앞쪽 열 — 영어 페이지의 왼쪽, 아랍어 페이지의 오른쪽. [MPSidebar](./sidebar)를 넣으면 어느 끝에 있는지 스스로 알게 되므로 `side`를 따로 주지 않아도 됩니다',
        en: 'The leading column — the left of an English page, the right of an Arabic one. An [MPSidebar](./sidebar) put here is told which end it is on and needs no `side` of its own'
      }
    },
    {
      name: 'endSidebar',
      type: NODE,
      description: {
        ko: '뒤쪽 열. 한쪽에 내비게이션, 반대쪽에 목차나 인스펙터나 필터 패널을 두는 배치를 위한 것입니다',
        en: 'The trailing column, for the layouts that have two: navigation down one side and a table of contents, an inspector or a filter panel down the other'
      }
    },
    {
      name: 'headerSpan',
      type: "'full' | 'content'",
      default: "'full'",
      description: {
        ko: '헤더와 사이드바 중 어느 쪽이 위쪽 모서리를 가져가는지. `full`은 웹사이트의 배치이고, `content`는 사이드바가 창 전체 높이를 차지하고 바가 그 사이에 들어가는 애플리케이션의 배치 — MD3가 standard navigation drawer를 그리는 방식 그대로입니다',
        en: "Which of the header and the sidebars takes the top corner. `full` is the arrangement of a website; `content` is the arrangement of an application, with the sidebars running the full height of the window and the bar between them — MD3's own drawing of a standard navigation drawer"
      }
    },
    {
      name: 'footerSpan',
      type: "'full' | 'content'",
      default: "'full'",
      description: {
        ko: '푸터에 대한 같은 질문. 따로 답할 값어치가 있습니다 — 창 전체 높이의 내비게이션을 둔 대시보드도 저작권 한 줄은 보통 내비게이션 아래가 아니라 본문 아래에 둡니다',
        en: 'The same question for the footer, and worth answering separately: a dashboard with a full-height navigation drawer still usually wants its copyright line under the content rather than under the drawer'
      }
    },
    {
      name: 'scroll',
      type: "'page' | 'content'",
      default: "'page'",
      description: {
        ko: '문서가 스크롤되는지, 바 사이의 영역만 스크롤되는지. `page`는 거의 모든 페이지가 원하는 것입니다 — 휴대폰의 주소 표시줄이 숨고, 뒤로 가기에서 스크롤 위치가 복원됩니다. `content`는 페이지가 문서가 아니라 작업 공간일 때',
        en: "Whether the document scrolls or only the region between the bars does. `page` is what almost every page wants — a phone's address bar still hides, and the browser restores the scroll position on a back navigation. Reach for `content` when the page is a workspace rather than a document"
      }
    },
    {
      name: 'height',
      type: "'viewport' | 'auto' | number | string",
      default: "'viewport'",
      description: {
        ko: '레이아웃의 높이. `viewport`는 창의 높이, `auto`는 부모의 높이(페이지가 아닌 레이아웃용), 길이를 주면 그 길이. 페이지가 스크롤되는 동안에는 하한이고 내용만 스크롤될 때는 정확한 높이입니다',
        en: "How tall the layout is. `viewport` is the window's, `auto` is its parent's — for a layout that is not the page — and a length is that length. It sets a floor while the page scrolls and an exact height while only the content does"
      }
    },
    {
      name: 'collapseBelow',
      type: "MPWindowClass | 'none'",
      default: "'expanded'",
      description: {
        ko: '사이드바가 열이기를 그만두고 서랍이 되는 윈도우 크기 클래스. Tailwind의 중단점이 아니라 MD3 자신의 사다리이고, 기본값이 `expanded`인 것도 MD3의 답 그대로입니다 — 명세는 standard navigation drawer를 expanded 창에 주고 그 아래에는 같은 목적지를 모달 서랍 뒤에 둡니다. `none`은 어느 폭에서도 열로 남깁니다',
        en: "The window size class below which the sidebars stop being columns and become drawers. MD3's own ladder rather than Tailwind's breakpoints, and `expanded` is MD3's own answer: the specification gives a standard navigation drawer to an expanded window and puts the same destinations behind a modal drawer below one. `none` keeps them columns at every width"
      }
    },
    {
      name: 'sidebarOpen',
      type: 'boolean',
      description: {
        ko: '앞쪽 사이드바의 서랍이 열려 있는지. `onSidebarOpenChange`와 함께 제어합니다 — 라우트가 바뀌면 뒤에서 닫아야 하는 서랍, 애플리케이션이 이미 들고 있는 상태',
        en: 'Whether the leading sidebar’s drawer is open. Use with `onSidebarOpenChange` for a controlled layout — a route change that should close the drawer behind it, a state the application already holds'
      }
    },
    {
      name: 'defaultSidebarOpen',
      type: 'boolean',
      default: 'false',
      description: { ko: '어느 상태로 시작할지', en: 'Which state it starts in' }
    },
    {
      name: 'onSidebarOpenChange',
      type: '(open: boolean) => void',
      description: {
        ko: '열림 상태가 바뀔 때마다 호출됩니다',
        en: 'Called whenever the open state changes'
      }
    },
    {
      name: 'endSidebarOpen',
      type: 'boolean',
      description: {
        ko: '뒤쪽 사이드바에 대한 같은 셋',
        en: 'The same three for the trailing sidebar'
      }
    },
    {
      name: 'defaultEndSidebarOpen',
      type: 'boolean',
      default: 'false',
      description: { ko: '어느 상태로 시작할지', en: 'Which state it starts in' }
    },
    {
      name: 'onEndSidebarOpenChange',
      type: '(open: boolean) => void',
      description: {
        ko: '열림 상태가 바뀔 때마다 호출됩니다',
        en: 'Called whenever the open state changes'
      }
    },
    {
      name: 'skipLink',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '"본문으로 건너뛰기" 링크를 문서 맨 앞에 두고, 포커스를 가진 동안에만 그립니다. 여기서 유일하게 스타일 결정이 아닌 항목입니다',
        en: 'Puts a "Skip to content" link first in the document, drawn only while it holds the focus. The one thing here that is not a style decision'
      }
    },
    {
      name: 'skipLabel',
      type: 'string',
      description: {
        ko: '그 링크가 하는 말. 기본값은 `locale`의 해당 단어입니다',
        en: 'What that link says. Defaults to the word for it in `locale`'
      }
    },
    {
      name: 'mainId',
      type: 'string',
      default: "'main'",
      description: {
        ko: '건너뛰기 링크가 도착하는 `id`. `<main>`에 붙습니다',
        en: 'The `id` the skip link jumps to, put on the `<main>`'
      }
    },
    {
      name: 'mainProps',
      type: "Omit<ComponentPropsWithoutRef<'main'>, 'id' | 'children'>",
      description: {
        ko: '`<main>`에 필요한 나머지 — `className`, `aria-label`',
        en: 'Anything else the `<main>` needs — a `className`, an `aria-label`'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '레이아웃이 자기 단어를 말할 언어. 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다. 안의 모든 사이드바와 트리거가 물려받으므로 페이지당 한 번만 씁니다',
        en: "Which language the layout's own words are in. Falls back to the nearest `MPLocaleProvider`, then to English. Inherited by every sidebar and trigger inside it, so it is written once per page"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '페이지. `<main>` 안에 렌더링됩니다',
        en: 'The page. Rendered inside the `<main>`'
      }
    }
  ],

  MPHeader: [
    {
      name: 'brand',
      type: NODE,
      description: {
        ko: '앞쪽 슬롯 — 마크, 제품 이름, 모든 페이지에서 같은 것. 좁은 창에서는 그 앞에 [MPSidebarTrigger](./sidebar#mpsidebartrigger)가 들어갑니다. `children`의 첫 번째가 아니라 독립된 슬롯인 이유는, 가운데를 바의 중심선에 놓으려면 양 끝을 컴포넌트가 재야 하기 때문입니다',
        en: "The leading slot: the mark, the product's name, the thing that is the same on every page — and, on a narrow window, the [MPSidebarTrigger](./sidebar#mpsidebartrigger) that goes ahead of it. A slot of its own rather than the first of `children` because the middle can only be centred on the bar if the two ends are the component's to measure"
      }
    },
    {
      name: 'actions',
      type: NODE,
      description: {
        ko: '뒤쪽 슬롯 — 계정 메뉴, 테마 전환, 주요 행동. 끝쪽 정렬로 놓이므로 아이콘 버튼 몇 개에 별도 래퍼가 필요 없습니다',
        en: 'The trailing slot: the account menu, the theme switch, the call to action. Laid out end-aligned, so a row of icon buttons needs no wrapper of its own'
      }
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: {
        ko: '가운데 슬롯이 어디에 놓이는지. `center`는 MD3 자신의 center-aligned top app bar이고, 남은 공간이 아니라 **바** 자체를 기준으로 가운데입니다 — 양 끝에 같은 몫을 주므로 브랜드가 길어져도 가운데가 움직이지 않습니다',
        en: "Where the middle slot sits. `center` is MD3's own center-aligned top app bar, and it is centred on the *bar* rather than in the space left over: both ends are given equal shares, so the middle stays on the bar's midline however long the brand is"
      }
    },
    {
      name: 'position',
      type: "'static' | 'absolute' | 'sticky' | 'fixed'",
      default: "'sticky'",
      description: {
        ko: '바가 페이지의 스크롤에 어떻게 놓이는지. `sticky`는 흐름 안에 남은 채 창 위쪽에 붙고, `fixed`는 흐름에서 완전히 빠지며 — [MPPageLayout](./page-layout)이 그 높이를 대신 비워 둡니다 — `static`은 함께 스크롤되어 사라집니다',
        en: 'How the bar sits in the page’s scroll. `sticky` holds it against the top of the window while leaving it in the flow; `fixed` takes it out of the flow entirely, which an [MPPageLayout](./page-layout) answers by reserving its height; `static` lets it scroll away'
      }
    },
    {
      ...containerVariant,
      default: "'tonal'",
      description: {
        ko: '바가 칠하는 표면의 양, **컨테이너**의 사다리로. 바는 절대 물들지 않습니다. `tonal`은 MD3의 스크롤된 top app bar(`surface-container`), `outlined`는 평평한 쪽 — 페이지 자신의 표면에 끝나는 자리를 알리는 실선 하나 — 이고, `text`는 아무것도 칠하지 않습니다',
        en: "How much surface the bar paints, on the **container** ladder — a bar is never dyed. `tonal` is MD3's scrolled top app bar (`surface-container`), `outlined` is the flat one — the page's own surface with a hairline where it ends — and `text` paints nothing at all"
      }
    },
    {
      ...size,
      description: {
        ko: '바의 높이 하한, 좌우 여백, 슬롯 사이의 공기. `md`는 64px로 MD3 자신의 small top app bar입니다. 높이가 아니라 하한인 것은, 가운데 슬롯이 두 줄로 넘어가면 잘려서는 안 되기 때문입니다',
        en: "The bar's height floor, its gutter and the air between its slots. `md` is 64px, MD3's own small top app bar. A floor rather than a height: a bar whose middle slot wrapped onto a second line would otherwise clip it"
      }
    },
    {
      name: 'maxWidth',
      type: "MPSize | 'none'",
      default: "'none'",
      description: {
        ko: '슬롯이 놓인 행을 본문 폭으로 묶고 가운데에 둡니다. 시트 자체는 여전히 창 전체를 덮습니다. [MPContainer](./container)의 `maxWidth`와 같은 사다리라서, 헤더와 그 아래 컨테이너가 같은 선에 맞습니다',
        en: "Holds the row of slots to a measure and centres it while the sheet itself still spans the window. The same ladder [MPContainer](./container)'s `maxWidth` uses, so a header and the container under it line up on one edge"
      }
    },
    {
      ...padded,
      description: { ko: '양옆의 여백', en: 'The gutter down each side of the row' }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '바가 불릴 이름. 한 페이지에 `<header>`가 둘 이상일 때 — 기사 자신의 헤더와 사이트의 헤더 — 쓸 값어치가 있습니다. "banner"가 둘이면 어느 쪽이 어느 쪽인지 전혀 알 수 없습니다',
        en: 'The name the bar is announced by. Worth writing when a page has more than one `<header>` in it — an article’s own and the site’s — because "banner" twice tells a reader which is which not at all'
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<header>` 대신 다른 엘리먼트로 렌더링합니다. 좀처럼 원하는 일이 아닙니다 — 문서 최상위의 그 태그가 곧 `banner` 랜드마크입니다',
        en: 'Renders something other than a `<header>`. Rarely what you want: at the top level of a document that tag *is* the `banner` landmark'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '가운데 슬롯 — 내비게이션 링크 행, 검색 필드, 제목',
        en: 'The middle slot: a row of navigation links, a search field, a headline'
      }
    }
  ],

  MPFooter: [
    {
      name: 'position',
      type: "'static' | 'absolute' | 'sticky' | 'fixed'",
      default: "'static'",
      description: {
        ko: '시트가 페이지의 스크롤에 어떻게 놓이는지. 기본값 `static`은 [MPHeader](./header)의 것과 반대이고, 그것이 푸터의 정의입니다 — 문서의 끝, 스크롤해서 닿는 것. `sticky`와 `fixed`는 손이 닿는 곳에 남아야 하는 바를 위한 것이고, `fixed`가 흐름에서 빼 가는 높이는 [MPPageLayout](./page-layout)이 비워 둡니다',
        en: "How the sheet sits in the page's scroll. `static` — the default, and the opposite of [MPHeader](./header)'s — is what a footer *is*: the end of the document, reached by scrolling to it. `sticky` and `fixed` are for the bar that has to stay in reach, and an [MPPageLayout](./page-layout) reserves the height a `fixed` one takes out of the flow"
      }
    },
    {
      ...containerVariant,
      default: "'outlined'",
      description: {
        ko: '시트가 칠하는 표면의 양, **컨테이너**의 사다리로. 푸터는 절대 물들지 않습니다. 여기 기본값이 `outlined`이고 [MPHeader](./header)의 기본값이 `tonal`인 것은 둘이 서로 다른 것을 마주 보기 때문입니다. 헤더 아래로는 내용이 지나가지만, 푸터 위에는 문서의 끝이 있고 아래에는 아무것도 없어서 실선이 문서가 끝났다고 말하는 전부입니다',
        en: "How much surface the sheet paints, on the **container** ladder — a footer is never dyed. `outlined` is the default here and `tonal` is [MPHeader](./header)'s, because the two sit against different things: a header has content passing underneath it, while a footer has the end of the document above it and nothing below, so the hairline is the whole of what says the document ended"
      }
    },
    {
      ...size,
      description: {
        ko: '시트의 좌우 여백과 위아래 공기. [MPBox](./box)에서처럼 여기서의 `size`는 *시트*의 크기입니다 — 높이도 타입 스케일도 정하지 않습니다',
        en: "The sheet's gutter and the air above and below its content. As on [MPBox](./box), `size` here is the size of the *sheet*: it sets no height and no type scale"
      }
    },
    {
      name: 'maxWidth',
      type: "MPSize | 'none'",
      default: "'none'",
      description: {
        ko: '내용을 본문 폭으로 묶고 가운데에 둡니다. 시트 자체는 여전히 창 전체를 덮습니다. [MPContainer](./container)의 `maxWidth`와 같은 사다리입니다',
        en: "Holds the content to a measure and centres it while the sheet itself still spans the window. The same ladder [MPContainer](./container)'s `maxWidth` uses"
      }
    },
    {
      ...padded,
      description: { ko: '좌우 여백과 위아래 공기', en: 'The gutter, and the air above and below' }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '영역이 불릴 이름. 한 페이지에 `<footer>`가 둘 이상일 때 — 기사 자신의 것과 사이트의 것 — 쓸 값어치가 있습니다',
        en: "The name the region is announced by. Worth writing when a page has more than one `<footer>` in it — an article's own and the site's"
      }
    },
    {
      name: 'render',
      type: 'RenderProp',
      description: {
        ko: '`<footer>` 대신 다른 엘리먼트로 렌더링합니다. 좀처럼 원하는 일이 아닙니다 — 문서 최상위의 그 태그가 `contentinfo` 랜드마크입니다',
        en: 'Renders something other than a `<footer>`. Rarely what you want: at the top level of a document that tag is the `contentinfo` landmark'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '안에 들어가는 모든 것. 어떤 사이트에서는 링크 네 열이고 다음 사이트에서는 한 줄입니다 — 그래서 이 컴포넌트에는 슬롯이 하나도 없습니다',
        en: 'Everything in it. Four columns of links on one site and a single line on the next, which is why this component has slots for nothing'
      }
    }
  ],

  MPSidebar: [
    {
      name: 'side',
      type: "'start' | 'end'",
      default: "'start'",
      description: {
        ko: '띠의 어느 끝을 가져갈지. 물리적이 아니라 논리적입니다 — `start`는 영어 페이지의 왼쪽이고 아랍어 페이지의 오른쪽입니다. [MPPageLayout](./page-layout) 안에서는 어느 슬롯에 건네졌는지로 이미 정해지므로, 여기서 다시 지정하는 것은 레이아웃과 다투는 방법일 뿐입니다',
        en: 'Which end of the band it takes. Logical rather than physical — `start` is the left of an English page and the right of an Arabic one. Inside an [MPPageLayout](./page-layout) it is already decided by which slot the sidebar was handed to, and setting it again is only a way of disagreeing with the layout'
      }
    },
    {
      name: 'width',
      type: 'number | string',
      description: {
        ko: '열의 폭 — 픽셀 수 또는 임의의 CSS 길이. 지정하지 않으면 `size`가 함의하는 폭입니다. `resizable`과 함께 쓰면 이것은 *시작* 폭일 뿐이고, 드래그가 그 위에 덮어씁니다',
        en: 'How wide the column is — a number in pixels or any CSS length. Left out, it is the width `size` implies. With `resizable` it is only the width the column *starts* at: a drag writes over it'
      }
    },
    {
      name: 'minWidth',
      type: 'number | string',
      default: '160',
      description: { ko: '얼마나 좁게까지 끌 수 있는지', en: 'How narrow it may be dragged' }
    },
    {
      name: 'maxWidth',
      type: 'number | string',
      default: '480',
      description: { ko: '그리고 얼마나 넓게까지', en: 'And how wide' }
    },
    {
      name: 'resizable',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '안쪽 가장자리를 끌어 열의 폭을 바꿀 수 있게 합니다. 기본은 꺼짐입니다 — 크기를 바꿀 수 있는 사이드바는 그 폭이 독자의 것이 된다는 뜻이고, 이걸 켜는 호출자는 보통 `onResizeEnd`가 알려 주는 값을 저장하고 싶어 합니다',
        en: "Lets the reader drag the inner edge to change the column's width. Off by default: a sidebar that can be resized is a sidebar whose width is the reader's to remember, so a caller who turns this on usually also wants to store what `onResizeEnd` reports"
      }
    },
    {
      name: 'onResize',
      type: '(width: number) => void',
      description: {
        ko: '가장자리를 끄는 동안 픽셀 단위 폭과 함께 호출됩니다',
        en: 'Fires with the width in pixels while the edge is being dragged'
      }
    },
    {
      name: 'onResizeEnd',
      type: '(width: number) => void',
      description: {
        ko: '놓았을 때 같은 숫자와 함께 한 번 호출됩니다',
        en: 'Fires once, with the same number, when it is let go'
      }
    },
    {
      name: 'collapseBelow',
      type: "MPWindowClass | 'none'",
      description: {
        ko: '열이 서랍이 되는 윈도우 크기 클래스. [MPPageLayout](./page-layout)의 값을 기본으로 하고, 레이아웃 밖에서는 `none`입니다 — 페이지의 무엇도 되돌릴 수 없는 채로 접힌 사이드바는 독자가 잃어버린 사이드바이기 때문입니다',
        en: "The window size class below which the column becomes a drawer. Defaults to the [MPPageLayout](./page-layout)'s own, and to `none` outside one: a sidebar that collapsed with nothing on the page able to bring it back would be a sidebar the reader has lost"
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '서랍이 열려 있는지. 접힌 뒤에만 의미가 있습니다 — 열은 여는 것이 아니라 거기 있는 것입니다. [MPPageLayout](./page-layout) 안에서는 레이아웃이 이 값을 들고 있으므로 거기서 제어하세요',
        en: 'Whether the drawer is open. Only meaningful once the sidebar has collapsed; a column is not opened, it is there. Inside an [MPPageLayout](./page-layout) the layout owns this, so control it there'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '레이아웃 밖의 비제어 사이드바가 어느 상태로 시작할지',
        en: 'Which state it starts in, for an uncontrolled standalone sidebar'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: {
        ko: '어느 쪽이든 그대로 호출됩니다',
        en: 'Fires either way'
      }
    },
    {
      name: 'sticky',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '페이지가 옆을 지나 스크롤되는 동안 열이 제자리를 지키는지. 필요 없을 때는 아무 대가도 없습니다 — 내용만 스크롤되는 레이아웃에서는 이미 레이아웃만큼 높으므로 아무것도 달라지지 않습니다',
        en: 'Whether the column holds its place while the page scrolls past it. It costs nothing when it is not needed: with only the content scrolling the column is already as tall as the layout and this changes nothing'
      }
    },
    {
      name: 'title',
      type: NODE,
      description: {
        ko: '서랍인 동안에만 그려지는 제목. 열에는 자기가 무엇인지 말해 줄 페이지가 둘러 있지만 페이지를 덮은 패널에는 없고, 제목 없는 다이얼로그에는 접근 가능한 이름이 없습니다 — 그래서 없으면 `label`로, 그다음 `locale`의 "사이드바"라는 단어로 내려갑니다',
        en: 'The heading, drawn only while the sidebar is a drawer. A column has the page around it to say what it is; a panel that has covered the page does not, and a dialog with no heading has no accessible name — so without one it falls back to `label`, and then to the word for "sidebar" in `locale`'
      }
    },
    {
      ...containerVariant,
      default: "'outlined'",
      description: {
        ko: '열이 칠하는 표면의 양, **컨테이너**의 사다리로. 사이드바는 절대 물들지 않습니다. 기본값 `outlined`는 페이지 자신의 표면에 내용을 마주 보는 가장자리의 실선 하나입니다. 접힌 뒤에는 [MPDrawer](./drawer)이고, 서랍은 MD3 자신의 navigation drawer 표면을 칠하며 여기서 아무 값도 가져가지 않습니다',
        en: "How much surface the column paints, on the **container** ladder — a sidebar is never dyed. `outlined`, the default, is the page's own surface with a hairline down the edge that faces the content. Once collapsed it is an [MPDrawer](./drawer), which paints MD3's own navigation drawer surface and takes no weight from here"
      }
    },
    {
      ...size,
      description: {
        ko: '열의 기본 폭과 내용 주변의 공기. `md`는 360px로 MD3 자신의 navigation drawer이고, [MPDrawer](./drawer)가 그려지는 것과 같은 단입니다',
        en: "The column's default width and the air around its content. `md` is 360px, MD3's own navigation drawer and the same rung [MPDrawer](./drawer) is drawn at"
      }
    },
    {
      ...padded,
      description: { ko: '좌우 여백과 위아래 공기', en: 'The gutter, and the air above and below' }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '영역이 불릴 이름. 페이지의 모든 `<aside>`에는 이름이 있어야 하고, 사이드바가 둘인 페이지에는 *반드시* 있어야 합니다. 없으면 스크린 리더가 "complementary"라는 영역을 둘 내놓습니다. 기본값은 `locale`의 "사이드바"입니다',
        en: 'The name the region is announced by. Every `<aside>` should have one and a page with two sidebars *must*, or a screen reader offers two regions called "complementary". Defaults to the word for "sidebar" in `locale`'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '사이드바가 자기 단어를 말할 언어. [MPPageLayout](./page-layout)의 값, 그다음 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다',
        en: "Which language the sidebar's own words are in. Falls back to the [MPPageLayout](./page-layout)'s, then to the nearest `MPLocaleProvider`, then to English"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '안의 모든 것 — nav, 필터 패널, 목차',
        en: 'Everything in it: a nav, a filter panel, a table of contents'
      }
    }
  ],

  MPSidebarTrigger: [
    {
      name: 'side',
      type: "'start' | 'end'",
      default: "'start'",
      description: {
        ko: '레이아웃의 두 사이드바 중 어느 쪽을 여는지',
        en: "Which of the layout's two sidebars it opens"
      }
    },
    {
      name: 'collapseBelow',
      type: "MPWindowClass | 'none'",
      description: {
        ko: '버튼이 나타나는 폭. 사이드바가 접히는 것과 같은 값입니다 — 버튼은 열이 없는 동안 정확히 그동안만 존재하니까요. [MPPageLayout](./page-layout)에서 물려받고, 설정할 곳도 거기입니다',
        en: 'The width below which the button appears — the same one the sidebar collapses at, since the button exists exactly while the column does not. Inherited from the [MPPageLayout](./page-layout), which is where it should be set'
      }
    },
    {
      name: 'icon',
      type: NODE,
      description: {
        ko: '글리프. 다른 것을 주지 않으면 가로선 셋입니다',
        en: 'The glyph. Three lines, unless something else is given'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '하는 일을 말로. 기본값은 `locale`의 "사이드바 열기" / "사이드바 닫기"이고, 버튼이 상태에 따라 달라지므로 이름도 함께 달라집니다',
        en: 'What it does, in words. Defaults to "Open sidebar" / "Close sidebar" in `locale`, and it changes with the state because the button does'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '그 단어의 언어. 레이아웃에서 물려받습니다',
        en: 'Which language that word is in. Inherited from the layout'
      }
    },
    {
      ...size,
      description: {
        ko: '버튼의 크기. 나머지 [MPIconButton](../inputs/icon-button) prop도 그대로 통과합니다',
        en: "The button's size. Every other [MPIconButton](../inputs/icon-button) prop passes straight through too"
      }
    }
  ],

  MPToggle: [
    {
      ...containerVariant,
      default: "'outlined'",
      description: {
        ko: '**꺼져 있는 동안** 토글이 칠하는 표면의 양. 켜진 상태는 어떤 무게를 골랐든 언제나 강조색이 자기를 주장하는 쪽입니다',
        en: 'How much surface the toggle paints while it is **off**. On is always the accent asserting itself, whichever weight was asked for'
      }
    },
    {
      ...color,
      description: {
        ko: '켜졌을 때 읽을 강조색 계열. 꺼진 토글은 절대 이 색을 입지 않습니다 — 그것이 이 신호가 신호로 남는 이유입니다',
        en: 'Which accent family it turns on in. An unpressed toggle never wears it, which is what keeps the signal a signal'
      }
    },
    {
      name: 'pressed',
      type: 'boolean',
      description: {
        ko: '켜져 있는지. `onPressedChange`와 함께 제어합니다',
        en: 'Whether it is on. Use with `onPressedChange` for a controlled toggle'
      }
    },
    {
      name: 'defaultPressed',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '비제어 토글이 켜진 채로 시작할지',
        en: 'Whether it starts on, for an uncontrolled one'
      }
    },
    {
      name: 'onPressedChange',
      type: '(pressed: boolean) => void',
      description: {
        ko: '상태가 바뀔 때마다 호출됩니다',
        en: 'Called whenever the state changes'
      }
    },
    {
      name: 'value',
      type: 'string',
      description: {
        ko: '[MPToggleGroup](./toggle#mptogglegroup) 안에서 이 토글을 식별합니다',
        en: 'Identifies the toggle inside an [MPToggleGroup](./toggle#mptogglegroup)'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 글리프', en: 'A glyph before the label' }
    },
    {
      name: 'endIcon',
      type: NODE,
      description: { ko: '라벨 뒤의 글리프', en: 'A glyph after it' }
    },
    {
      ...size,
      description: {
        ko: '토글의 높이와 타입 스케일. [MPButton](./button)과 같은 사다리라서, 한 행에 놓인 버튼과 토글의 높이가 맞습니다',
        en: "The toggle's height and type scale. The same ladder [MPButton](./button) is on, so a button and a toggle in one row line up"
      }
    },
    fullWidth,
    disabled,
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '라벨. 비워 두면 받은 글리프를 감싸 정사각형이 됩니다 — 툴바 토글이자 MD3가 *toggle icon button*이라 부르는 것입니다. 아이콘만 있는 토글에도 `aria-label`은 필요합니다',
        en: 'The label. Left out, the toggle goes square around whatever glyph it was given — which is a toolbar toggle, and what MD3 calls a *toggle icon button*. An icon-only toggle still needs an `aria-label`'
      }
    }
  ],

  MPToggleGroup: [
    {
      ...containerVariant,
      default: "'outlined'",
      description: {
        ko: '세트의 모든 토글에 전달됩니다',
        en: 'Passed to every toggle in the set'
      }
    },
    {
      ...color,
      description: {
        ko: '세트의 모든 토글에 전달됩니다',
        en: 'Passed to every toggle in the set'
      }
    },
    {
      name: 'value',
      type: 'readonly string[]',
      description: {
        ko: '어떤 토글이 켜져 있는지, `value` 기준으로. 단일 선택에서도 배열입니다 — [MPSegmentedButton](./segmented-button)과 같은 결정으로, boolean prop 하나에 *타입*이 바뀌는 `value`는 읽기 전에 매번 좁혀야 하는 유니온입니다',
        en: 'Which toggles are on, by their `value`. An array in both modes, the same decision [MPSegmentedButton](./segmented-button) makes: a `value` whose *type* changed with a boolean prop would be a union every caller has to narrow before they can read it'
      }
    },
    {
      name: 'defaultValue',
      type: 'readonly string[]',
      description: {
        ko: '비제어 세트에서 어떤 것이 켜진 채 시작할지',
        en: 'Which start on, for an uncontrolled set'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string[]) => void',
      description: {
        ko: '켜져 있는 모든 값과 함께 호출됩니다',
        en: 'Called with every value that is on'
      }
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '한 번에 둘 이상이 켜질 수 있는지. 꺼져 있으면 하나를 켜는 것이 직전 것을 끕니다 — 그건 하나 고르기이고, 한 번 더 생각할 값어치가 있습니다. 고르는 것이 상태가 아니라 **값**이라면 [MPSegmentedButton](./segmented-button)이나 [MPRadioGroup](./radio-group)입니다',
        en: 'Whether more than one may be on at a time. Off, turning one on turns the last one off — which is a one-of-a-set, and worth a second thought: if what is being chosen is a **value** rather than a state, that is an [MPSegmentedButton](./segmented-button) or an [MPRadioGroup](./radio-group)'
      }
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: { ko: '토글이 놓이는 방향', en: 'Which way the toggles run' }
    },
    {
      ...size,
      description: { ko: '세트의 모든 토글에 전달됩니다', en: 'Passed to every toggle in the set' }
    },
    {
      ...disabled,
      description: {
        ko: '세트 전체를 한 번에 비활성화합니다',
        en: 'Disables every toggle in the set at once'
      }
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '방향키가 양 끝에서 반대편으로 돌아가는지',
        en: 'Whether the arrow keys wrap around at the ends'
      }
    },
    {
      ...fullWidth,
      description: {
        ko: '컨테이너 폭까지 늘리고 토글끼리 폭을 균등하게 나눕니다',
        en: 'Stretches to the container and divides the width evenly between the toggles'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '`MPToggle`들', en: 'The `MPToggle`s' }
    }
  ],

  MPTransfer: [
    {
      name: 'items',
      type: 'readonly MPTransferItem[]',
      required: true,
      description: {
        ko: '어느 쪽에든 놓일 수 있는 모든 것. `{ value, label, disabled? }`이고, 두 목록 모두 이 순서로 그립니다 — 그래서 보냈다가 되돌린 행이 원래 자리로 돌아옵니다',
        en: 'Everything that can be on either side — `{ value, label, disabled? }`. Both lists draw in this order, which is what lands a row sent across and back where it started'
      }
    },
    {
      name: 'value',
      type: 'readonly string[]',
      description: {
        ko: '뒤쪽에 놓인 것들. `onValueChange`와 함께 제어합니다. 화살표를 누를 때만 바뀝니다 — 체크는 값이 아닙니다',
        en: 'What is on the trailing side. Use with `onValueChange` for a controlled pair. It changes on an arrow press and never on a tick'
      }
    },
    {
      name: 'defaultValue',
      type: 'readonly string[]',
      description: {
        ko: '비제어 쌍에서 뒤쪽에 놓인 채 시작할 것들',
        en: 'What starts there, for an uncontrolled one'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string[]) => void',
      description: {
        ko: '화살표를 누를 때, `items`의 순서대로 호출됩니다',
        en: 'Called on an arrow press, in the order of `items`'
      }
    },
    {
      name: 'sourceLabel',
      type: NODE,
      description: {
        ko: '앞쪽 목록의 제목. 기본값은 `locale`의 단어이고, 이 제목이 그 목록 전체 선택 체크박스의 이름이기도 합니다',
        en: "The heading over the leading list. Defaults to the word in `locale`, and it is also the name of that list's select-all tick"
      }
    },
    {
      name: 'targetLabel',
      type: NODE,
      description: { ko: '뒤쪽 목록의 제목', en: 'And over the trailing one' }
    },
    {
      name: 'searchable',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '각 목록 위에 필터를 놓습니다. 각 필터는 자기 쪽만 좁히고, 누름은 필터가 여전히 보여 주고 있는 것만 옮깁니다',
        en: 'Puts a filter above each list. Each one narrows its own side, and a press moves only what the filter is still showing'
      }
    },
    {
      name: 'height',
      type: 'number | string',
      default: '220',
      description: {
        ko: '각 목록의 높이 — 픽셀 수 또는 임의의 CSS 길이. 두 목록은 어느 쪽이 더 긴지와 무관하게 같은 높이입니다',
        en: 'How tall each list is — a number in pixels, or any CSS length. Both are the same height whichever side is longer'
      }
    },
    {
      ...containerVariant,
      default: "'outlined'",
      description: {
        ko: '각 패널이 칠하는 표면의 양, **컨테이너**의 사다리로. 패널은 남의 라벨이 놓인 행을 담으므로 절대 물들지 않습니다',
        en: 'How much surface each panel paints, on the **container** ladder — the panels hold rows of somebody else’s labels, so they are never dyed'
      }
    },
    {
      ...size,
      description: {
        ko: '컨트롤 전체의 크기 — 행, 제목, 필터, 두 화살표',
        en: 'The scale of the whole control: the rows, the headings, the filter and the two arrows'
      }
    },
    {
      ...color,
      description: {
        ko: '체크와 화살표가 읽는 강조색 계열',
        en: 'Which accent family the ticks and the arrows read'
      }
    },
    {
      ...disabled,
      description: {
        ko: '아무것도 체크하거나 옮길 수 없습니다',
        en: 'Nothing can be ticked or moved'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '제목, 화살표, 필터가 쓰인 언어. 가장 가까운 `MPLocaleProvider`, 그다음 영어로 내려갑니다',
        en: 'Which language the headings, the arrows and the filter are written in. Falls back to the nearest `MPLocaleProvider`, then to English'
      }
    },
    {
      name: 'labels',
      type: "Partial<MPMessages['transfer']>",
      description: {
        ko: '단어 자체에 대한 덮어쓰기. 번역보다 우선하고, 지정하지 않은 나머지는 번역된 채로 남습니다',
        en: 'Overrides for the words themselves. They win over the translation, and anything not named stays translated'
      }
    }
  ],

  MPNavigationMenu: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '행이 놓이는 방향. `vertical`은 패널이 아래가 아니라 옆으로 열리는 레일이고, 방향키도 그에 맞춰 따라갑니다',
        en: 'Which way the row runs. `vertical` is a rail whose panels open beside it rather than under it; the arrow keys follow either way'
      }
    },
    {
      name: 'value',
      type: 'string | null',
      description: {
        ko: '어느 아이템의 패널이 열려 있는지, `value` 기준으로. nullish는 닫힘입니다',
        en: "Which item's panel is open, by its `value`. Nullish is closed"
      }
    },
    {
      name: 'defaultValue',
      type: 'string | null',
      description: {
        ko: '비제어 메뉴에서 어느 것이 열린 채 시작할지',
        en: 'Which starts open, for an uncontrolled menu'
      }
    },
    {
      name: 'onValueChange',
      type: '(value: string | null) => void',
      description: {
        ko: '열린 패널이 바뀔 때마다 호출됩니다',
        en: 'Called whenever the open panel changes'
      }
    },
    {
      name: 'delay',
      type: 'number',
      description: {
        ko: '패널이 열리기까지 포인터가 머무는 시간, 밀리초',
        en: 'How long the pointer rests on an item before its panel opens, in milliseconds'
      }
    },
    {
      name: 'closeDelay',
      type: 'number',
      description: {
        ko: '포인터가 떠난 뒤 패널이 남아 있는 시간, 밀리초',
        en: 'And how long a panel stays after the pointer leaves'
      }
    },
    {
      name: 'sideOffset',
      type: 'number',
      default: '8',
      description: { ko: '행으로부터의 거리, 픽셀', en: 'Distance from the row, in pixels' }
    },
    {
      ...size,
      description: {
        ko: '행의 높이와 타입 스케일. 아이템은 컨트롤 높이에 놓입니다 — 헤더에서 옆의 버튼과 줄이 맞습니다',
        en: "The row's height and type scale. The items sit at control height, so they line up with a button beside them in a header"
      }
    },
    {
      ...color,
      description: {
        ko: '열린 아이템의 라벨이 읽는 강조색 계열. 패널 자체는 MD3의 메뉴 표면처럼 중립으로 남습니다',
        en: "Which accent family an open item's label reads. The panel itself stays neutral, as MD3's menu surface does"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '`MPNavigationMenuItem`들', en: 'The `MPNavigationMenuItem`s' }
    }
  ],

  MPNavigationMenuItem: [
    {
      name: 'label',
      type: NODE,
      required: true,
      description: { ko: '행에 놓이는 말', en: 'The word in the row' }
    },
    {
      name: 'href',
      type: 'string',
      description: {
        ko: '아이템을 패널을 여는 것이 아니라 평범한 링크로 만듭니다. `href`가 있고 자식이 없는 아이템은 **목적지**이고 그렇게 알려집니다 — 사이트 내비게이션이 [MPMenu](./menu)가 아닌 이유의 전부입니다',
        en: 'Makes the item a plain link rather than something that opens a panel. An item with an `href` and no children is a **destination**, and it is announced as one — which is the whole reason a site’s navigation is not an [MPMenu](./menu)'
      }
    },
    {
      name: 'target',
      type: 'string',
      description: {
        ko: '링크가 열리는 곳. `href` 없이는 무시됩니다',
        en: 'Where the link opens. Ignored without `href`'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 글리프', en: 'A glyph before the label' }
    },
    {
      name: 'value',
      type: 'string',
      description: {
        ko: '제어되는 메뉴에서 아이템을 식별합니다. Base UI가 각 아이템에 자기 정체성을 주므로 비제어 메뉴에는 필요 없습니다',
        en: 'Identifies the item, for a controlled menu. Base UI gives each item an identity of its own, so an uncontrolled menu needs none'
      }
    },
    {
      ...disabled,
      description: {
        ko: '사용할 수 없습니다. 말은 행에 남고 아무것도 열지 않습니다',
        en: 'Unavailable. The word stays in the row and opens nothing'
      }
    },
    {
      name: 'columns',
      type: 'number',
      default: '1',
      description: {
        ko: '패널이 링크를 몇 개의 열로 배치할지',
        en: 'How many columns the panel lays its links out in'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '패널의 내용 — 보통 `MPNavigationMenuLink`들',
        en: "The panel's contents — usually `MPNavigationMenuLink`s"
      }
    }
  ],

  MPNavigationMenuLink: [
    {
      name: 'href',
      type: 'string',
      required: true,
      description: { ko: '어디로 가는지', en: 'Where it goes' }
    },
    {
      name: 'title',
      type: NODE,
      required: true,
      description: { ko: '행의 이름', en: "The row's name" }
    },
    {
      name: 'description',
      type: NODE,
      description: {
        ko: '아래 한 줄. 스케일 한 단계 아래이고 한 톤 물러납니다',
        en: 'A second line under it, one step down the scale and muted'
      }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '제목 앞의 글리프', en: 'A glyph before the title' }
    }
  ],

  MPForm: [
    {
      name: 'validationMode',
      type: "'onSubmit' | 'onBlur' | 'onChange'",
      default: "'onSubmit'",
      description: {
        ko: '필드가 언제 검사받는지. `onSubmit`은 제출할 때, 그리고 그 뒤로는 값이 바뀔 때마다입니다 — 아직 이메일 주소를 입력하는 중인 사람에게 틀렸다고 말하지 않는 유일한 모드입니다',
        en: 'When a field validates. `onSubmit` is on submit and on every change afterwards — the only mode that does not tell somebody their email address is wrong while they are still typing it'
      }
    },
    {
      name: 'errors',
      type: 'Record<string, string | string[]>',
      description: {
        ko: '브라우저 자신의 검사 밖에서 온 오류 — 서버, 폼 액션, 스키마 — 를 각 메시지가 속한 필드의 `name`으로 키를 붙여 넘깁니다. 페이지 위쪽 배너가 아니라 **필드 위에** 표시되고, 그 필드가 바뀌는 즉시 지워집니다',
        en: "Errors from outside the browser's own validation — a server, a form action, a schema — keyed by the `name` of the field each belongs to. They are shown **on the field** rather than in a banner at the top, and cleared as soon as that field changes"
      }
    },
    {
      name: 'onSubmit',
      type: '(values: Record<string, unknown>) => void',
      description: {
        ko: '유효한 제출에서 폼의 값들과 함께 호출됩니다. 네이티브 submit 이벤트는 막히므로 아무 곳으로도 이동하지 않습니다',
        en: "Called on a valid submit, with the form's values. The native submit event is prevented, so nothing navigates"
      }
    },
    {
      ...size,
      description: {
        ko: '자식들 사이의 간격. 폼은 스택이고, 이것은 그 스택이 서는 사다리의 단입니다',
        en: "The gap between the form's children. A form is a stack, and this is which rung of the ladder it stacks on"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '필드들, 그리고 그것을 제출하는 것',
        en: 'The fields, and whatever submits them'
      }
    }
  ],

  MPFieldset: [
    {
      name: 'legend',
      type: NODE,
      description: {
        ko: '그룹의 이름. 안에 있는 모든 컨트롤의 접근 가능한 이름의 일부가 되므로, 각각의 앞에 놓아도 여전히 말이 되는 구절이어야 합니다 — "어디로 보낼까요?"가 아니라 "청구지 주소"',
        en: 'What the group is called. It becomes part of the accessible name of every control inside, so it has to be a phrase that still reads correctly in front of each of them — "Billing address", not "Where should we send it?"'
      }
    },
    {
      name: 'description',
      type: NODE,
      description: { ko: '레전드 아래 한 줄', en: 'A line under the legend' }
    },
    {
      ...disabled,
      description: {
        ko: '안의 모든 컨트롤을 한 번에 비활성화합니다. `<fieldset>`이 늘 해 온 대로이고, 세 단계 아래의 컴포넌트가 그린, 이 그룹의 존재를 들어 본 적도 없는 컨트롤까지 닿습니다',
        en: 'Disables every control inside at once, the way a `<fieldset>` always has — including ones a component three levels down rendered and never heard of it'
      }
    },
    {
      ...size,
      description: {
        ko: '레전드의 타입 스케일과 컨트롤들이 서는 간격',
        en: "The legend's type scale and the gap the controls stand at"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '함께 하나의 질문에 답하는 컨트롤들',
        en: 'The controls that answer one question together'
      }
    }
  ],

  MPCommandPalette: [
    {
      name: 'items',
      type: 'readonly MPCommand[]',
      required: true,
      description: {
        ko: '팔레트가 할 수 있는 모든 것. `{ value, label, description?, icon?, shortcut?, group?, keywords?, disabled?, onSelect? }`이고, 주어진 순서대로 그려집니다 — 그룹 제목은 그룹이 바뀔 때마다 나오므로 같은 그룹의 명령은 붙여서 나열해야 합니다',
        en: 'Everything the palette can do — `{ value, label, description?, icon?, shortcut?, group?, keywords?, disabled?, onSelect? }`. Drawn in the order given, and a group heading appears each time the group changes, so a group’s commands have to be listed together'
      }
    },
    {
      name: 'open',
      type: 'boolean',
      description: {
        ko: '팔레트가 열려 있는지. `onOpenChange`와 함께 제어합니다',
        en: 'Whether the palette is open. Use with `onOpenChange` for a controlled one'
      }
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '비제어 팔레트가 열린 채로 시작할지',
        en: 'Whether it starts open, for an uncontrolled one'
      }
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description: {
        ko: '열림 상태가 바뀔 때마다 호출됩니다',
        en: 'Called whenever the open state changes'
      }
    },
    {
      name: 'onSelect',
      type: '(item: MPCommand) => void',
      description: {
        ko: '명령이 실행될 때, 그 명령 자신의 `onSelect` 다음에 호출됩니다. 어느 쪽이든 팔레트는 닫힙니다',
        en: 'Called when a command is run, after its own `onSelect`. The palette closes either way'
      }
    },
    {
      name: 'shortcut',
      type: 'string | false',
      default: "'Mod+K'",
      description: {
        ko: '팔레트를 여는 키. 윈도우에 바인딩되고, [MPShortcut](../display/shortcut)이 쓰는 방식 그대로라 `Mod`는 맥에서 Command, 그 밖에서는 Control입니다. `false`면 아무것도 바인딩하지 않습니다',
        en: 'The keystroke that opens the palette, bound on the window. Written the way [MPShortcut](../display/shortcut) writes them, so `Mod` is Command on a Mac and Control everywhere else. `false` binds nothing'
      }
    },
    {
      name: 'width',
      type: 'number | string',
      description: {
        ko: '시트가 넓어질 수 있는 한계. 픽셀 수 또는 임의의 CSS 길이',
        en: 'How wide the sheet may get. A number in pixels, or any CSS length'
      }
    },
    {
      name: 'maxHeight',
      type: 'number | string',
      default: '320',
      description: {
        ko: '목록이 스크롤되기 전까지 높아질 수 있는 한계',
        en: 'How tall the list may get before it scrolls'
      }
    },
    {
      ...size,
      description: { ko: '행의 높이와 타입 스케일', en: 'The row height and type scale' }
    },
    {
      ...color,
      description: {
        ko: '강조된 행과 캐럿이 읽는 강조색 계열',
        en: 'Which accent family the highlighted row and the caret read'
      }
    },
    {
      name: 'locale',
      type: 'string',
      description: {
        ko: '플레이스홀더, 빈 줄, 다이얼로그 자신의 이름이 쓰인 언어',
        en: "Which language the placeholder, the empty line and the dialog's own name are written in"
      }
    },
    {
      name: 'placeholder',
      type: 'string',
      description: { ko: '필드의 플레이스홀더', en: 'The placeholder in the field' }
    },
    {
      name: 'emptyMessage',
      type: NODE,
      description: {
        ko: '아무것도 일치하지 않았을 때 행이 있어야 할 자리의 줄',
        en: 'The line where the rows would be, when nothing matched'
      }
    },
    {
      name: 'label',
      type: 'string',
      description: {
        ko: '다이얼로그의 접근 가능한 이름. 보이는 제목이 없어서 가져올 곳이 없습니다',
        en: 'The accessible name of the dialog, which has no visible title to take one from'
      }
    }
  ],

  MPMenubar: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: {
        ko: '바가 놓이는 방향. `vertical`은 메뉴가 늘어선 옆 레일의 모양이고, 방향키는 어느 쪽이든 따라갑니다',
        en: 'Which way the bar runs. `vertical` is the shape a side rail of menus takes; the arrow keys follow it either way'
      }
    },
    {
      name: 'modal',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '열린 메뉴가 페이지를 가져가는지',
        en: 'Whether an open menu takes the page away'
      }
    },
    {
      name: 'loopFocus',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '방향키가 바의 양 끝에서 반대편으로 돌아가는지',
        en: 'Whether the arrow keys wrap around at the ends of the bar'
      }
    },
    {
      ...disabled,
      description: {
        ko: '바 위의 모든 메뉴를 한 번에 비활성화합니다',
        en: 'Disables every menu on the bar at once'
      }
    },
    {
      ...size,
      description: {
        ko: '행의 높이와 타입 스케일. 바 위의 모든 메뉴에 전달됩니다. 컨트롤 사다리보다 한 단 아래입니다 — 메뉴 바는 버튼의 행이 아니라 말의 띠이고, 보통 이미 자기 높이를 가진 무언가 안에 놓입니다',
        en: 'The row height and type scale, passed to every menu on the bar. A rung below the control ladder: a menu bar is not a row of buttons but a strip of words, and it usually sits inside something that already has a height of its own'
      }
    },
    {
      ...color,
      description: {
        ko: '열린 메뉴의 말이 읽는 강조색 계열이자, 그 안에서 선택된 행이 읽는 계열',
        en: "Which accent family an open menu's word reads, and which a chosen row inside it reads"
      }
    },
    {
      name: 'children',
      type: NODE,
      description: { ko: '`MPMenubarMenu`들', en: 'The `MPMenubarMenu`s' }
    }
  ],

  MPMenubarMenu: [
    {
      name: 'label',
      type: NODE,
      required: true,
      description: { ko: '바 위의 말', en: 'The word on the bar' }
    },
    {
      name: 'startIcon',
      type: NODE,
      description: { ko: '라벨 앞의 글리프', en: 'A glyph before the label' }
    },
    {
      ...disabled,
      description: {
        ko: '사용할 수 없습니다. 말은 바에 남고 아무것도 열지 않습니다',
        en: 'Unavailable. The word stays on the bar and opens nothing'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '행들. [MPMenu](./menu) 안에서 쓰는 것과 정확히 같습니다',
        en: 'The rows, written exactly as they are inside an [MPMenu](./menu)'
      }
    }
  ],

  MPAvatarGroup: [
    {
      name: 'max',
      type: 'number',
      description: {
        ko: '나머지가 숫자가 되기 전까지 몇 개를 그릴지. 지정하지 않으면 전부 그립니다',
        en: 'How many avatars are drawn before the rest become a count. Left out, every one of them is drawn'
      }
    },
    {
      name: 'total',
      type: 'number',
      description: {
        ko: '그룹이 앞의 몇 개만 건네받았을 때, 전부 해서 몇 개인지. 없으면 자식 수로 계산하는데 그건 전부를 넘겼을 때만 맞습니다 — 얼굴 마흔 개짜리 목록이 `<img>` 넷과 숫자 하나만 보내는 것이 이 prop이 있는 이유입니다',
        en: 'How many there are altogether, when the group was handed only the first few. Without it the count is worked out from the children, which is right only when all of them were passed — and a list of forty faces that ships four `<img>`s and a number is exactly why this exists'
      }
    },
    {
      name: 'overlap',
      type: 'number | string',
      description: {
        ko: '각 아바타가 앞의 것 아래로 얼마나 들어가는지 — 픽셀 수 또는 임의의 CSS 길이. 지정하지 않으면 `size`의 일정 비율이라, 어느 단에서도 겹침이 같아 보입니다',
        en: 'How far each avatar sits under the one before it — a number in pixels, or any CSS length. Left out it is a fraction of `size`, which keeps the overlap looking the same at every rung'
      }
    },
    {
      ...size,
      description: {
        ko: '그룹의 모든 아바타에 전달됩니다. 네 번째 얼굴만 한 단 어긋난 스택은 스택이 아닙니다',
        en: 'Passed to every avatar in the group. A stack whose fourth face is a rung out is not a stack'
      }
    },
    {
      name: 'shape',
      type: "'circle' | 'square'",
      default: "'circle'",
      description: {
        ko: '그룹의 모든 아바타에 전달됩니다',
        en: 'Passed to every avatar in the group'
      }
    },
    {
      ...containerVariant,
      default: "'tonal'",
      description: {
        ko: '그룹의 모든 아바타에 전달됩니다. 아바타는 *물들는* 대상이므로 그 컨테이너는 색조를 가져갑니다',
        en: 'Passed to every avatar in the group. An avatar *is* the thing being coloured, so its container takes the tint'
      }
    },
    {
      ...color,
      description: {
        ko: '그룹의 모든 아바타에 전달됩니다',
        en: 'Passed to every avatar in the group'
      }
    },
    {
      name: 'children',
      type: NODE,
      description: {
        ko: '아바타들. 첫 번째가 맨 위에 놓입니다 — 시작부터 읽는 스택은 앞에서 뒤로 읽는 스택입니다',
        en: 'The avatars. The first one is on top: a stack read from the start is read front to back'
      }
    }
  ]
};

/**
 * The tables as a page reads them: what is written above, plus the two rows
 * every component ends up with.
 *
 * Appended here rather than typed into a hundred and five tables, for the reason
 * `size` and `color` are written once — a `className` that says one thing on a
 * button and another on a chip is exactly the drift this file exists to prevent.
 */
export const propTables: Record<string, PropRow[]> = Object.fromEntries(
  Object.entries(componentTables).map(([name, rows]) => {
    if (NO_ELEMENT.has(name)) {
      return [name, rows];
    }

    const own = rows.filter((row) => row.name !== 'className' && row.name !== 'style');
    const events = EVENTS_LAND_ON[name] ? eventRows(EVENTS_LAND_ON[name]) : [];

    return [
      name,
      [...own, ...events, classNameRow(CLASS_NAME_LANDS_ON[name] ?? OUTERMOST), styleRow]
    ];
  })
);
