import { from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPEmpty: [
    from('MPEmpty', 'title', {
      type: `${WIDGET}?`,
      default: undefined,
      description: {
        ko: '제목. 비워 두면 `locale`의 "아무것도 없습니다"에 해당하는 말이 그려집니다',
        en: 'The headline. Left out, the words for "nothing here" in `locale`'
      }
    }),
    {
      name: 'showTitle',
      type: 'bool',
      default: 'true',
      description: {
        ko: '제목을 그릴지. 글리프와 문장만 있는 상태를 위한 것으로, React의 `title={false}` 자리입니다',
        en: "Whether a headline is drawn at all, for a state that is a glyph and a sentence. React's `title={false}`"
      }
    },
    from('MPEmpty', 'icon', {
      type: `${WIDGET}?`,
      description: {
        ko: '제목 위의 글리프. 비워 두면 빈 쟁반입니다. 아이콘은 상태의 글리프 크기로 그려지고, 그림은 받은 크기 그대로입니다',
        en: "The glyph above the headline. Left out, the empty tray. An icon is drawn at the state's glyph size; a picture keeps the size it was given"
      }
    }),
    {
      name: 'showIcon',
      type: 'bool',
      default: 'true',
      description: {
        ko: '글리프를 그릴지. React의 `icon={false}` 자리입니다',
        en: "Whether a glyph is drawn at all. React's `icon={false}`"
      }
    },
    from('MPEmpty', 'action', {
      type: `${WIDGET}?`,
      description: {
        ko: '글 아래의 빠져나갈 길. 위젯 하나이므로, 함께 줄바꿈될 버튼 여러 개는 가운데 정렬한 `Wrap`으로 묶어서 넘깁니다',
        en: 'What to do about it, under the text. One widget, so several buttons that should wrap together come in a centred `Wrap`'
      }
    }),
    from('MPEmpty', 'variant', { type: VARIANT, default: 'MPVariant.text' }),
    sizeRow('MPEmpty'),
    {
      name: 'liveRegion',
      type: 'bool',
      default: 'true',
      description: {
        ko: '나타날 때 알릴지. 사라진 것이 아니라 더해진 것이므로 기본으로 알립니다. 화면이 만들어질 때부터 그 일부인 상태에는 `false`를 주며, React의 `role={undefined}` 자리입니다',
        en: "Whether the state is announced when it appears, which it is by default because something was added rather than removed. `false` for a state that is part of the screen on arrival: React's `role={undefined}`"
      }
    },
    {
      name: 'locale',
      type: 'String?',
      description: {
        ko: '기본 제목을 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the default headline is written in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    },
    renamed('MPEmpty', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
