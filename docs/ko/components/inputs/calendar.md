---
title: MPCalendar
order: 1
---

# MPCalendar

<p class="mp-lede">팝업이 아니라 페이지 위의 한 달. <code>MPDatePicker</code>가 여는 그 격자를, 앞에 아무것도 두지 않고 그대로 씁니다.</p>

<Demo src="calendar/hero" :minHeight="360" />

```tsx
import { MPCalendar } from 'material-plus-ui';

const [day, setDay] = useState(new Date());

<MPCalendar value={day} onValueChange={setDay} />;
```

## Props

<PropsTable name="MPCalendar" />

## 왜 별도 컴포넌트인가

달력은 처음부터 `MPDatePicker`의 더 큰 절반이었습니다. 한 자리에 겹쳐 놓인 세 개의 뷰, 하나뿐인 탭 스톱, 가장자리를 넘어가면 달을 넘기는 방향키, 그리고 월 이름과 연도가 각각 자기 격자를 여는 버튼인 헤더. 없던 것은 **앞에 트리거를 두지 않고 쓰는 방법**뿐이었습니다.

이건 실재하는 형태입니다. 예약 페이지는 지금 이야기하고 있는 달을 보여 주지, 그걸 보려고 무언가를 열라고 하지 않습니다. 대시보드는 필터링하는 목록 옆에 달력을 둡니다. 자리가 있는 폼이라면 필드 뒤에 숨길 이유가 없습니다. 이 셋 모두에서 팝업은 걸리적거리는 쪽입니다.

피커의 달력이 하는 일은 이것도 전부 합니다 — 헤더, 페이지 넘김, 키보드는 [MPDatePicker](./date-picker.md#what-the-calendar-is-actually-for) 쪽에 적혀 있고 여기서 되풀이하지 않습니다.

## 기본값은 아무것도 칠하지 않습니다

`variant`가 `'text'`라서 면을 전혀 칠하지 않습니다.

<Demo src="calendar/surface" :minHeight="380">

<<< @/.vitepress/demos/calendar/surface.tsx

</Demo>

기본값이 그런 이유는, 독립 달력이 놓이는 곳이 거의 언제나 **이미 면**이기 때문입니다 — `MPCard`, 패널, 직접 만든 팝오버. 두 번째 면을 칠하는 기본값은 흔한 경우에 상자 안의 상자가 되고, 칠해진 면에서 빠져나오는 길은 override밖에 없습니다.

여백도 면을 따라갑니다. `text` 달력에는 padding도 없는데, 맨 격자는 옆에 놓인 것과 줄을 맞춰야 하기 때문입니다. 나머지 넷은 피커 팝업이 쓰는 그 padding 사다리를 그대로 쓰므로, 혼자 서 있는 달력과 피커 안의 같은 달력이 한 칸 어긋나는 일은 없습니다.

## 화면에 떠 있는 달은 그 자체로 상태입니다

그리고 읽는 사람이 두고 간 자리에 그대로 있습니다.

`MPDatePicker`는 팝업이 열릴 때마다 달력을 고른 날로 되돌립니다. 여는 행위 자체가 "다시 시작"이라는 사건이기 때문입니다. 늘 화면에 있는 달력에는 그런 순간이 없고, 누가 9월을 읽고 있는데 7월로 튕겨 돌아가는 달력은 그 사람이 의도한 이동을 취소하는 셈입니다.

직접 몰고 싶은 경우를 위해 `month`와 `onMonthChange`가 있습니다 — 한 달 간격으로 벌려 둔 달력 두 개, 직접 만든 "12월로 가기" 버튼:

```tsx
const [month, setMonth] = useState(new Date());

<MPCalendar month={month} onMonthChange={setMonth} />;
```

## 고르는 것으로 비워지지는 않습니다

`onValueChange`는 `Date`를 건네고 `null`은 건네지 않습니다. `MPDatePicker`와 시그니처가 갈라지는 유일한 지점입니다.

달력에는 ×가 없고, 고른 날을 한 번 더 눌러도 선택이 풀리지 않습니다. 두 번째 누름에 스스로 비워지는 컨트롤은 더블클릭 한 번에 값을 잃습니다 — 게다가 지우기 어포던스를 놓을 트리거가 있는 피커와 달리, 달력이 그걸 제공하려면 푸터가 자라야 합니다.

비우려면 바깥에서 `value`를 `null`로 두세요.

## 경계는 지우는 게 아니라 표시합니다

`minDate` · `maxDate` · `shouldDisableDate`는 날을 흐리게 하고 격자에 그대로 남깁니다.

<Demo src="calendar/booking" :minHeight="420">

<<< @/.vitepress/demos/calendar/booking.tsx

</Demo>

구멍 난 격자는 방향키로 한 달을 훑는 사람이 빠지는 격자입니다. 그래서 막힌 칸은 자리와 이름을 그대로 지키고 거절만 합니다. `shouldDisableDate`는 **날에 대해서만** 묻습니다. `precision`이 달이나 해인 달력은 아예 호출하지 않는데, 주말에 관해 쓴 규칙은 "7월이 가능한가"에 답할 수 없고, 1일로 답을 지어내면 하필 일요일에 시작하는 달들이 막히기 때문입니다.

## 날, 달, 또는 해

`precision`은 달력이 어느 뷰에서 멈출지를 정합니다. 피커에서와 똑같습니다.

```tsx
<MPCalendar precision="month" onValueChange={setBillingMonth} />
```

`month` 달력은 열두 달로 열리고 그 아래 날짜 격자로 내려갈 길이 없습니다. `year` 달력은 연도로 열립니다. 답은 물어본 단위로 잘려 나오므로 — 그 달의 1일, 또는 1월 1일 — *2026년 7월*이라고 말하는 값이 몰래 31일인 일은 없습니다.

## 폼 안에서

`name`을 주면 **로컬** 날짜를 `YYYY-MM-DD`로 실은 hidden input이 생기고, `precision`을 따라 `YYYY-MM`이나 `YYYY`로 줄어듭니다.

```tsx
<form action="/book">
  <MPCalendar name="day" defaultValue={new Date()} />
</form>
```

UTC가 아니라 로컬인 이유는 이 라이브러리 전체가 달력의 하루를 로컬로 다루는 이유와 같습니다. 서울의 7월 15일은 `toISOString()`에서 14일이고, 화면에 보이는 것보다 하루 앞선 날을 제출하는 폼은 지구의 정확히 절반에서 틀립니다. `name`이 없으면 hidden input 자체가 없습니다.

## 날카로운 모서리

- **마운트하면서 포커스를 가져가지 않습니다.** `autoFocus`는 `false`이며, 피커 안의 달력과 정반대입니다. 포커스를 채 가면 위쪽에서 입력 중이던 캐럿이 밀려납니다.
- **범위 달력이 아닙니다.** 양 끝은 [MPDateRangePicker](./date-range-picker.md)의 질문입니다. 두 끝 사이에 그리는 띠는 절반만 고른 상태의 미리보기를 필요로 하는데, 값 하나로는 그걸 담을 자리가 없습니다.
- **일정 달력도 아닙니다.** 칸별 렌더 훅이 없습니다. 아무 내용이나 담을 수 있는 칸은 40dp 타깃이기를 그만두고 레이아웃이 되기 때문입니다.
- **격자의 탭 스톱은 하나입니다.** `Tab`은 마흔두 칸을 걸어가지 않고 달력을 떠납니다. 안에서 움직이는 것은 방향키입니다.

## 다음

- [MPDatePicker](./date-picker.md) — 같은 달력을 필드 뒤에 둔 것.
- [로컬라이제이션](../../design/localization.md) — 월 이름이 어디서 오는지.
