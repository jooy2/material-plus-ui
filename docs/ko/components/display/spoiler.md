---
title: MPSpoiler
order: 14
---

# MPSpoiler

<p class="mp-lede">누군가 요청하기 전까지 가려 두는 내용입니다. 반전, 연봉 범위, 경고가 붙은 사진 — 형태로는 보이지만 실수로는 읽히지 않습니다.</p>

<Demo src="spoiler/hero" :minHeight="320" />

```tsx
import { MPSpoiler } from 'material-plus-ui';

<MPSpoiler reversible>그 사람은 처음부터 그의 여동생이었습니다.</MPSpoiler>;
```

## Props

<PropsTable name="MPSpoiler" />

## 덮개는 `display: none`이 아니라 블러입니다

그게 요점의 전부입니다. 읽는 사람은 거기에 무언가가 있다는 것과 그것이 대략 얼마만큼인지를 볼 수 있고, `maxHeight`가 있으면 잘려 있다는 것도 압니다. 할 수 없는 것은 실수로 읽는 일뿐입니다.

다만 블러만으로는 덮개가 되지 않습니다. 문단을 흩어 놓기는 하지만 색과 리듬은 남고, 10px로 흐려진 사진도 여전히 알아볼 수 있는 얼굴 사진입니다. 그래서 그 위에 페이지 자신의 `surface` 역할을 섞은 막이 한 겹 올라갑니다. 두 가지가 한꺼번에 정리됩니다. 내용은 자기 색들이 뭉개진 얼룩이 되고, 버튼은 우연히 그 아래 있던 무언가가 아니라 딛고 설 자리를 얻습니다.

컨테이너 역할이 아니라 `surface`인 이유는, 이 막이 시트가 아니라 **페이지**를 대신하고 있기 때문입니다. [MPOverlay](../feedback/overlay)의 `solid` 톤이 읽는 것과 같은 역할이고, 이유도 같습니다.

## 내용이 `inert`인 이유

가려져 있는 동안 내용은 탭으로 닿지 않고, 스크린 리더가 읽지 않으며, **페이지를 가로지르는 드래그로 선택되지도 않습니다**.

셋 다 중요합니다. Ctrl-A로 뚫리는 스포일러는 스포일러가 아니고, `aria-hidden`만으로는 스크린 리더가 없다고 들은 링크로 키보드 사용자가 탭해 들어가게 됩니다. 속성 하나가 그 전부를 처리합니다.

## 문구는 번역되어 있습니다

덮개는 이 라이브러리에서 컴포넌트 자신의 단어가 읽히기만 하는 것이 아니라 **그려지는** 유일한 자리입니다. 그래서 영어 기본값을 가진 prop이 아니라 [메시지 표](../../design/localization)에서 옵니다.

```tsx
<MPSpoiler locale="ko">가려진 내용</MPSpoiler>
// "보기", "실수로 읽지 않도록 가려 두었습니다"
```

`locale`을 생략하면 가장 가까운 [`MPLocaleProvider`](../../design/localization)를 따릅니다. `label`, `hideLabel`, `description`은 기본 문구가 맞는 문구가 아닐 때를 위한 것입니다. 채용 공고의 스포일러가 원하는 말은 "실수로 읽지 않도록 가려 두었습니다"가 아니라 "연봉 범위"입니다.

## 예시

<Demo src="spoiler/clamped" :minHeight="420">

<<< @/.vitepress/demos/spoiler/clamped.tsx

</Demo>

### maxHeight

**가려진** 상자에만 걸립니다. 흐려진 내용이 화면을 가득 채우면 아무것도 없는 화면이 되어 버릴 만큼 긴 내용에 지정하세요.

열면 제한이 풀리고 내용은 필요한 높이를 그대로 가집니다. 무언가를 보여 주면서 스크롤바 달린 상자에 남겨 두는 건 엉뚱한 질문에 답하는 일입니다.

### reversible

한 번 열린 뒤 내용 아래에 다시 가리는 버튼이 나타납니다. 기본은 꺼짐입니다. 대부분의 스포일러는 한 번 읽히고 그대로 남습니다.

### padded

가장자리까지 닿아야 하는 내용 — 사진, 영상 — 에는 꺼 두세요. 시트 자신의 모서리는 여전히 내용을 잘라내고, 덮개도 상자 전체를 채웁니다.

### action

누름이 아닌 다른 것 — 결제, 연령 확인, 권한 — 으로 열리는 스포일러를 위해 공개 버튼 전체를 대체합니다.

```tsx
<MPSpoiler revealed={unlocked} action={<MPButton onClick={verify}>연령 확인</MPButton>}>
  …
</MPSpoiler>
```

대체한 컨트롤은 직접 연결해야 합니다. `revealed`를 넘기고 자기 상태로 구동하세요. 이미 있는 버튼의 문구만 바꾸고 싶다면 훨씬 흔한 그 경우를 위한 prop이 `label`입니다.

## 접근성

- 공개 버튼은 `aria-expanded`와 내용을 가리키는 `aria-controls`를 가진 진짜 [MPButton](../inputs/button)입니다. 스크린 리더는 그 뒤에 무언가가 있고 지금은 닫혀 있다는 것을 듣습니다.
- 가려진 내용은 `inert`이므로 탭으로도, 스크린 리더로도, 선택으로도 그 안의 무엇에도 닿지 않습니다.
- 버튼 위의 안내는 평범한 텍스트라서, 읽는 사람은 결정하기 전에 무엇이 왜 가려져 있는지 읽을 수 있습니다.
- 블러는 `filter` 전환이고 `prefers-reduced-motion`에서 사라집니다. 덮개 자체는 애니메이션되지 않는데, 천천히 사라지는 스포일러는 사라지는 동안 읽히는 스포일러이기 때문입니다.

## 함께 보기

- [MPCollapsible](../layout/collapsible) — 읽는 사람을 보호하려고 숨긴 것이 아니라, 자리를 아끼려고 접어 둔 내용.
- [MPOverlay](../feedback/overlay) — 어떤 일이 벌어지고 있어서 영역을 덮는 것.
- [MPSkeleton](../feedback/skeleton) — 보류된 내용이 아니라, 아직 도착하지 않은 내용.
