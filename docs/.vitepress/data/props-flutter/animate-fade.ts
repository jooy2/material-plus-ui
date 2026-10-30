/**
 * `MPAnimateFade`, and the rows every other `MPAnimate*` page borrows.
 *
 * The ten timing settings mean the same thing on all seventeen widgets, so
 * they are written once here, next to the effect the rest are measured
 * against, and imported by the other `animate-*.ts` files. Each row is still
 * derived from the React row of the component it is listed under, so a prop
 * that disappears on the React side breaks the page it disappeared from.
 */

import { from, renamed, WIDGET, type PropRow } from './shared';

type Patch = Partial<PropRow>;

/** The Flutter types and wording of the timing settings, by name. */
const timing: Record<string, Patch> = {
  duration: {
    type: 'Duration?',
    description: {
      ko: '한 번 도는 데 걸리는 시간. 비워 두면 그 효과의 MD3 duration 토큰(`MPMotion`)을 따릅니다',
      en: "How long one run takes. Left out, it takes the effect's own MD3 duration token from `MPMotion`"
    }
  },
  delay: {
    type: 'Duration',
    default: 'Duration.zero',
    description: { ko: '시작하기 전에 기다리는 시간', en: 'How long before it starts' }
  },
  easing: {
    type: 'MPEasing?',
    description: {
      ko: '어떤 MD3 이징 곡선을 탈지. 이름마다 `MPMotion`의 곡선 하나에 대응하며, 임의의 `Curve`는 받지 않습니다',
      en: 'Which MD3 easing curve it runs on. Each name stands for one of the curves in `MPMotion`; an arbitrary `Curve` is not accepted'
    }
  },
  repeat: {
    type: 'MPAnimateRepeat',
    default: '1',
    description: {
      ko: "몇 번 도는지. `MPAnimateRepeat`는 `int?`이고 `null`이면 멈추지 않습니다. React의 `'infinite'` 자리입니다",
      en: "How many times it runs. `MPAnimateRepeat` is an `int?`, and `null` never stops: React's `'infinite'`"
    }
  },
  alternate: { type: 'bool', default: 'false' },
  paused: { type: 'bool', default: 'false' },
  trigger: {
    type: 'MPAnimateTrigger',
    default: 'MPAnimateTrigger.mount',
    description: {
      ko: '무엇이 시작시키는지. 화면에 올라올 때, 스크롤해서 보일 때, 포인터나 포커스가 들어올 때, 또는 `play`로만',
      en: 'What starts it: being built, being scrolled into view, the pointer or the focus arriving, or nothing but `play`'
    }
  },
  play: {
    type: 'bool',
    default: 'false',
    description: {
      ko: '`trigger`가 `MPAnimateTrigger.manual`일 때 이것이 돌립니다. `false`에서 `true`로 바뀔 때마다 처음부터 다시 시작합니다',
      en: 'Runs it when `trigger` is `MPAnimateTrigger.manual`. Each `false` → `true` starts it over'
    }
  },
  once: {
    type: 'bool',
    default: 'true',
    description: {
      ko: '`MPAnimateTrigger.visible`일 때 처음 한 번만 돌릴지. 끄면 다시 보일 때마다 돕니다',
      en: 'With `MPAnimateTrigger.visible`, whether it runs only the first time. Off, it runs again on every return'
    }
  },
  threshold: {
    type: 'double',
    default: '0.2',
    description: {
      ko: '`MPAnimateTrigger.visible`일 때 얼마나 보여야 보인 것으로 칠지, `0`부터 `1`까지. 위에 있는 모든 스크롤 영역과 화면 안에 든 부분으로 잽니다',
      en: 'With `MPAnimateTrigger.visible`, how much has to be on screen before it counts, from `0` to `1`, measured inside every scrollable above it and the screen'
    }
  }
};

/**
 * The timing settings `names` on `component`, each patched with its Flutter
 * type and wording. `patches` adjusts a row further.
 */
export function motionRows(
  component: string,
  names: string[],
  patches: Record<string, Patch> = {}
): PropRow[] {
  return names.map((name) => from(component, name, { ...timing[name], ...patches[name] }));
}

/** All ten, in the order a caller meets them. */
export const ALL_MOTION = [
  'duration',
  'delay',
  'easing',
  'repeat',
  'alternate',
  'paused',
  'trigger',
  'play',
  'once',
  'threshold'
];

/** `mode`, which Dart has to spell `enter` and `exit`. */
export function modeRow(component: string): PropRow {
  return from(component, 'mode', {
    type: 'MPAnimateMode',
    default: 'MPAnimateMode.enter',
    description: {
      ko: '내용이 도착하는지(`enter`) 떠나는지(`exit`). `in`이 Dart의 예약어라서 React의 `in`과 `out` 대신 이 두 이름을 씁니다. 나가는 쪽이 더 짧습니다',
      en: "Whether the content arrives (`enter`) or leaves (`exit`). Two names in place of React's `in` and `out`, because `in` is a reserved word in Dart. An exit is quicker than an entrance"
    }
  });
}

/** `stagger`, `durationStep` and `reverse`, as `Duration`s. */
export function staggerRows(component: string): PropRow[] {
  return [
    from(component, 'stagger', {
      type: 'Duration',
      default: 'Duration.zero',
      description: {
        ko: '`children`에서 한 자식 뒤에 다음 자식이 시작하기까지의 시간. 이것이 효과를 자식 단위로 바꿉니다. 0이면 상자 자체가 재생됩니다. 단계는 자식마다입니다',
        en: 'How much later each of `children` starts than the one before it. This is what turns the effect into a per-child one; at zero the box itself animates. The step is per child'
      }
    }),
    from(component, 'durationStep', {
      type: 'Duration',
      default: 'Duration.zero',
      description: {
        ko: '자식마다 앞의 것보다 얼마나 더 오래 걸리는지. 음수는 짧아지며 0에서 멈춥니다. `stagger`와 함께일 때만 읽힙니다',
        en: 'How much longer each child takes than the one before it. Negative shortens instead, clamped at zero. Only read alongside `stagger`'
      }
    }),
    from(component, 'reverse', { type: 'bool', default: 'false' })
  ];
}

/**
 * `child`, `children` and `layoutBuilder`: one subject, or a set and how to
 * lay it out. React has `children` alone, because the caller's own markup
 * lays a set out there.
 */
export function subjectRows(component: string, subject: { ko: string; en: string }): PropRow[] {
  return [
    renamed(component, 'children', 'child', {
      type: `${WIDGET}?`,
      description: subject
    }),
    {
      name: 'children',
      type: 'List<Widget>?',
      description: {
        ko: '하나로, 또는 `stagger`를 주면 하나씩 차례로 움직일 묶음. `child`와 함께 줄 수 없습니다',
        en: 'A set that moves as one, or one after another with a `stagger`. Not given together with `child`'
      }
    },
    layoutRow
  ];
}

/** How a set is laid out, which the React build leaves to the caller's CSS. */
export const layoutRow: PropRow = {
  name: 'layoutBuilder',
  type: 'MPAnimateLayoutBuilder?',
  description: {
    ko: '`children`를 배치합니다. 비워 두면 각자 제 너비로 세로로 쌓입니다. React에서는 호출하는 쪽의 마크업과 CSS가 맡는 일이라서 Flutter에만 있습니다',
    en: "Lays out `children`. Left out, they stack down the page, each at its own width. Flutter only: in React the caller's own markup and CSS do this"
  }
};

/** A text widget's style, which React takes through `style`. */
export const textStyleRow: PropRow = {
  name: 'style',
  type: 'TextStyle?',
  description: {
    ko: '글자 스타일. 물려받은 스타일 위에 합쳐집니다. React에서 `style`로 글자 크기를 주던 자리입니다',
    en: "The text style, merged over the inherited one. Where React's `style` carries a font size"
  }
};

export default {
  MPAnimateFade: [
    modeRow('MPAnimateFade'),
    from('MPAnimateFade', 'from', { type: 'double', default: '0' }),
    ...motionRows('MPAnimateFade', ALL_MOTION),
    ...staggerRows('MPAnimateFade'),
    ...subjectRows('MPAnimateFade', { ko: '나타나거나 사라질 것', en: 'What arrives or leaves' })
  ]
} satisfies Record<string, PropRow[]>;
