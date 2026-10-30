import { from, WIDGET, type PropRow } from './shared';

export default {
  MPForm: [
    from('MPForm', 'validationMode', {
      type: 'MPFormValidationMode',
      default: 'MPFormValidationMode.onSubmit'
    }),
    from('MPForm', 'errors', {
      type: 'Map<String, String>',
      default: 'const {}',
      description: {
        ko: '필드 자신의 검사 밖에서 온 오류 — 서버, 스키마 — 를 각 메시지가 속한 필드의 `name`으로 키를 붙여 넘깁니다. **필드 위에** 표시되고, 그 필드가 바뀌는 즉시 지워집니다',
        en: "Errors from outside the fields' own checks — a server, a schema — keyed by the `name` of the field each belongs to. Shown **on the field**, and cleared as soon as that field changes"
      }
    }),
    from('MPForm', 'onSubmit', {
      type: 'ValueChanged<Map<String, Object?>>?',
      description: {
        ko: '유효한 제출에서 이름이 있는 필드의 값을 그 이름 아래 담은 맵과 함께 호출됩니다',
        en: "Called on a valid submit, with each named field's value under its name"
      }
    }),
    {
      name: 'size',
      type: 'MPSize?',
      default: 'MPSize.md',
      description: {
        ko: '자식들 사이 간격. 폼은 스택이고, 이것이 스택이 서는 단계입니다',
        en: 'The gap between the children. A form is a stack, and this is the rung it stacks on'
      }
    },
    from('MPForm', 'children', { type: `List<${WIDGET}>`, required: true })
  ]
} satisfies Record<string, PropRow[]>;
