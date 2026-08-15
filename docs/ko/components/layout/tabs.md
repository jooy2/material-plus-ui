---
title: MPTabs
order: 11
---

# MPTabs

<p class="mp-lede">여러 패널 중 하나를 보여 주는 묶음입니다. 머터리얼의 두 가지 탭이 <code>variant</code>로 들어 있습니다 — 화면의 최상위 층은 <code>primary</code>, 그 패널 안의 구분은 <code>secondary</code> — 각각 명세의 인디케이터, 높이, 타입 역할을 그대로 씁니다.</p>

<Demo src="tabs/hero" :minHeight="200" />

```tsx
import { MPTab, MPTabPanel, MPTabs } from 'material-plus-ui';

<MPTabs aria-label="여행" defaultValue="flights">
  <MPTab value="flights">항공</MPTab>
  <MPTab value="stays">숙소</MPTab>

  <MPTabPanel value="flights">…</MPTabPanel>
  <MPTabPanel value="stays">…</MPTabPanel>
</MPTabs>;
```

탭과 패널은 children 하나로 넣으면 바와 본문으로 알아서 나뉩니다. 기억해야 할 `<MPTabList>` 같은 건 없습니다. 엘리먼트가 이미 말하고 있는 것을 다시 말하는 것이 유일한 일인 래퍼는 틀릴 기회만 하나 더 늘립니다.

## Props

<PropsTable name="MPTabs" />

### MPTab

<PropsTable name="MPTab" />

### MPTabPanel

<PropsTable name="MPTabPanel" />

## primary와 secondary는 세기가 아니라 깊이입니다

<Demo src="tabs/variants" :minHeight="260">

<<< @/.vitepress/demos/tabs/variants.tsx

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

## activateOnFocus

기본값은 꺼짐입니다. 방향키는 포커스만 옮기고, 선택은 <kbd>Enter</kbd>나 <kbd>Space</kbd>가 합니다.

자동 활성화는 모든 패널이 이미 페이지에 있을 때만 친절합니다. 그중 하나라도 데이터를 가져오기 시작하면 탭 네 개를 지나가는 동안 요청이 네 번 나가고, 키보드 사용자는 탭을 불러오지 않고서는 지나갈 수조차 없게 됩니다.

## keepMounted

숨겨진 패널은 언마운트됩니다. 패널 넷 중 하나만 화면에 있는 흔한 경우에는 맞는 기본값이고, 절반쯤 채워진 폼을 들고 있는 패널에는 틀린 기본값입니다.

```tsx
<MPTabPanel value="compose" keepMounted>
  …
</MPTabPanel>
```

## 가로 전용입니다

`orientation`이 없고, 그 부재는 명세의 것입니다.

MD3에 세로 탭은 없습니다. 화면 옆으로 세워진 목적지 목록은 **내비게이션 레일**이고, 이는 동작이 다른 별개의 컴포넌트입니다. 한 화면의 어느 패널을 보여 줄지가 아니라 _화면_ 자체를 바꾸고, 방향키가 안에서 도는 하나의 탭 스톱도 아닙니다. 옆으로 세운 탭 바는 탭의 계약을 주장하면서 다른 물건처럼 보이게 됩니다.

들어갈 자리보다 탭이 많으면 줄바꿈 대신 스크롤됩니다. MD3의 scrollable tabs입니다. 두 줄이 된 탭 바는 이미 바이기를 그만둔 것이고, 인디케이터가 놓일 자리도 마땅치 않습니다.

## 이게 틀린 컴포넌트일 때

**화면 전체를 바꾸는 것**이라면 휴대폰에서는 [MPBottomNavigation](./bottom-navigation), 넓은 화면에서는 옆의 레일입니다. 탭은 한 화면을 나누고 내비게이션은 화면 사이를 옮깁니다. 스크린 리더에게 둘은 완전히 다르게 들립니다.

**목록이 보여 주는 내용을 바꾸는 두세 개의 배타적 선택지**라면 [MPSegmentedButton](../inputs/segmented-button)입니다. 패널이 없다는 것이 차이입니다.

**동시에 여러 개가 열릴 수 있는 구획**이라면 [MPAccordion](./accordion)입니다.

## 접근성

- 밑에는 Base UI가 있고, 그것이 이 컴포넌트를 버튼 몇 개가 아니라 탭 바로 만듭니다. 묶음 전체가 하나의 탭 스톱, 그 안에서 방향키, <kbd>Home</kbd>과 <kbd>End</kbd>, `tab`과 `tabpanel` role, 그리고 둘을 잇는 `aria-controls`까지입니다.
- 포커스 가능한 것이 하나도 없는 패널은 스스로 포커스를 받습니다. 방금 탭이 드러낸 내용에 키보드가 닿을 수 있어야 하기 때문입니다.
- `aria-label`을 주세요. 그것이 바의 이름입니다. 탭들은 자기 이름만 말합니다.
- 비활성 탭은 바에 남고 계속 읽힙니다. 존재하지만 지금은 쓸 수 없는 자리이고, 사라진 자리와는 다릅니다.

## 함께 보기

- [MPSegmentedButton](../inputs/segmented-button) — 뒤에 패널이 없는 같은 질문.
- [MPAccordion](./accordion) — 제자리에서 열리고, 동시에 여러 개가 열릴 수 있는 구획.
- [Base UI Tabs](https://base-ui.com/react/components/tabs) — 밑에 있는 동작.
