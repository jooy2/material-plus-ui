import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPCommandPalette: [
    from('MPCommandPalette', 'items', { type: 'List<MPCommand>', required: true }),
    from('MPCommandPalette', 'open', { type: 'bool?' }),
    renamed('MPCommandPalette', 'defaultOpen', 'initialOpen', { type: 'bool', default: 'false' }),
    from('MPCommandPalette', 'onOpenChange', { type: 'ValueChanged<bool>?' }),
    from('MPCommandPalette', 'onSelect', { type: 'ValueChanged<MPCommand>?' }),
    from('MPCommandPalette', 'shortcut', {
      type: 'String?',
      default: "'Mod+K'",
      description: {
        ko: '팔레트를 여는 키 조합. 앱 어디에서 눌러도 듣습니다. `MPShortcut`이 그리는 것과 같은 어휘로 쓰므로 `Mod`는 맥에서 Command, 그 밖에서는 Control입니다. `null`이면 아무것도 바인딩하지 않습니다',
        en: 'The keystroke that opens the palette, heard anywhere in the app. Written in the vocabulary `MPShortcut` draws, so `Mod` is Command on a Mac and Control everywhere else. `null` binds nothing'
      }
    }),
    from('MPCommandPalette', 'width', {
      type: 'double?',
      description: {
        ko: '시트가 넓어질 수 있는 최대 너비. 논리 픽셀 단위입니다. 비워 두면 `size`에 따른 너비입니다',
        en: 'How wide the sheet may get, in logical pixels. Left out, the width `size` implies'
      }
    }),
    from('MPCommandPalette', 'maxHeight', { type: 'double', default: '320' }),
    sizeRow('MPCommandPalette'),
    colorRow('MPCommandPalette'),
    from('MPCommandPalette', 'locale', { type: 'String?' }),
    from('MPCommandPalette', 'placeholder', { type: 'String?' }),
    from('MPCommandPalette', 'emptyMessage', { type: 'String?' }),
    renamed('MPCommandPalette', 'label', 'semanticLabel', { type: 'String?' })
  ],
  MPCommand: [
    {
      name: 'value',
      type: 'String',
      required: true,
      description: { ko: '명령을 가리키는 값', en: 'What identifies the command' }
    },
    {
      name: 'label',
      type: 'String',
      required: true,
      description: {
        ko: '행에 쓰이는 글자이자 질의를 맞춰 보는 글자',
        en: 'What the row says, and what the query is matched against'
      }
    },
    {
      name: 'description',
      type: 'String?',
      description: {
        ko: '아래에 붙는 둘째 줄. 명령이 어디로 가는지, 무엇을 바꾸는지를 적습니다',
        en: 'A second line under it: where the command goes, or what it changes'
      }
    },
    {
      name: 'icon',
      type: `${WIDGET}?`,
      description: { ko: '라벨 앞의 글리프', en: 'A glyph before the label' }
    },
    {
      name: 'shortcut',
      type: 'String?',
      description: {
        ko: '같은 일을 하는 키 조합. 행 끝에 `MPShortcut`으로 그립니다. 팔레트는 이 키를 바인딩하지 않고, 앱이 이미 가진 바인딩의 라벨로만 씁니다',
        en: 'The keystroke that does the same thing, drawn at the end of the row by `MPShortcut`. The palette does not bind it: it is the label for a binding the app already has'
      }
    },
    {
      name: 'group',
      type: 'String?',
      description: {
        ko: '명령이 놓일 제목. 그룹이 바뀔 때마다 제목이 그려지므로 같은 그룹의 명령은 붙여서 나열해야 합니다',
        en: 'The heading this command sits under. A heading is drawn each time the group changes, so a group’s commands have to be listed together'
      }
    },
    {
      name: 'keywords',
      type: 'List<String>',
      default: 'const []',
      description: {
        ko: '그리지는 않지만 질의를 맞춰 보는 단어. 다른 제품이 같은 명령에 붙인 이름, 약어, 독자가 검색했을 법한 단어를 넣습니다',
        en: 'Words the query is matched against but that are never drawn: another product’s name for the command, an abbreviation, the word the reader would have searched for'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '목록에는 있지만 실행할 수 없습니다',
        en: 'In the list but not runnable'
      }
    },
    {
      name: 'onSelect',
      type: 'VoidCallback?',
      description: { ko: '명령을 실행하면 일어나는 일', en: 'What running it does' }
    }
  ]
} satisfies Record<string, PropRow[]>;
