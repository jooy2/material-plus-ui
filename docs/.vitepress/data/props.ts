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
  ]
};
