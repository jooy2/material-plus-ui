---
title: MPAnimateSplit
order: 14
---

# MPAnimateSplit

<p class="mp-lede">한 줄이 단어 단위 또는 글자 단위로 도착합니다. 문자열을 위한 <a href="./animate-appear">MPAnimateAppear</a>입니다 — 같은 자리잡기를, 호출하는 쪽이 적어 둔 자식이 아니라 문장의 조각들에 대해.</p>

<Demo src="animate-split/hero" :minHeight="360" />

```tsx
import { MPAnimateSplit } from 'material-plus-ui';

<MPAnimateSplit>이번 분기에 만든 것</MPAnimateSplit>;
```

## Props

<PropsTable name="MPAnimateSplit" />

## 조각은 읽는 사람이 자를 자리에서 잘립니다

`split(' ')`도 아니고 `[...text]`도 아닙니다.

**단어** 경계는 미얀마 동쪽 어디에서도 공백이 아닙니다. 일본어, 중국어, 태국어, 크메르어, 라오어는 공백 없이 씁니다. 그래서 공백으로 쪼개면 문장 전체가 조각 하나로 돌아오고, 효과는 아무 일도 하지 않습니다. 조용히, 그리고 하필 그것을 시험하는 사람이 알아차리지 못할 언어들에서요.

**글자**는 코드 포인트가 아닙니다. `👩‍👩‍👧`는 zero-width joiner로 이어진 코드 포인트 일곱 개이고, 붙여넣기가 아니라 타자로 친 한글 음절은 세 개일 수 있으며, 국기는 두 개입니다. 코드 포인트 단위로 쪼개는 구현은 그 조각 하나하나에 각자의 delay를 주고, 독자는 이모지가 그 자체로는 아무 뜻도 없는 부품들로 조립되는 것을 보게 됩니다.

`Intl.Segmenter`는 두 경계를 다 알고, `internal/text.ts`가 이 라이브러리에서 그것을 묻는 유일한 자리입니다. [MPAnimateTyping](./animate-typing), [MPAnimateScramble](./animate-scramble)과 공유합니다. 사본이 셋이면 의견도 셋이 되기 때문입니다.

## 스크린 리더가 받는 것

잘린 상자에서 나오는 온전한 한 줄, 한 번. 애니메이션되는 사본은 `aria-hidden`입니다.

그것이 없으면 글자 단위로 쪼갠 줄은 **낱글자 목록**으로 읽히고, 효과를 볼 수 없는 독자는 문장이 무슨 말이었는지 알아내기 위해 그 공연을 끝까지 앉아 있어야 합니다. 페이지 내 찾기도 여전히 문장에 매치됩니다. 한 글자짜리 span 더미로는 그렇게 되지 않습니다.

## 글자는 자기 단어 안에 머뭅니다

조각이 움직이려면 `inline-block`이어야 합니다. transform은 대체되지 않은 인라인 상자에 아무 일도 하지 않기 때문입니다. 그런데 그것은 동시에 **줄바꿈 기회**를 만들어서, 글자로 쪼갠 줄은 단어 한가운데에서 줄이 바뀝니다.

그래서 각 단어가 자기 inline-block이 되고 글자들은 그 안에 들어갑니다. 줄은 원래 바뀌던 자리에서 바뀝니다. 공백은 버리지 않고 단어에 붙여 두므로, 조각들은 여전히 넘겨받은 문자열로 다시 이어집니다.

## 예제

### by

기본은 `word`입니다. `character`는 더 센 효과이고 아껴 써야 합니다. 조각이 대여섯 배로 늘어나므로 훨씬 작은 `stagger`를 원하고, 짧은 헤딩보다 긴 것에 쓰면 읽는 것이 아니라 기다리는 것이 됩니다.

### stagger, durationStep, reverse

여섯 개의 단일 keyframe 효과가 받는 것과 같은 셋을, 자식이 아니라 조각에 대해. `stagger`가 효과의 전부이고, `durationStep`은 착지하면서 집합이 퍼지거나 모이게 하며, `reverse`는 줄을 마지막 조각부터 재생하되 각 조각은 그대로 앞으로 갑니다.

### from, distance, fade

조각 하나가 하는 일이고, [MPAnimateAppear](./animate-appear)의 것과 같습니다. 이동 거리는 일부러 짧습니다. 조각 마흔 개에 걸친 긴 이동은 도착하는 문단이 아니라 _움직이는_ 문단입니다.

### timeline

`timeline="view"`는 모든 조각을 각자의 스크롤포트 여정에 올립니다. 그래서 줄은 시계가 아니라 독자가 거기 닿는 대로 완성됩니다. [스크롤이 곧 시계입니다](./animate-fade#스크롤이-곧-시계입니다)를 보세요.

## 접근성

- `prefers-reduced-motion`에서는 애니메이션이 빠지고 줄은 온전히 그냥 거기 있습니다.
- **텍스트**만 쪼개집니다. 자식 중 요소는 자기 텍스트만 기여하고 마크업은 아무것도 기여하지 않습니다. 링크의 절반에 각자의 delay를 주는 정직한 방법은 없기 때문입니다.

## 함께 보기

- [MPAnimateAppear](./animate-appear) — 문자열이 아니라 자식들에 대한 같은 효과.
- [MPAnimateTyping](./animate-typing) — 도착하는 줄이 아니라 씌어지는 줄에.
- [MPAnimateScramble](./animate-scramble) — 첫 프레임부터 완성된 길이로, 노이즈에서 가라앉는 줄에.
