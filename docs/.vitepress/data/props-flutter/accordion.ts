import {
  densityRow,
  elevationRow,
  from,
  renamed,
  sizeRow,
  VARIANT,
  WIDGET,
  focusRows,
  type PropRow
} from './shared';

export default {
  MPAccordion: [
    {
      name: 'children',
      type: 'List<Widget>',
      required: true,
      description: {
        ko: '구획들. 보통 `MPAccordionItem`입니다',
        en: 'The sections, usually `MPAccordionItem`s'
      }
    },
    from('MPAccordion', 'multiple', { type: 'bool', default: 'false' }),
    from('MPAccordion', 'value', { type: 'List<Object>?' }),
    renamed('MPAccordion', 'defaultValue', 'initialValue', {
      type: 'List<Object>?',
      description: {
        ko: 'uncontrolled 아코디언에서 처음 열려 있을 구획들. React의 `defaultValue`입니다',
        en: "Which sections start open in an uncontrolled accordion. React's `defaultValue`"
      }
    }),
    renamed('MPAccordion', 'onValueChange', 'onChanged', { type: 'ValueChanged<List<Object>>?' }),
    from('MPAccordion', 'dividers', { type: 'bool', default: 'true' }),
    from('MPAccordion', 'disabled', { type: 'bool', default: 'false' }),
    from('MPAccordion', 'variant', { type: VARIANT, default: 'MPVariant.outlined' }),
    elevationRow('MPAccordion'),
    sizeRow('MPAccordion'),
    densityRow('MPAccordion'),
    from('MPAccordion', 'keepMounted', { type: 'bool', default: 'false' }),
    {
      name: 'headingLevel',
      type: 'int',
      default: '3',
      description: {
        ko: '각 구획의 제목이 읽히는 제목 단계, `1`부터 `6`까지. 아코디언이 놓인 제목보다 한 단계 아래로 지정해서 화면의 개요가 단계를 건너뛰지 않게 하세요',
        en: "The heading level each section's title is announced at, `1` to `6`. Set it one below the heading the accordion sits under, so the screen's outline does not skip a level"
      }
    }
  ],
  MPAccordionItem: [
    from('MPAccordionItem', 'value', {
      type: 'Object?',
      description: {
        ko: '`value`와 `initialValue`에서 이 구획을 가리키는 값. 비워 두면 구획 자신으로 구별되며, 코드로 다루지 않는 아코디언에는 충분합니다',
        en: 'Identifies the section to `value` and `initialValue`. Left out, the section is identified by itself, which is enough for an accordion nobody drives from code'
      }
    }),
    from('MPAccordionItem', 'title', { type: `${WIDGET}?` }),
    from('MPAccordionItem', 'subtitle', { type: `${WIDGET}?` }),
    from('MPAccordionItem', 'startIcon', { type: `${WIDGET}?` }),
    from('MPAccordionItem', 'action', { type: `${WIDGET}?` }),
    from('MPAccordionItem', 'disabled', { type: 'bool', default: 'false' }),
    renamed('MPAccordionItem', 'children', 'child', { type: `${WIDGET}?` }),
    focusRows[0]
  ]
} satisfies Record<string, PropRow[]>;
