---
title: MPTabs
order: 12
---

# MPTabs

<p class="mp-lede">여러 패널 중 하나를 보여 주는 묶음입니다. 머터리얼의 두 가지 탭이 <code>variant</code>로 들어 있습니다 — 화면의 최상위 층은 <code>primary</code>, 그 패널 안의 구분은 <code>secondary</code> — 각각 명세의 인디케이터, 높이, 타입 역할을 그대로 씁니다.</p>

<Demo src="tabs/hero" :minHeight="200" />

::: fw react

```tsx
import { MPTab, MPTabPanel, MPTabs } from 'material-plus-ui';

<MPTabs aria-label="여행" defaultValue="flights">
  <MPTab value="flights">항공</MPTab>
  <MPTab value="stays">숙소</MPTab>

  <MPTabPanel value="flights">…</MPTabPanel>
  <MPTabPanel value="stays">…</MPTabPanel>
</MPTabs>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPTabs<String>(
  semanticLabel: '여행',
  initialValue: 'flights',
  children: const <Widget>[
    MPTab<String>(value: 'flights', child: Text('항공')),
    MPTab<String>(value: 'stays', child: Text('숙소')),
    MPTabPanel<String>(value: 'flights', child: FlightsPanel()),
    MPTabPanel<String>(value: 'stays', child: StaysPanel()),
  ],
);
```

:::

탭과 패널은 children 하나로 넣으면 바와 본문으로 알아서 나뉩니다. 기억해야 할 `<MPTabList>` 같은 건 없습니다. 엘리먼트가 이미 말하고 있는 것을 다시 말하는 것이 유일한 일인 래퍼는 틀릴 기회만 하나 더 늘립니다.

::: fw flutter

children은 모두 값 타입이 같은 `MPTab`이나 `MPTabPanel`이어야 하고, 바의 탭 순서는 `MPTab`을 쓴 순서입니다. 그 밖의 위젯을 넣으면 디버그 모드에서 assertion이 납니다. 탭도 패널도 아닌 위젯은 바에도 본문에도 놓일 자리가 없기 때문입니다.

:::

## Props

<PropsTable name="MPTabs" />

### MPTab

<PropsTable name="MPTab" />

### MPTabPanel

<PropsTable name="MPTabPanel" />

## primary와 secondary는 세기가 아니라 깊이입니다

<Demo src="tabs/variants" :minHeight="260">

::: fw react

<<< @/.vitepress/demos/tabs/variants.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/tabs/variants.dart

:::

</Demo>

primary 탭은 화면의 최상위 층이고, secondary 탭은 그중 한 패널 안의 내용을 나눕니다. 위 데모가 두 번째를 첫 번째의 패널 안에 넣은 이유이고, 명세가 그리는 배치도 그것입니다.

MD3는 둘을 세 가지로 구분하고, 셋 다 여기 있습니다.

|             | `primary`                   | `secondary`               |
| ----------- | --------------------------- | ------------------------- |
| 인디케이터  | 3dp, 둥근 모서리, 라벨 아래 | 2dp, 각진 모서리, 탭 전체 |
| 선택된 라벨 | 강조 색                     | `on-surface`              |
| 글리프      | 라벨 위                     | 라벨 앞                   |
| `md` 높이   | 48dp, 글리프가 있으면 64dp  | 48dp                      |

세 번째 variant는 일부러 없습니다. 버튼 같은 사다리는 강조의 축인데, 탭 바에는 강조할 것이 없습니다. 탭 바는 화면 위의 액션이 아니라 화면의 지도입니다.

## 인디케이터는 라벨을 감쌉니다

primary 바에서 인디케이터는 탭 자신의 좌우 패딩만큼 정확히 안쪽으로 들어옵니다. 그래서 탭 아래가 아니라 글자 아래에 놓입니다. 그 길이는 루트에 선언된 하나이므로 패딩과 인디케이터가 서로 어긋날 수 없습니다.

알아 둘 만한 결과 하나: `fullWidth`처럼 탭이 라벨보다 훨씬 넓을 때는 인디케이터가 글자 폭이 아니라 탭에서 패딩을 뺀 폭이 됩니다.

인디케이터는 `left`와 `width`를 애니메이션해서 움직입니다. 글자가 들어 있지 않은 빈 상자의 레이아웃 애니메이션이고, 이 라이브러리가 허용하는 유일한 종류입니다.

::: fw flutter

인디케이터 위치는 탭 개수로 계산하지 않고 탭 상자를 직접 잽니다. 그래야 라벨 길이가 서로 달라도 맞는 탭 아래에 놓입니다. 바의 너비가 바뀌거나 탭 크기가 바뀌면 다시 잽니다.

:::

## 패널은 페이드로 넘어갑니다

새로 들어오는 패널은 200ms 동안 서서히 나타납니다. MD3가 정한 답이고, 인디케이터가 미끄러지는 것의 나머지 절반입니다. 장식은 애니메이션하면서 그 장식이 가리키는 내용은 뚝 끊기는 바는 엉뚱한 쪽을 애니메이션하고 있던 셈이니까요.

나가는 쪽에는 대응하는 페이드가 없고, 이유는 미감이 아니라 구조입니다. 나가는 패널은 그 위의 전환이 재생되는 동안에도 여전히 레이아웃 안에 있습니다. 그래서 패널이 서서히 사라지게 만들면 둘이 동시에 흐름 안에 놓이고, 페이지가 둘을 담을 만큼 커졌다가 새 패널 크기로 무너집니다. 그것보다는 끊기는 편이 낫습니다.

첫 페인트에서도 아무것도 페이드하지 않습니다. 페이지가 열릴 때 자기 내용을 서서히 띄우는 바는 아무도 하지 않은 질문에 답하는 것입니다.

## activateOnFocus

기본값은 꺼짐입니다. 방향키는 포커스만 옮기고, 선택은 <kbd>Enter</kbd>나 <kbd>Space</kbd>가 합니다. <kbd>Home</kbd>과 <kbd>End</kbd>는 바의 양 끝으로 갑니다.

자동 활성화는 모든 패널이 이미 페이지에 있을 때만 친절합니다. 그중 하나라도 데이터를 가져오기 시작하면 탭 네 개를 지나가는 동안 요청이 네 번 나가고, 키보드 사용자는 탭을 불러오지 않고서는 지나갈 수조차 없게 됩니다.

## keepMounted

숨겨진 패널은 언마운트됩니다. 패널 넷 중 하나만 화면에 있는 흔한 경우에는 맞는 기본값이고, 절반쯤 채워진 폼을 들고 있는 패널에는 틀린 기본값입니다.

::: fw react

```tsx
<MPTabPanel value="compose" keepMounted>
  …
</MPTabPanel>
```

:::

::: fw flutter

```dart
const MPTabPanel<String>(value: 'compose', keepMounted: true, child: ComposeForm())
```

남겨 둔 패널은 보이든 숨든 트리의 같은 자리에 있으므로 상태가 유지됩니다. 숨어 있는 동안에는 그려지지 않고, 포커스를 받지 않고, 시맨틱 트리에서 빠지며, 애니메이션도 멈춥니다.

:::

## 가로 전용입니다

`orientation`이 없고, 그 부재는 명세의 것입니다.

MD3에 세로 탭은 없습니다. 화면 옆으로 세워진 목적지 목록은 **내비게이션 레일**이고, 이는 동작이 다른 별개의 컴포넌트입니다. 한 화면의 어느 패널을 보여 줄지가 아니라 _화면_ 자체를 바꾸고, 방향키가 안에서 도는 하나의 탭 스톱도 아닙니다. 옆으로 세운 탭 바는 탭의 계약을 주장하면서 다른 물건처럼 보이게 됩니다.

들어갈 자리보다 탭이 많으면 줄바꿈 대신 스크롤됩니다. MD3의 scrollable tabs입니다. 두 줄이 된 탭 바는 이미 바이기를 그만둔 것이고, 인디케이터가 놓일 자리도 마땅치 않습니다.

## 스크롤된다는 것을 말하기

원래부터 스크롤은 됐습니다. 그렇다고 말할 방법이 없었을 뿐입니다.

macOS는 쓰기 전까지 존재하지 않는 오버레이 스크롤바를 그립니다. 그래서 탭 네 개가 가장자리 밖으로 나가 있는 바와 하나도 나가지 않은 바가 같은 그림이었습니다. Windows는 진짜 스크롤바를 그리는데, 그것은 신호이면서 동시에 두 플랫폼 중 한쪽에만 있는 탭 아래 15px짜리 가구이기도 합니다.

이제 스크롤바는 양쪽 모두에서 감추고, 바는 **남은 바가 있는 쪽 끝을 흐립니다**. 오른쪽에 더 있으면 오른쪽을, 독자가 중간 어딘가에 있으면 양쪽을, 전부 들어가면 어느 쪽도 흐리지 않습니다. 이미 도달한 끝을 흐리는 것은 아무 말도 하지 않는 것과 같은 거짓말입니다.

넘치는지 아닌지는 선언이 아니라 측정입니다. 그것은 전적으로 바가 받은 공간에 달려 있기 때문입니다. 같은 탭 여섯 개가 640px에서는 들어가고 320px에서는 들어가지 않습니다.

::: fw react

측정 결과는 `.mp-tabs__list`에 `data-mp-overflow`로 적히므로, 다른 방식으로 표현하고 싶은 페이지도 같은 사실을 읽을 수 있습니다.

```css
/* 예를 들면 페이드 대신 화살표. */
.mp-tabs__list[data-mp-overflow='right']::after {
  content: '›';
}
```

값은 `left`, `right`, `both`이고 **물리적**입니다. 글의 방향이 아니라 상자의 면을 가리킵니다. 인디케이터의 `--active-tab-left`가 따르는 것과 같은 규칙입니다. 측정값은 RTL에서도 측정값으로 남고, 물리적 측정값을 논리적 속성과 짝지우는 것이야말로 방향을 고치는 게 아니라 망가뜨리는 일입니다.

:::

::: fw flutter

흐림은 스트립 위에 씌운 마스크라서 바가 어떤 배경 위에 놓여도 맞게 보입니다. 탭이 모두 들어가면 마스크 자체를 씌우지 않습니다. 그러데이션은 읽는 방향을 따르므로 RTL에서는 스트립과 함께 뒤집힙니다.

방향키로 포커스를 옮기면 그 탭이 보이는 자리로 들어오고, 바가 처음 배치될 때는 선택된 탭이 흐린 부분을 벗어난 자리에 옵니다. 움직이는 것은 스트립뿐이고, 둘레의 페이지는 그대로 있습니다.

:::

바 아래 구분선은 탭과 함께 흐려지지 않습니다. 그것은 바와 패널 사이의 경계이고, 바가 무엇을 하든 전체 너비를 달립니다.

## 이게 틀린 컴포넌트일 때

**화면 전체를 바꾸는 것**이라면 휴대폰에서는 [MPBottomNavigation](./bottom-navigation), 넓은 화면에서는 옆의 레일입니다. 탭은 한 화면을 나누고 내비게이션은 화면 사이를 옮깁니다. 스크린 리더에게 둘은 완전히 다르게 들립니다.

**목록이 보여 주는 내용을 바꾸는 두세 개의 배타적 선택지**라면 [MPSegmentedButton](../inputs/segmented-button)입니다. 패널이 없다는 것이 차이입니다.

**동시에 여러 개가 열릴 수 있는 구획**이라면 [MPAccordion](./accordion)입니다.

## 접근성

::: fw react

- 밑에는 Base UI가 있고, 그것이 이 컴포넌트를 버튼 몇 개가 아니라 탭 바로 만듭니다. 묶음 전체가 하나의 탭 스톱, 그 안에서 방향키, <kbd>Home</kbd>과 <kbd>End</kbd>, `tab`과 `tabpanel` role, 그리고 둘을 잇는 `aria-controls`까지입니다.
- 포커스 가능한 것이 하나도 없는 패널은 스스로 포커스를 받습니다. 방금 탭이 드러낸 내용에 키보드가 닿을 수 있어야 하기 때문입니다.
- `aria-label`을 주세요. 그것이 바의 이름입니다. 탭들은 자기 이름만 말합니다.
- 비활성 탭은 바에 남고 계속 읽힙니다. 존재하지만 지금은 쓸 수 없는 자리이고, 사라진 자리와는 다릅니다.

:::

::: fw flutter

- 바 전체가 포커스 지점 하나입니다. 방향키는 비활성 탭을 건너뛰며 포커스를 옮기고, <kbd>Home</kbd>과 <kbd>End</kbd>는 양 끝으로 가며, <kbd>Enter</kbd>나 <kbd>Space</kbd>로 선택합니다. 포커스가 바를 떠나면 포커스 지점은 선택된 탭으로 돌아갑니다.
- 리모컨 D-pad 같은 방향 내비게이션에서는 방향키가 양 끝에서 돌아가지 않고 멈추며, 끝을 넘는 방향키는 다음 컨트롤로 넘어갑니다.
- 바는 tab bar role을 가진 노드이고 이름은 `semanticLabel`입니다. 각 탭은 tab role 노드이고 선택 여부를 말합니다. 선택된 탭은 `controlsNodes`로 자기 패널을 가리키고, 패널은 tab panel role 노드입니다.
- 비활성 탭은 바에 남고, 쓸 수 없는 상태로 읽힙니다.
- 포커스 링은 `secondary` 색으로 탭 안쪽에 그립니다. 나란히 놓인 탭의 바깥에 링을 그리면 이웃 탭 위를 덮기 때문입니다.

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | 값이 바뀌는 것뿐인 콜백에 Flutter가 쓰는 이름입니다. |
| `defaultValue` | `initialValue` | Flutter의 이름입니다. 비워 두면 비활성화되지 않은 첫 탭이 선택된 채로 시작합니다. |
| `value={null}` | — | `value: null`은 바가 스스로 선택을 관리한다는 뜻이므로, 아무것도 선택되지 않은 controlled 바는 표현할 수 없습니다. |
| 프래그먼트까지 들여다보는 children 정렬 | children은 `MPTab`과 `MPTabPanel`뿐 | Dart에는 프래그먼트가 없습니다. 함께 나타나고 사라지는 짝은 컬렉션 `if`로 씁니다. |
| `aria-label` | `semanticLabel` | Flutter의 이름입니다. |
| 포커스 가능한 것이 없는 패널이 스스로 포커스를 받음 | — | Flutter의 화면 낭독기는 시맨틱 트리로 패널 내용에 닿고, Tab 키는 패널 안의 첫 컨트롤로 갑니다. 패널을 따로 포커스 지점으로 만들면 할 일이 없는 지점이 하나 생깁니다. |
| `data-mp-overflow` | — | 그 값을 읽을 스타일시트가 없습니다. 흐림은 바가 직접 그립니다. |
| `className`, `style`, `div`가 받는 속성 | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPSegmentedButton](../inputs/segmented-button) — 뒤에 패널이 없는 같은 질문.
- [MPAccordion](./accordion) — 제자리에서 열리고, 동시에 여러 개가 열릴 수 있는 구획.
- [Base UI Tabs](https://base-ui.com/react/components/tabs) — 밑에 있는 동작.
