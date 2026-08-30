import pathlib, sys
def rep(path, old, new):
    p = pathlib.Path(path); s = p.read_text(encoding='utf-8')
    if s.count(old) != 1: print(f'FAIL {path}: {s.count(old)}'); sys.exit(1)
    p.write_text(s.replace(old, new, 1), encoding='utf-8'); print('ok ', path)

EN_OLD = """Yours is appended to the component's own, and nothing is removed to make room for it. So **two utilities setting the same property are resolved by the stylesheet rather than by which of them you wrote.**

Which one that is depends on how the styles were wired up. On the precompiled path it is whichever sheet the application imported second. On the Tailwind path both are generated in one pass, and Tailwind's own ordering decides — which is per property, and not something to work out at the call site:

| You pass     | The component sets    | Which one wins |
| ------------ | --------------------- | -------------- |
| `p-8`        | `px-6`                | the component  |
| `rounded-lg` | `rounded-mp-full`     | the component  |
| `shadow-lg`  | `shadow-mp-1`         | the component  |
| `text-lg`    | `text-mp-label-large` | yours          |
| `bg-red-500` | `bg-mp-primary`       | yours          |
| `h-20`       | `h-14`                | yours          |

Read the column, not the rows: the answers are what one version of Tailwind happens to emit, and the point is that there is no rule connecting them. `className` is the right tool for what a component does **not** already set — margin, width, grid placement, position, an animation — and the wrong one for taking something over."""

EN_NEW = """Yours is appended to the component's own, and nothing is removed to make room for it. Two classes setting the same property both end up on the element, at equal specificity, and **the one that wins is the one the stylesheet happens to put last** — not the one you wrote.

A class for something the component does not already set always works. That is most of what a class is for, and there is nothing more to know about it:

```tsx
<MPButton className="mt-4 w-full">Save</MPButton>
```

Past that it depends on the pair. On the precompiled path it depends on which sheet the application imported second; on the Tailwind path both are generated in one pass and Tailwind's own ordering decides. Measured against this repository's own stylesheet, on an `MPButton` at the default size:

| You pass                     | It sets                  | Result  |
| ---------------------------- | ------------------------ | ------- |
| `px-8`                       | `px-6`                   | applies |
| `px-2`                       | `px-6`                   | ignored |
| `h-20`                       | `h-14`                   | applies |
| `h-8`                        | `h-14`                   | ignored |
| `text-lg`, `text-xs`         | `text-mp-title-medium`   | applies |
| `bg-red-500`                 | `bg-(--_mp-accent)`      | applies |
| `rounded-lg`                 | `rounded-mp-full`        | ignored |
| `shadow-lg`                  | `shadow-mp-1`            | ignored |
| `p-8`                        | `px-6`                   | ignored |
| any of the above with a `!`  | —                        | applies |

The first four rows are the ones worth staring at. `px-8` works and `px-2` does not, on the same component and the same property, because Tailwind emits a scale in scale order and the larger step is therefore later — so *making a control bigger tends to work and making it smaller tends not to*. The rest is which of two theme keys Tailwind happened to sort first: the library's `--text-mp-*` land before Tailwind's own, so any `text-*` you pass wins, while `--radius-mp-*` and `--shadow-mp-*` land after, so `rounded-*` and `shadow-*` do not.

None of that is a promise. It is what one version of Tailwind emits, it is per pair rather than per property, and it can move under you when either side adds a token. Treat `className` as the tool for what the component leaves alone."""

KO_OLD = """넘긴 클래스는 컴포넌트 자신의 클래스 뒤에 붙고, 자리를 내주기 위해 지워지는 것은 없습니다. 그래서 **같은 속성을 지정하는 두 유틸리티는 어느 쪽을 썼는지가 아니라 스타일시트가 결정합니다.**

어느 쪽이 되는지는 스타일을 어떻게 연결했는지에 달려 있습니다. 컴파일된 시트를 쓰는 경우에는 애플리케이션이 나중에 import한 시트가 이깁니다. Tailwind를 쓰는 경우에는 둘이 한 번의 패스에서 생성되고 Tailwind 자신의 정렬이 결정하는데, 그 정렬은 속성마다 다르고 호출부에서 따져볼 만한 것이 아닙니다.

| 넘긴 것 | 컴포넌트가 지정한 것 | 이기는 쪽 |
| --- | --- | --- |
| `p-8` | `px-6` | 컴포넌트 |
| `rounded-lg` | `rounded-mp-full` | 컴포넌트 |
| `shadow-lg` | `shadow-mp-1` | 컴포넌트 |
| `text-lg` | `text-mp-label-large` | 넘긴 쪽 |
| `bg-red-500` | `bg-mp-primary` | 넘긴 쪽 |
| `h-20` | `h-14` | 넘긴 쪽 |

행이 아니라 열을 보세요. 이 답들은 어떤 한 버전의 Tailwind가 그렇게 내놓은 것일 뿐이고, 요점은 이들을 이어 주는 규칙이 없다는 것입니다. `className`은 컴포넌트가 **지정하지 않은** 것 — 마진, 너비, 그리드 배치, 위치, 애니메이션 — 에 쓰는 도구이고, 이미 지정된 것을 가져오는 데 쓰는 도구가 아닙니다."""

KO_NEW = """넘긴 클래스는 컴포넌트 자신의 클래스 뒤에 붙고, 자리를 내주기 위해 지워지는 것은 없습니다. 같은 속성을 지정하는 두 클래스가 같은 명시도로 엘리먼트에 함께 올라가고, **이기는 쪽은 스타일시트가 뒤에 놓은 쪽입니다.** 어느 쪽을 썼는지가 아닙니다.

컴포넌트가 지정하지 않은 것에 대한 클래스는 언제나 적용됩니다. 클래스로 하려는 일의 대부분이 이것이고, 여기에 더 알아야 할 것은 없습니다.

```tsx
<MPButton className="mt-4 w-full">저장</MPButton>
```

그 너머는 짝에 따라 다릅니다. 컴파일된 시트를 쓰는 경우에는 애플리케이션이 나중에 import한 시트가 이기고, Tailwind를 쓰는 경우에는 둘이 한 번의 패스에서 생성되어 Tailwind 자신의 정렬이 결정합니다. 이 저장소의 시트로, 기본 크기의 `MPButton`에 대고 실제로 측정한 결과입니다.

| 넘긴 것 | 컴포넌트가 지정한 것 | 결과 |
| --- | --- | --- |
| `px-8` | `px-6` | 적용됨 |
| `px-2` | `px-6` | 무시됨 |
| `h-20` | `h-14` | 적용됨 |
| `h-8` | `h-14` | 무시됨 |
| `text-lg`, `text-xs` | `text-mp-title-medium` | 적용됨 |
| `bg-red-500` | `bg-(--_mp-accent)` | 적용됨 |
| `rounded-lg` | `rounded-mp-full` | 무시됨 |
| `shadow-lg` | `shadow-mp-1` | 무시됨 |
| `p-8` | `px-6` | 무시됨 |
| 위의 어느 것이든 `!`를 붙이면 | — | 적용됨 |

들여다볼 만한 것은 처음 네 줄입니다. 같은 컴포넌트, 같은 속성인데 `px-8`은 되고 `px-2`는 안 됩니다. Tailwind가 스케일을 스케일 순서로 내놓기 때문에 더 큰 단계가 더 뒤에 오고, 그래서 *컨트롤을 키우는 쪽은 대체로 되고 줄이는 쪽은 대체로 안 됩니다*. 나머지는 두 테마 키 중 어느 쪽을 Tailwind가 먼저 정렬했는가의 문제입니다. 이 라이브러리의 `--text-mp-*`는 Tailwind 자신의 것보다 앞에 놓이므로 넘긴 `text-*`가 이기고, `--radius-mp-*`와 `--shadow-mp-*`는 뒤에 놓이므로 `rounded-*`와 `shadow-*`는 지지 않고 집니다.

이 중 무엇도 약속이 아닙니다. 어떤 한 버전의 Tailwind가 내놓은 결과이고, 속성 단위가 아니라 짝 단위이며, 양쪽 중 어느 한쪽이 토큰을 추가하면 발밑에서 움직일 수 있습니다. `className`은 컴포넌트가 건드리지 않는 것에 쓰는 도구로 두세요."""

rep('docs/en/guide/getting-started.md', EN_OLD, EN_NEW)
rep('docs/ko/guide/getting-started.md', KO_OLD, KO_NEW)
