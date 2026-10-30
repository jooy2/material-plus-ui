import {
  focusRows,
  from,
  renamed,
  semanticLabelRow,
  sizeRow,
  WIDGET,
  type PropRow
} from './shared';

export default {
  MPFilePicker: [
    from('MPFilePicker', 'accept', { type: 'String?' }),
    from('MPFilePicker', 'multiple', { type: 'bool', default: 'false' }),
    from('MPFilePicker', 'maxSize', { type: 'int?' }),
    from('MPFilePicker', 'maxFiles', { type: 'int?' }),
    from('MPFilePicker', 'value', {
      type: 'List<MPFile>?',
      description: {
        ko: '가지고 있는 파일들. 주면 controlled이고, 빼면 피커가 직접 들고 `initialValue`에서 시작합니다',
        en: 'The files held. Given, the picker is controlled; left out, it keeps its own, starting at `initialValue`'
      }
    }),
    renamed('MPFilePicker', 'defaultValue', 'initialValue', {
      type: 'List<MPFile>',
      default: 'const <MPFile>[]'
    }),
    renamed('MPFilePicker', 'onFilesChange', 'onFilesChanged', {
      type: 'ValueChanged<List<MPFile>>?'
    }),
    from('MPFilePicker', 'onReject', {
      type: 'ValueChanged<List<MPFileRejection>>?',
      description: {
        ko: '거절된 파일과 이유(`MPFileRejectionReason.type`, `.size`, `.count`)로 호출됩니다. 이것이 없으면 거절된 파일이 조용히 사라집니다',
        en: 'Called with everything that was turned away, and why (`MPFileRejectionReason.type`, `.size`, `.count`). Without it a rejected file disappears in silence'
      }
    }),
    {
      name: 'onBrowse',
      type: 'Future<List<MPFile>> Function()?',
      description: {
        ko: '앱이 직접 연결한 파일 고르기를 실행하고 찾은 파일을 돌려줍니다. 돌려준 파일은 놓은 파일과 똑같이 규칙으로 검사됩니다. 빼면 박스를 눌러도 아무 일도 없고, 파일은 `MPFilePickerState.add`로만 들어옵니다',
        en: "Runs the app's own file picking and hands back what it found, which is checked against the rules like a drop. Left out, a press on the box does nothing and files arrive only through `MPFilePickerState.add`"
      }
    },
    {
      name: 'dragging',
      type: 'bool',
      default: 'false',
      description: {
        ko: '파일이 박스 위로 끌려와 있는지. Flutter는 플러그인 없이 운영체제의 파일 끌기를 알 수 없으므로, 그런 플러그인을 쓰는 앱이 여기에 알려 줍니다',
        en: 'Whether a file is being dragged over the box. Flutter has no file drag from the operating system without a plugin, so an app with one says so here'
      }
    },
    from('MPFilePicker', 'label', { type: `${WIDGET}?` }),
    from('MPFilePicker', 'description', { type: `${WIDGET}?` }),
    from('MPFilePicker', 'errorMessage', { type: `${WIDGET}?` }),
    from('MPFilePicker', 'title', { type: `${WIDGET}?`, default: undefined }),
    from('MPFilePicker', 'hint', { type: `${WIDGET}?` }),
    from('MPFilePicker', 'icon', {
      type: `${WIDGET}?`,
      description: { ko: '문장 위의 그림', en: 'The picture above the title' }
    }),
    {
      name: 'showIcon',
      type: 'bool',
      default: 'true',
      description: {
        ko: '문장 위에 그림을 그릴지. React의 `icon={null}` 자리입니다',
        en: "Whether a picture is drawn above the title at all. React's `icon={null}`"
      }
    },
    from('MPFilePicker', 'showList', { type: 'bool', default: 'true' }),
    from('MPFilePicker', 'removeLabel', { type: 'String Function(String name)?' }),
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '피커가 직접 쓰는 말 — 박스 안의 기본 문장, 삭제 버튼 이름 — 을 어느 언어로 쓸지',
        en: "Which language the picker's own words are in: the box's default sentence and the remove buttons' names"
      }
    },
    sizeRow('MPFilePicker'),
    from('MPFilePicker', 'fullWidth', { type: 'bool', default: 'true' }),
    from('MPFilePicker', 'required', {
      type: 'bool',
      default: 'false',
      description: {
        ko: '필수로 표시합니다. `MPForm` 안에서 아무것도 없는 필수 피커는 제출을 막습니다',
        en: 'Marks the picker required. Inside an `MPForm`, a required picker holding nothing holds the submit back'
      }
    }),
    from('MPFilePicker', 'disabled', { type: 'bool', default: 'false' }),
    from('MPFilePicker', 'readOnly', { type: 'bool', default: 'false' }),
    from('MPFilePicker', 'name', {
      type: 'String?',
      description: {
        ko: '`MPForm`이 파일 목록을 넣어 두는 이름',
        en: 'The name an `MPForm` files the list under'
      }
    }),
    semanticLabelRow,
    ...focusRows
  ],

  MPFile: [
    {
      name: 'name',
      type: 'String',
      required: true,
      description: { ko: '확장자까지 포함한 파일 이름', en: 'What it is called, extension and all' }
    },
    {
      name: 'size',
      type: 'int',
      required: true,
      description: { ko: '바이트 단위 크기', en: 'How many bytes it is' }
    },
    {
      name: 'mimeType',
      type: 'String?',
      description: {
        ko: '`image/png` 같은 미디어 타입. 빼면 `accept`와 비교할 때 확장자만 봅니다',
        en: 'Its media type, `image/png`. Left out, only the extension is checked against `accept`'
      }
    },
    {
      name: 'source',
      type: 'Object?',
      description: {
        ko: '앱의 파일 고르기가 넘겨준 원래 객체. 피커는 들여다보지 않고 그대로 돌려줍니다',
        en: "Whatever the app's own picking handed over. The picker never looks at it and hands it back untouched"
      }
    }
  ]
} satisfies Record<string, PropRow[]>;
