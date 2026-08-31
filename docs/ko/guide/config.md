---
title: 앱 전역 기본값
order: 3
---

# 앱 전역 기본값

<p class="mp-lede"><code>size="sm"</code>로 도는 디자인은 결정 하나여야지 호출 지점마다 하나여서는 안 됩니다. <code>MPConfigProvider</code>가 그 결정이 놓이는 자리입니다.</p>

<Demo src="config/hero" :minHeight="380" />

```tsx
import { MPConfigProvider } from 'material-plus-ui';

<MPConfigProvider size="sm" color="tertiary" locale="ko">
  <App />
</MPConfigProvider>;
```

## Props

<PropsTable name="MPConfigProvider" />

## 구체성의 순서

답할 수 있는 자리가 셋이고, 가장 가까운 것이 이깁니다.

```
호출 지점의 prop  →  그것을 감싼 그룹  →  MPConfigProvider  →  머터리얼 자신의 것
```

버튼에 적힌 `size`는 모든 것을 이깁니다. 그것을 감싼 [`MPButtonGroup`](../components/inputs/button-group.md)이나 [`MPAvatarGroup`](../components/display/avatar-group.md)은 *그 컨트롤들*에 대한 진술이라 페이지에 대한 진술인 프로바이더를 이깁니다. 그리고 아무도 아무 말도 하지 않았을 때 남는 것이 머터리얼이 말하는 것 — `md`, `primary` — 입니다.

```tsx
<MPConfigProvider size="xl">
  <MPButtonGroup size="sm">
    <MPButton>One</MPButton> {/* sm — 그룹이 더 가깝습니다 */}
  </MPButtonGroup>
  <MPButton size="lg">Two</MPButton> {/* lg — 호출 지점이 이깁니다 */}
  <MPButton>Three</MPButton> {/* xl — 프로바이더 */}
</MPConfigProvider>
```

## 왜 이 둘이고 테마가 아닌가

테마가 보통 담는 것은 여기서 이미 전부 **CSS custom property**입니다 — 색 역할, 타입 스케일, 모서리, 모션 지속 시간. 그것들은 cascade를 타고 컴포넌트에 도달하므로, 페이지의 한 구역이 나머지와 달라지는 데 프로바이더도 리렌더도 필요 없습니다. 자바스크립트 테마 객체는 같은 값이 사는 두 번째 장소가 되고, 둘은 어긋납니다. 토큰 쪽이 어떻게 도는지는 [색](../design/color.md)을 보세요.

`size`만은 그 길로 갈 수 없습니다. 이건 **리터럴 Tailwind 클래스 문자열**로 풀립니다 — `h-14`, `text-mp-body-large`. Tailwind가 소스 텍스트를 훑어 클래스를 찾기 때문에, 보간한 `h-${n}`은 규칙을 아예 만들어 내지 않습니다. custom property가 될 수 없으면서 모든 호출 지점에 도달해야 하는 값, 그게 정확히 컨텍스트가 있는 이유입니다.

`color`가 합류한 이유는 이 둘이 제품 하나를 통째로 정할 때 보통 함께 정해지는 축이기 때문이고, `color` prop이 색이 아니라 *역할 이름*이기 때문입니다. `primary`가 **무엇인지**를 바꾸는 것은 여전히 토큰의 일이고, 이건 컨트롤이 네 역할 중 어느 것을 읽을지만 바꿉니다.

## 왜 `variant`는 여기 없는가

_그_ 기본 variant라는 것이 없기 때문입니다.

| 컴포넌트      | 자기 기본값 |
| ------------- | ----------- |
| `MPButton`    | `filled`    |
| `MPChip`      | `outlined`  |
| `MPAlert`     | `tonal`     |
| `MPAccordion` | `outlined`  |
| `MPBadge`     | `filled`    |

강조에 관한 서로 다른 다섯 질문에 대한 다섯 개의 답입니다. 전역 값 하나는 그 다섯을 임의의 하나로 덮어쓰고, 그 뒤에 이상해 보이는 컴포넌트는 왜인지 단서를 주지 않습니다.

## 일부러 닿지 않는 것

**자기 기본값을 고른 컴포넌트는 그것을 지킵니다.** 규칙은 프로바이더가 _라이브러리의_ 기본값을 공급하지 _컴포넌트의_ 답을 공급하지는 않는다는 것입니다.

| 컴포넌트 | 지키는 것 | 이유 |
| --- | --- | --- |
| `MPBadge` | `color="error"` | 배지는 보통 주의를 원하는 무언가의 개수입니다 |
| `MPTooltip` | `size="sm"` | 컨트롤 높이로 그린 툴팁은 판때기입니다 |
| `MPDialog` · `MPPill` · `MPShortcut` | `color="secondary"` | 행동이 아니라 가구입니다 |

옮기려면 prop을 지정하세요.

기본값이 **아예 없는** prop도 그대로 둡니다 — `MPSkeleton`의 `color`는 "중립"을 뜻하는 미지정이고, 앱 전역 강조색이 그 자리를 채우지 않습니다.

## 중첩

프로바이더는 중첩되고 **병합**되며, 필드별로 가장 가까운 것이 이깁니다. 강조색만 바꾸는 구역은 위에서 온 크기를 그대로 지킵니다.

```tsx
<MPConfigProvider size="sm">
  <App />
  <MPConfigProvider color="error">
    <DangerZone /> {/* 여전히 size="sm", 이제 color="error" */}
  </MPConfigProvider>
</MPConfigProvider>
```

## 로케일도 함께 옵니다

`MPConfigProvider`는 `locale`도 함께 나릅니다. 애플리케이션에 프로바이더가 둘이 아니라 하나면 되도록.

```tsx
<MPConfigProvider size="sm" locale="ko">
  <App />
</MPConfigProvider>
```

[`MPLocaleProvider`](../design/localization.md#2-mplocaleprovider)는 그대로 있고 그대로 동작합니다 — 언어만 바꾸는 서브트리를 위한 좁은 쪽입니다. `locale`을 주지 않은 `MPConfigProvider`는 플랫폼 기본값으로 되돌리지 않고 위에 있는 것을 물려받습니다.

## 되읽기

```tsx
import { useMPConfig } from 'material-plus-ui';

const { size, color } = useMPConfig();
```

이것들을 감싸는 자기 래퍼 컴포넌트를 위한 것입니다. 아래에 있는 컴포넌트가 풀 방식 그대로 prop을 풀 수 있습니다. 필드는 **선택적**이고, `undefined`는 `md`나 `primary`가 아니라 *아무도 정하지 않음*을 뜻합니다 — 라이브러리 자신의 기본값은 여기 저장되지 않고 컴포넌트가 적용하므로, 나중에 기본값을 바꿀 자리가 한 곳입니다.

## 날카로운 모서리

- **`defaultProps`가 아닙니다.** 컴포넌트별 override 맵은 없고, 그걸 더하면 같은 말을 하는 두 번째 방식이 이름을 키로 생깁니다. 실제로 생기는 경우는 prop 두 개로 덮이고, 그보다 좁은 것은 직접 만드는 래퍼 컴포넌트의 몫입니다.
- **아래를 리렌더합니다.** 값은 객체가 아니라 필드에 memoise되어 있어서 같은 설정으로 부모가 리렌더되는 것은 공짜입니다 — 다만 런타임에 `size`를 _바꾸면_ 모든 소비자가 리렌더되고, 위 데모가 하고 있는 것이 그것입니다. 그건 설정 화면의 일이지 스크롤 핸들러의 일이 아닙니다.

## 오른쪽에서 왼쪽으로

이 라이브러리의 패딩·마진·모서리·아이콘 슬롯은 전부 이미 **논리** 속성입니다 — `pl`/`pr`이 아니라 `ps`/`pe`, 왼쪽·오른쪽이 아니라 `startIcon`/`endIcon`, `top-left`가 아니라 `MPCorner`의 `top-start`. 그래서 RTL의 스타일시트 쪽은 컴포넌트 위 어디든 `dir`만 있으면 예전부터 동작했고, LTR 페이지 속 `dir="rtl"` 구역도 사고가 아니라 지원되는 배치입니다.

없던 것은 나머지 절반이었습니다.

```tsx
<MPConfigProvider dir="rtl">
  <App />
</MPConfigProvider>
```

### 두 시스템, 하나의 prop

방향은 두 곳에서 답해지고 둘이 일치해야 합니다.

|            | 읽는 것          | 배선돼 있었나 |
| ---------- | ---------------- | ------------- |
| 스타일시트 | DOM 자신의 `dir` | 예, 항상      |
| Base UI    | React 컨텍스트   | **아니오**    |

Base UI의 일곱 부품이 그 컨텍스트를 봅니다 — 슬라이더·메뉴·셀렉트·콤보박스·내비게이션 메뉴·OTP 필드·스크롤 영역. 그런데 그것을 제공하는 것이 없어서, DOM이 뭐라 하든 일곱 전부 페이지가 왼쪽에서 오른쪽으로 흐른다고 듣고 있었습니다.

드러난 곳은 슬라이더입니다. 손잡이는 `inset-inline-start`와 **물리** `translate: -50%`로 놓입니다. RTL에서는 inset이 오른쪽에서 재는데 translate는 여전히 왼쪽으로 옮기므로, 손잡이가 자기가 보고하는 값에서 정확히 손잡이 너비만큼 떨어진 자리에 놓였습니다 — 모든 값에서, 그리고 0과 100에서는 트랙 밖으로 나갔습니다.

`dir`은 둘 다 설정합니다. 속성은 `display: contents` 엘리먼트에 붙어 레이아웃에 전혀 참여하지 않으므로, 프로바이더가 flex 컨테이너와 그 자식들 사이의 상자가 되지 않습니다. 같은 값이 Base UI 자신의 `DirectionProvider`로 들어갑니다.

주지 않으면 아무것도 렌더하지 않고 아무것도 주장하지 않습니다. `<html>`에 `dir`을 걸고 이것을 마운트하지 않은 페이지는 여전히 CSS 절반만 얻습니다.

### 여전히 당신 몫인 것

- **`<html dir>`과 `lang`.** 프로바이더의 `dir`은 그 아래 전부를 덮지만 문서 엘리먼트는 브라우저 자신의 영역입니다 — 스크롤바 위치와 네이티브 폼 컨트롤이 거기서 읽습니다. 둘 다 설정하세요.
- **폰트.** 아랍어와 히브리어에는 폰트가 필요하고, 이 라이브러리는 폰트를 싣지 않습니다.
- **`MPSide`는 물리적으로 남습니다.** 팝업의 `top`/`right`/`bottom`/`left`는 일부러 물리적입니다. 트리거 위의 툴팁은 어느 표기 방향에서든 위입니다. 논리적인 쪽은 `MPAlign`과 `MPCorner`입니다.

### 날카로운 모서리

- **방향이 섞인 페이지는 방향이 바뀌는 지점마다 프로바이더가 필요합니다.** 루트에만이 아니라요 — Base UI 컨텍스트는 트리를 따르고 CSS는 DOM을 따르므로 둘을 같이 두세요.
- **`display: contents`도 엘리먼트를 렌더합니다.** 레이아웃에는 참여하지 않지만 DOM에는 있습니다. 직접 쓴 `> *` 셀렉터는 이걸 셉니다.

## 다음

- [Prop 규약](../design/prop-conventions.md) — `size`와 `color`가 뜻하는 것.
- [색](../design/color.md) — 테마의 나머지 절반인 토큰 쪽.
- [훅](./hooks.md) — 컴포넌트 없이 공개된 나머지.
