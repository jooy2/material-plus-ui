---
title: MPTreeView
order: 28
---

# MPTreeView

<p class="mp-lede">열리고 닫히는 행들의 나무. 탭 스톱 하나짜리 위젯 하나이고 화살표 키로 걸어 다닙니다. 파일 탐색기, 분류 선택기, 문서 사이드바.</p>

<Demo src="tree-view/hero" :minHeight="360" />

::: fw react

```tsx
import { MPTreeItem, MPTreeView } from 'material-plus-ui';

<MPTreeView label="Files" defaultExpanded={['src']}>
  <MPTreeItem value="src" label="src">
    <MPTreeItem value="index" label="index.ts" />
  </MPTreeItem>
</MPTreeView>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPTreeView(
  label: 'Files',
  initialExpanded: <Object>['src'],
  children: <MPTreeItem>[
    MPTreeItem(
      value: 'src',
      label: Text('src'),
      children: <MPTreeItem>[MPTreeItem(value: 'index', label: Text('index.ts'))],
    ),
  ],
);
```

:::

## Props

<PropsTable name="MPTreeView" />

### MPTreeItem

<PropsTable name="MPTreeItem" />

## 트리가 갚아야 할 것, 그리고 어디서 갚는지

이 밑에는 <Fw react="Base UI 프리미티브" flutter="프레임워크 위젯" />가 없습니다. 그래서 이 패턴이 갚아야 할 세 가지가 컴포넌트의 대부분입니다.

- <Fw react="`tree` / `treeitem` / `group` role" flutter="열렸는지와 골랐는지를 알리는 행마다의 노드" />,
- 위젯 전체에 탭 스톱 **하나**,
- 그리고 그것을 걸어 다니는 화살표 키.

::: fw flutter

`children`과 각 행의 `children`은 아무 위젯이 아니라 `MPTreeItem`의 목록입니다. 어느 행이 보이고 화살표 키가 어떤 순서로 닿는지 알려면 트리가 행들을 훑어야 하기 때문입니다.

:::

키보드는 맨 위에서 한 번만 다룹니다. 트리의 화살표 키는 *트리*에 대한 질문 — 다음에 보이는 행이 무엇인가, 내 부모가 어디인가 — 이고, 그것에 답할 수 있는 엘리먼트는 그 전부를 쥐고 있는 하나뿐입니다.

|              |                                                     |
| ------------ | --------------------------------------------------- |
| 위, 아래     | 보이는 이전 행과 다음 행                            |
| Home, End    | 첫 행과 마지막 행                                   |
| 오른쪽       | 닫힌 가지를 열고, 열린 가지에서는 안으로 들어갑니다 |
| 왼쪽         | 열린 가지를 닫고, 잎에서는 밖으로 나갑니다          |
| Enter, Space | 행을 누릅니다 — 고르고, 지나는 길에 엽니다          |

RTL에서는 좌우가 바뀝니다. 방향은 prop이 아니라 <Fw react="엘리먼트" flutter="주변의 `Directionality`" />에서 읽습니다. 호출부가 세 단계 위에서 방향을 정했을 수도 있고, ArrowRight는 어느 쪽이든 "더 안쪽"을 뜻해야 합니다.

## 펼침 화살표가 버튼이 아닌 이유

포커스를 받는 것은 행입니다. ARIA 패턴이 그렇습니다. 그 안의 버튼은 탭 스톱이 정확히 하나여야 하는 위젯의 두 번째 탭 스톱이 되고, 키보드는 이미 ArrowRight로 가지를 엽니다.

그래서 화살표는 <Fw react="클릭 핸들러가 달린 평범한 span" flutter="평범한 탭 과녁" />입니다. 포인터를 위한 과녁이고, 키보드가 지나쳐야 할 것은 아닙니다. 흥미로운 부분은 그것이 하는 일입니다. **행을 고르지 않고 가지만 엽니다.** 폴더를 가리키는 것과 폴더를 여는 것의 차이가 그것이고, 화살표가 자기 과녁을 갖는 유일한 이유입니다.

## 닫힌 가지는 거기 없습니다

숨겨진 것이 아니라 언마운트된 것입니다. 그래서 화살표 키가 걷는 행의 순서가 문서 순서와 같아지고, 천 개짜리 트리가 아무도 열지 않은 구백 개를 렌더하지 않습니다.

_닫히는 중인_ 가지는 세 번째 상태입니다. 접히는 동안 문서에 남아 있어야 하고, 아니면 접을 것이 없습니다. 그 몇백 밀리초 동안 그 행들은 보이지만 더 이상 트리의 일부가 아닙니다. 방금 닫은 폴더에서 아래를 누르면 그 안이 아니라 그다음 행으로 갑니다.

::: fw react

접힘 자체는 `0fr`에서 `1fr`로 가는 그리드 행입니다. 아무것도 재지 않고, 열려 있는 동안 행이 늘어난 가지는 함께 자라며, 그 안에서 열리는 중첩 가지도 같은 트랙이 실어 나릅니다.

:::

::: fw flutter

접힘 자체는 가지가 자기 높이 중 보이는 비율을 줄여 가는 것이고, `short4`와 `standard` 커브를 쓰며 `MediaQuery.disableAnimations`에서는 그냥 잘립니다. 열려 있는 동안 행이 늘어난 가지는 함께 자라고, 그 안에서 열리는 중첩 가지도 함께 실려 갑니다.

:::

## `lines`

|  |  |
| --- | --- |
| `none` | 들여쓰기만. 두 단계 깊이에 레이블이 구조를 말해 주는 내비게이션 사이드바에는 대개 이쪽이 맞습니다 |
| `simple` | 단계마다 실선 레일 하나가 그룹 높이만큼 내려갑니다. 행의 열을 그것이 속한 가지까지 따라가기에 충분합니다 |
| `folder` | 레일에 더해 각 행으로 들어가는 팔꿈치, 그리고 마지막 자식 아래에서 멈추는 레일. 파일 관리자의 그림이고, 깊은 트리에 쓸 쪽입니다 |

## 고르기

`selected`는 한 번에 하나만 고를 수 있을 때도 <Fw react="배열" flutter="리스트" />입니다. [MPAccordion](../layout/accordion)의 값과 같은 모양이라, `multiple`을 켠다고 값의 타입까지 바뀌지는 않습니다.

단일 선택은 비지 않습니다. 고른 행을 다시 눌러도 그대로 남습니다. "아무것도 고르지 않음"은 행을 가리켜서 되돌아갈 수 있는 상태가 아니기 때문입니다. 다중 선택은 토글합니다. 그것이 다중 선택의 용도입니다.

## 행 높이는 컨트롤 사다리를 벗어납니다

라이브러리에서 행이 일부러 그렇게 하는 유일한 자리입니다. 컨트롤이 `md`에서 56dp인 것은 MD3가 필드를 56dp로 그리기 때문이고, 트리 행은 수십 개가 늘어선 열의 한 줄입니다. 56짜리 여섯 줄은 여섯 개를 보여 주는 사이드바입니다.

거래는 분명히 적어 둘 만합니다. `md`의 40은 48dp 터치 목표에 못 미치므로, 엄지로 쓸 트리는 `lg`를 원합니다. `density`가 컨트롤을 24까지 내려 줄 때 내리는 것과 같은 판단입니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `defaultExpanded`, `defaultSelected` | `initialExpanded`, `initialSelected` | 위젯이 받아서 이후 스스로 들고 있는 시작값을 Flutter는 이렇게 부릅니다. |
| 아무 자식 | `children: List<MPTreeItem>` | 어느 행이 보이는지, 어떤 순서인지 알려면 트리가 행을 훑어야 합니다. |
| `string \| number` 값 | `Object` 값 | `==`가 제대로 동작하는 값이면 무엇이든 행을 가리킬 수 있습니다. |
| 자동 생성되는 값 | 트리 안에서의 자리 | `value`가 없는 행은 놓인 자리로 구별됩니다. |
| `href`, `render` | — | Flutter에는 링크 엘리먼트가 없습니다. 이동하는 행은 `onPressed`에서 라우터를 부릅니다. |
| `onClick` | `onPressed` | Flutter의 이름입니다. |
| `tree`, `treeitem`, `group` role | 선택과 펼침 상태 | Flutter에는 트리 role이 없어서, 각 행이 열렸는지와 골랐는지를 알립니다. |

:::
