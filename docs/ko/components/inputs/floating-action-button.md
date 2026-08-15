---
title: MPFloatingActionButton
order: 9
---

# MPFloatingActionButton

<p class="mp-lede">화면이 다루는 단 하나의 액션이, 그 위에 떠 있는 것입니다. 머터리얼의 컨테이너 셋, 각 크기가 가져가는 모서리까지 포함한 크기 셋, 레벨 3 그림자, 그리고 extended 형태까지 들어 있습니다. 기본값은 명세의 FAB 그대로입니다 — <code>on-primary-container</code> 아래의 <code>primary-container</code>.</p>

<Demo src="floating-action-button/hero" :minHeight="140" />

```tsx
import { ICONS, MPFloatingActionButton, MPIcon } from 'material-plus-ui';

<MPFloatingActionButton icon={<MPIcon icon={ICONS.add} />} label="새 글" />;
```

## Props

<PropsTable name="MPFloatingActionButton" />

## label은 필수입니다

라벨 전체가 그림인 버튼에는 접근성 이름이 아예 없습니다. "aria-label 없는 플로팅 버튼"은 컨트롤이 그것 없이도 완성되어 보이기 때문에 그대로 배포되는 결함입니다.

필수로 만드는 것이 리뷰를 통과하는 유일한 해법입니다. 기본값은 누구에게도 맞지 않는 이름이고, 경고는 콘솔에서 걸러지는 것입니다. `extended`일 때는 같은 문자열이 버튼에 쓰이는 단어이기도 해서, 둘이 다른 말을 할 수가 없습니다.

## 여기서는 모서리가 크기 사다리에 있습니다

**이 라이브러리에서 그런 유일한 컴포넌트**이고, 명세가 그렇게 정해 두었기 때문입니다.

| `size` | 높이 | 모서리               | MD3       |
| ------ | ---- | -------------------- | --------- |
| `xs`   | 40dp | `corner-medium`      | Small FAB |
| `sm`   | 48dp | `corner-large`       | —         |
| `md`   | 56dp | `corner-large`       | FAB       |
| `lg`   | 72dp | `corner-extra-large` | —         |
| `xl`   | 96dp | `corner-extra-large` | Large FAB |

다른 모든 곳에서 반지름은 취향에 따른 크기가 아니라 이것이 어떤 종류의 물건인지에 대한 진술이고 — [MPBox](../layout/box)를 보세요 — 단계가 바뀌어도 고정입니다. 여기서는 _물건 자체_ 가 단계와 함께 바뀌고, 그것이 MD3의 해석입니다. 96dp 원반과 40dp 원반은 하나의 두 크기가 아니라 서로 다른 두 가구입니다.

## 컨테이너 셋

| `variant`  | 컨테이너                 | 잉크                   | MD3         |
| ---------- | ------------------------ | ---------------------- | ----------- |
| `tonal`    | `primary-container`      | `on-primary-container` | 기본값      |
| `filled`   | 강조 색                  | `on-primary`           | —           |
| `elevated` | `surface-container-high` | 강조 색                | Surface FAB |

`outlined`와 `text`가 없는 이유는 플로팅 버튼이 **곧** 그 컨테이너이기 때문입니다. 스크롤되는 페이지 위의 실선 원반은 페이지가 통과해 지나가는 도형이고, text 원반은 누를 것이 없는 글리프입니다.

`color`는 이 셋을 다른 계열로 옮깁니다. 임의의 색상값은 아닙니다 — `primary`가 무엇인지 바꾸려면 토큰을 설정하세요.

## position

기본값이 `fixed`입니다. 이 라이브러리의 다른 모든 것이 `static`인 것과 반대인데, 그것이 이 컴포넌트이기 때문입니다. 나머지는 모두 페이지의 흐름 안에 있고 거기서 꺼내는 것이 잘못이지만, 이것은 페이지의 일부가 아니라는 사실로 정의됩니다.

<Demo src="floating-action-button/anchored" :minHeight="260">

<<< @/.vitepress/demos/floating-action-button/anchored.tsx

</Demo>

`absolute`는 창이 아니라 가장 가까운 위치 지정 조상에 고정합니다. 카드 위, 지도 위, 미리보기 위에 뜨는 버튼이 원하는 값입니다. `static`은 흐름으로 되돌립니다 — 실제로는 `position: relative`로 그려지는데, 스테이트 레이어가 채울 것이 여전히 필요하기 때문입니다.

`corner`는 논리 방향이라 `bottom-end`는 RTL에서 왼쪽 아래이고, `offset`은 양쪽 가장자리로부터의 거리입니다. 머터리얼 자신의 값인 16dp가 기본값입니다.

## 스피드 다이얼이 없는 이유

작은 버튼 서넛으로 펼쳐지는 플로팅 버튼은 머터리얼 **2** 의 패턴이고, MD3는 그것을 없앴습니다.

애초에 좋았던 적이 없습니다. 액션들은 화면 구석의 라벨 없는 원반이고, 사용자가 보고 있던 내용을 가리며, 키보드 계약 없이 `role="menu"`를 주장하는 버튼 다발은 아무것도 주장하지 않는 것보다 키보드 사용자에게 더 나쁩니다.

액션이 정말로 여러 개라면 그건 [MPMenu](./menu)에 속합니다. 그 단어가 약속하는 로빙 포커스, 타이프어헤드, Escape 동작을 실제로 갖춘 진짜 메뉴이고, 이 버튼에서 열면 됩니다.

```tsx
<MPMenu trigger={<MPFloatingActionButton icon={<MPIcon icon={ICONS.add} />} label="만들기" />}>
  <MPMenuItem>문서</MPMenuItem>
  <MPMenuItem>스프레드시트</MPMenuItem>
</MPMenu>
```

## 이게 틀린 컴포넌트일 때

**화면이 다루는 단 하나의 액션이 아닐 때.** FAB는 여기서 할 만한 일이 정확히 하나 있다는 약속입니다. 한 화면에 둘이 있으면 그 화면에는 주 액션이 없는 것입니다. 나머지는 전부 [MPButton](./button)입니다.

**행 하나나 카드 하나에 대한 액션**이라면 그 행 안의 [MPIconButton](./icon-button)입니다. 플로팅 버튼은 화면에 속합니다.

## 접근성

- `label`이 접근성 이름이고 필수입니다. 이름 없이 이 컴포넌트를 렌더링할 방법은 없습니다.
- 밑에 Base UI의 버튼이 있어서 `disabled`가 맨 `aria-disabled`의 합성 문제 없이 탭 순서에서 빠지고, 키보드로 누른 것도 포인터와 같은 스테이트 레이어를 켭니다.
- 비활성 플로팅 버튼은 색과 함께 그림자도 잃습니다. 누를 수 없는데도 여전히 떠 있는 버튼은 여전히 자기가 할 일이라고 주장하는 버튼입니다.
- `type`은 `submit`이 아니라 `button`입니다. 네이티브 버튼은 기본적으로 자기를 감싼 폼을 제출합니다.

## 함께 보기

- [MPButton](./button) — 화면의 나머지 모든 액션.
- [MPIconButton](./icon-button) — 행이나 카드 안의, 이름을 가진 글리프.
- [MPMenu](./menu) — 한 번의 누름 뒤에 여러 액션이 있다면 실제로 있어야 할 곳.
