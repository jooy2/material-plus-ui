import { colorRow, from, sizeRow, type PropRow } from './shared';

export default {
  MPPagination: [
    from('MPPagination', 'count', { type: 'int', required: true }),
    from('MPPagination', 'page', {
      type: 'int?',
      description: {
        ko: '현재 페이지(1부터). 넘기면 controlled입니다',
        en: 'The current page, from 1. Given, the row is controlled'
      }
    }),
    {
      name: 'initialPage',
      type: 'int',
      default: '1',
      description: {
        ko: '처음 현재 페이지. 자기 페이지를 스스로 들고 있는 줄에 씁니다. React의 `defaultPage` 자리입니다',
        en: "Which page starts current, for a row that holds its own. React's `defaultPage`"
      }
    },
    {
      name: 'onChanged',
      type: 'ValueChanged<int>?',
      description: {
        ko: '고른 페이지로 호출됩니다. React의 `onPageChange` 자리입니다',
        en: "Called with the page that was chosen. React's `onPageChange`"
      }
    },
    from('MPPagination', 'siblingCount', { type: 'int', default: '1' }),
    from('MPPagination', 'boundaryCount', { type: 'int', default: '1' }),
    from('MPPagination', 'showEdges', { type: 'bool', default: 'false' }),
    from('MPPagination', 'showArrows', { type: 'bool', default: 'true' }),
    sizeRow('MPPagination'),
    colorRow('MPPagination'),
    {
      name: 'fullWidth',
      type: 'bool',
      default: 'false',
      description: {
        ko: '주어진 너비 안에서 줄을 가운데에 둡니다',
        en: 'Centres the row in the width it is given'
      }
    },
    {
      name: 'disabled',
      type: 'bool',
      default: 'false',
      description: {
        ko: '쓸 수 없습니다. 줄의 모든 칸이 응답을 멈춥니다',
        en: 'Unavailable. Every cell stops answering'
      }
    },
    from('MPPagination', 'locale', { type: 'String?' }),
    from('MPPagination', 'labels', {
      type: 'Map<String, String>?',
      description: {
        ko: '문구 자체를 덮어씁니다(`label`, `page`, `status`, `previous`, `next`, `first`, `last`). 번역보다 우선합니다',
        en: 'Overrides for the words themselves (`label`, `page`, `status`, `previous`, `next`, `first`, `last`). They win over the translation'
      }
    })
  ]
} satisfies Record<string, PropRow[]>;
