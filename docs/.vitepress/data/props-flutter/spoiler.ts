import { colorRow, from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPSpoiler: [
    renamed('MPSpoiler', 'children', 'child', { type: `${WIDGET}?` }),
    from('MPSpoiler', 'revealed', { type: 'bool?' }),
    renamed('MPSpoiler', 'defaultRevealed', 'initialRevealed', { type: 'bool', default: 'false' }),
    from('MPSpoiler', 'onRevealedChange', { type: 'ValueChanged<bool>?' }),
    from('MPSpoiler', 'locale', {
      type: 'String?',
      description: {
        ko: '덮개의 문구를 어느 언어로 쓸지. 가장 가까운 `MPLocaleProvider`, 앱의 `Localizations`, 영어 순으로 따릅니다',
        en: "Which language the cover is written in. Falls back to the nearest `MPLocaleProvider`, then the app's `Localizations`, then English"
      }
    }),
    from('MPSpoiler', 'label', { type: `${WIDGET}?` }),
    from('MPSpoiler', 'hideLabel', { type: `${WIDGET}?` }),
    from('MPSpoiler', 'description', {
      type: `${WIDGET}?`,
      description: {
        ko: '버튼 위에서 왜 가렸는지 말하는 줄. 비워 두면 `locale`의 문구입니다',
        en: "The line above the button, saying why the content is covered. Left out, `locale`'s wording"
      }
    }),
    {
      name: 'showDescription',
      type: 'bool',
      default: 'true',
      description: {
        ko: '그 줄을 그릴지. 아무것도 쓰이지 않은 덮개를 위한 것으로, React의 `description={false}` 자리입니다',
        en: "Whether that line is drawn at all, for a cover with nothing written on it. React's `description={false}`"
      }
    },
    from('MPSpoiler', 'action', { type: `${WIDGET}?` }),
    from('MPSpoiler', 'reversible', { type: 'bool', default: 'false' }),
    from('MPSpoiler', 'maxHeight', {
      type: 'double?',
      description: {
        ko: '가려진 상자의 높이를 이 값(논리 픽셀)으로 제한합니다. 열면 풀리고 내용은 필요한 만큼 높아집니다',
        en: 'Clamps the covered box to this height, in logical pixels. Revealing releases it and the content takes whatever height it needs'
      }
    }),
    from('MPSpoiler', 'blur', { type: 'double', default: '10' }),
    from('MPSpoiler', 'padded', { type: 'bool', default: 'true' }),
    from('MPSpoiler', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    sizeRow('MPSpoiler'),
    colorRow('MPSpoiler')
  ]
} satisfies Record<string, PropRow[]>;
