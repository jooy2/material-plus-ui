---
title: MPDatePicker
order: 2
---

# MPDatePicker

<p class="mp-lede">달력에서 고르는 하루. 트리거는 텍스트 필드의 껍데기에 달력 글리프를 단 것이라, 폼 안의 날짜 필드가 주변 필드들과 같은 물건이 됩니다.</p>

<Demo src="date-picker/hero" :minHeight="96" />

::: fw react

```tsx
import { MPDatePicker } from 'material-plus-ui';

const [due, setDue] = useState(null);

<MPDatePicker label="마감일" value={due} onValueChange={setDue} />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

MPDatePicker(
  label: const Text('마감일'),
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

달력은 트리 밖으로 들려 나가므로 피커 위에 `Overlay`가 있어야 합니다. 내비게이터를 둔 `WidgetsApp`이 하나를 줍니다.

:::

## Props

<PropsTable name="MPDatePicker" />

::: fw flutter

트리거는 `MPTextField`와 같은 필드 껍데기 위에, `package:flutter/widgets.dart`만으로 만들었습니다. 그래서 위에 `MaterialApp`이 없는 앱에서도 동작합니다. React 패키지에서 넘어오지 않는 것은 [React 빌드와 다른 점](#react-빌드와-다른-점)에 있습니다.

### MPDateNames

피커가 날짜를 쓸 때 쓰는 단어와 모양입니다. 언제 직접 만드는지는 [현지화](#현지화)에 있습니다.

<PropsTable name="MPDateNames" />

:::

## 달력이 실제로 존재하는 이유

헤더 때문입니다.

한 번에 한 달씩만 넘기는 피커는 30년 전 생일을 180번의 클릭 너머에 둡니다. 그래서 월 이름과 연도가 각각 자기 격자를 여는 **버튼**입니다 — 열두 달, 그다음 한 번에 열두 해. 화면에 있는 해의 어떤 달이든 두 번, 어떤 해든 세 번입니다.

세 뷰는 의도적으로 너비도 높이도 같습니다. 일 뷰는 헤더까지 일곱 행이고, 나머지 둘은 같은 높이 위에 네 행과 세 행을 펼칩니다. 그래서 뷰를 바꿔도 팝업을 연 포인터 아래에서 팝업 크기가 변하지 않습니다.

달을 한 칸 옮기면 **페이지가 넘어갑니다**. 새로 들어오는 주들이 가져온 방향에서 미끄러져 들어와 자리를 잡습니다. 제자리에서 교체되는 격자는 헤더로 어느 달인지만 말할 뿐, 읽는 사람이 어느 쪽으로 갔는지에 대해서는 아무 말도 하지 않았습니다. 그 둘 사이를 오가는 것이 존재 이유인 컨트롤에서요.

넘어가는 것은 주들뿐입니다. 그 위의 요일 이름은 달이 바뀌어도 달라지지 않고, 월요일이 미끄러져 들어와 월요일이 되는 것은 아무 일도 일어나지 않았는데 무언가 일어났다고 말하는 움직임입니다.

움직임을 덜 원한다고 밝힌 독자에게는 교체가 남습니다. 잃는 것은 방향뿐입니다.

## 하루, 한 달, 혹은 한 해

`precision`이 달력을 셋 중 어디에서 멈출지 정합니다.

<Demo src="date-picker/precision" :minHeight="420">

::: fw react

<<< @/.vitepress/demos/date-picker/precision.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/precision.dart

:::

</Demo>

카드 유효기간, 회계연도, 리포트가 다루는 달 — 읽는 사람이 날짜까지 줄 필요가 없는 질문들입니다. 그런 자리에서 굳이 하루를 묻는 컨트롤은 아무도 의도하지 않은 답을 기록하게 됩니다.

멈추는 방식은 **더 잔 뷰를 아예 두지 않는** 것이지 거절하는 것이 아닙니다. `month` 피커는 열두 달 격자로 열리고 그 아래로 내려갈 일 격자가 없으며, `year` 피커는 연도 격자로 열립니다. 답하는 뷰의 _위_ 뷰는 그대로 남습니다. 다른 해로 가는 길이 그것이기 때문입니다 — 월 피커에서 연도를 누르면 연도 페이지가 열리고, 하나를 고르면 다시 달들로 돌아옵니다.

정밀도를 따라 함께 움직이는 것들:

|                      | `'day'`        | `'month'`       | `'year'`    |
| -------------------- | -------------- | --------------- | ----------- |
| 값                   | 누른 날        | 그 달의 **1일** | **1월 1일** |
| 트리거 기본 표기     | `2026. 7. 15.` | `2026년 7월`    | `2026년`    |
| `name`이 제출하는 값 | `2026-07-15`   | `2026-07`       | `2026`      |
| 푸터의 단축 버튼     | 오늘           | 이번 달         | 올해        |

::: fw flutter

Flutter에서 `name` 행은 피커의 `name` 아래로 [MPForm](./form)이 `onSubmit`에 넘기는 값입니다. `DateTime` 자체는 `onChanged`로 옵니다.

:::

값이 단위에 맞춰 잘리는 것은 값이 그 단위를 가리키기 때문입니다. 트리거는 _2026년 7월_ 이라고 쓰면서 폼으로는 31일을 보내는 피커는 쓰는 것과 보내는 것이 다른 피커입니다. 값이 이미 갖고 있던 시각은 일 단위에서와 똑같이 살아남습니다.

`minDate`와 `maxDate`도 그 정밀도로 읽힙니다. 월 피커에서 최소가 7월 10일이어도 7월은 그대로 고를 수 있습니다. 거기서 경계는 "어떤 달이 존재하는가"에 대한 것이기 때문입니다. 넘어오지 않는 것은 `shouldDisableDate` 하나뿐입니다. 이 규칙은 날에 대해 묻는 것이라, 주말에 대해 쓴 규칙에는 "7월이 가능한가"에 대한 답이 없습니다. 1일을 대신 물어 답을 지어내면 하필 일요일에 시작하는 달들이 막히므로, 더 굵은 피커는 아예 호출하지 않습니다.

## 날짜 라이브러리도, 타이핑도 없습니다

사실상 하나인 두 결정입니다.

::: fw react

**아래에 날짜 라이브러리가 없습니다.** 산술 전부가 `Date`이고, 피커가 그리는 모든 이름은 `Intl`에서 옵니다. 슬그머니 `date-fns`를 추가하는 — 더 나쁘게는, 소비자를 대신해 dayjs/luxon/Temporal 논쟁에서 편을 드는 — 컴포넌트 라이브러리는 자기 것이 아닌 결정을 내린 것입니다. 피커는 패키지가 이미 설치하는 것 위에 아무것도 더하지 않습니다.

:::

::: fw flutter

**아래에 날짜 라이브러리가 없습니다.** 산술 전부가 `DateTime`이고, 이름은 패키지가 싣고 다니는 표에서 옵니다. 슬그머니 `package:intl`을 추가하거나 소비자를 대신해 날짜 패키지들 사이에서 편을 드는 컴포넌트 라이브러리는 자기 것이 아닌 결정을 내린 것입니다. Flutter 패키지는 프레임워크 말고는 의존성이 없고, 피커도 하나를 더하지 않습니다.

:::

**그리고 트리거에 타이핑할 수 없습니다.** 자유 텍스트에서 날짜를 파싱하는 일은 날짜 라이브러리 없이는 정직하게 해낼 수 없을 만큼 로케일에 얽혀 있습니다. `27/7/26`은 읽는 사람에 따라 세 개의 다른 날입니다. 어떤 브라우저에서는 알아듣고 다음 브라우저에서는 못 알아듣는 필드는, 애초에 알아듣는다고 하지 않은 필드보다 나쁩니다. 그래서 트리거는 [셀렉트](./select)와 똑같이 버튼이고, 답은 달력에서 옵니다.

## 현지화

움직이는 것은 전부 플랫폼에서 옵니다.

<Demo src="date-picker/locale" :minHeight="480">

::: fw react

<<< @/.vitepress/demos/date-picker/locale.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/locale.dart

:::

</Demo>

::: fw react

`Intl`이 월 이름, 요일 머리글자, 주가 시작하는 요일(미국과 한국은 일요일, 유럽 대부분은 월요일), 헤더 두 버튼의 순서 — `July 2026` 대 `2026년 7월` — 그리고 트리거의 날짜 표기를 제공합니다. 이 순서를 틀리면 티가 잘 안 나면서도 정확히 그게 틀린 사람들에게는 고장으로 읽히므로, 추측하지 않고 물어봅니다.

이 라이브러리가 직접 대는 문자열은 `Intl`이 의견을 갖지 않는 것들뿐입니다. "이전 달", "오늘", "지우기". 열여덟 개 언어로 번역되어 있고, 그 밖의 언어에서는 영어로 내려가며, `labels`로 하나씩 덮어쓸 수 있습니다. 전체는 [현지화](../../design/localization) 페이지에 있습니다.

:::

::: fw flutter

Flutter 프레임워크에는 `Intl`이 없어서, 패키지가 `Intl`이 했을 말을 싣고 다닙니다. 단어를 싣는 열여덟 개 언어와 영어마다 표가 하나씩 있고, 거기에 월과 요일 이름, 오전과 오후, 주가 시작하는 요일(미국과 한국은 일요일, 유럽 대부분은 월요일), 12시간제 여부, 헤더 두 버튼의 순서(`July 2026` 대 `2026년 7월`), 날짜와 시각을 쓰는 모양이 들어 있습니다. 표는 ICU에 실린 CLDR 데이터에서, React 패키지가 실행 중에 `Intl.DateTimeFormat`에 하는 질문을 그대로 던져 만들었습니다. 그래서 두 패키지 모두 트리거가 한국어로는 `2026. 7. 15.`, 독일어로는 `15.07.2026`으로 씁니다.

어느 표를 읽을지는 단어와 같은 태그가 정합니다. 피커의 `locale`, 가장 가까운 `MPLocaleProvider`, `MPConfigProvider`, 앱의 `Localizations` 순입니다. 표가 없는 언어는 영어입니다. "이전 달", "오늘", "지우기" 같은 단어는 여전히 `registerMPMessages`에 넘긴 표에서 오고, `labels`로 하나씩 덮어쓸 수 있습니다.

언어와 상관없이 늘 같은 것이 둘 있습니다. 숫자는 서양식 숫자이고 달력은 그레고리력입니다. 아랍어 날짜도 아랍-인도 숫자가 아니라 `15/07/2026`처럼 쓰고, 태국어 연도도 불기가 아니라 서기입니다.

패키지가 싣지 않은 언어나 지역은 `names`로 넘깁니다. 어느 표를 읽을지는 언어만 보고 정하므로, `en-GB`는 따로 말하지 않으면 미국식으로 일요일에 시작하는 주와 12시간제 시계를 받습니다.

```dart
MPDatePicker(
  locale: 'en-GB',
  names: MPDateNames.english.copyWith(
    firstDayOfWeek: MPWeekday.monday,
    hour12: false,
    patterns: const MPDatePatterns(
      fullDate: 'EEEE d MMMM y',
      mediumDate: 'd MMM y',
      time24: 'HH:mm',
    ),
  ),
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

패턴은 ICU의 문자(`y`, `M`~`MMMM`, `d`, `E`, `h`, `H`, `mm`, `a`, 작은따옴표 안의 글자)로 씁니다. 나머지는 [MPDateNames](#mpdatenames)에 있습니다. 이미 `package:intl`에 의존하는 앱이라면 이름 목록을 `DateFormat.LLLL(tag)`, `DateFormat.EEEE(tag)` 같은 호출로 한 줄씩 채울 수 있습니다.

:::

## 경계

<Demo src="date-picker/bounds" :minHeight="300">

::: fw react

<<< @/.vitepress/demos/date-picker/bounds.tsx

:::

::: fw flutter

<<< @/../packages/flutter/example/lib/demos/date_picker/bounds.dart

:::

</Demo>

여기서 `minDate`와 `maxDate`는 **날짜 단위**입니다. 7월 27일 09:00을 최대로 두어도 27일은 여전히 고를 수 있습니다. 경계가 말하는 건 어떤 날이 존재하느냐이고, 하루 중 시각은 시계의 문제이기 때문입니다. [`MPDateTimePicker`](./date-time-picker)는 같은 prop을 전체 정밀도로 읽고, 그게 둘 사이의 유일한 실질적 차이입니다.

`shouldDisableDate`는 규칙이 말하는 것을 막습니다 — 주말, 공휴일, 이미 예약된 방.

막힌 날도 전부 **그려지고**, 그중 어느 것도 포커스 순서에서 빠지지 않습니다. 구멍 뚫린 격자는 화살표로 한 달을 가로지르는 사람이 빠지는 격자이고, "이 날은 존재하지 않는다"와 "이 날은 당신 것이 아니다"는 다른 주장입니다.

## 예시

### 날짜를 바꿔도 시각은 살아남습니다

날을 고르면 날만 바뀝니다. 시각도 함께 담는 필드에 묶인 피커가, 날짜를 고칠 때마다 조용히 자정으로 되돌려서는 안 됩니다.

::: fw react

```tsx
// value가 7월 10일 14:30일 때 15일을 고르면 7월 15일 14:30이 됩니다.
<MPDatePicker value={value} onValueChange={setValue} />
```

:::

::: fw flutter

```dart
// value가 7월 10일 14:30일 때 15일을 고르면 7월 15일 14:30이 됩니다.
MPDatePicker(value: value, onChanged: (DateTime? next) => setState(() => value = next));
```

:::

### floatingLabel

이 라이브러리에서 노치를 두른 컨트롤은 자리를 비켜줄 것이 없는 동안 라벨을 자기 줄 위에 내려둡니다 — [MPTextField](./text-field#floatinglabel) 참고. 다만 피커는 실질적으로 예외입니다. 내려온 라벨이 설 바로 그 자리에 달력 글리프를 그리고, 둘 중에서는 글리프 쪽이 "누르면 달력이 열린다"고 말하는 쪽이기 때문입니다.

그래서 글리프를 빼달라고 하지 않는 한 라벨은 노치에 남습니다.

::: fw react

```tsx
<MPDatePicker label="Due date" startIcon={null} value={due} onValueChange={setDue} />
```

:::

::: fw flutter

```dart
MPDatePicker(
  label: const Text('마감일'),
  startIcon: null,
  value: due,
  onChanged: (DateTime? next) => setState(() => due = next),
);
```

:::

`MPDateRangePicker`, `MPDateTimePicker`, `MPTimePicker`도 마찬가지입니다.

### clearable

트리거에 ×를, 푸터에 단어를 답니다. 피커가 비어 있거나 읽기 전용이거나 비활성일 때는 나타나지 않습니다. 지울 게 없으니까요.

### readOnly

값을 보여 주고, 탭 순서에 남고, **열리지 않습니다**. 읽기 전용 피커가 담고 있는 건 읽을 거리이고, 모든 칸이 죽어 있는 달력은 아무것도 없는 메뉴입니다.

### name

::: fw react

hidden input을 더해서 전체가 폼과 함께 제출되게 합니다.

```html
<input type="hidden" name="due" value="2026-07-15" />
```

:::

::: fw flutter

피커를 감싼 [MPForm](./form)에 값을 등록합니다. 그래서 제출하면 `onSubmit`이 `{'due': '2026-07-15'}`를 받고, 비어 있는 `required` 피커는 아래에 "필수"라는 말을 띄우며 제출을 막습니다.

:::

UTC가 아니라 로컬이고, 그게 핵심 전부입니다. 서울에서 7월 15일을 뜻하는 `Date`에 `toISOString()`을 하면 `2026-07-14T15:00:00Z`가 나옵니다. 화면에 보이는 날의 전날을 조용히 보고하는 폼 필드는 날짜 피커가 낼 수 있는 가장 비싼 버그입니다. 형식은 `<input type="date">`가 제출하는 그것이므로, 이미 그걸 파싱하는 서버는 새로 쓸 코드가 없습니다.

## 접근성

::: fw react

- 트리거는 홈에 놓인 라벨이 `id`로 이름 붙인 버튼입니다.

:::

::: fw flutter

- 트리거는 버튼 노드 하나입니다. 노치의 라벨이 이름이 되고, 담긴 날짜는 **값**으로 읽히며, 아래 줄도 함께 읽힙니다. 보이는 라벨이 없는 피커는 `semanticLabel`로 이름을 붙입니다.

:::

- 격자에는 **roving tab stop**이 하나뿐이고, 이게 ARIA의 날짜 피커 관행입니다. `Tab`은 마흔두 칸을 걷는 대신 달력을 떠납니다.
- 화살표는 하루씩, `Home`/`End`는 그 주의 양끝으로, `PageUp`/`PageDown`은 한 달씩 — Shift와 함께면 한 해씩 움직입니다. 가장자리를 넘어가면 멈추는 대신 달력이 넘어갑니다.
- 모든 칸은 맨 숫자가 아니라 온전한 날짜로 이름 붙습니다. 그래서 "15"가 아니라 "2026년 7월 15일 수요일"로 읽힙니다.
- 오늘은 채움이 아니라 **테두리** 원으로 표시하고, 그 테두리는 border라서 포커스 링과 공존할 수 있습니다.

::: fw flutter

## React 빌드와 다른 점

이 페이지의 대부분은 두 패키지에서 같습니다. 아래는 같지 않은 지점과 그 이유입니다.

| React | Flutter | 이유 |
| --- | --- | --- |
| `onValueChange` | `onChanged` | 단순한 변경에 쓰는 Flutter의 이름입니다. `onOpenChange`는 이름을 그대로 둡니다. |
| `defaultValue`, `defaultOpen` | `initialValue`, `initialOpen` | Flutter의 이름입니다. 부모가 바꾼 `value`는 `null`까지 포함해 피커가 들고 있던 값을 대신하고, 빼면 피커가 값을 직접 들고 있습니다. |
| `Intl`에 닿는 `locale` | 패키지의 표에 닿는 `locale`, 그리고 `names` | 프레임워크에 `Intl`이 없습니다. 열여덟 개 언어와 영어를 싣고, 나머지는 `names`가 맡습니다. |
| `format` (`Intl.DateTimeFormatOptions`) | `format` (`String Function(DateTime)`) | 옵션을 넘길 `Intl`이 없습니다. |
| 노드로 받는 `label`, `description`, `errorMessage`, `placeholder` | `Widget?`, `placeholder`는 `String?` | `MPNumberField`가 받는 방식과 같습니다. placeholder는 너비를 재야 해서 문자열입니다. |
| `weekStartsOn: 0`–`6` | `weekStartsOn: MPWeekday` | `MPWeekday.monday`부터 `MPWeekday.sunday`까지, Dart의 번호 체계입니다. |
| `name` 아래의 hidden input | `MPForm`에 값을 등록하는 `name` | Flutter에는 native 폼이 없습니다. 문자열은 같습니다. |
| `onKeyDown`, `onKeyUp` | `onKeyEvent` | 콜백 하나로, 트리거가 스스로 처리하지 않는 키를 받습니다. |
| `onFocus`, `onBlur` | `onFocusChange` | `bool`을 받는 콜백 하나입니다. |
| `onClick`, `onDoubleClick`, `onContextMenu` | — | 포인터는 피커를 `GestureDetector`로 감싸서 받습니다. |
| `id`, `className`, `style` | — | 넘겨줄 대상이 없습니다. |
| — | `semanticLabel`, `focusNode`, `autofocus` | 보이는 라벨이 없는 피커의 이름과, 밖에서 다루는 포커스입니다. |
| `Intl`이 쓰는 곳의 아랍-인도 숫자와 불기 | 어디서나 서양식 숫자와 그레고리력 | 표는 모양과 이름을 담고, 숫자는 늘 칸에 보이는 숫자입니다. |

화면보다 넓은 팝업은 화면 밖으로 넘치지 않고 시트 안에서 스크롤됩니다. 나머지는 일부러 맞췄습니다. 껍데기, 세 가지 뷰, 페이지 넘김, 키, 정밀도 규칙, 경계, 푸터가 그렇습니다.

:::

## 함께 보기

- [MPDateRangePicker](./date-range-picker) — 두 날과 그 사이 전부.
- [MPDateTimePicker](./date-time-picker) — 날짜와 시각을 한 팝업에서.
- [MPTimePicker](./time-picker) — 시각만.
- [현지화](../../design/localization) — `locale`이 닿는 곳과 닿지 않는 곳.
