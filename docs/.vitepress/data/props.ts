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
  ]
};
