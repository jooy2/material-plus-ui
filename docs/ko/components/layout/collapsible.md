---
title: MPCollapsible
order: 7
---

# MPCollapsible

<p class="mp-lede">혼자 서 있는, 접히는 한 구획입니다. 폼의 "더 보기", 선택적인 설정 묶음, 행 아래의 상세 — 패널의 높이는 실제로 잰 값에서 애니메이션되므로 내용이 한 번에 튀어나오지 않습니다.</p>

<Demo src="collapsible/hero" :minHeight="220" />

```tsx
import { MPCollapsible } from 'material-plus-ui';

<MPCollapsible title="배송 옵션" subtitle="일반 배송 선택됨">
  일반 배송은 영업일 기준 3~5일이 걸립니다.
</MPCollapsible>;
```

## Props

<PropsTable name="MPCollapsible" />

## 아코디언이 아닌 이유

[MPAccordion](./accordion)은 이런 접힘의 _집합_ 이고, 그중 무엇이 열려 있는지를 스스로 소유합니다. 이 컴포넌트는 옆에 아무것도 없는 같은 접힘이라서, 남의 목록에 속한 자리 대신 자기 `open`이 필요합니다.

선택 기준은 마크업이 아니라 페이지입니다.

- **서로 관계없는** 두 구획 — 폼의 "고급 설정", 결과 아래의 "원본 응답 보기" — 은 콜랩서블 두 개입니다. 하나가 열렸다고 다른 하나를 닫는 건, 페이지에 없는 관계를 컴포넌트가 지어내는 일입니다.
- 서로 **대안 관계**여서 전부 열리면 페이지가 읽는 사람 밑에서 자라나는 구획들은 아코디언입니다.

콜랩서블을 쌓아 두는 건 전혀 이상한 일이 아닙니다. 그 쌓임 자체에 규칙이 필요해지는 순간이 아코디언입니다.

## 무엇이 움직이고, 왜 그건 허용되는지

패널의 높이는 애니메이션됩니다. 표면을 움직이지 않는다는 이 라이브러리의 규칙에 대한 예외처럼 보이지만 아닙니다.

변형(transform)되는 것이 없고, 글자가 다시 샘플링되지 않으며, 내용이 자기가 담긴 패널을 기준으로 이동하지도 않습니다. 패널은 가만히 있는 내용 위로 열리는 창입니다. 규칙이 막으려는 것은 읽는 사람이 이미 보고 있는 문장을 화면 위로 끌고 다니는 시트이고, 그건 다른 문제입니다.

높이는 Base UI가 내용을 재서 `--collapsible-panel-height`로 내놓은 값입니다. 지속 시간과 커브는 명세의 `short4`와 `standard`로, 텍스트 필드의 외곽선이 정착할 때 쓰는 것과 같은 조합입니다. `prefers-reduced-motion`에서는 전환이 사라지고 그냥 잘립니다.

## 표면은 중립으로 남습니다

<Demo src="collapsible/variants" :minHeight="420">

<<< @/.vitepress/demos/collapsible/variants.tsx

</Demo>

여기서 `filled`가 무엇인지 보세요. 강조 색이 **아니라** MD3 자신의 filled 카드 표면인 `surface-container-highest`입니다. 버튼이나 [얼럿](../feedback/alert)에서 `filled`는 강조 색 위에 그에 맞는 잉크를 얹은 것입니다. 그 컴포넌트들은 스스로가 칠해지는 대상이기 때문입니다. 콜랩서블은 남의 내용을 담는 상자이고, 상자를 물들이면 그 안의 내용 배경이 물듭니다 — 안에 들어간 링크, 필드, 버튼 하나하나가 강조 색 위에서의 처리를 따로 필요로 하게 됩니다.

`color` prop이 없는 이유도 같습니다. 읽을 것이 없습니다. 표면은 구조적으로 중립이고, 포커스 링은 이 라이브러리의 모든 컨트롤에서 `secondary`입니다. 아무 데도 닿지 않는 prop은 영원히 지원해야 하는 prop입니다.

## 예시

### 헤더 슬롯

<Demo src="collapsible/slots" :minHeight="260">

<<< @/.vitepress/demos/collapsible/slots.tsx

</Demo>

`action`은 트리거 **바깥**에 있고, 이건 겉모습이 아니라 구조의 문제입니다. 접히기도 하고 스위치도 들고 있는 헤더에는 누를 것이 두 개 있는데, `<button>` 안의 `<button>`은 브라우저가 파싱하면서 고쳐 쓰는 마크업입니다. 그래서 액션은 트리거의 형제이고, 그것을 눌러도 자기가 앉아 있는 구획이 접히지 않습니다.

### trigger

헤더 전체를 직접 만든 컨트롤로 바꿉니다. 넘긴 엘리먼트가 _트리거가 됩니다_ — Base UI가 클릭 핸들러, `aria-expanded`, 패널을 가리키는 `aria-controls`를 쥐여 줍니다.

```tsx
<MPCollapsible variant="text" trigger={<MPButton variant="text">더 보기</MPButton>}>
  여기서 무엇이 무엇을 제어하는지 따로 알려 줄 필요가 없었습니다.
</MPCollapsible>
```

직접 만든 트리거를 쓰면 패널은 내용 위의 여백까지 부담합니다. 기본 헤더가 아닌 컨트롤은 그 여백을 지불한 적이 없기 때문입니다.

### padded

가장자리까지 닿아야 하는 내용 — 테이블, 사진, 자기 행을 직접 그리는 리스트 — 에는 꺼 두세요.

```tsx
<MPCollapsible title="행" padded={false}>
  <MPTable headers={headers} items={items} variant="text" />
</MPCollapsible>
```

### hiddenUntilFound과 keepMounted

닫힌 패널을 DOM에 남겨 두는 두 가지 다른 이유이고, 서로 바꿔 쓸 수 없습니다.

| Prop               | 용도                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| `hiddenUntilFound` | 브라우저 자체의 페이지 검색. Ctrl-F가 텍스트를 찾아 접힘을 열어 보여 줍니다 |
| `keepMounted`      | 만드는 비용이 큰 내용, 또는 접혀 있는 동안에도 살아남아야 하는 폼 상태      |

`hiddenUntilFound`가 `keepMounted`보다 우선합니다. `hidden="until-found"`가 이미 엘리먼트를 남기기 때문입니다.

```tsx
<MPCollapsible title="약관" hiddenUntilFound>
  닫혀 있어도 Ctrl-F로 찾을 수 있습니다.
</MPCollapsible>
```

## 접근성

- 트리거는 `aria-expanded`와 패널을 가리키는 `aria-controls`를 가진 진짜 `<button>`이고, 둘 다 Base UI가 연결합니다. `<div>`에 핸들러를 붙인 것이 아니라 버튼이므로 Space와 Enter가 모두 동작합니다.
- `action`은 트리거 바깥에 있으므로, 키보드 사용자는 접힘과 그 위의 컨트롤을 하나가 다른 하나 안에 중첩된 형태가 아니라 별개의 정지점 두 개로 만납니다.
- 호버·포커스·프레스는 머터리얼의 state layer — 내용 색을 반투명하게 덮는 층 — 이라서, 다섯 표면 어디에서나 헤더가 똑같이 읽힙니다.
- 포커스 링은 **안쪽**으로 그려집니다. 패널이 창이 될 수 있도록 시트가 자식을 잘라내는데, `overflow: hidden`은 시트 상단을 가득 채운 트리거의 바깥쪽 링을 함께 깎아 냅니다.

## 함께 보기

- [MPAccordion](./accordion) — 이것들의 집합. 몇 개까지 열릴 수 있는지에 대한 규칙이 붙습니다.
- [MPCard](./card) — 모든 구획이 한꺼번에 보이는 시트.
- [MPSpoiler](../display/spoiler) — 실수로 읽히면 안 되어서 가려 둔 내용. 이건 다른 문제입니다.
