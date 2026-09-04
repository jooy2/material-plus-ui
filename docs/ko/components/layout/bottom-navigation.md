---
title: MPBottomNavigation
order: 13
---

# MPBottomNavigation

<p class="mp-lede">창의 아래쪽 가장자리에 붙어 있는 목적지들의 행입니다. 머터리얼은 이것을 <strong>내비게이션 바</strong>라고 부르고, 그려지는 것은 명세의 것입니다 — 80dp 높이의 <code>surface-container</code> 바, 그리고 지금 있는 목적지의 글리프 뒤에 놓인 64×32dp <code>secondary-container</code> 알약.</p>

<Demo src="bottom-navigation/hero" :minHeight="140" />

```tsx
import { ICONS, MPBottomNavigation, MPBottomNavigationItem, MPIcon } from 'material-plus-ui';

<MPBottomNavigation label="주 메뉴" value={page} onValueChange={setPage}>
  <MPBottomNavigationItem value="home" icon={<MPIcon icon={ICONS.info} />}>
    홈
  </MPBottomNavigationItem>
  <MPBottomNavigationItem value="search" icon={<MPIcon icon={ICONS.search} />}>
    검색
  </MPBottomNavigationItem>
</MPBottomNavigation>;
```

목적지는 셋에서 다섯입니다. 셋보다 적으면 구멍이 뚫린 행이 되고, 다섯을 넘으면 이 컴포넌트가 유일하게 상정하는 입력 수단인 엄지로는 누를 수 없는 크기가 됩니다.

## Props

<PropsTable name="MPBottomNavigation" />

### MPBottomNavigationItem

<PropsTable name="MPBottomNavigationItem" />

## 탭 목록이 아니라 `<nav>`인 이유

무엇을 약속할지에 대한 의도적인 선택입니다.

탭 목록은 키보드 사용자에게 묶음 전체가 하나의 탭 스톱이라는 것과 그 안에서의 방향키를, 스크린 리더에게 탭마다의 패널을 빚집니다. 내비게이션 바는 한 화면의 어느 패널을 보여 줄지가 아니라 **페이지** 자체를 바꾸고, 동작 없이 role만 주장하는 것은 아무것도 주장하지 않는 것보다 나쁩니다. 사용자가 아무 일도 하지 않는 방향키에 손을 뻗게 되기 때문입니다.

대신 주장하는 것은 `aria-current="page"`이고, 그것이 정직한 진술입니다. 여기가 지금 있는 목적지입니다. 각 아이템은 탭 순서 안에 있는 평범한 버튼이나 링크이고, 버튼과 링크가 하는 일을 합니다.

한 화면을 패널로 나누는 것이라면 그건 정말로 [MPTabs](./tabs)입니다.

## labels

<Demo src="bottom-navigation/labels" :minHeight="280">

<<< @/.vitepress/demos/bottom-navigation/labels.tsx

</Demo>

| `labels`   | 그려지는 것           |
| ---------- | --------------------- |
| `all`      | 모든 목적지의 이름    |
| `selected` | 지금 있는 곳의 이름만 |
| `none`     | 이름 없음             |

`all`이 기본값이고, 애플리케이션을 처음 쓰는 사람에게 통하는 유일한 값입니다. 글리프 넷의 행은 첫 번에는 수수께끼이고 다섯 번째에야 습관입니다.

**그려지지 않는 것이 말해지지 않는 것은 아닙니다.** 나머지 둘에서도 이름은 스크린 리더를 위해 문서에 남습니다. 글리프 하나에는 접근성 이름이 아예 없기 때문입니다.

## href

실제 애플리케이션이라면 대부분 써야 할 값입니다.

```tsx
<MPBottomNavigationItem value="saved" href="/saved" icon={…}>
  저장됨
</MPBottomNavigationItem>
```

길게 누르면 "새 탭에서 열기"가 나오고, 주소가 상태 표시줄에 보이고, 크롤러가 따라갈 수 있습니다. `router.push`를 호출하는 `<button>`으로는 어느 것도 되지 않습니다. `onValueChange`는 그대로 호출되므로 클라이언트 라우터도 계속 동작합니다.

`disabled`인 목적지는 사용 불가 표시가 붙는 대신 `href`를 잃습니다. `disabled`는 `<a>`가 가질 수 있는 상태가 아니고, 보기에만 사용 불가인 링크는 키보드가 여전히 밟고 크롤러가 여전히 따라가는 링크이기 때문입니다.

`render`는 그 앵커 자리에 라우터의 `Link`를 놓아, 탭 한 번이 전체 페이지 로드가 아니라 클라이언트 내비게이션이 되게 합니다.

```tsx
<MPBottomNavigationItem value="saved" href="/saved" render={<Link />} icon={…}>
  저장됨
</MPBottomNavigationItem>
```

`href`, `target`, 그리고 바가 정하는 것들은 모두 그대로 전달되고, 바의 `onValueChange`도 어느 쪽이든 불립니다. `href`가 없으면 대신 `<button>` 쪽을 대체하는데, 같은 자리의 같은 엘리먼트입니다.

`target`은 자기 `rel`을 데려옵니다 — `_blank`이면 `noopener noreferrer`입니다. 직접 준 `rel`은 그것을 덧붙이는 게 아니라 대체합니다.

## activeIcon

MD3는 선택된 아이콘을 채우고 나머지는 외곽선으로 둡니다. 곁눈질로 봐도 살아남는 신호입니다.

```tsx
<MPBottomNavigationItem
  value="saved"
  icon={<MPIcon icon={BookmarkOutline} />}
  activeIcon={<MPIcon icon={BookmarkFilled} />}
>
  저장됨
</MPBottomNavigationItem>
```

없으면 `icon`으로 돌아가므로, 글리프가 하나뿐인 묶음도 그대로 동작합니다.

## 인디케이터는 옆으로 넓어집니다

알약은 글리프 자리 크기의 원에서 가로로 자라 나옵니다. 200ms 동안 진행되는 MD3의 움직임이고, 목적지 사이를 오가는 것이 알약 하나가 꺼지고 다른 하나가 켜지는 일이 아니라 표시가 옮겨 가는 일로 읽히게 만드는 것이 이것입니다.

알약은 자리 자체의 배경이 아니라 그 안의 레이어로 그려집니다. 자리는 목적지를 제자리에 붙들어 두는 것이라서, 그것이 자라는 쪽이면 독자가 목적지를 옮길 때마다 다섯 개짜리 줄 전체가 옆으로 밀립니다.

크기 배율이 아니라 `width`인 이유는 알약이 `corner-full`이기 때문입니다. 가로로 늘인 원은 타원이지만, 높이의 절반으로 고정된 반지름을 유지한 채 넓어지는 원은 중간의 모든 프레임에서 알약입니다.

## position과 safeArea

기본값은 `fixed`입니다. 이 라이브러리의 다른 모든 것이 `static`인 것과 반대이지만, 그것이 바로 바텀 내비게이션이기 때문입니다. `static`은 흐름으로 되돌리는데, 미리보기나 문서 페이지가 원하는 값입니다.

`safeArea`는 행 아래에 `env(safe-area-inset-bottom)`을 더해 목적지들이 휴대폰의 홈 인디케이터를 피하게 합니다. 컨테이너는 여전히 화면 맨 아래까지 닿고 행만 올라가므로, 표면이 인디케이터 아래로 이어지고 그 위에서 띠처럼 끊기지 않습니다.

## color를 받지 않는 이유

액티브 인디케이터가 `secondary-container`인 것은 MD3가 그렇게 정했기 때문이고, [MPSegmentedButton](../inputs/segmented-button)이 말하는 것과 같은 이유입니다. **지금 어디에 있는지**를 말하는 표시는 강조의 진술이 아닙니다. `primary`는 화면이 다루는 액션을 위해 남겨 두는 색이고, 내비게이션 바는 아무 일도 하지 않습니다.

`divider`가 꺼져 있는 것도 비슷한 이유입니다. MD3는 바를 페이지에서 선이 아니라 _톤_ 으로 분리합니다. 페이지의 `surface`에 대한 `surface-container`입니다. 뒤의 페이지가 같은 톤일 때만 켜세요.

## 이게 틀린 컴포넌트일 때

**휴대폰보다 넓은 곳에서는** 머터리얼의 답이 이 바가 아니라 옆의 내비게이션 레일입니다. 1400px 창을 가로지르는 목적지 행은 타깃 넷과 그 사이의 아주 많은 빈 곳입니다.

**한 화면을 패널로 나누는 것**이라면 [MPTabs](./tabs)입니다.

**다섯 개에 들어가지 않는 목적지 묶음**이라면 [MPDrawer](./drawer)입니다.

## 접근성

- 바는 `<nav>` 랜드마크입니다. `label`을 주세요. 이름 없는 랜드마크는 스크린 리더가 그냥 "탐색"이라고 읽는 것이고, 그런 게 둘 있는 페이지에서는 도움이 되지 않습니다.
- 지금 있는 목적지는 `aria-current="page"`로 표시되고, 선택 상태를 주장하는 것은 그 외에 없습니다.
- 이름은 어떤 `labels` 설정에서도 문서에 남습니다.
- 비활성 목적지는 바에 남고 계속 읽힙니다. 존재하지만 지금은 갈 수 없는 자리이고, 사라진 자리와는 다릅니다.

## 함께 보기

- [MPTabs](./tabs) — 화면 사이를 옮기는 것이 아니라 한 화면을 나누는 것.
- [MPDrawer](./drawer) — 같은 목적지가 다섯 개를 넘을 때.
- [MPSegmentedButton](../inputs/segmented-button) — `secondary-container`로 선택을 표시하는 또 하나의 컴포넌트.
