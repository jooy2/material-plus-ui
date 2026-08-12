---
title: MPIconButton
order: 1
---

# MPIconButton

<p class="mp-lede">글리프 하나만 들어 있는 둥근 버튼. 거의 전부가 <code>MPButton</code>이고, 여기서 더하는 건 기본값을 정할 수 없으면서 항상 빠져 있는 딱 하나 — 이름입니다.</p>

<Demo src="icon-button/hero" :minHeight="72" />

```tsx
import { ICONS, MPIcon, MPIconButton } from 'material-plus-ui';

<MPIconButton icon={<MPIcon icon={ICONS.more} />} label="추가 작업" onClick={open} />;
```

## Props

<PropsTable name="MPIconButton" />

## `label`이 필수인 이유

"`aria-label` 없는 아이콘 버튼"은 컴포넌트 라이브러리가 내보내는 접근성 결함 중 단연 가장 흔한 것이고, 다른 해결책은 전부 실패하기 때문입니다.

기본값을 두면 누구에게도 맞지 않는 이름이 됩니다. 개발 중 경고는 바쁜 프로젝트의 콘솔에서 걸러지는 것입니다. 문서는 이미 알고 있던 사람이 읽습니다. **필수 prop**은 이것들 중 코드 리뷰에서 살아남는 유일한 형태입니다. 없으면 컴파일이 되지 않으니까요.

이름은 읽히기만 하고 그려지지 않습니다. 화면에 있는 것은 글리프가 전부입니다.

## 여기 있는 게 이렇게 적은 이유

모양은 이 컴포넌트가 정하는 게 아닙니다. 아이콘만 있고 children이 없는 [`MPButton`](./button)은 이미 정사각형이 되고, 이미 `corner-full`입니다 — 2021년부터 머터리얼 버튼은 알약이었으니까요. 정사각형 알약은 원입니다. MD3의 아이콘 버튼 모양은 버튼 자신의 토큰에서 따라 나오고, 맞춰 둬야 할 두 번째 표는 생기지 않습니다.

나머지도 전부 버튼의 것이고, 의도적으로 그대로입니다. 다섯 가지 variant, 네 계열, 크기 사다리, state layer, `loading`, 그리고 주변 [`MPButtonGroup`](./button-group)이 정하는 값들.

같은 표면을 서로 다른 두 벌의 표에서 그리는 두 컴포넌트는, 언젠가 반드시 서로 다른 말을 하게 됩니다.

## 기본 variant가 버튼과 다른 이유

`MPButton`은 `filled`에서 시작합니다. 이쪽은 `text`에서 시작하고, 그게 MD3의 _standard_ 아이콘 버튼 — 컨테이너가 아예 없는 글리프입니다.

이유에 대해서는 명세가 옳습니다. 라벨이 붙은 버튼은 보통 그 줄에서 누를 만한 유일한 것이지만, 아이콘 버튼은 보통 툴바나 카드 모서리에 여럿이 앉아 있습니다. 채워진 원반 다섯 개가 한 줄에 늘어서면 그 줄에는 강조가 하나도 남지 않습니다. 아이콘 버튼이 그 화면의 액션 **자체**일 때 `filled`를 꺼내세요.

<Demo src="icon-button/variants" :minHeight="220">

<<< @/.vitepress/demos/icon-button/variants.tsx

</Demo>

## 토글 상태는 없습니다

MD3에는 선택되면 컨테이너와 잉크를 바꾸는 _toggle_ 아이콘 버튼도 있습니다. 이건 그게 아니고, `selected` prop을 달면 반쪽짜리가 됩니다.

토글에는 이 컴포넌트에 없는 세 가지가 필요합니다. 누른 뒤에도 남는 눌림 상태, 여럿 중 하나만 고르도록 강제하는 그룹, 그리고 **상태에 따라 바뀌는 이름**. "즐겨찾기에 추가"와 "즐겨찾기에서 제거"는 다른 문장이고, 둘 중 하나만 유지하는 토글은 절반의 시간 동안 거짓말을 하는 컨트롤입니다.

여러 개라면 [`MPSegmentedButton`](./segmented-button)이고, 하나뿐이라면 `icon`과 `label`을 직접 상태에서 끌어오는 `MPIconButton`입니다.

```tsx
<MPIconButton
  variant={starred ? 'tonal' : 'text'}
  icon={<MPIcon icon={starred ? ICONS.success : ICONS.add} />}
  label={starred ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
  aria-pressed={starred}
  onClick={() => setStarred(!starred)}
/>
```

## 예시

### size

다섯 단계로, 모든 컨트롤이 그려지는 그 단계와 같습니다. `xs`의 아이콘 버튼은 32px 정사각형이고, 이 라이브러리가 그리는 가장 작은 과녁입니다. 그 아래로 가면 컨트롤이 24px 터치 타깃을 만족하지 못합니다.

글리프는 따로 말하지 않는 한 **함께 커지지 않습니다**. `icon`은 버튼의 `startIcon`과 정확히 같게 배치되므로, 기본 24px이 그 단계에 맞지 않으면 크기를 지정한 `MPIcon`을 넘기세요.

### loading

스피너가 글리프 자리를 대신하고, 버튼은 자기 footprint와 탭 순서 안의 자리를 지킵니다.

```tsx
<MPIconButton icon={<MPIcon icon={ICONS.upload} />} label="업로드" loading />
```

의도적으로 `disabled`가 아닙니다. 누르는 순간 탭 순서에서 사라지는 버튼은 키보드 포커스를 데리고 사라지고, 방금 보낸 요청이 아직 날아가는 중인데 읽는 사람은 문서 맨 위로 돌아가 있게 됩니다.

## 접근성

- `label`은 `aria-label`이 되고, 그게 버튼의 접근성 이름입니다. 그것 없이 렌더링할 방법은 없습니다.
- `disabled`는 native 속성을 써서 탭 순서를 떠나고, `loading`은 `aria-disabled`를 써서 떠나지 않습니다.
- 포커스 표시는 `secondary`이고 원반 **바깥**에 그려집니다. MD3 자신의 규칙이기도 합니다 — 채워진 버튼 안쪽에 그린 링은, 구별하려던 그 채움 위에 그린 링입니다.

## 함께 보기

- [MPButton](./button) — 이 컴포넌트를 이루는 전부.
- [MPButtonGroup](./button-group) — 여러 개의 `size`, `color`, `variant`를 한 번에 정합니다.
- [MPTooltip](../feedback/tooltip) — 이름을 접근성 트리뿐 아니라 화면에도 띄우고 싶을 때.
