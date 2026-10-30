---
title: MPCommandPalette
order: 15
---

# MPCommandPalette

<p class="mp-lede">애플리케이션이 할 수 있는 모든 것을, 필드 하나 뒤에.</p>

<Demo src="command-palette/hero" :minHeight="240" />

::: fw react

```tsx
import { MPCommandPalette } from 'material-plus-ui';

<MPCommandPalette
  items={[
    { value: 'new', label: '새 문서', group: '파일', shortcut: 'Mod+N', onSelect: create },
    { value: 'open', label: '열기…', group: '파일', keywords: ['load'], onSelect: browse }
  ]}
/>;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPCommandPalette(
  items: <MPCommand>[
    MPCommand(value: 'new', label: '새 문서', group: '파일', shortcut: 'Mod+N', onSelect: create),
    MPCommand(value: 'open', label: '열기…', group: '파일', keywords: <String>['load'], onSelect: browse),
  ],
);
```

:::

## Props

<PropsTable name="MPCommandPalette" />

::: fw flutter

### `MPCommand`

팔레트가 할 수 있는 일 하나입니다. React의 `MPCommand`는 같은 필드를 가진 TypeScript 인터페이스입니다.

<PropsTable name="MPCommand" />

:::

## 무엇이고, 무엇이 아닌지

메뉴 바가 담을 수 있는 것보다 행동이 많아진 키보드 중심 제품이 취하는 모양입니다. 독자는 그것이 어디에 놓였는지 기억하는 대신 **원하는 것을 입력합니다**.

[MPMenu](./menu)가 아닙니다. 메뉴는 한 곳에 있는 짧은 목록이고, 모든 행이 찾기 전부터 보입니다. 그것이 메뉴가 잘하는 일의 전부이고, 행이 예순 개인 메뉴가 메뉴가 아닌 이유입니다.

[MPCombobox](./combobox)도 아닙니다. 이건 정확히 짚어 둘 값어치가 있습니다. 콤보박스에서 돌아오는 것은 **값**이고, 호출자가 그것으로 무언가를 합니다. 여기서 돌아오는 것은 _무언가가 일어나는 것_ 입니다. 행이 곧 행동이고, `onSelect`가 그것을 실행하며, 더 결정할 것이 없으므로 시트가 닫힙니다.

## 표면은 MD3의 search view입니다

`corner-extra-large` 아래 레벨 3의 `surface-container-high`.

MD3 자신의 docked search view이고, 마침 [MPDialog](../feedback/dialog)가 내리는 것과 같은 세 가지 결정입니다. 숨길 값어치가 없는 우연입니다. 스크림 위에서 페이지를 가져간 시트는 이 시스템에서 하나의 객체입니다. 질문을 하든 검색을 받든 말이죠.

가운데가 아니라 창 **위쪽**에 고정됩니다. 팔레트를 여는 사람은 곧 입력하려는 사람이고, 손 아래로 도착하는 필드는 찾으러 갈 필요가 없는 필드입니다.

## 단축키, 한 번만 말해지는

기본값은 `Mod+K`입니다. React에서는 윈도우에 바인딩하고, Flutter에서는 앱 어디에서 눌러도 키보드에서 듣습니다. `Mod`는 맥에서 Command, 그 밖에서는 Control입니다.

[MPShortcut](../display/shortcut)이 **그리는** 것과 정확히 같은 어휘로 쓰였고, 그것은 의도한 것입니다. 컴포넌트가 보여 주는 단축키와 바인딩하는 단축키가 같은 방식으로 쓰이지 않으면, 화면의 라벨은 아무도 확인하지 않은 주장이 됩니다.

::: fw react

실제 키보드 이벤트를 상대로 `pressed()`가 하는 읽기도 같은 어휘입니다.

:::

명령 자신의 `shortcut`이 그 나머지 절반이고, 팔레트는 그것을 **바인딩하지 않습니다**.

::: fw react

```tsx
{ value: 'new', label: '새 문서', shortcut: 'Mod+N', onSelect: create }
```

:::

::: fw flutter

```dart
MPCommand(value: 'new', label: '새 문서', shortcut: 'Mod+N', onSelect: create)
```

:::

애플리케이션이 이미 가진 바인딩의 라벨입니다. 그것을 바인딩하는 팔레트는 아래의 에디터와 경쟁하는 팔레트입니다.

::: fw react

아무것도 바인딩하지 않으려면 `shortcut={false}`를 넘기고 `open`으로 직접 여세요.

:::

::: fw flutter

아무것도 바인딩하지 않으려면 `shortcut: null`을 넘기고 `open`으로 직접 여세요.

:::

## 매칭

질문은 대소문자를 가리지 않고 세 가지에 대해 맞춰집니다.

- 명령의 `label`,
- `group` — "파일"을 입력하면 그 구획 전체가 돌아옵니다,
- 그리고 **절대 그려지지 않는** `keywords`.

흥미로운 것은 키워드입니다. 다른 제품이 같은 명령에 붙인 이름, 약어, 독자가 검색했을 법한 단어가 들어가는 자리입니다.

::: fw react

```tsx
{ value: 'open', label: '열기…', keywords: ['load', 'import', 'browse'] }
```

:::

::: fw flutter

```dart
MPCommand(value: 'open', label: '열기…', keywords: <String>['load', 'import', 'browse'])
```

:::

각 부분은 따로 맞춰 보므로, 질의가 두 부분의 경계를 넘어 맞지 않습니다. `copy link`는 이름이 _Copy_이고 키워드로 _link_가 붙은 명령을 찾지 않습니다.

## 그룹

`group`이 바뀔 때마다 제목이 그려지므로, 같은 그룹의 명령은 **붙여서** 나열해야 합니다. 한계라기보다 의도한 제약입니다. `items`의 순서가 곧 팔레트가 보여 주는 순서이므로, 무엇이 먼저 오는지는 발견하는 것이 아니라 호출자가 정하는 것입니다.

## 접근성

::: fw react

- 다이얼로그에는 보이는 제목이 없으므로 `label`에서, 또는 `locale`의 "명령 팔레트"라는 단어에서 이름을 가져옵니다.
- 목록은 Base UI의 `Autocomplete`입니다. 포인터와 방향키가 **하나의** 강조를 움직이므로, 독자가 두 표시 중 어느 쪽을 Enter가 실행할지 따질 일이 없습니다. `aria-activedescendant`가 강조가 움직이는 동안에도 포커스를 필드에 둡니다.
- 다이얼로그는 열려 있는 동안 포커스를 가두고, 나갈 때 독자가 있던 자리로 되돌려 놓습니다.

:::

::: fw flutter

- 시트는 dialog role을 가진 노드입니다. 보이는 제목이 없으므로 `semanticLabel`에서, 또는 `locale`의 "명령 팔레트"라는 단어에서 이름을 가져옵니다. 필드는 플레이스홀더로 이름을 갖고, 무언가를 입력한 뒤에도 그 이름을 유지합니다.
- 포인터와 방향키가 **하나의** 강조를 움직이므로, 독자가 두 표시 중 어느 쪽을 Enter가 실행할지 따질 일이 없습니다. React와 마찬가지로 방향키나 포인터가 행을 밝히기 전에는 아무 행도 밝혀지지 않고, 방향키는 비활성 명령을 건너뜁니다. 방향키와 Enter는 필드보다 먼저 키보드에서 읽으므로, 필드는 입력되는 글자를 모두 받습니다. 밝혀진 행은 선택되었다고 말합니다.
- 시트는 열려 있는 동안 포커스를 붙잡고, 스크림은 포인터와 화면 낭독기가 아래 페이지에 닿지 못하게 막습니다. 닫히면 포커스는 독자가 있던 자리로 돌아갑니다. <kbd>Esc</kbd>, 시스템 뒤로 가기, 스크림 누르기로 닫힙니다.
- 시트는 다이얼로그처럼 커지면서 나타나고, 움직임을 줄여 달라고 한 독자에게는 움직이지 않고 나타납니다.

:::

- 비활성 명령은 명세의 38%로 목록에 남고 실행되지 않습니다.
- 행의 단축키는 [MPShortcut](../display/shortcut)이 그리며, `⌘`를 유니코드 이름이 아니라 "Command"로 알립니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| 인터페이스인 `MPCommand` | 클래스인 `MPCommand` | Dart에서 모양에 이름을 붙이는 방법입니다. 필드는 같습니다. |
| `shortcut={false}` | `shortcut: null` | Dart의 매개변수는 타입이 하나입니다. `null`이면 아무것도 바인딩하지 않습니다. |
| `defaultOpen` | `initialOpen` | Flutter의 이름입니다. |
| `label` | `semanticLabel` | 화면 낭독기가 읽는 이름에 Flutter가 쓰는 이름입니다. |
| CSS 길이를 받는 `width` | `double`인 `width` | Flutter의 길이는 논리 픽셀뿐입니다. |
| CSS 길이를 받는 `maxHeight` | `double`인 `maxHeight` | 같은 이유입니다. |
| 노드인 `emptyMessage` | `String`인 `emptyMessage` | 팔레트의 흐린 글자 스타일로 그립니다. |
| 노드인 `description` | `String`인 `description` | 같은 이유입니다. |
| `classNames`, `className`, `style` | — | 넘겨줄 클래스 목록도 style 속성도 없습니다. |

:::

## 함께 보기

- [MPShortcut](../display/shortcut) — 그려진 키들.
- [MPCombobox](./combobox) — 답이 값일 때의 같은 필드 모양.
- [MPMenu](./menu) — 한 곳에 있는 짧은 행동 목록.
- [MPDialog](../feedback/dialog) — 이것이 표면을 공유하는 시트.
