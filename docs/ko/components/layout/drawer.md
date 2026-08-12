---
title: MPDrawer
order: 8
---

# MPDrawer

<p class="mp-lede">창의 한쪽 가장자리에 붙는 패널입니다. 두 가지가 한 컴포넌트인데, 사실 같은 패널이기 때문입니다 — 열어서 쓰는 드로어와, 그냥 페이지의 일부인 드로어.</p>

<Demo src="drawer/hero" :minHeight="120" />

```tsx
import { MPDrawer, MPDrawerClose, MPButton } from 'material-plus-ui';

<MPDrawer
  trigger={<MPButton>메뉴 열기</MPButton>}
  title="Material Plus"
  actions={<MPDrawerClose render={<MPButton variant="text">닫기</MPButton>} />}
>
  …
</MPDrawer>;
```

## Props

<PropsTable name="MPDrawer" />

## modal과 standard

MD3가 내비게이션 드로어의 변종을 부르는 바로 그 두 단어이고, `mode`가 정하는 것의 전부입니다.

|                  | `modal`                           | `standard`                    |
| ---------------- | --------------------------------- | ----------------------------- |
| 렌더링 위치      | `<body>` 끝의 포털                | 작성한 자리, 레이아웃 안      |
| 뒤쪽 페이지      | 스크림, inert, 스크롤 잠금        | 그대로 — 패널을 둘러싸고 배치 |
| 포커스           | 안에 갇히고, 닫히면 트리거로 복귀 | 특별한 처리 없음              |
| Escape·바깥 클릭 | 닫힘                              | 닫을 것이 없음                |
| 표면             | 레벨 1의 `surface-container-low`  | 평평한 `surface`              |
| 시작 상태        | 닫힘                              | 열림                          |
| ×                | 켬                                | 끔                            |

<Demo src="drawer/standard" :minHeight="260">

<<< @/.vitepress/demos/drawer/standard.tsx

</Demo>

둘이 한 컴포넌트인 이유는, 브레이크포인트에서 사이드바가 햄버거로 바뀌는 일이 **prop 하나**여야 하기 때문입니다. prop이 서로 다른 두 컴포넌트를 갈아 끼우는 일이 아니라요.

```tsx
<MPDrawer mode={wide ? 'standard' : 'modal'} open={open} onOpenChange={setOpen} title="섹션">
  …
</MPDrawer>
```

닫힌 `standard` 드로어는 **아무것도** 렌더링하지 않습니다. 흐름 속 패널에게 "닫힘"은 "레이아웃에 없음"이기 때문입니다. 나가는 길에 애니메이션할 것도 없습니다. 움직이는 것은 그 주변의 페이지이고, 페이지를 움직이는 일은 이 컴포넌트의 몫이 아닙니다.

## 네 가장자리

<Demo src="drawer/sides" :minHeight="120">

<<< @/.vitepress/demos/drawer/sides.tsx

</Demo>

`side`는 **물리적**입니다 — `left`, `right`, `top`, `bottom`. 이 라이브러리 어디서나 `MPSide`가 그렇듯이요. 창 위쪽에 붙은 드로어는 어느 표기 방향에서든 위쪽에 붙습니다.

여기서 서로 다른 두 물건이 나오고, MD3는 둘 다에 이름을 붙였습니다.

- **옆면 패널**은 내비게이션 드로어입니다. `size`가 함의하는 너비 — `md`에서 360px로, 명세 자신의 값 — 를 가지고, 자유 가장자리를 `corner-large`로 둥글립니다.
- **위·아래 패널**은 시트입니다. 담긴 것만큼 높고 창의 85%에서 멈추며, 바텀 시트의 모서리인 `corner-extra-large`로 둥글립니다.

**창**에 맞닿은 모서리는 언제나 각지고, 테두리도 마찬가지입니다. 보이는 끝이 없는 것에서 잘라낸 모서리는 아무것도 잘라내지 않은 모서리이고, 창 가장자리를 따라 그은 실선에는 갈라 놓을 반대편이 없습니다.

## 미끄러져 들어오지 않는 이유

전환은 투명도뿐입니다. [MPDialog](../feedback/dialog)와 똑같습니다.

드로어는 글과 컨트롤이 전부이고, 미끄러져 들어오는 패널은 애니메이션이 이어지는 내내 자기 문장들을 화면 위로 끌고 다닙니다. 이건 규칙의 예외가 아니라 규칙이 쓰인 바로 그 경우입니다. 이 패널이 가장자리에서 왔다고 말하는 것은 패널이 가장자리에 _붙어 있다_ 는 사실입니다. 창 쪽은 각지고, 자유로운 쪽은 잘려 있습니다.

## variant도 color도 없는 이유

`variant`가 없는 것은 다이얼로그와 같은 이유입니다. 다섯 무게는 "이 표면이 페이지에 대해 스스로를 얼마나 주장하는가"에 답하는데, 창의 한 변을 통째로 가져간 패널은 이미 답했습니다.

`color`가 없는 것은 읽을 것이 없기 때문입니다. MD3의 내비게이션 드로어는 중립 잉크 아래의 중립 표면이고, 그 안에서 강조 색을 지니는 것은 **선택된 행**입니다. 그건 호출자가 안에 넣은 [리스트](../display/list)의 몫입니다.

```tsx
<MPDrawer title="섹션">
  <MPList variant="text">
    <MPListItem selected onClick={…}>개요</MPListItem>
  </MPList>
</MPDrawer>
```

## 예시

### extent

크기 사다리를 덮어쓰며, 축에 따라 다른 것을 뜻합니다 — 옆면 패널에서는 **너비**, 시트에서는 **높이**. 숫자는 픽셀입니다.

```tsx
<MPDrawer extent={280}>…</MPDrawer>
<MPDrawer side="bottom" extent="40vh">…</MPDrawer>
```

### dividers

헤더·본문·액션 사이를 여백 대신 실선으로 나누고, 선이 양 끝까지 닿도록 세로 여백을 시트에서 각 구획으로 옮깁니다.

본문이 스크롤되기 시작하는 순간 켤 만합니다. 스크롤되는 것은 본문뿐이고, 선은 헤더가 제자리에 남아 있다고 말해 줍니다.

### dismissible

반드시 대답을 받아야 하는 드로어에서는 꺼 두세요. 그리고 대답할 수 있는 액션을 주세요. 다른 나갈 길이 없어집니다.

```tsx
<MPDrawer open dismissible={false} title="요금제 선택" actions={<MPButton>계속</MPButton>}>
  …
</MPDrawer>
```

`MPDrawerClose`와 코드에 의한 닫기는 그대로 동작합니다. 취소되는 것은 Escape와 스크림 클릭입니다.

### MPDrawerClose

uncontrolled 드로어에는 Cancel 버튼이 부를 `setOpen`이 없고, 모든 드로어를 controlled로 만드는 건 버튼 하나에 답하려고 드로어마다 상태를 하나씩 두는 일입니다. `render`는 Base UI 자신의 탈출구라서, 진짜 Material Plus 버튼이 닫습니다.

```tsx
<MPDrawerClose render={<MPButton variant="text">취소</MPButton>} />
```

`modal` 드로어의 버튼입니다. `standard`는 다이얼로그가 아니라서 이것이 말을 걸 상대가 없습니다.

## 접근성

- `modal` 드로어는 진짜 다이얼로그입니다. 포커스가 안에 갇히고, 뒤쪽 페이지는 inert가 되며, 스크롤이 잠기고, 닫히면 포커스가 트리거로 돌아갑니다. 전부 Base UI의 것입니다.
- `title`과 `description`은 `aria-labelledby`·`aria-describedby`로 연결되어, 패널이 이름 없는 영역으로 읽히지 않고 스스로를 알립니다.
- `standard` 드로어는 다이얼로그가 **아니고** 그런 척하지도 않습니다. 평범한 `<h2>`와 `<p>`를 쓰는데, 다이얼로그 바깥에서 쓰는 다이얼로그의 부품은 패널에 없는 역할을 주장하기 때문입니다.
- 스크롤되는 것은 본문뿐이라서 제목과 액션은 화면에서 사라지지 않습니다. `dividers`가 없을 때 본문은 1픽셀의 여백을 가지고 음수 마진으로 그 공간을 그대로 돌려줍니다. 스크롤 컨테이너가 잘라 냈을 포커스 링의 자리입니다.

## 함께 보기

- [MPDialog](../feedback/dialog) — 같은 슬롯을 페이지 한가운데 시트에 올린 것.
- [MPOverlay](../feedback/overlay) — 가장자리에 붙는 대신 영역을 덮는 것.
- [MPPanes](./panes) — 여닫는 대신 읽는 사람이 크기를 조절하는 사이드바.
