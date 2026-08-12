---
title: MPPill
order: 13
---

# MPPill

<p class="mp-lede">지금 살아 있는 정보를 조금 담아 떠 있는 알약 모양입니다 — 통화 중, 아직 진행 중인 업로드, 녹음, 2분 뒤 도착하는 열차.</p>

<Demo src="pill/hero" :minHeight="200" />

```tsx
import { MPPill } from 'material-plus-ui';

<MPPill
  title="통화 중"
  description="04:12"
  expanded={expanded}
  onClick={() => setExpanded(!expanded)}
  details="에이다, 그레이스 외 2명."
/>;
```

## Props

<PropsTable name="MPPill" />

## 명세에 없는 컴포넌트입니다

MD3에는 이 모양이 없습니다. 라이브러리가 그래도 제공하는 이유는 [MPProgressBox](../feedback/progress-box)와 같습니다. 명세 자신의 부품으로 그릴 수 있는 실제 필요가 있는데, 이 세트의 어떤 컴포넌트도 그것을 그리지 않기 때문입니다.

이것이 _쓰이는 곳_ 은 어느 한 컨트롤에 관한 것이 아닌 페이지의 상태입니다. [스낵바](../feedback/snackbar)는 무슨 일이 있었다고 말하고 떠납니다. [얼럿](../feedback/alert)은 페이지의 흐름에 속합니다. [배지](./badge)는 컨트롤 위의 개수를 셉니다. 필은 그중 어느 것도 아닙니다. **아직 진행 중인** 무언가이고, 그것이 끝날 때까지 남습니다.

## 모양, 그리고 이것이 굽히는 하나의 규칙

접힌 필은 스타디움 — `corner-full` — 입니다. 이 라이브러리의 다른 모든 시트는 일부러 그 앞에서 멈춥니다.

여기서 허용되는 이유는 규칙이 존재하는 이유와 같습니다. 머터리얼에서 반지름은 이것이 어떤 종류의 물건인지를 말하는데, 이건 페이지 위에 놓인 시트가 아닙니다. 페이지 위에 떠 있는 물건이고, 페이지 위에 떠 있는 물건이 페이지와 같은 재료에서 잘려 나온 것처럼 보여서는 안 됩니다.

`details`를 열면 모서리가 `corner-extra-large`로 옮겨 가고, 그 이동은 전환됩니다. 이것도 장식이 아닙니다. 여섯 줄로 자란 상자에서 `corner-full`은 높이의 3분의 1쯤 되는 모서리이고, 그러면 모든 줄의 첫 두 단어가 잘려 나갑니다. 필은 알약에서, 시트 사다리가 가진 가장 큰 모서리를 두른 둥근 사각형으로 변형됩니다. 그 크기에서라면 처음부터 그랬어야 할 모양입니다.

두 값 모두 토큰이라서, [`data-mp-shape`](../../guide/getting-started#shape)로 척도를 옮긴 페이지에서는 이것들도 함께 움직입니다.

## 모든 variant가 그림자를 가집니다

<Demo src="pill/variants" :minHeight="140">

<<< @/.vitepress/demos/pill/variants.tsx

</Demo>

`elevated` 단계가 다른 것들로 새어 나온 게 아닙니다. 높이는 이 모양이 **무엇인가**의 일부입니다. 자기가 떠 있는 내용 위에 평평하게 놓인 알약은 실수처럼 읽힙니다. 그래서 여기서 `elevated`가 더하는 것은 들어 올림이 아니라 중립 표면입니다.

`variant`는 컨테이너가 아니라 **컨트롤**의 사다리입니다. 필은 스스로가 칠해지는 대상이니까요. [버튼](../inputs/button)이나 [칩](./chip)에서와 똑같이, `filled`는 강조 색 위에 그에 맞는 잉크를 얹습니다.

## details, 그리고 높이를 관찰하는 이유

`details`는 잰 높이를 애니메이션해서 드러납니다. [아코디언](../layout/accordion) 패널과 같은 방식이지만, 재는 쪽이 한 번만 재는 측정이 아니라 `ResizeObserver`입니다.

살아 있는 정보는 화면에 있는 동안 바뀌는 종류의 내용입니다. 열린 뒤에 상세가 자란 필은 그러지 않으면 도착 당시의 높이에서 잘립니다.

닫혀 있는 동안 패널은 `inert`입니다. 속성 하나로 그 안의 내용을 탭 순서에서, 접근성 트리에서, 그리고 페이지의 텍스트 선택에서 한꺼번에 빼냅니다. `aria-hidden`만으로는 스크린 리더가 없다고 들은 링크로 키보드 사용자가 탭해 들어가게 됩니다.

## 예시

### position

기본은 `static`입니다. `sticky`는 스크롤 컨테이너의 한쪽 가장자리에 붙여 두고, `fixed`는 뷰포트에 고정하고 가운데로 보냅니다 — 이 모양이 존재하는 배치입니다.

```tsx
<MPPill position="fixed" side="bottom" title="녹음 중" description="00:42" />
```

자기 너비의 절반만큼 이동시키는 대신 뷰포트를 가로지르는 상자에 `mx-auto`로 가운데를 잡습니다. auto 마진에는 방향성이 없으므로 RTL에서도 알약이 가운데에 남고, 표면은 아무것도 변형되지 않습니다.

### onClick과 endIcon

`onClick`을 넘기면 **가운데**가 진짜 `<button>`이 됩니다. `endIcon`은 그 바깥에 남아서 자기 컨트롤을 담을 수 있습니다.

```tsx
<MPPill
  title="통화 중"
  onClick={expand}
  endIcon={<MPIconButton size="xs" variant="text" icon={…} label="통화 종료" />}
/>
```

[MPChip](./chip)이 쓰는 모양이고, 이유도 같은 둘입니다. 클릭 핸들러를 단 `<div>`는 키보드에 보이지 않고, `<button>` 안의 `<button>`은 브라우저가 파싱하면서 고쳐 쓰는 마크업입니다.

### children

`title`과 `description`으로 말할 수 없는 것을 가운데에 넣습니다 — 작은 수치 두 개, 살아 있는 카운터, 진행 표시. 그 아래, 같은 가운데 정렬 열에 그려집니다.

## 접근성

- 누를 수 있는 부분은 필 자신의 텍스트를 이름으로 가진 진짜 `<button>`이고, 두 번째 배경 대신 머터리얼의 state layer를 씁니다.
- 버튼의 반지름이 `inherit`이라서 포커스 링이 알약 자신의 모서리를 따라갑니다.
- 닫힌 `details` 패널은 `inert`이므로, 보이지 않는 동안 그 안의 무엇도 탭 대상이 되지 않습니다.
- `fixed` 필은 live region이 아닙니다. 안의 정보가 바뀔 때 알릴 만하다면 그 알림을 `children`에 넣거나, 메시지를 위한 컴포넌트인 [스낵바](../feedback/snackbar)로 말하세요.

## 함께 보기

- [MPChip](./chip) — 페이지 위에 떠 있는 물건 하나가 아니라, 여럿이 늘어선 토큰.
- [MPSnackbar](../feedback/snackbar) — 아직 일어나는 중이 아니라, 일어난 일.
- [MPBadge](./badge) — 컨트롤 위의 개수.
