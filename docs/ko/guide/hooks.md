---
title: 훅
order: 2
---

# 훅

<p class="mp-lede">라이브러리가 이미 돌리고 있던 기계에, 가져다 쓸 수 있는 이름을 붙인 것입니다. 여기 있는 것은 전부 먼저 컴포넌트 안에 있었고, 새로운 것은 이제 여러분의 코드도 같은 질문을 하고 같은 답을 받을 수 있다는 점뿐입니다.</p>

공개한 이유가 그것뿐입니다. prop이 덮는 것보다 한 번 더 판단해야 하는 페이지는 브레이크포인트·플랫폼 감지·미디어 쿼리를 다시 적어야 했고, 그 숫자는 라이브러리의 것과 일치해야 했습니다. 어긋나면 레이아웃이 딱 한 너비에서 자기 자신과 어긋나고, 아무도 이유를 못 찾습니다.

| 훅 | 답하는 것 |
| --- | --- |
| [`useMPWindowClass`](#usempwindowclass) | 창이 머터리얼의 다섯 window size class 중 어디에 있는지 |
| [`useMPReducedMotion`](#usempreducedmotion) | 읽는 사람이 모션을 줄여 달라고 했는지 |
| [`useMPShortcut`](#usempshortcut) | 키 입력이 오면 무언가를 실행 |
| [`useMPPlatform`](#usempplatform) | 읽는 사람이 어떤 키보드를 쓰는지 |
| [`useMPLocale`](../design/localization.md#3-nothing-at-all) | 트리의 이 지점에서 유효한 언어 |
| [`useMPSnackbar`](../components/feedback/snackbar.md) | 프로바이더 아래 어디서든 스낵바 띄우기 |

뒤의 둘은 자기가 읽는 프로바이더 옆에 있습니다 — 컨텍스트를 읽는 훅이 있어야 할 자리입니다. 위의 넷은 자기 컴포넌트가 없습니다.

## `useMPWindowClass`

```tsx
import { useMPWindowClass } from 'material-plus-ui';

const size = useMPWindowClass();

return size === 'compact' ? <MPDrawer>{nav}</MPDrawer> : <MPSidebar>{nav}</MPSidebar>;
```

<Demo src="hooks/window-class" :minHeight="140" />

다섯은 [`MPWindowClass`](../design/prop-conventions.md) — 600, 840, 1200, 1600dp에서 갈리는 머터리얼 자신의 사다리입니다. `MPGrid`가 흐름을 바꾸는 축이자 `MPResponsive`가 쓰여 있는 축이므로, 이 훅으로 바꾼 레이아웃과 prop으로 바꾼 그리드는 같은 너비에서 함께 바뀝니다.

| 인자       | 타입            | 기본값       | 의미                            |
| ---------- | --------------- | ------------ | ------------------------------- |
| `onServer` | `MPWindowClass` | `'expanded'` | 잴 창이 없을 때 무엇으로 답할지 |

**너비가 아니라 미디어 쿼리를 읽습니다.** `innerWidth`는 고전적인 스크롤바를 세고 미디어 쿼리는 세지 않으므로, 스크롤바가 15px인 615px 창은 CSS에게는 `medium`이고 산술에게는 `compact`입니다. 자바스크립트와 스타일시트가 딱 한 너비에서 갈라서는 레이아웃은 가장 보여 주기 어려운 종류의 버그라서, 훅은 스타일시트 쪽에 남습니다.

`resize`가 아니라 네 개의 경계를 구독하기도 합니다. 창을 500에서 1900까지 끌면 이건 네 번 깨어나고, `resize` 리스너는 같은 네 개의 답을 위해 수백 번 깨어납니다.

### 잴 창이 없을 때

서버에는 너비가 없으니 참인 답도 없고, 라이브러리가 잘 찍을 방법도 없습니다. `onServer`가 그 추측이며, 인자인 이유는 보통 애플리케이션이 더 잘 알기 때문입니다. 마케팅 사이트의 첫 페인트는 대부분 휴대폰이고, 사내 대시보드는 아닙니다.

```tsx
const size = useMPWindowClass('compact');
```

클라이언트가 hydration에서 고칩니다. 아래에 깔린 `useSyncExternalStore`가 그 정정을 React가 불평하는 불일치가 아니라 정당한 것으로 만들어 줍니다. **다만 정정은 두 번째 렌더**라서, 이걸로 내비게이션 패턴 전체를 바꾸는 컴포넌트는 첫 로드에서 그 전환이 눈에 보입니다. 그게 문제라면 애초에 첫 렌더가 틀릴 일이 없는 답을 쓰세요 — `MPGrid`의 반응형 prop과 Tailwind의 variant는 무엇이 그려지기 전에 브라우저가 풀어 줍니다.

## `useMPReducedMotion`

```tsx
const still = useMPReducedMotion();

<video autoPlay={!still} />;
```

`prefers-reduced-motion: reduce`이며, 모든 `MPAnimate*` 컴포넌트가 이미 스스로 확인하고 있는 것입니다 — 페이드는 등장이 되고, 타자기는 문장을 찍어 놓고, 마퀴는 멈춥니다. 라이브러리가 이미 지키고 있는 그 선호를 여러분의 모션도 함께 지키도록 공개했습니다. 따로 물으면 둘 중 하나가 잊습니다.

선호를 가질 사람이 없는 곳에서는 `false`입니다. 반대로 했다면 첫 페인트에서 모두의 애니메이션을 끄고 잠시 뒤 대부분에게 다시 켜는 것이 되는데, 그건 선호가 아니라 깜빡임입니다.

## `useMPShortcut`

```tsx
useMPShortcut('Mod+K', () => setOpen(true));
```

<Demo src="hooks/shortcut" :minHeight="140">

<<< @/.vitepress/demos/hooks/shortcut.tsx

</Demo>

[`MPShortcut`](../components/display/shortcut.md)이 그려 내고 [`MPCommandPalette`](../components/inputs/command-palette.md)가 묶어 쓰는 그 매처입니다. 정돈의 문제가 아닙니다. 둘은 예전에 *지금 어떤 플랫폼인가*를 따로 답했고 서로 어긋났습니다 — 페이지가 `⌘K`를 그리면서 `Ctrl+K`를 듣고 있을 수 있었습니다. 한 번만 쓰이면 그럴 수 없습니다.

| 인자 | 타입 | 기본값 | 의미 |
| --- | --- | --- | --- |
| `keys` | `string \| string[]` | — | `'Mod+K'` 또는 `['Mod', 'K']`. 배열형은 `+` 자체가 들어간 조합용 |
| `handler` | `(event: KeyboardEvent) => void` | — | 일치하면 실행 |
| `options.enabled` | `boolean` | `true` | 들고 있는 것을 언마운트하지 않고 바인딩만 끔 |
| `options.preventDefault` | `boolean` | `true` | 브라우저에게서 그 키를 가져옴 |
| `options.ignoreInputs` | `boolean` | `false` | 포커스가 입력란에 있는 동안은 발동하지 않음 |
| `options.target` | `EventTarget \| null` | window | 리스너를 어디에 붙일지 |

**`Mod`는 다섯 번째 modifier가 아니라 어떤 키의 이름입니다.** 맥에서는 Command, 나머지에서는 Control로 풀리며, 그래서 문자열 하나가 바인딩이자 라벨이 됩니다.

```tsx
<MPShortcut keys="Mod+K" />;
useMPShortcut('Mod+K', open);
```

modifier는 **양방향**으로 비교합니다. Shift까지 눌려 있으면 `Mod+K`는 발동하지 않습니다. 그 조합은 다른 것의 몫일 수 있고, 여분의 modifier를 무시하는 단축키는 받은 적 없는 키 입력을 조용히 가져가는 셈이기 때문입니다.

**`preventDefault`가 기본으로 켜져 있는** 이유는 일부 브라우저가 `Mod+K`에 자기 검색창을 두기 때문이고, 조합을 바인딩한 페이지는 그 키가 자기 것이라고 말한 것이기 때문입니다. 브라우저의 것과 _나란히_ 돌 작정인 단축키에서는 끄세요.

**`ignoreInputs`가 기본으로 꺼져 있는** 이유는 대부분의 페이지가 바인딩하는 단축키에 modifier가 있고, 검색창에 친 `Mod+K`도 여전히 "팔레트를 열어라"이기 때문입니다. **맨** 키에서 켜세요 — 검색으로 가는 `/`, 도움말의 `?` — 안 그러면 누군가 쓰던 문장 한가운데에서 그 글자가 사라집니다.

### 날카로운 모서리

- **핸들러는 의존성이 아닙니다.** 키가 도착하는 순간 ref에서 읽으므로 인라인 화살표 함수를 그대로 써도 되고 매 렌더마다 리스너를 다시 걸지 않습니다. 다시 거는 것은 `keys` · `enabled` · `preventDefault` · `ignoreInputs` · `target`입니다.
- **전파를 멈추지 않습니다.** 한 조합에 훅 두 개가 걸려 있으면 둘 다 실행됩니다. 그건 페이지가 풀 충돌이지 훅이 찍을 수 있는 것이 아닙니다.
- **`target`을 주지 않으면 window에서 듣습니다.** 패널 하나에 속한 단축키라면 그 패널의 엘리먼트를 주세요.

## `useMPPlatform`

```tsx
const os = useMPPlatform(); // 'mac' | 'windows' | 'linux'
```

`MPShortcut`이 키캡을 찍어 내는 그 감지이며, 직접 키캡을 그리는 애플리케이션을 위한 것입니다. `userAgentData.platform` · `navigator.platform` · user agent 문자열 세 가지를 동시에 봅니다. 질문 자체가 성긴 데다 브라우저마다 이 셋을 따로따로 얼리거나 속이기 때문입니다.

navigator가 없는 곳에서는 `'windows'`이고, hydration에서 고쳐집니다.

## 다음

- [Prop 규약](../design/prop-conventions.md) — prop이 쓰여 있는 어휘.
- [MPShortcut](../components/display/shortcut.md) — 단축키 이야기의 나머지 절반.
