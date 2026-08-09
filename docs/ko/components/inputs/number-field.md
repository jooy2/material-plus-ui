---
title: MPNumberField
order: 3
---

# MPNumberField

<p class="mp-lede">숫자만 담는 필드이고, `MPTextField`의 껍데기를 픽셀 단위로 그대로 씁니다. 화살표 키와 증감 버튼이 `step`만큼 움직이고, 값은 `min`과 `max` 사이로 잘리며, `format`은 통화나 백분율로 써 주면서도 값 자체는 순수한 숫자로 남깁니다.</p>

<Demo src="number-field/hero" :minHeight="72" />

```tsx
import { MPNumberField } from 'material-plus-ui';

const [quantity, setQuantity] = useState(1);

<MPNumberField label="수량" value={quantity} onValueChange={setQuantity} min={1} max={20} />;
```

## Props

<PropsTable name="MPNumberField" />

## `<input type="number">`가 아닌 이유

native 쪽도 될 것처럼 보이기 때문에 분명히 적어 둘 가치가 있습니다.

일부 브라우저에서는 텍스트를 조용히 받아들입니다. 스피너는 스타일을 줄 수 없고, 사파리에는 스피너가 아예 없습니다. 기본적으로 스크롤에 반응해서, 포인터 아래에서 페이지가 스크롤되면 값이 바뀝니다. 그리고 파싱에 실패한 모든 입력을 `''`로 보고합니다. 즉 _약간_ 잘못된 필드와 빈 필드를 읽는 쪽에서 구분할 수 없습니다.

이것은 `inputmode="numeric"`을 가진 `type="text"`에 role 설명을 붙인 것이고, Base UI의 number field가 하는 방식입니다. 그래서 휴대폰은 여전히 숫자 키패드를 띄우고 스크린 리더는 여전히 숫자 필드라고 말하면서, 파싱은 브라우저의 기분이 아니라 로케일을 기준으로 이루어집니다.

## 예시

### format

`format`은 `Intl.NumberFormat`으로 그대로 전달됩니다. 그래서 상자는 `$1,240.00`이라고 말하면서 `onValueChange`는 `1240`을 넘깁니다.

<Demo src="number-field/format" :minHeight="220">

<<< @/.vitepress/demos/number-field/format.tsx

</Demo>

이 분리가 이것이 prop인 이유의 전부입니다. 들어갈 때 서식을 입히면 나올 때 파싱을 해야 하고, 어려운 쪽은 파싱입니다.

### steppers

세 가지 배치이고, 네 번째는 없습니다.

<Demo src="number-field/steppers" :minHeight="280">

<<< @/.vitepress/demos/number-field/steppers.tsx

</Demo>

native 숫자 입력이 만들어 내는 모양 — 위아래로 쌓인 절반 높이 chevron 한 쌍 — 은 의도적으로 없습니다. `xs`에서는 화살표 하나가 3픽셀도 되지 않고, 그만한 표적은 아무도 맞히지 못합니다.

`min`이나 `max`에 닿은 증감 버튼은 그냥 반응하지 않는 것이 아니라 비활성화됩니다. 누르기 전에 갈 곳이 없다는 것을 볼 수 있어야 하니까요. `readOnly`는 두 버튼을 통째로 없앱니다. 비활성 상태로 남겨 두는 것은 같은 말을 두 번 하는 것이고, 그중 비활성 쪽은 고장 난 것처럼 보입니다.

### step, largeStep, smallStep

`step`은 화살표 키 한 번입니다. Shift는 `largeStep`(기본 10), Alt는 `smallStep`(기본 0.1)을 씁니다. Base UI의 관례이고 스프레드시트와 같은 동작입니다.

```tsx
<MPNumberField label="투명도" step={0.05} smallStep={0.01} min={0} max={1} />
```

### onValueCommitted

`onValueChange`는 모든 변경마다 — 모든 키 입력, 모든 스텝, 휠 한 칸마다 — 발생합니다. `onValueCommitted`는 값이 확정될 때 한 번 발생합니다. 타이핑 후 blur, 버튼을 누르고 뗀 시점, 그리고 키보드에서는 `onValueChange`와 함께입니다.

앞의 것으로 폼 상태를 맞추고, 비싼 일은 뒤의 것에 두세요.

## 접근성

- 라벨은 외곽선의 홈에 놓이고 `id`로 input과 연결됩니다. 텍스트 필드와 똑같습니다.
- 두 증감 버튼은 이름을 가진 진짜 버튼입니다. `incrementLabel`과 `decrementLabel`은 기본값이 영어이고, 현지화된 애플리케이션에서는 바꿔 주는 것을 전제로 합니다.
- `allowWheelScrub`은 기본이 **꺼짐**입니다. 포인터 아래에서 페이지가 스크롤되는 것과 필드가 바뀌는 것은 같은 제스처이고, 의도한 쪽은 하나뿐입니다.

## 함께 보기

- [MPTextField](./text-field) — 여기서 빌려 온 껍데기.
- [MPSlider](./slider) — 읽는 사람이 정확히 아는 값이 아니라 가늠하는 값이라면.
- [Base UI Number Field](https://base-ui.com/react/components/number-field) — 아래에 깔린 동작.
