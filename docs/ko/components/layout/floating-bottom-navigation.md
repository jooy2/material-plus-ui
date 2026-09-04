---
title: MPFloatingBottomNavigation
order: 25
---

# MPFloatingBottomNavigation

<p class="mp-lede">아래 가장자리에서 떠 있는 목적지들의 행. <a href="./bottom-navigation">MPBottomNavigation</a>과 같은 바를 페이지에서 들어 올려, 내용이 그 밑으로 계속 흐르게 합니다.</p>

<Demo src="floating-bottom-navigation/hero" :minHeight="320" />

```tsx
import { MPBottomNavigationItem, MPFloatingBottomNavigation } from 'material-plus-ui';

<MPFloatingBottomNavigation defaultValue="home" label="Main">
  <MPBottomNavigationItem value="home" icon={<HomeIcon />}>
    Home
  </MPBottomNavigationItem>
  <MPBottomNavigationItem value="search" icon={<SearchIcon />}>
    Search
  </MPBottomNavigationItem>
</MPFloatingBottomNavigation>;
```

## Props

<PropsTable name="MPFloatingBottomNavigation" />

목적지는 [MPBottomNavigationItem](./bottom-navigation#mpbottomnavigationitem)입니다. 손대지 않은 같은 컴포넌트입니다. 항목은 자기가 두 바 중 어느 쪽에 있는지 모릅니다. 얼마나 넓어도 되는지만 다릅니다.

## 어느 바를 고를지

바가 화면의 바닥 **그 자체**일 때는 [MPBottomNavigation](./bottom-navigation)입니다. 페이지가 거기서 끝나고, `surface-container`와 `surface` 사이의 색조 차이가 둘을 갈라 놓습니다.

내용이 그 밑으로 흘러야 할 때는 이쪽입니다. 지도, 사진, 바에서 끝나서는 안 되는 피드.

## 모양에 관한 모든 것이 `offset`에서 나옵니다

페이지가 아래로 계속 이어지기 때문에, 시트는

- 모서리 둘 달린 바가 아니라 **스타디움**이고,
- 목적지만큼만 넓어서 각 목적지가 화면의 몫이 아니라 자기 내용만큼 넓어지고,
- 기본으로 **그림자**를 답니다. 떠 있는 대상 위에 평평하게 누운 로젠지는 결정이 아니라 실수로 읽히기 때문입니다.
- 그리고 독자가 있는 목적지만 이름을 답니다. 다섯 개의 이름을 다 그리면 다시 바로 늘어나 버립니다.

자리가 있다면 `labels="all"`이 마지막 항목을 덮습니다. 짧은 이름 셋이면 대개 자리가 있습니다.

## 두 번째 하이라이트는 없습니다

독자가 있는 목적지는 전폭 바에서 입는 것과 같은 active indicator를 입습니다. 글리프 뒤에서 원이 옆으로 넓어지는 MD3의 알약입니다.

떠 있는 바라면 목적지 사이를 미끄러지는 타일을 따로 둘 수도 있었고, 여기서는 일부러 두지 않았습니다. 명세가 그리는 선택 표시는 하나이고, 둘 다 가진 로젠지는 서로 다른 두 곡선으로 독자의 위치를 두 번 말하는 셈입니다.

## `position`, 그리고 창과 무관한 값 하나

`fixed`는 창의 아래에, `sticky`는 스크롤되는 것의 아래에 붙듭니다. `static`은 흐름 안으로 되돌려 가운데 놓습니다.

흥미로운 것은 `absolute`입니다. 가장 가까운 positioned 조상의 아래에 붙듭니다. 자기 화면 안에 있는 바가 원하는 것이 그것입니다. 폰 프레임, 카드, 미리 보기. 위의 데모가 그것입니다.

가운데 정렬은 컨테이너를 가로질러 늘린 상자에 건 `mx-auto`이지, 바 자기 너비의 절반만큼 translate하는 것이 아닙니다. 면을 움직이지 않는다는 규칙은 여기서도 유효하고, `auto` 여백은 말해 주지 않아도 RTL에서 가운데를 지킵니다.

## `safeArea`는 시트 전체를 옮깁니다

전폭 바에서는 안쪽 행만 옮깁니다. 컨테이너가 화면 바닥까지 닿아 있어야 하고, 아니면 그 아래로 페이지가 한 줄 비쳐 보이기 때문입니다. 여기서는 바 아래에 덮어 둘 것이 없으므로 간격이 그냥 늘어납니다. `offset` 더하기 `env(safe-area-inset-bottom)`.

## 주장하지 않는 것

`role="tablist"`입니다. [MPBottomNavigation](./bottom-navigation)과 같은 이유입니다. 바텀 내비게이션은 페이지의 어느 패널을 보여 줄지가 아니라 페이지가 **무엇인지**를 바꿉니다. 모든 항목은 `aria-current="page"`를 단 평범한 버튼이거나 링크입니다.
