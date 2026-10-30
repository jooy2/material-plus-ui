---
title: MPFilePicker
order: 8
---

# MPFilePicker

<p class="mp-lede">파일을 떨어뜨리거나 눌러서 파일 대화상자를 여는 상자입니다. 머터리얼에는 이런 컴포넌트가 없으므로, 빌려 오는 것은 *면*인 부분 — 모서리 크기, `outline-variant` 테두리, 스테이트 레이어, 보조 텍스트 — 이고, 더하는 것은 직접 만든 드롭존이 늘 틀리는 두 가지입니다.</p>

<Demo src="file-picker/hero" :minHeight="200" />

::: fw react

```tsx
import { MPFilePicker } from 'material-plus-ui';

const [files, setFiles] = useState([]);

<MPFilePicker label="첨부" multiple value={files} onFilesChange={setFiles} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPFilePicker(
  label: const Text('첨부'),
  multiple: true,
  value: files,
  onBrowse: () async => pickWithYourPlugin(),
  onFilesChanged: (List<MPFile> next) => setState(() => files = next),
);
```

**피커는 플랫폼의 파일 대화상자를 열지 않습니다.** 이 패키지는 Flutter의 위젯 계층만으로 만들었고 의존성이 없습니다. 파일 시스템에 닿는 일은 그 일을 하는 모든 Flutter 앱에서 플러그인의 몫입니다. 그래서 앱이 직접 연결한 파일 고르기는 `onBrowse`에서 실행합니다. 고른 플러그인을 부르고, 돌려받은 것을 `MPFile`로 바꿔서 돌려주면 됩니다. 앱이 자기 플러그인으로 알아챈 드롭은 `MPFilePickerState.add`로 넣습니다. 컴포넌트가 맡는 것은 그 다음의 전부입니다. 규칙, 목록, 삭제, 그리고 상자 자체입니다. 이 페이지의 미리보기는 지어낸 파일을 돌려줍니다.

:::

## Props

<PropsTable name="MPFilePicker" />

::: fw flutter

### MPFile

<PropsTable name="MPFile" />

`MPFile`은 의도적으로 `dart:io`의 `File`이 아니고, 그것을 감싼 추상화도 아닙니다. 상자가 그리는 것은 이름과 크기이고, 규칙이 읽는 것은 이름과 크기와 종류이므로 그것만 받습니다. `source`는 앱의 원래 객체를 손대지 않고 실어 나르므로, 호출하는 쪽은 반대편에서 자기 객체를 그대로 돌려받습니다. `matches(accept)`는 `accept` 검사이고, 목록을 직접 그리는 쪽이 쓸 수 있습니다.

:::

## 이 컴포넌트가 고치는 두 가지

::: fw react

**`accept`는 드롭에 적용되지 않습니다.** 브라우저는 이 속성을 자기 대화상자에만 적용하고 다른 어디에도 적용하지 않습니다. 그래서 속성만 지정한 드롭존은 드래그로 도착한 파일이라면 무엇이든 받아들입니다. 이 컴포넌트는 떨어진 파일을 속성이 취하는 세 가지 형태 — `.확장자`, `type/subtype`, `type/*` — 그대로 검사합니다.

**`dragenter`와 `dragleave`는 자식마다 발생합니다.** 포인터가 존의 *자식*을 지날 때도 둘 다 발생하므로, boolean을 토글하는 존은 파일이 자기 내용 위를 지나는 내내 깜빡입니다. 이벤트를 세는 것이 상자 안에 무언가가 있어도 살아남는 유일한 방법이고, 상자 안에는 늘 무언가가 있습니다. 파일 목록이 거기 있으니까요.

:::

::: fw flutter

**`accept`는 도착한 것에 대고 검사합니다.** `onBrowse`가 돌려준 것과 `MPFilePickerState.add`에 들어온 것은 모두 HTML 속성이 취하는 세 가지 형태 — `.확장자`, `type/subtype`, `type/*` — 로 검사합니다. 그것을 찾은 플러그인이 같은 조건을 받았는지와는 상관없습니다. 컴포넌트가 내세우고 지키지 않는 규칙은 규칙이 아닙니다.

**끌기 상태는 앱이 알아냅니다.** Flutter는 플러그인 없이 운영체제의 파일 끌기를 알 수 없으므로, 피커는 파일이 자기 위에 있는지 모릅니다. 그런 플러그인을 쓰는 앱이 그동안 `dragging: true`를 넘기면 상자가 제 모습대로 밝아집니다. 상태의 모습은 컴포넌트의 몫이고, 알아내는 것은 앱의 몫입니다.

:::

## onReject

가장 먼저 연결할 가치가 있는 prop입니다.

<Demo src="file-picker/limits" :minHeight="280">

::: fw react

<<< @/.vitepress/demos/file-picker/limits.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/file_picker/limits.dart

:::

</Demo>

::: fw react

이것이 없으면 거절된 파일이 조용히 사라집니다. 드롭존이 하는 가장 나쁜 짓입니다. 읽는 사람은 자기 파일이 사라지는 것을 보면서 그것이 거절된 것인지 유실된 것인지 알 방법이 없습니다. 각 거절은 `File`과 세 가지 이유 중 하나 — `'type'`, `'size'`, `'count'` — 를 검사 순서대로 담고 있습니다.

:::

::: fw flutter

이것이 없으면 거절된 파일이 조용히 사라집니다. 드롭존이 하는 가장 나쁜 짓입니다. 읽는 사람은 자기 파일이 사라지는 것을 보면서 그것이 거절된 것인지 유실된 것인지 알 방법이 없습니다. 각 거절은 `MPFile`과 세 가지 이유 중 하나 — `MPFileRejectionReason.type`, `.size`, `.count` — 를 검사 순서대로 담고 있습니다.

:::

`maxFiles`는 한 번의 드롭이 아니라 **이미** 들고 있는 것과 합쳐서 셉니다. "파일 다섯 개를 떨어뜨릴 수 있다"와 "파일 다섯 개까지 가질 수 있다"의 차이이고, 이 prop이 뜻하는 것은 뒤쪽뿐입니다.

## formatFileSize

컴포넌트와 함께 내보냅니다.

::: fw react

```tsx
import { formatFileSize } from 'material-plus-ui';

formatFileSize(1_400_000); // '1.4 MB'
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

formatFileSize(1400000); // '1.4 MB'
```

:::

1024가 아니라 1000을 밑으로 쓰고 `MiB`가 아니라 `MB`를 씁니다. 모든 데스크톱 파일 관리자가 보여 주는 숫자가 그것이고, 파일 크기를 두고 Finder와 다투는 피커는 이길 수 없는 싸움을 고른 것입니다.

내보내는 이유는, `hint`를 직접 쓰는 쪽("최대 5 MB")이 아래 목록이 쓸 표기와 같은 표기를 필요로 하기 때문입니다. 한 컴포넌트 안에서 같은 숫자를 두 가지로 쓰는 것은, 버그처럼 보이는 종류의 일입니다.

## 예시

### title, hint, icon

상자 안에 들어가는 세 가지입니다. `title`의 기본값은 `locale`의 문장입니다. `hint`는 그 아래 한 줄 — 무엇을, 얼마나 크게, 몇 개까지.

::: fw react

`icon={null}`을 주면 그림 없는 상자가 됩니다.

:::

::: fw flutter

`showIcon: false`를 주면 그림 없는 상자가 됩니다.

:::

### showList

고른 파일은 기본적으로 상자 아래에 나열되고 각각 지울 방법이 붙습니다. 파일을 페이지의 다른 곳에서 보여 준다면 꺼도 됩니다. 어느 쪽이든 피커는 파일을 계속 들고 있습니다.

### readOnly

고른 것을 보여 주되 추가와 삭제를 막습니다. 삭제 버튼은 비활성화되는 것이 아니라 통째로 사라집니다. 아무 일도 하지 않는 동작을 제안하는 것은 없어야 하니까요.

## 접근성

::: fw react

- 누를 수 있는 영역은 진짜 `<button>`이고, 파일 목록은 그 **바깥**에 있습니다. 삭제 버튼이 브라우즈 버튼 안에 중첩될 수는 없습니다.
- 진짜 `<input type="file">`은 숨기지 않고 화면 밖으로 보냅니다. `display: none`과 `visibility: hidden`은 둘 다 input을 포커스 불가능하게 만드는데, 이 input은 여전히 폼과 `required` 검증 메시지가 닿을 수 있어야 합니다.
- 그 input은 탭 순서에서는 빠지지만 `aria-hidden`은 **아닙니다**. 두 사실은 함께 갑니다. 비어 있는 `required` 필드는 브라우저가 검증 말풍선을 걸기 위해 포커스하는 대상인데, 접근성 트리에서 빼낸 요소로 포커스를 옮기면 그 메시지는 아무에게도 전달되지 않습니다. 대신 필드 자신의 이름을 답니다.
- 설명이나 오류는 `aria-describedby`로 버튼에 연결됩니다.

:::

::: fw flutter

- 상자는 버튼 노드 하나이고, 라벨과 상자 안의 문장으로 이름이 붙으며, Enter나 Space로 누릅니다. 파일 목록은 그 **바깥**에 있으므로, 각 삭제 버튼은 상자 안에 중첩되지 않고 자기 노드를 가집니다.
- 상자는 필수인지, 오류 상태인지 알립니다. `MPForm` 안에서는 `name`으로 목록이 나머지와 함께 넘어가고, 아무것도 없는 필수 피커는 제출을 막고 포커스를 받으며, 폼이 그 이름으로 돌려준 오류가 상자 아래에 보입니다.
- 키보드 포커스에서는 라이브러리의 다른 컨트롤과 마찬가지로 상자 바깥에 포커스 링이 그려집니다.

:::

- `removeLabel`은 파일 이름을 받습니다. 그래서 각 삭제 버튼은 "삭제"라는 같은 이름의 버튼 다섯 개가 아니라, 자기가 지울 파일의 이름으로 불립니다.

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| 브라우저의 파일 대화상자 | `onBrowse` | 위젯 계층만 쓰고 의존성이 없는 패키지는 대화상자를 열 수 없습니다. 앱이 거기서 자기 플러그인을 실행하고 `MPFile`을 돌려줍니다. |
| 데스크톱에서 끌어다 놓기 | `MPFilePickerState.add`, `dragging` | Flutter는 플러그인 없이 운영체제의 파일 끌기를 알 수 없습니다. 드롭과 끌기는 앱이 알아내고, 규칙과 모습은 컴포넌트가 맡습니다. |
| `File` | `MPFile` | 이름, 크기, 미디어 타입이고, 앱의 원래 객체는 `source`에 담깁니다. |
| `onFilesChange` | `onFilesChanged` | 변경 콜백에 붙는 Flutter식 이름입니다. `onReject`는 이름을 그대로 둡니다. |
| `defaultValue` | `initialValue` | Flutter의 이름입니다. `value`를 빼면 `null`이 되고 피커가 목록을 직접 들고 있습니다. |
| `icon={null}` | `showIcon: false` | Dart에서 `null`은 기본 그림을 요청하는 값입니다. |
| `label`, `title`, `hint`, `icon` (`ReactNode`) | `Widget?` | 보통 `Text`입니다. |
| `id`, `className`, `style` | — | 넘겨줄 대상이 없습니다. |
| — | `locale`, `semanticLabel`, `focusNode`, `autofocus` | 피커가 직접 쓰는 말의 언어, 상자의 이름, 밖에서 다루는 포커스입니다. |

나머지는 일부러 맞췄습니다. 점선 테두리, 스테이트 레이어와 드롭 색, 규칙과 그 검사 순서, 목록과 새로 들어오는 행, `formatFileSize`가 그렇습니다.

:::

## 함께 보기

- [Prop 규약](../../design/prop-conventions) — 이 컴포넌트가 따르는 공통 어휘.
