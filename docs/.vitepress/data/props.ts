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
    ko: '컨트롤에 붙고 라벨이 가리키는 id. 생략하면 `name`에서, `name`도 없으면 자동 생성됩니다',
    en: 'The id put on the control and pointed at by the label. Derived from `name` when omitted, and generated when there is no name either'
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
    ko: '외곽선의 홈에 놓이는 라벨. 항상 그 자리에 그려지므로 라벨이 있는 피커와 없는 피커의 높이가 같습니다',
    en: "Label in the outline's notch. Always drawn there, so a picker with a label and one without sit at the same height"
  }
};

const pickerStartIcon: PropRow = {
  name: 'startIcon',
  type: NODE,
  description: {
    ko: '값 앞에 놓이는 내용. 기본값은 피커 자신의 글리프(달력 또는 시계)입니다',
    en: "Content placed before the value. Defaults to the picker's own glyph — a calendar or a clock"
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

export const propTables: Record<string, PropRow[]> = {
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
        ko: '필드 위 라벨. 항상 축소된 상태로 그려지므로 라벨이 있는 필드와 없는 필드의 높이가 같습니다',
        en: 'Label above the field. Always drawn shrunk, so a field with a label and one without sit at the same height'
      }
    },
    {
      name: 'type',
      type: "'email' | 'password' | 'text'",
      default: "'text'",
      description: {
        ko: '어떤 컨트롤을 그릴지. `password`는 모양만이 아니라 동작도 달라져서, 끝에 표시/숨김 토글이 생깁니다',
        en: 'Which control to draw. `password` also changes behaviour: it grows a reveal toggle in the trailing adornment'
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
        ko: 'Enter를 눌렀을 때 호출됩니다. 한 줄 필드에서는 Enter가 삼켜지므로 폼이 두 번 제출되지 않습니다',
        en: 'Called when Enter is pressed. On a single-line field Enter is then swallowed, so a form is submitted once'
      }
    },
    {
      name: 'disableEnterKey',
      type: 'boolean',
      default: 'false',
      description: {
        ko: 'Enter가 줄바꿈을 넣지 못하게 삼킵니다. `rows`가 있을 때만 의미가 있습니다',
        en: 'Swallows the Enter key instead of letting it insert a newline. Only meaningful with `rows`'
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
        ko: '컨트롤에 붙고 라벨이 가리키는 id. 생략하면 `name`에서, `name`도 없으면 자동 생성됩니다',
        en: 'The id put on the control and pointed at by the label. Derived from `name` when omitted, and generated when there is no name either'
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
        ko: '외곽선의 홈에 놓이는 라벨. 항상 축소된 상태로 그려지므로 라벨이 있는 셀렉트와 없는 셀렉트의 높이가 같습니다',
        en: "Label in the outline's notch. Always drawn there, so a select with a label and one without sit at the same height"
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
      description: { ko: '외곽선의 홈에 놓이는 라벨', en: "Label in the outline's notch" }
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
        ko: '외곽선 노치 안의 라벨. 폼 안에서 텍스트 필드와 같은 높이에 서도록 언제나 노치에 그립니다',
        en: "Label in the outline's notch. Always drawn there, so a combobox and a text field sit at the same height in a form"
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
        en: 'Shown in the list, in the input and on the chip. Defaults to the value. A `string` rather than a `ReactNode` — the one place this differs from `MPSelect` — because the label is what the filter matches against and what is written into a text input'
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
        ko: '외곽선 노치 안의 라벨. `inline`이면 패널 위',
        en: 'Label in the outline’s notch, or above the panel when `inline`'
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
      name: 'labels',
      type: 'Partial<MPColorPickerLabels>',
      description: {
        ko: '접근성 이름의 개별 override. 채도 사각형에는 이름을 가져올 데가 없어 라이브러리가 지어낸 여섯 문자열입니다',
        en: 'Overrides for the accessible names, one at a time — the six strings the picker has to invent because a colour square has nowhere to take a name from'
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
    pickerPlaceholder,
    description,
    errorMessage,
    pickerDefaultMonth,
    {
      name: 'minDate',
      type: 'Date | null',
      description: {
        ko: '고를 수 있는 가장 이른 날. 날짜 단위라 시각은 무시합니다 — 7월 27일 09:00을 넘겨도 27일은 그대로 고를 수 있습니다',
        en: 'The earliest day that may be chosen. Day-granular: a bound of 27 July at 09:00 still leaves the 27th pickable'
      }
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
      name: 'showTodayButton',
      type: 'boolean',
      default: 'true',
      description: {
        ko: '푸터에 오늘로 가는 단축 버튼을 답니다',
        en: 'Offers the shortcut to today in the footer'
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
        ko: '폼 제출에 쓰이는 이름. 값은 `YYYY-MM-DD`로, UTC가 아니라 로컬 날짜로 나갑니다',
        en: 'Identifies the field when a form is submitted, as `YYYY-MM-DD` — the local day, not a UTC instant'
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
  ]
};
