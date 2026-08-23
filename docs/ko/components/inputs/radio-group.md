---
title: MPRadioGroup
order: 5
---

# MPRadioGroup

<p class="mp-lede">정확히 하나만 고르는 선택지 묶음입니다. 머터리얼의 20dp 링 안에 10dp 점, 그리고 정말 중요한 부분 — 묶음 전체가 탭 정지 하나이고 그 안에서 화살표 키가 움직입니다.</p>

<Demo src="radio-group/hero" :minHeight="180" />

```tsx
import { MPRadio, MPRadioGroup } from 'material-plus-ui';

const [delivery, setDelivery] = useState('standard');

<MPRadioGroup label="배송" value={delivery} onValueChange={setDelivery}>
  <MPRadio value="standard" label="일반" />
  <MPRadio value="express" label="특급" />
</MPRadioGroup>;
```

## Props

<PropsTable name="MPRadioGroup" />

### MPRadio

<PropsTable name="MPRadio" />

## 옵션이 children인 이유

옵션이 `items` 배열인 [MPSelect](./select)와 다릅니다.

차이는 라디오 옵션이 **블록**이라는 데 있습니다. 라벨과 설명을 가지고, 페이지 아래로 배치되며, 호출하는 쪽이 바꾸고 싶은 것은 텍스트만이 아니라 그 내용입니다. 셀렉트의 옵션은 아직 열리지도 않은 팝업 안의 행이고, 그래서 그쪽은 데이터여야 합니다.

옵션에는 자기 `size`도 `color`도 없습니다. 둘 다 그룹의 것이고, 한 번 설정해서 묶음의 모든 옵션에 같은 의미를 갖게 할 수 있는 유일한 자리가 그룹입니다.

## 탭 정지는 다섯이 아니라 하나

라디오 그룹이 `<div>`에 input을 담은 것이 아니라 컴포넌트인 이유의 전부입니다. ARIA 패턴은 묶음이 탭 정지 **하나**를 갖고 그 안에서 화살표 키가 움직이라고 말하고, Base UI가 그것을 담당합니다. 그룹에 들어올 때 어느 옵션이 포커스를 받는지 — 첫 번째가 아니라 선택된 것 — 까지 포함해서요.

위 그룹으로 Tab해서 들어간 뒤 화살표 키를 눌러 보세요.

## 점이 나타나는 방식

점은 링의 한가운데에서 자라 나옵니다. 링 자신의 테두리가 강조색에 도달하는 것과 같은 200ms이므로, "선택됨"의 두 절반이 함께 도착합니다. 빠질 때도 같은 방식입니다.

체크박스의 체크와 달리 60%가 아니라 0에서 시작하는데, 그 차이는 둘이 각각 무엇인가에서 옵니다. 체크는 획이라서 도착하는 동안에도 읽혀야 하지만, 원은 어떤 크기에서도 여전히 원입니다. [MPCheckbox](./checkbox#체크-표시가-나타나는-방식)를 보세요.

## 예시

### orientation

기본은 세로입니다. 세로 열은 길이에 상관없이 훑을 수 있지만, 가로는 라벨 하나가 예상보다 길어지는 순간 조용히 읽기 어려워집니다. 그래서 `horizontal`은 가질 만한 값이고, 우연히 얻는 것이 아니라 요청해서 얻을 만한 값입니다.

<Demo src="radio-group/orientation" :minHeight="200">

<<< @/.vitepress/demos/radio-group/orientation.tsx

</Demo>

### errorMessage

옵션 아래의 메시지이고, 그룹도 함께 뒤집습니다. `description`은 같은 자리이고 그것으로 대체됩니다.

둘 다 라벨과 함께 `role="radiogroup"` 요소 **바깥**에 놓입니다. 라디오 그룹 안에서 라디오가 아닌 모든 것은, 스크린 리더가 다음 옵션에 닿기 위해 지나가야 하는 내용이기 때문입니다.

### disabled

그룹에 주면 모든 옵션을 한 번에 비활성화하고, 옵션에 주면 그 하나만 비활성화하고 나머지는 그대로 둡니다. 목록에는 있지만 고를 수 없는 것은, 아예 없는 것과 다른 말입니다.

## 접근성

- 라벨은 그룹 안의 `<legend>`가 아니라 `aria-labelledby`가 가리키는 형제 요소입니다. Base UI는 둘 다 문서화하지만, `orientation="horizontal"`에서 살아남는 것은 이쪽뿐입니다. legend는 옵션들의 행에서 flex 아이템이 되어 첫 옵션 위가 아니라 옆에 앉습니다.
- 각 옵션은 자기 라벨로 이름이 붙고 `id`로 연결됩니다.
- `readOnly`는 선택을 보여 주되 바꾸지 못하게 하고, 묶음은 탭 순서에 남습니다.

## 함께 보기

- [MPSelect](./select) — 한꺼번에 보여 주기에는 옵션이 많을 때.
- [MPSegmentedButton](./segmented-button) — 같은 질문이지만 폼을 채우는 것이 아니라 화면을 바꾸는 것일 때.
- [Base UI Radio](https://base-ui.com/react/components/radio) — 아래에 깔린 동작.
