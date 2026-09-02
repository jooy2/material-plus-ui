---
title: MPAvatarGroup
order: 16
---

# MPAvatarGroup

<p class="mp-lede">겹쳐 쌓인 아바타들, 그리고 자리에 들어가지 못한 만큼의 숫자.</p>

<Demo src="avatar-group/hero" :minHeight="200" />

```tsx
import { MPAvatarGroup, MPAvatar } from 'material-plus-ui';

<MPAvatarGroup max={4} total={12}>
  <MPAvatar name="Ada Lovelace" />
  <MPAvatar name="Alan Turing" />
</MPAvatarGroup>;
```

## Props

<PropsTable name="MPAvatarGroup" />

## 그룹이 한 번에 정하는 것

`size`, `shape`, `variant`, `color`는 아바타마다가 아니라 **여기서** 정합니다. 네 번째 얼굴만 한 단 어긋난 스택은 스택이 아니고, 자식 여섯에 prop 넷을 되풀이하는 것은 자식당 네 번의 틀릴 기회입니다.

<Demo src="avatar-group/sizes" :minHeight="320">

<<< @/.vitepress/demos/avatar-group/sizes.tsx

</Demo>

아바타 자신의 prop은 여전히 이깁니다. 그래서 그중 하나를 나머지와 구별해 둘 수 있습니다. 말하고 있는 사람, 내 계정, 실패한 것.

[MPButtonGroup](../inputs/button-group)이 하는 것과 같은 배치이고 근거도 같습니다. 그룹은 **폴백**으로 읽히므로, "그룹에 설정하지 않음"이 기본값으로 변하지 않고 "아바타 자신의 기본값을 쓰라"는 뜻으로 남습니다.

## 링은 장식이 아닙니다

비슷한 톤의 원 둘을 겹쳐 놓으면 그 사이에 경계가 아예 없고, 스택은 하나로 뭉개진 형태로 읽힙니다.

링은 페이지 자신의 `surface`로 그려지므로, 얼굴을 나누는 것은 그 위에 칠한 흰 선이 아니라 **비쳐 보이는 배경**입니다. 다크 스킴에서는 아무도 말하지 않아도 페이지와 함께 어두워집니다.

그룹의 `isolate`가 나머지 절반입니다. 첫 아바타의 링이 그룹이 올라앉은 무언가가 아니라 페이지를 상대로 칠해지게 만듭니다.

## max와 total

`max`는 몇 개를 그릴지입니다. 그 뒤는 전부 숫자가 됩니다. 맨 숫자가 아니라 아바타로요. 스택의 마지막 것이고, 같은 크기의 같은 원이어야 합니다. 그렇지 않으면 그 줄이 그 줄의 일부가 아닌 것으로 끝납니다.

손에 잡을 값어치가 있는 것은 `total`입니다. 그것이 없으면 자식 수로 계산하는데, 그건 **전부**를 넘겼을 때만 맞습니다.

```tsx
// 사람 마흔 명, <img> 태그 넷.
<MPAvatarGroup max={4} total={people.length}>
  {people.slice(0, 4).map((person) => (
    <MPAvatar key={person.id} name={person.name} src={person.avatar} />
  ))}
</MPAvatarGroup>
```

## 첫 번째 아바타가 맨 위입니다

각 아바타는 앞의 것 아래에 그려집니다. 그래서 시작부터 읽는 스택은 앞에서 뒤로 읽는 스택이고, 그룹이 _무엇에 관한 것인지_ 를 말하는 사람이 마지막이 아니라 처음에 옵니다.

이것은 문서 순서의 **반대**입니다. 뒤에 오는 형제가 앞의 것 위에 그려지기 때문입니다. 그래서 모든 아바타가 맨 앞부터 거꾸로 세어 내려가는 `z-index`를 답니다. 문서에 맡기면 뒤에서 앞으로 그려지고, 그나마도 스택 안의 무언가가 자기 `z-index`를 갖는 순간까지만 유지됩니다.

숫자는 더미 위에 얹은 라벨이 아니라 더미의 마지막 카드입니다. 그것도 이 줄의 일부이고, 마지막 항목만 자기가 속한 쌓임에서 떠 있는 스택은 예외가 하나 있는 스택입니다.

깊이는 `size`와 `shape`가 오는 것과 같은 컨텍스트로 아바타에 전달됩니다. 그래서 호출자가 넘긴 자식에는 손대지 않습니다. `MPAvatar`가 아닌 자식 — 라우터의 링크로 감싼 것, 툴팁의 트리거 — 은 깊이를 받지 않고 문서가 주는 순서를 그대로 유지합니다.

RTL에서는 전체가 알아서 뒤집힙니다. 겹침이 음수 `margin-left`가 아니라 논리적 마진이기 때문입니다.

## 접근성

- 각 아바타는 자기 `name`으로 스스로를 알리므로, 스택은 글자의 행이 아니라 사람의 목록입니다. [MPAvatar](./avatar#접근성)를 보세요.
- `+3`은 숫자이고 그뿐입니다. 자기 이름이 없습니다. "플러스 삼"이 그것이 말하는 것이자 뜻하는 것이기 때문입니다.
- 그룹에는 역할이 없습니다. 프로젝트 제목 옆의 얼굴 더미는 옆 문장을 위한 장식입니다. 그렇지 않을 때는 이름을 붙여 주는 것으로 감싸세요.

```tsx
<div role="group" aria-label="이 프로젝트 참여자">
  <MPAvatarGroup max={4} total={12}>
    …
  </MPAvatarGroup>
</div>
```

## 함께 보기

- [MPAvatar](./avatar) — 얼굴 하나, 그리고 그 안에 그려지는 모든 것.
- [MPBadge](./badge) — 아바타 위의 상태 점. 아바타가 들어 있는 배지입니다.
- [MPButtonGroup](../inputs/button-group) — "묶음에 대해 한 번만 정한다"는 같은 배치.
