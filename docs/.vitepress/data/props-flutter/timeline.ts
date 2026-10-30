import { colorRow, from, renamed, sizeRow, WIDGET, type PropRow } from './shared';

export default {
  MPTimeline: [
    {
      name: 'children',
      type: 'List<MPTimelineItem>',
      required: true,
      description: {
        ko: '단계들. 타임라인이 번호를 매기고 단계 사이의 선을 직접 그리므로 `MPTimelineItem`을 받습니다',
        en: 'The steps. `MPTimelineItem`s, because the timeline numbers them and draws the line between them itself'
      }
    },
    from('MPTimeline', 'active', { type: 'int?' }),
    sizeRow('MPTimeline'),
    colorRow('MPTimeline'),
    from('MPTimeline', 'orientation', { type: 'MPOrientation', default: 'MPOrientation.vertical' })
  ],
  MPTimelineItem: [
    from('MPTimelineItem', 'title', { type: `${WIDGET}?` }),
    from('MPTimelineItem', 'meta', { type: `${WIDGET}?` }),
    from('MPTimelineItem', 'bullet', { type: `${WIDGET}?` }),
    from('MPTimelineItem', 'status', { type: 'MPTimelineStatus?' }),
    from('MPTimelineItem', 'color', { type: 'MPColor?' }),
    from('MPTimelineItem', 'connector', {
      type: 'MPTimelineConnector',
      default: 'MPTimelineConnector.solid'
    }),
    renamed('MPTimelineItem', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
