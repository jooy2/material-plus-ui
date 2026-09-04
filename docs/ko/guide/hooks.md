---
title: 훅
order: 2
---

# 훅

<p class="mp-lede">라이브러리가 이미 돌리고 있던 기계에, 가져다 쓸 수 있는 이름을 붙인 것입니다. 여기 있는 것은 전부 먼저 컴포넌트 안에 있었고, 새로운 것은 이제 여러분의 코드도 같은 질문을 하고 같은 답을 받을 수 있다는 점뿐입니다.</p>

공개한 이유가 그것뿐입니다. prop이 덮는 것보다 한 번 더 판단해야 하는 페이지는 브레이크포인트·플랫폼 감지·미디어 쿼리를 다시 적어야 했고, 그 숫자는 라이브러리의 것과 일치해야 했습니다. 어긋나면 레이아웃이 딱 한 너비에서 자기 자신과 어긋나고, 아무도 이유를 못 찾습니다.

| 훅 | 답하는 것 |
| --- | --- |
| [`useMPColorScheme`](#usempcolorscheme) | 페이지의 색 스킴과 그것을 바꾸는 법 |
| [`useMPWindowClass`](#usempwindowclass) | 창이 머터리얼의 다섯 window size class 중 어디에 있는지 |
| [`useMPReducedMotion`](#usempreducedmotion) | 읽는 사람이 모션을 줄여 달라고 했는지 |
| [`useMPShortcut`](#usempshortcut) | 키 입력이 오면 무언가를 실행 |
| [`useMPPlatform`](#usempplatform) | 읽는 사람이 어떤 키보드를 쓰는지 |
| [`useMPDisclosure`](#usempdisclosure) | 열림 상태와 그것을 바꾸는 세 가지 방법 |
| [`useMPMediaQuery`](#usempmediaquery) | 미디어 쿼리가 일치하는지 |
| [`useMPElementSize`](#usempelementsize) | 엘리먼트가 얼마나 큰지 |
| [`useMPOnScreen`](#usemponscreen) | 엘리먼트가 화면에 있는지 |
| [`useMPLocale`](../design/localization.md#3-nothing-at-all) | 트리의 이 지점에서 유효한 언어 |
| [`useMPSnackbar`](../components/feedback/snackbar.md) | 프로바이더 아래 어디서든 스낵바 띄우기 |

뒤의 둘은 자기가 읽는 프로바이더 옆에 있습니다 — 컨텍스트를 읽는 훅이 있어야 할 자리입니다. 나머지는 자기 컴포넌트가 없습니다.

앞의 다섯은 컴포넌트가 이미 돌리고 있던 기계였습니다. 뒤의 넷은 라이브러리가 여러 번 하고 있으면서 그대로는 공개할 수 없었던 것의 일반형입니다. `useMPWindowClass`는 미디어 쿼리 넷을 지켜보고 `useMPMediaQuery`는 하나를 지켜봅니다. `MPTabs`는 자기 바를 재고 `useMPElementSize`가 그 측정입니다. `trigger="visible"`은 엘리먼트가 뷰포트를 넘는 것을 지켜보고, `useMPOnScreen`은 애니메이션을 뺀 그 지켜봄입니다.

## `useMPColorScheme`

```tsx
const { resolved, toggle } = useMPColorScheme();

<MPIconButton
  icon={<MPIcon icon={resolved === 'dark' ? SunIcon : MoonIcon} />}
  label="Switch theme"
  onClick={toggle}
/>;
```

<Demo src="hooks/color-scheme" :minHeight="260">

<<< @/.vitepress/demos/hooks/color-scheme.tsx

</Demo>

스타일시트에는 스위치가 늘 있었습니다 — `prefers-color-scheme`, 그리고 스스로 모는 페이지를 위한 `data-mp-scheme`. 없던 것은 그걸 _몰_ 무언가였고, 그래서 모든 애플리케이션이 같은 세 가지를 직접 썼습니다. 상태 하나, `localStorage` 왕복, 그리고 첫 페인트가 번쩍이지 않게 하는 `<head>` 스크립트.

| 반환        | 타입                            | 의미                   |
| ----------- | ------------------------------- | ---------------------- |
| `scheme`    | `'light' \| 'dark' \| 'system'` | **고른** 것            |
| `resolved`  | `'light' \| 'dark'`             | **칠해지는** 것        |
| `isSystem`  | `boolean`                       | 고른 것이 `system`인지 |
| `setScheme` | `(scheme) => void`              | 하나를 고름            |
| `toggle`    | `() => void`                    | 둘 중 나머지 하나      |

| 인자                 | 타입     | 기본값              | 의미                    |
| -------------------- | -------- | ------------------- | ----------------------- |
| `options.storageKey` | `string` | `'mp-color-scheme'` | 선택을 기억해 두는 자리 |

### 둘이 아니라 셋

`'system'`은 세 번째 스킴이 아니라 **선택하지 않음**이고, 그걸 남겨 두는 것이 핵심입니다. 토글을 한 번도 건드린 적 없는 독자는 운영체제를 _그것이 바뀌는 대로_ 따라야 합니다 — 해 질 무렵을 포함해서. 두 상태짜리 훅이 추적을 멈추는 지점이 바로 거기고, 그때 어두운 방에서 페이지가 하얘집니다.

설정 컨트롤은 `scheme`에 묶고 그리는 것은 `resolved`로 하세요. `scheme`에 묶인 2단 토글은 "시스템을 따름"을 아예 표현하지 못하고, 그래서 `toggle`이 따로 있습니다 — `'system'`에서는 지금 칠해진 것의 반대로 가지, 독자가 이미 보고 있는 스킴으로 돌아가지 않습니다.

### 한 페이지에 답 하나

선택은 각 호출자의 상태가 아니라 모듈 수준 저장소에 삽니다. 헤더의 토글과 설정 화면의 라디오 그룹이 같은 것을 보게 하려고요. 각자 `useState`를 든 컴포넌트 둘은 각자 마지막에 설정한 것을 보여 주고 서로의 소식을 듣지 못합니다.

### 무엇을 쓰는가

`<html>`의 `data-mp-scheme` — 그리고 `'system'`은 그 단어를 쓰는 게 아니라 속성을 **지웁니다**. 미디어 쿼리가 발언권을 되찾는 방법이 그것입니다.

`.dark`는 일부러 건드리지 않습니다. 그 클래스는 프로젝트 _자신의_ Tailwind가 키로 쓰는 것이고, 자기가 붙이지도 않은 클래스를 라이브러리가 손대는 것은 남의 마크업을 편집하는 일입니다. 둘 다 원하는 페이지는 자기 코드 한 줄이면 됩니다.

```tsx
useEffect(() => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}, [resolved]);
```

### 첫 페인트

훅은 브라우저가 이미 그린 **뒤에** 돕니다. 그래서 다크를 고른 독자는 한 프레임 동안 하얀 페이지를 봅니다. 그보다 먼저 돌 수 있는 것은 `<head>` 안의 동기 스크립트뿐입니다.

```tsx
import { mpColorSchemeScript } from 'material-plus-ui';

<head>
  <script dangerouslySetInnerHTML={{ __html: mpColorSchemeScript() }} />
</head>;
```

훅이 읽는 그 키를 읽고, 같은 속성을 쓰고, 저장된 값이 없거나 `system`이면 아무것도 하지 않습니다 — 미디어 쿼리가 답하도록 두는데, 어차피 그건 첫 페인트 전에 끝납니다.

훅에 준 것과 **같은** `storageKey`를 주세요. 키가 다르면 페이지가 한 스킴을 그렸다가 다른 것으로 스스로를 고치게 되고, 그게 바로 이것이 없애려는 번쩍임입니다.

태그가 아니라 소스를 돌려주므로, `unsafe-inline` 없는 Content Security Policy 아래의 페이지는 태그에 자기 nonce를 달 수 있습니다. `<script src>`가 될 수는 없습니다 — fetch가 바로 피하려는 그 지연이기 때문입니다.

### 날카로운 모서리

- **저장소는 실패할 수 있고, 그건 처리돼 있습니다.** 일부 브라우저의 사생활 보호 창과 일부 쿠키 정책 아래에서는 `localStorage` 읽기·쓰기가 throw합니다. 둘 다 잡습니다 — 토글은 이번 방문 동안 동작하고 선택만 기억되지 않습니다.
- **이미 페이지에 있는 속성이 저장소를 이깁니다.** 스크립트를 돌렸거나 서버에서 쿠키로 `data-mp-scheme`을 렌더한 페이지는 이미 어떤 스킴을 칠하고 있습니다. 그게 참인 쪽이고, 대신 저장소를 보고하면 화면과 어긋납니다.
- **문서 전체의 스킴을 정합니다.** _구역_ 하나 — 밝은 페이지 속 어두운 편집기 패널 — 는 그 엘리먼트에 직접 `data-mp-scheme`을 다세요. 양방향 모두 동작합니다. [색](../design/color.md#dark-mode)을 보세요.

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

클라이언트가 hydration에서 고칩니다. 아래에 깔린 `useSyncExternalStore`가 그 정정을 React가 불평하는 불일치가 아니라 정당한 것으로 만들어 줍니다. **다만 정정은 두 번째 렌더**라서, 이걸로 내비게이션 패턴 전체를 바꾸는 컴포넌트는 첫 로드에서 그 전환이 눈에 보입니다. 그게 문제라면 애초에 첫 렌더가 틀릴 일이 없는 답을 쓰세요 — [`MPShow`](../components/layout/show), `MPGrid`의 반응형 prop, Tailwind의 variant는 무엇이 그려지기 전에 브라우저가 풀어 줍니다.

### 경계는 어디에서 오는가

MD3 자신의 값입니다. 위쪽의 [`MPConfigProvider`](./config#윈도우-크기-클래스-옮기기)가 옮겼다면 그 값이고요. 그 prop은 스타일시트의 경계까지 옮긴 페이지에서 자바스크립트 쪽 절반을 맞춰 주는 것입니다. 한쪽만 옮기는 건 둘 다 옮기지 않는 것보다 나쁘고, 그 이유는 프로바이더 쪽에 적혀 있습니다.

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

## `useMPDisclosure`

```tsx
const dialog = useMPDisclosure();

<MPButton onClick={dialog.onOpen}>Delete</MPButton>
<MPDialog open={dialog.open} onOpenChange={dialog.setOpen} title="Delete?">
  <MPButton onClick={dialog.onClose}>Cancel</MPButton>
</MPDialog>;
```

이 라이브러리를 쓰는 애플리케이션에서 가장 많이 쓰이는 여섯 줄입니다. 다이얼로그, 드로어, 팝오버, 메뉴, 커맨드 팔레트가 모두 같은 방식으로 제어되고, 그중 하나를 띄우는 페이지마다 같은 `useState`와 같은 화살표 셋을 씁니다.

급히 쓴 버전이 빠뜨리는 두 가지를 지킵니다.

- **콜백이 전부 안정적입니다.** 인라인 `onClick={() => setOpen(true)}`는 렌더마다 새 함수이고, 메모된 트리거를 다시 렌더시켜 페이지가 일부러 걸어 둔 `React.memo`를 무력화합니다.
- **이미 그런 상태를 요청하는 것은 공짜입니다.** React는 이미 가진 값으로 `useState`를 설정하면 빠져나옵니다. 닫기 핸들러가 버튼과 `onOpenChange`와 컴포넌트가 처리하는 Escape 셋에 동시에 연결되는 일이 흔하므로 이 점이 중요합니다.

상태를 들고 있으므로 대상을 controlled로 만듭니다. 자기 열림 상태를 스스로 관리해야 하는 컴포넌트는 `defaultOpen`을 받고 이것이 필요 없습니다.

## `useMPMediaQuery`

```tsx
const coarse = useMPMediaQuery('(pointer: coarse)');

<MPTooltip disabled={coarse}>…</MPTooltip>;
```

이 라이브러리가 윈도우 크기 클래스에 네 번, 모션 축소와 색 구성표에 한 번씩 하고 있는 일의 일반형입니다. 페이지에는 자기 질문이 있습니다. 거친 포인터인지, 창이 낮은지, 고대비 모드인지. 그것 하나를 묻자고 구독을 다시 써야 했습니다.

**너비에는 쓰지 마세요.** 여기 쓴 너비 쿼리는 라이브러리도 들고 있는 숫자의 사본이고, `MPConfigProvider`가 경계를 옮기는 순간 둘이 어긋납니다. [`useMPWindowClass`](#usempwindowclass)는 그리드와 사이드바가 읽는 그 사다리를 읽습니다.

물어볼 데가 없으면 — 서버이거나 `matchMedia`가 없는 브라우저 — `false`이고, 두 번째 인자로 직접 답을 줄 수 있습니다. 기본값이 "일치"였다면 서버에서 렌더된 모든 페이지가 모든 선호를 한꺼번에 주장하게 됩니다.

## `useMPElementSize`

```tsx
const ref = React.useRef<HTMLDivElement>(null);
const { width } = useMPElementSize(ref);

<div ref={ref}>{width > 480 ? <Chart /> : <Figure />}</div>;
```

컴포넌트 **자기** 너비에 대한 답입니다. 컨테이너 쿼리가 묻는 것이고 미디어 쿼리는 답할 수 없는 것입니다. 사이드바 안의 카드와 본문 열의 같은 카드는 같은 창이고 서로 다른 두 너비입니다.

- **측정 전에는 0입니다.** ref는 커밋 중에 채워지므로 첫 답은 `0`이고 진짜 답은 그다음 렌더에 옵니다. 숫자 자체가 아니라 임계값으로 분기하세요. 그러지 않으면 차트가 마운트되고, 너비가 0이라는 말을 듣고, 다시 마운트됩니다.
- **content box가 아니라 border box입니다.** 옵저버 엔트리의 `contentRect`는 padding과 border를 뺍니다. 측정값을 브레이크포인트와 비교하는 쪽이 뜻하는 것은 엘리먼트가 실제로 차지하는 상자입니다.
- **숫자가 바뀔 때만 다시 렌더합니다.** `ResizeObserver`는 반올림하면 같은 정수가 되는 서브픽셀 재배치에도 발화합니다.

`ResizeObserver`가 없으면 마운트 때 한 번 재고 그대로 있습니다.

## `useMPOnScreen`

```tsx
const ref = React.useRef<HTMLDivElement>(null);
const seen = useMPOnScreen(ref);

<div ref={ref}>{seen ? <Chart data={data} /> : <MPSkeleton height={240} />}</div>;
```

`MPAnimate*` 컴포넌트의 `trigger="visible"`이 이미 하고 있는 일을, 묻는 다른 이유들을 위해 꺼낸 것입니다. 이미지 로드, 요청 시작, 읽음 표시, 스크롤 밖으로 나간 비싼 것 멈추기.

`once`가 기본으로 켜져 있습니다. 묻는 이유 대부분이 한 방향이기 때문입니다. 무언가 로드되고, 스크롤 밖으로 나갔다고 다시 언로드되지는 않습니다. 멈춰야 하는 비디오에는 끄세요. `rootMargin`은 영역을 넓히므로 `'200px 0px'`는 도착하기 전에 알려 줍니다.

`IntersectionObserver`가 없으면 `true`입니다. 내용을 보여 주는 쪽이 안전하게 실패하는 답이고, 반대쪽은 지연된 구역이 전부 영원히 스켈레톤으로 남는 페이지입니다.

## 다음

- [Prop 규약](../design/prop-conventions.md) — prop이 쓰여 있는 어휘.
- [MPShortcut](../components/display/shortcut.md) — 단축키 이야기의 나머지 절반.
