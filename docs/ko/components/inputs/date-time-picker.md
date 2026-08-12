---
title: MPDateTimePicker
order: 5
---

# MPDateTimePicker

<p class="mp-lede">날짜와 시각을 한 팝업에서. 시계가 달린 날짜 피커가 아닙니다 — 두 패널이 정확히 같은 높이로 나란히 앉아 있어서, 팝업이 크기가 다른 두 개를 붙여 놓은 것이 아니라 하나의 사각형입니다.</p>

<Demo src="date-time-picker/hero" :minHeight="120" />

```tsx
import { MPDateTimePicker } from 'material-plus-ui';

const [starts, setStarts] = useState(null);

<MPDateTimePicker
  label="시작"
  minDate={new Date()}
  minuteStep={15}
  value={starts}
  onValueChange={setStarts}
/>;
```

## Props

<PropsTable name="MPDateTimePicker" />

## 두 패널의 높이가 같은 이유

달력의 격자와 시계의 열이 하나의 사다리를 공유하기 때문입니다.

`md`에서 날짜 칸은 40px이고, 일 뷰는 헤더까지 일곱 행이며, 시계의 각 열도 같은 숫자에 대해 `7 × cell` 높이로 그려집니다. 런타임에 무언가를 재는 부분은 없습니다. 둘 다 같은 `--_mp-cell` 길이를 읽으므로, 둘을 담은 팝업은 하나의 사각형이 됩니다.

이 정도의 조율은 값어치가 있습니다. 높이가 다른 두 패널을 붙여 놓는 것은, 결합형 피커가 조립된 물건처럼 보이게 되는 가장 흔한 경로입니다.

## 여기서는 경계가 더 많은 일을 합니다

[`MPDatePicker`](./date-picker)와의 유일한 실질적 차이이고, 이름이 아니라 prop의 *의미*의 차이입니다.

`minDate`와 `maxDate`를 **전체 정밀도**로 읽습니다. 15일 09:30이 최소라면,

- 그날의 일부가 허용되므로 달력에서 15일은 **고를 수 있게** 남고,
- 시계에서는 오전이 시 단위로, 그다음 분 단위로 **흐려집니다**.

날짜 단위 검사로는 이걸 표현할 수 없습니다. 15일 전체를 막거나 전체를 허용하거나 둘 중 하나가 됩니다. "지금 이전은 안 됨"이라는 규칙이 실제로 필요로 하는 게 이것이고, 두 컴포넌트가 같은 prop을 다르게 읽는 이유이기도 합니다 — 하나로 통일하면 둘 중 하나에게는 틀린 동작이 됩니다.

`shouldDisableDate`와 `shouldDisableTime` 둘 다 있고, 각각 필요한 것만 정확히 받습니다. 날짜, 또는 순간과 그게 나온 열.

## 순서는 상관없습니다

날을 고르면 날이 바뀝니다. 시를 고르면 시가 바뀝니다. 어느 쪽도 다른 쪽을 되돌리지 않습니다.

날짜를 고칠 때마다 시각을 자정으로 되돌리는 피커는 순간을 고르는 일을 **순서가 정해진 작업**으로 만들고, 아무도 팝업을 쓰인 순서대로 읽지 않습니다. 아직 고른 날이 없으면 시계는 오늘 위에 쓰고, 나중에 날을 고르면 이미 맞춰 둔 시각이 그대로 유지됩니다.

여기서 `closeOnSelect`가 `false`이고 날짜 피커에서는 `true`인 것도 같은 이유입니다. 순간은 날짜 _그리고_ 시각이고, 둘 중 첫 번째에서 닫으면 두 번째는 답을 얻지 못합니다. 대신 **완료** 버튼이 있습니다.

## 예시

### 트리거는 글리프 하나만 답니다

둘 다가 아니라 달력입니다. 컨트롤은 한 번에 두 가지를 말할 수 없고, 읽는 사람이 눈으로 찾는 건 날짜 쪽입니다.

### format

기본값은 `{ dateStyle: 'medium', timeStyle: 'short' }`에 `hour12`가 접혀 들어간 것이라, 트리거가 열이 그려진 다이얼과 같은 말을 합니다. `Intl`이 받는 것은 무엇이든 동작합니다.

```tsx
<MPDateTimePicker format={{ dateStyle: 'full', timeStyle: 'medium' }} />
```

### name

`<input type="datetime-local">`이 제출하는 형식의 hidden input입니다.

```html
<input type="hidden" name="starts" value="2026-07-15T09:05" />
```

UTC가 아니라 로컬입니다. 서울에서 7월 15일 09:05를 뜻하는 `Date`에 `toISOString()`을 하면 `2026-07-15T00:05:00Z`가 나옵니다 — 순간 자체는 맞지만, 폼을 읽는 쪽이 틀리게 읽을 형식입니다.

## 접근성

양쪽 절반이 각자 가진 것 전부가 그대로입니다. 달력의 roving tab stop과 키보드 어휘 전체, 시계의 이름 붙은 listbox들과 시각을 한 문장으로 되읽어 주는 live region. 둘 사이의 구분선은 장식이라 숨겨져 있습니다.

## 함께 보기

- [MPDatePicker](./date-picker) — 달력 절반. 공유되는 동작 전부가 거기 있습니다.
- [MPTimePicker](./time-picker) — 시계 절반. 다이얼이 아니라 열인 이유도 거기 있습니다.
- [현지화](../../design/localization) — 여기서 `locale`이 결정하는 것.
