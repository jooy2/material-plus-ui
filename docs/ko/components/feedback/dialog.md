---
title: MPDialog
order: 4
---

# MPDialog

<p class="mp-lede">답할 때까지 페이지를 가져가는 시트입니다. 각 구역은 조합할 하위 컴포넌트가 아니라 prop입니다. 대화상자의 배치는 고정되어 있고 — 아이콘, 헤드라인, 보조 텍스트, 본문, 액션 — 호출자가 정하고 싶은 것은 각 칸에 무엇이 들어가는가입니다.</p>

<Demo src="dialog/hero" :minHeight="80" />

```tsx
import { MPButton, MPDialog, MPDialogClose } from 'material-plus-ui';

<MPDialog
  trigger={<MPButton>프로젝트 삭제</MPButton>}
  title="“Aurora”를 삭제할까요?"
  description="안에 있던 것도 함께 사라집니다."
  actions={
    <>
      <MPDialogClose render={<MPButton variant="text">취소</MPButton>} />
      <MPDialogClose render={<MPButton color="error">삭제</MPButton>} />
    </>
  }
/>;
```

## Props

<PropsTable name="MPDialog" />

## 시트

`corner-extra-large`의 `surface-container-high`, elevation 3 — MD3가 대화상자에 대해 내린 세 가지 선택이고, 이 라이브러리에서 세 번째 elevation을 쓰는 유일한 면입니다.

`elevation` prop이 없는 것은 `variant`가 없는 것과 같은 이유입니다. 페이지에 납작하게 놓이라고 말할 수 있는 대화상자는 대화상자이기를 그만두라고 말할 수 있는 대화상자입니다.

시트는 서서히 나타나면서 **자라납니다**. 들어올 때는 `emphasized-decelerate`로 400ms, 나갈 때는 `emphasized-accelerate`로 200ms — MD3가 정한 짝이고, [MPDrawer](../layout/drawer)가 움직이는 것과 같은 타이밍입니다.

그래서 이 라이브러리에서 움직이는 면은 이것과 드로어, 둘뿐입니다. 나머지가 따르는 규칙 — 글이 담긴 상자는 움직이면 안 된다 — 은 무언가를 _겨냥해_ 열리는 경우에 관한 것입니다. 메뉴는 포인터가 놓인 행 옆에서 열리고, 셀렉트의 목록은 방금 누른 필드를 덮습니다. 둘 중 어느 쪽이든 움직이면 이미 그쪽으로 향하던 포인터 밑에서 표적이 빠져나갑니다. 대화상자는 아무것도 겨냥하지 않고 열립니다. 자라나는 움직임이 단순한 페이드에 더해 주는 것은 방향이고, 그것이 도착한 시트와 원래 거기 있었는데 이제서야 눈에 띈 시트의 차이입니다.

명세의 80%가 아니라 95%에서 시작합니다. 확대는 이 라이브러리에서 재생 중에 글자를 다시 그리는 유일한 전환이고, 560dp 대화상자의 80%는 끝보다 56px 좁게 시작합니다. 글자가 눈에 띄게 바깥으로 움직이고 대부분의 구간에서 흐릿할 만큼 먼 거리입니다. 95%에서는 상자가 14px 움직이는데, 이것은 안의 문장이 움직이는 것이 아니라 시트가 자리를 잡는 것으로 읽힙니다.

`fullScreen`은 페이드만 합니다. 이미 창 자체인 대화상자에는 자라날 중심이 없습니다. 움직임을 덜 원한다고 밝힌 독자에게도 마찬가지입니다.

## `MPDialogClose`

uncontrolled 대화상자에는 취소 버튼이 부를 `setOpen`이 없고, 대안 — 모든 대화상자를 controlled로 만들기 — 은 버튼 하나에 답하려고 대화상자마다 상태를 하나씩 두는 일입니다.

```tsx
<MPDialogClose render={<MPButton variant="text">취소</MPButton>} />
```

`render`는 Base UI의 escape hatch이므로, 대화상자 스타일을 입은 맨 버튼이 아니라 진짜 Material Plus 버튼이 닫습니다.

## 예시

### icon

hero icon이 있으면 헤더가 가운데 정렬됩니다. MD3의 규칙이고, 장식이 아니라 진짜 구분입니다. 아이콘이 있는 대화상자는 무언가를 **알리고** 있고, 없는 대화상자는 무언가를 **묻고** 있습니다.

<Demo src="dialog/icon" :minHeight="80">

<<< @/.vitepress/demos/dialog/icon.tsx

</Demo>

### dividers

스크롤되는 것은 본문뿐이고 헤더와 액션은 그대로 있습니다. 본문이 스크롤되기 시작하는 순간 `dividers`를 켜세요 — 여백만으로는 헤드라인이 왜 함께 움직이지 않았는지 설명하지 못하게 됩니다.

<Demo src="dialog/scrolling" :minHeight="80">

<<< @/.vitepress/demos/dialog/scrolling.tsx

</Demo>

### size와 width

`size`는 타입 스케일과 시트가 커질 수 있는 최대 너비를 정합니다 — `md`가 MD3의 560dp입니다. 둘이 아니라 한 축인 이유는, `maxWidth`라는 두 번째 다섯 단계 스케일이 라이브러리에 이미 이름이 있는 개념의 두 번째 표기가 되기 때문입니다.

`width`는 *내용*이 너비를 정하는 대화상자를 위한 탈출구입니다. 넓은 표, 좁은 확인 창.

<Demo src="dialog/sizes" :minHeight="80">

<<< @/.vitepress/demos/dialog/sizes.tsx

</Demo>

### fullWidth

기본값이 켜짐이고, 라이브러리의 다른 모든 컴포넌트와 반대입니다. 다른 곳에서 `fullWidth`는 "컨테이너를 채운다"는 뜻인데, 대화상자의 컨테이너는 뷰포트이고 두 단어에 맞춰 줄어든 대화상자는 툴팁입니다.

### fullScreen

뷰포트를 가장자리까지 채웁니다. 휴대폰 크기 화면이나 에디터를 위한 것입니다. `showClose`가 이 값을 따르는 이유는 전체 화면 대화상자에는 누를 스크림이 남아 있지 않기 때문입니다.

### dismissible

반드시 답해야 하는 대화상자에서는 끄되, 답할 액션을 함께 주세요. 다른 출구가 없어집니다.

```tsx
<MPDialog
  dismissible={false}
  title="세션이 만료되었습니다"
  actions={<MPButton>다시 로그인</MPButton>}
/>
```

## 접근성

- title이 대화상자의 이름이 되고 description이 설명이 됩니다. 둘 다 Base UI가 연결하므로 직접 쓸 `aria-labelledby`는 없습니다.
- 포커스 트랩, 스크롤 잠금, 뒤 페이지의 inert 처리, 닫을 때 트리거로 포커스를 되돌리는 일은 Base UI가 가집니다.
- `dismissible`이 꺼져 있지 않으면 Escape로 닫힙니다. 꺼져 있을 때는 키를 삼키는 것이 아니라 변경의 이유를 취소하므로, 대화상자 안의 대화상자에서도 옳은 쪽이 닫힙니다.

## 함께 보기

- [MPOverlay](./overlay) — 시트도 답할 것도 없는, 스크림 그 자체.
- [MPSnackbar](./snackbar) — 결정할 것이 아니라 일어난 일을 알릴 때.
