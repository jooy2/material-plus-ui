---
title: MPSelect
order: 2
---

# MPSelect

<p class="mp-lede">목록에서 값 하나를 고릅니다. 트리거는 `MPTextField`의 껍데기에 chevron을 단 것입니다 — 같은 홈이 파인 외곽선, 홈에 놓인 같은 라벨, 같은 보조 텍스트. 그래서 폼 안의 드롭다운이 주변 필드들과 같은 물건이 됩니다.</p>

<Demo src="select/hero" :minHeight="72" />

```tsx
import { MPSelect } from 'material-plus-ui';

const [city, setCity] = useState(null);

<MPSelect
  label="도시"
  items={[
    { value: 'kr-11', label: '서울' },
    { value: 'jp-13', label: '도쿄' }
  ]}
  value={city}
  onValueChange={setCity}
/>;
```

## Props

<PropsTable name="MPSelect" />

## 옵션이 데이터인 이유

조합해서 쓰는 `<MPSelect.Option>`은 없고, 그건 편법이 아닙니다.

목록은 팝업이 마운트되기도 전에 **트리거**에서 필요합니다. 그렇지 않으면 닫힌 셀렉트는 원본 값밖에 보여 줄 수 없고, "서울"이라고 말해야 할 필드가 `kr-11`이라고 말하며 앉아 있게 됩니다. children으로는 이걸 할 수 없습니다. 팝업이 열리기 전까지 존재하지 않으니까요.

게다가 호출하는 쪽은 이미 배열을 갖고 있는 경우가 대부분입니다. 옵션은 손으로 쓰이는 것보다 API나 상수에서 오는 일이 훨씬 많습니다.

## 값이 될 수 있는 것

`string` 또는 `number`입니다. 임의의 객체는 의도적으로 받지 않습니다.

셀렉트는 폼 컨트롤이고 그 값은 폼이 제출하는 것입니다. 거기서 벗어나는 모든 장치 — 객체 값, 커스텀 동등성 비교, 트리거용 문자열 변환기 — 는 유연성을 사면서 흔한 경우를 더 쓰기 어렵게 만듭니다. 여기에는 식별자를 두고, 객체는 반대편에서 찾으세요.

## 예시

### errorMessage

별도의 `error` boolean은 없습니다. 메시지가 곧 오류 상태를 만들므로, 왜 잘못되었는지 설명 없이 잘못되어 보이기만 하는 컨트롤은 만들 수 없습니다.

<Demo src="select/states" :minHeight="300">

<<< @/.vitepress/demos/select/states.tsx

</Demo>

`description`은 같은 자리이고, `errorMessage`는 그 아래 쌓이는 것이 아니라 그것을 대체합니다. 머터리얼은 보조 텍스트에 한 줄을 줍니다. 자리를 만들려고 설명을 아래로 밀면, 읽는 사람은 방금 적용되지 않게 된 문장을 읽고 있게 됩니다.

### 비활성 옵션

옵션은 선택 불가능하면서도 목록에 남을 수 있습니다.

```tsx
items={[
  { value: 'free', label: 'Free' },
  { value: 'team', label: 'Team', disabled: true }
]}
```

지우지 않고 남기는 것은 의도입니다. "있지만 당신에게는 아님"과 "없음"은 다른 말이고, 동료가 말한 요금제가 왜 안 보이는지 설명해 주는 쪽은 하나뿐입니다.

### floatingLabel

고른 값이 없고 팝업도 닫혀 있는 동안 라벨은 플레이스홀더가 있을 자리, 즉 트리거 자신의 줄 위에 내려와 있다가 포커스나 첫 선택에서 노치로 올라갑니다. `placeholder`는 그때까지 보류됩니다 — 한 상자 안의 회색 문자열 두 개는 힌트가 아닙니다. 규칙 전체는 [MPTextField](./text-field#floatinglabel)에 있습니다.

팝업이 열려 있는 것도 포커스로 칩니다. Base UI가 포커스를 목록 안으로 옮기기 때문에, 트리거만 보는 라벨이라면 사용자가 한창 고르는 중에 다시 내려와 버립니다.

`floatingLabel={false}`는 라벨을 노치에 고정하고, `startIcon`이 있으면 어느 쪽이든 노치에 남습니다 — 글리프가 내려온 라벨이 설 자리에 이미 서 있기 때문입니다.

### size

다섯 단계이고 텍스트 필드가 그려지는 것과 같은 단계입니다. 같은 `size`의 필드 옆에 놓인 셀렉트는 픽셀 단위로 맞춰집니다. 껍데기를 공유하는 이유가 그것입니다.

<Demo src="select/sizes" :minHeight="440">

<<< @/.vitepress/demos/select/sizes.tsx

</Demo>

## 팝업

`surface-container`에 elevation 2 — 이 라이브러리에서 정말로 떠 있는 유일한 면이고, 기본으로 그림자를 갖는 유일한 면입니다.

선택된 행은 채움만이 아니라 **체크**로 표시됩니다. 강조 표시는 키보드 커서의 모습이기도 하기 때문입니다. "선택됨"과 "화살표 키가 있는 곳"이 같은 색인 목록은 읽을 수 없는 목록입니다. 체크의 열은 모든 행에 예약되어 있어서, 선택이 아래로 내려가도 라벨이 옆으로 밀리지 않습니다.

## 접근성

- 트리거는 홈에 놓인 라벨로 이름이 붙고 `id`로 연결됩니다.
- 팝업의 위치 계산과 뒤집기, 포커스 트랩, typeahead, 폼과 함께 제출되는 숨은 input은 모두 Base UI가 담당합니다.
- `readOnly`는 값을 보여 주되 바꾸지 못하게 하고 탭 순서에 남습니다. `disabled`는 둘 다 아닙니다.

## 함께 보기

- [MPTextField](./text-field) — 여기서 빌려 온 껍데기.
- [MPRadioGroup](./radio-group) — 한꺼번에 다 보여 줄 만한 개수의 옵션이라면.
- [Base UI Select](https://base-ui.com/react/components/select) — 아래에 깔린 동작.
