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
      name: 'large',
      type: 'boolean',
      default: 'false',
      description: {
        ko: '머터리얼 본래의 56px 높이로 그립니다. 기본값은 촘촘한 40px입니다',
        en: "Draws the field at Material's own 56px height instead of the compact 40px"
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
  ]
};
