---
title: MPStepper
order: 22
---

# MPStepper

<p class="mp-lede">한 번에 하나의 패널로, 지금 밟아 나가는 중인 순서.</p>

<Demo src="stepper/hero" :minHeight="300">

<<< @/.vitepress/demos/stepper/hero.tsx

</Demo>

```tsx
import { MPStep, MPStepper } from 'material-plus-ui';

const [step, setStep] = useState(0);

<MPStepper active={step} onActiveChange={setStep}>
  <MPStep label="Account">…</MPStep>
  <MPStep label="Payment">…</MPStep>
  <MPStep label="Done">…</MPStep>
</MPStepper>;
```

## Props

<PropsTable name="MPStepper" />

### MPStep

<PropsTable name="MPStep" />

## `MPTimeline`과 무엇이 다른가

둘은 같은 표에서 같은 그림을 그립니다 — 불릿, 커넥터, 그것들이 놓인 사다리는 [`internal/step.ts`](https://github.com/jooy2/material-plus/blob/main/src/internal/step.ts) 한 파일입니다. 두 개의 표가 지키는 그림은 둘 중 하나가 혼자 수정되는 순간 어긋나기 때문입니다.

둘이 별개인 이유는 하는 일이 둘이기 때문입니다.

|           | [`MPTimeline`](./timeline.md) | `MPStepper`      |
| --------- | ----------------------------- | ---------------- |
| 순서는    | 일어났다                      | 지금 밟는 중이다 |
| 스텝은    | 읽힌다                        | 눌린다           |
| 내용은    | 전부 화면에                   | 패널 하나        |
| 기본 방향 | `vertical`                    | `horizontal`     |

`onActiveChange`가 **없는** 스테퍼가 겹치는 지점입니다. 누를 수 없고, 여전히 패널은 하나이며, 애플리케이션 자신의 버튼이 모는 순서를 위한 진행 표시기입니다.

## Next와 Back을 싣지 않습니다

일부러입니다. 다른 라이브러리를 읽던 사람이 여기서 찾을 것으로 기대하는 유일한 것이기도 합니다.

*다음*이 무엇을 뜻하는지는 지금 스텝이 유효한지의 문제입니다. 그 버튼을 그리는 라이브러리는 그것을 추측하거나 스텝마다 validator를 요구해야 하는데, 그건 이미 쓴 폼을 두 번째 방식으로 다시 쓰는 일입니다. `onActiveChange`와 `MPButton` 두 개면 네 줄이고, 그 네 줄은 호출자가 읽을 수 있습니다.

```tsx
<MPButton variant="text" disabled={step === 0} onClick={() => setStep(step - 1)}>
  Back
</MPButton>
<MPButton disabled={!isValid} onClick={() => setStep(step + 1)}>
  Next
</MPButton>
```

## 어디까지 갈 수 있는가

`linear`가 누름이 닿을 수 있는 스텝을 정하고, 기본이 켜짐인 이유는 그게 바로 *순서*이기 때문입니다. 주소보다 결제를 먼저 누르게 하는 체크아웃은 완료할 수 없는 스텝을 내주는 셈입니다.

**뒤로 가는 것은 언제나 허용됩니다.** 선형 스테퍼가 거절하는 것은 읽는 사람이 실제로 도달한 지점보다 앞으로 건너뛰는 것이고, "실제로 도달한"은 현재가 아니라 **가장 멀리** 간 스텝입니다. 3단계까지 갔다가 1단계로 돌아온 사람은 여전히 3단계로 갈 수 있습니다. `active`만 아는 스테퍼는 그 사람이 뒤를 돌아본 순간 그것을 빼앗았을 것입니다.

`linear={false}`는 언제든 어디든 닿습니다 — 설정 마법사, 읽는 사람이 돌아다닐 수 있게 구획을 나눈 긴 폼.

닿을 수 없는 스텝은 제거되지 않고 `aria-disabled`로 표시됩니다. 레일을 훑는 사람은 구멍을 발견하는 대신 _왜_ 열리지 않는지를 듣습니다.

## 상태

<Demo src="stepper/states" :minHeight="420">

<<< @/.vitepress/demos/stepper/states.tsx

</Demo>

완료된 스텝은 번호 대신 **체크**를 그리고, 실패한 스텝은 에러 글리프를, 나머지는 걸어오면서 매겨진 번호를 그립니다. `bullet`이 셋 모두를 덮어씁니다.

`error`는 강조 색 계열을 바꾸고 **스텝을 순서 안에 그대로 둡니다**. 스텝이 순서의 어디에 있는지와 그것에 무슨 일이 있었는지는 서로 다른 두 질문이라서, 실패는 네 번째 상태가 아니라 색입니다 — 그리고 구멍 난 순서는 읽는 사람이 셀 수 없는 순서입니다.

`optional`은 boolean이 아니라 노드이고, 이건 사소한 차이가 아닙니다. boolean이었다면 이 라이브러리가 *Optional*이라는 **단어**를 싣고, 일부 애플리케이션만 그리는 라벨을 위해 열여덟 개 언어의 번역을 갖게 됩니다. 그 단어는 이미 여러분의 카피에, 여러분의 언어로 있습니다.

## 패널

활성 스텝의 `children`, 그리고 그것뿐입니다 — 속한 스텝 안이 아니라 리스트 **바깥**에 그려집니다. 폼 전체를 담은 `<li>`는 레일을 패널만큼 높게 만들고, 그러면 가로 레일은 스텝의 행이 아니라 열의 행이 됩니다.

한 번에 하나의 패널만 마운트됩니다. 그게 스테퍼가 가지고 타임라인이 갖지 않는 절반이고, 폼에서 중요한 절반입니다. 나머지 패널을 마운트해 두면 숨겨진 필드가 여전히 제출됩니다.

## 날카로운 모서리

- **스텝의 인덱스는 prop이 아니고, 될 수도 없습니다.** 스테퍼가 자식들을 걸으면서 번호를 매깁니다. [`MPTimelineItem`](./timeline.md)이 말하는 이유와 같습니다 — 자기가 목록의 어디인지 들어야 하는 스텝은 모든 호출자가 잘못 놓을 수 있는 스텝입니다.
- **`horizontal`은 라벨이 짧은 동안만 정직합니다.** 레일은 너비를 균등하게 나누므로, 한 스텝의 다섯 단어짜리 라벨이 행 전체의 높이를 정합니다. 스텝마다 설명이 붙는 형태는 `vertical`입니다.
- **패널 하나는 정말로 하나입니다.** 활성이 아닌 스텝 안의 상태는 그 스텝과 함께 언마운트됩니다. 걷는 동안 살아남아야 하는 것은 위로 올리세요.

## 다음

- [MPTimeline](./timeline.md) — 이미 일어난 순서를 위한, 같은 그림.
- [MPTabs](../layout/tabs.md) — 순서가 상관없을 때의 한 번에 한 패널.
