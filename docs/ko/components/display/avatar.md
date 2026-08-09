---
title: MPAvatar
order: 4
---

# MPAvatar

<p class="mp-lede">사람이나 사물의 사진을, 아는 크기로, 절대 빈 상자가 되지 않게 그립니다. 사진이 없거나 늦으면 이니셜이 대신하고, 이니셜도 없으면 실루엣이 대신합니다.</p>

<Demo src="avatar/hero" :minHeight="120" />

```tsx
import { MPAvatar } from 'material-plus-ui';

<MPAvatar src="/jane.jpg" name="Jane Doe" />
<MPAvatar name="홍길동" color="tertiary" />
<MPAvatar shape="square" variant="outlined" initials="MP" />;
```

## Props

<PropsTable name="MPAvatar" />

모든 native `<span>` 속성이 그대로 전달되고, `ref`는 루트에 닿습니다.

## 그릴 수 있는 것은 셋, 한 번에 하나입니다

`src`가 있고 잘 불러와졌다면 사진. 아니면 그것을 대신할 것 — `children`, `initials`, 또는 `name`에서 파생한 이니셜. 셋 다 없으면 실루엣.

어느 것이 보일지는 Base UI의 `Avatar`가 정합니다. "이미지가 불러와졌는가"는 답이 넷이고 그 사이에 경합이 있는 질문이기 때문입니다. `onLoadingStatusChange`가 그 넷을 알려주고, `delay`는 캐시된 이미지가 걸리는 시간만큼 대체 표시를 붙잡아 둡니다. 그러면 어차피 곧 도착할 사진 앞에서 이니셜이 깜빡이지 않습니다.

## `name`은 세 가지 일을 합니다

사진의 이름이 되고, 이니셜이 여기서 파생되고, 스크린 리더가 그 이니셜 **대신** 듣는 문장이 됩니다.

마지막 것이 핵심입니다. `JD`를 소리 내어 읽으면 두 글자이지 사람이 아닙니다. 그래서 이름이 있으면 그 이름이 대체 표시의 접근성 이름이 되고, 이니셜은 자신이 대신하고 있는 그림으로 남습니다.

규칙은 첫 단어의 첫 글자와 마지막 단어의 첫 글자입니다.

| `name`         | 이니셜 |
| -------------- | ------ |
| `Jane Doe`     | `JD`   |
| `Ada Lovelace` | `AL`   |
| `홍길동`       | `홍`   |
| `🚀 Team`      | `🚀T`  |

한 단어면 한 글자인 것은 의도한 것입니다. 한국어·일본어·중국어 이름은 한 덩어리이고, 32px에서 두 글자는 얼룩이지만 한 글자는 이름입니다. 기본 다국어 평면 밖의 문자를 두 코드 유닛 사이에서 자르지 않고, macOS 파일 이름과 여러 API가 건네는 분해된 결합 문자도 `A`가 아니라 `Ä`로 만듭니다.

규칙이 틀렸을 때는 `initials`로 직접 씁니다.

## 예시

### size

컨트롤 높이입니다. 그래서 툴바에서 아바타와 그 옆 버튼의 높이가 같습니다.

<Demo src="avatar/sizes">

<<< @/.vitepress/demos/avatar/sizes.tsx

</Demo>

이니셜은 행이 아니라 상자를 기준으로 크기가 정해집니다 — 지름의 약 40%인데, 두 글자가 가장자리에 닿지 않으면서 너비를 채우는 지점입니다. 각 단계는 여전히 보간한 크기가 아니라 머터리얼의 역할입니다.

### shape

`circle`이 기본값이고 머터리얼이 그리는 모양입니다. `square`는 대신 `corner-medium`으로 모서리를 깎습니다. 로고나 저장소 아이콘이 원하는 모양인데, 그것들은 사각형의 가장자리까지 그려져 있어서 둥근 크롭이 잘라 먹습니다.

### variant

`tonal`이 기본값인 이유는 MD3가 모노그램을 올리는 면이 그것이기 때문입니다. 강조 색 계열의 container 색과 짝이 되는 `on-` 잉크입니다. `filled` 아바타로 채운 페이지는 아무도 이름을 읽어낼 수 없는 진한 원들의 페이지입니다.

## 상태 점은 없습니다

초록 점이 붙은 아바타는 아바타를 담은 [MPBadge](./badge)입니다. 그것을 위한 두 번째 표기를 만들면 라이브러리에 같은 것이 둘 생깁니다.

```tsx
<MPBadge dot color="tertiary" overlap="circle" placement="bottom-end" label="접속 중">
  <MPAvatar name="홍길동" />
</MPBadge>
```

## 함께 보기

- [MPBadge](./badge) — 모서리에 붙는 표시.
- [MPList](./list) — 아바타가 보통 도착하는 곳, `startIcon`.
