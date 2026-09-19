---
title: A2UI 카탈로그
order: 4
---

# A2UI 카탈로그

<p class="mp-lede">에이전트가 화면을 서술하면 Material Plus가 그립니다. <a href="https://a2ui.org">A2UI</a>가 바로 그것을 위한 프로토콜입니다. 에이전트는 <em>카탈로그</em>에 있는 컴포넌트 이름을 담은 JSON을 보내고, 클라이언트의 렌더러가 그것을 해석하며, <code>material-plus-ui/a2ui</code>가 그 카탈로그를 Material Design 3으로 구현한 것입니다.</p>

카탈로그의 핵심은 에이전트가 마크업을 쓰지 않는다는 데 있습니다. 에이전트는 `{ "component": "Button", "variant": "primary" }`를 쓰고, 그것이 무엇으로 그려지는지는 클라이언트가 정합니다. 그래서 같은 에이전트가 여기서는 Material로 그려지고, 다른 카탈로그를 등록한 애플리케이션에서는 다른 것으로 그려집니다. 페이로드는 카탈로그가 선언한 어휘 밖으로 나갈 수 없습니다.

카탈로그는 두 개입니다. `mpA2uiCatalog`는 A2UI의 **basic 카탈로그** 18개를 전부 구현하고 basic 카탈로그의 id로 등록되므로, 이미 그것을 겨냥하는 에이전트는 바꿀 것이 없습니다. `mpA2uiExtendedCatalog`는 그 18개에 이 라이브러리 자신의 다섯 개를 더한 것이고, 자체 id를 씁니다. basic 어휘로는 표현할 수 없는 화면 — 표, 차트 세 개, 숫자 하나 — 를 위한 것입니다.

## 설치

프로토콜 SDK는 패키지 두 개이고, 이 라이브러리는 둘을 optional peer dependency로 선언합니다. 함께 설치하세요.

```bash
npm install material-plus-ui @a2ui/react @a2ui/web_core
```

optional인 이유는 둘이 가볍지 않기 때문입니다. Lit, signals, Zod, 날짜 라이브러리, 마크다운 파서가 함께 들어오는데, 이 패키지의 나머지가 약속하는 런타임 dependency는 두 개입니다. 이 서브패스 밖에서는 아무것도 둘을 import하지 않으므로, 에이전트 화면을 그리지 않는 프로젝트는 그중 아무것도 받지 않습니다.

그리는 프로젝트가 얼마를 내는지는 이 문서의 다른 모든 수치처럼 빌드가 측정합니다.

| 번들                    | 이 라이브러리 | SDK 포함 |
| ----------------------- | ------------- | -------- |
| `mpA2uiCatalog`         | 38.9 kB       | 77.3 kB  |
| `mpA2uiExtendedCatalog` | 60.6 kB       | 98.9 kB  |

gzip이고, React와 Base UI는 external입니다. 두 줄의 차이가 데이터 테이블과 차트 세 개입니다. basic 카탈로그를 별도 export로 둔 이유가 그것입니다. 등록할 쪽만 import하면 나머지는 떨어져 나갑니다.

## 서피스 그리기

```tsx
import { A2uiSurface } from '@a2ui/react/v0_9';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { mpA2uiCatalog } from 'material-plus-ui/a2ui';
import 'material-plus-ui/styles.css';

const processor = new MessageProcessor([mpA2uiCatalog], (action) => {
  // 읽는 사람이 한 일이 에이전트로 돌아가는 길입니다.
  void send(action);
});

processor.processMessages(messagesFromTheAgent);

function Surfaces() {
  const surfaces = Array.from(processor.model.surfacesMap.values());

  return surfaces.map((surface) => <A2uiSurface key={surface.id} surface={surface} />);
}
```

여기서 짚을 것이 셋입니다. 페이로드가 어떻게 그려질지 정하는 것은 `mpA2uiCatalog`입니다. `MessageProcessor`의 두 번째 인자는 누름·키 입력·선택이 에이전트로 떠나는 자리입니다. 그리고 관여하는 스타일시트는 `material-plus-ui/styles.css` 하나뿐입니다. 카탈로그는 자체 CSS가 없습니다. 이미 스타일이 있는 컴포넌트로 그리기 때문입니다.

에이전트가 보내야 하는 카탈로그 id는 내보내므로, 양쪽에서 다시 타이핑할 필요가 없습니다.

```ts
import { A2UI_BASIC_CATALOG_ID } from 'material-plus-ui/a2ui';
// 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'
```

클라이언트는 같은 문자열을 `supportedCatalogIds`로 알리고, 그 값은 `processor.getClientCapabilities()`가 만들어 줍니다.

## 컴포넌트별로 무엇이 그려지는가

| A2UI | 그려지는 것 | 메모 |
| --- | --- | --- |
| `Text` | `MPTypography` | `h1`–`h5`는 타입 스케일의 제목, `caption`은 작은 글씨 |
| `Image` | `MPImage` | `variant`는 상자이고, 로딩·실패 상태가 함께 옵니다 |
| `Icon` | `MPIcon` | 프로토콜의 이름 59개를 lucide 글리프에 대응 |
| `Video` | `<video controls>` | 브라우저의 플레이어에 Material의 모서리 |
| `AudioPlayer` | `<audio controls>` | 같고, 설명은 위에 그립니다 |
| `Row`, `Column` | `MPFlex` | 간격은 8px이고 에이전트가 정할 수 없습니다 |
| `List` | `<ul>`·`<ol>`로 그린 `MPFlex` | 진짜 목록 요소, 자식마다 `<li>` |
| `Card` | `MPCard` | 자식 하나를 시트 위에 |
| `Tabs` | `MPTabs` | 자식 id로 키를 잡아, 스트리밍 중 탭이 늘어도 됩니다 |
| `Modal` | `MPDialog` | 스크림, 포커스 트랩, Escape, 포커스 복귀 |
| `Divider` | `MPDivider` | 두 방향 모두 |
| `Button` | `MPButton` | `primary`는 filled, `default`는 outlined, `borderless`는 text |
| `TextField` | `MPTextField`, `MPNumberField` | `number`는 스테퍼가 있는 숫자 필드 |
| `CheckBox` | `MPCheckbox` | 라벨이 상자에 연결됩니다 |
| `ChoicePicker` | `MPCombobox`, `MPRadioGroup`, `MPCheckbox`, `MPChip` | 아래를 참고하세요 |
| `Slider` | `MPSlider` | 값을 항상 보여 줍니다 |
| `DateTimeInput` | `MPDatePicker`, `MPTimePicker`, `MPDateTimePicker` | 스위치 두 개로 고릅니다 |

모든 컴포넌트는 프로토콜의 공용 prop 두 개도 함께 받습니다. `weight`는 `Row`나 `Column` 안에서 flex 지분이 되고, `accessibility`는 요소의 접근 가능한 이름과 `title`이 됩니다. 라벨이 있는 컨트롤은 예외입니다. 그쪽에서는 페이로드의 `label`이 읽는 사람에게 보이는 것이고, 그 옆의 `aria-label`은 보이는 라벨을 보이지 않는 라벨로 바꿔 버립니다.

### ChoicePicker는 컨트롤 네 개입니다

프로토콜은 한 컴포넌트를 세 축으로 서술합니다. 하나만 고르는지 여럿인지, 상자인지 칩인지, 필터가 되는지. 그 조합 대부분에 Material은 서로 다른 컨트롤을 둡니다.

- **필터되는 경우**는 `MPCombobox`이고, 단일과 다중이 모두 됩니다. Material에서 필터는 목록 위에 얹은 텍스트 상자가 아니라 컨트롤 자체입니다. 필드가 목록에 속하고, 일치 개수를 읽어 주며, 빈 상태 문구가 이미 번역되어 있고, 긴 목록이 페이지에 펼쳐져 있지 않아도 검색됩니다.
- **하나만 고르고 상자인 경우**는 `MPRadioGroup`입니다. "이 중 정확히 하나"가 스크린 리더에 뜻하는 것이 라디오 그룹이고, 화살표 키 이동이 함께 옵니다.
- **그 밖의 경우**는 체크박스를 담은 `MPFieldset`이고, 에이전트가 칩을 요청했으면 칩을 담습니다. 그룹을 하나로 묶는 것은 legend입니다.

### 날짜는 날짜를 지킵니다

`DateTimeInput`은 ISO 8601 문자열을 담고 이 라이브러리의 피커는 모두 `Date`로 동작하므로, 그 경계에서 변환합니다. `new Date(value)`에 맡기지 않고 직접 합니다. 이유는 에이전트가 가장 많이 보내는 형태입니다. `new Date('2026-03-01')`은 그리니치의 자정이고, 그보다 서쪽에서는 2월 28일입니다. 잘못된 날에 열리는 달력은 아무도 이유를 설명하지 못하는 버그입니다. 값은 요청된 정밀도로, 로컬 벽시계로 다시 씁니다. 그래서 읽고 쓰기를 반복해도 값이 움직이지 않습니다.

### 마크다운은 켜기 전까지 꺼져 있습니다

명세는 `body` 텍스트가 간단한 마크다운을 담을 수 있다고 말합니다. 마크다운을 렌더한다는 것은 에이전트가 쓴 문자열을 HTML로 바꾼다는 뜻이고, 이 라이브러리에는 파서도 새니타이저도 없습니다. 그래서 프로토콜 자신의 방식을 씁니다. `@a2ui/react`의 마크다운 context로 렌더러를 넣으면 — `@a2ui/markdown-it`이든 직접 만든 것이든 — 서식이 그려집니다. 넣지 않으면 에이전트의 문자열은 있는 문자 그대로, `**이렇게**` 그려집니다.

깔끔한 기본값이 아니라 안전한 기본값입니다. 렌더러의 계약은 반환하는 HTML을 반드시 새니타이즈하는 것이고, 그 계약을 지킬 렌더러가 없는 동안에는 아무것도 HTML로 취급하지 않습니다.

## 에이전트가 할 수 있는 것과 할 수 없는 것

서피스는 언어 모델이 만든 JSON입니다. 경계를 분명히 적어 둡니다.

- **카탈로그가 허용 목록입니다.** 등록한 카탈로그에 없는 컴포넌트 이름은 해석되지 않고, 여러분이 넣지 않은 컴포넌트에는 어떤 페이로드도 닿지 못합니다.
- **prop은 스키마로 검증됩니다.** SDK의 바인더가 그리기 전에 확인하므로, 잘못된 서피스는 절반쯤 그려지는 대신 거부됩니다.
- **텍스트는 텍스트입니다.** 위에서 말한 마크다운 렌더러를 넣지 않았다면 그렇습니다.
- **URL은 에이전트의 것입니다.** `Image`, `Video`, `AudioPlayer`는 페이로드가 지목한 것을 불러옵니다. 통제하지 않는 에이전트의 서피스라면, 미디어가 어디서 올 수 있는지 말해 주는 Content Security Policy 뒤에 두어야 합니다.

## 이 라이브러리 자신의 카탈로그

basic 어휘로는 서술할 수 없는 다섯 개이고, 숫자를 보고하는 에이전트가 가장 먼저 필요한 것입니다.

| 컴포넌트    | 그려지는 것   | 쓰임                                               |
| ----------- | ------------- | -------------------------------------------------- |
| `DataTable` | `MPDataTable` | 행과 열, 정렬·검색·페이지·선택 포함                |
| `BarChart`  | `MPBarChart`  | 카테고리별 값, 나란히 또는 누적                    |
| `LineChart` | `MPLineChart` | 순서에 따라 움직이는 값, 곡선은 데이터에 대한 주장 |
| `PieChart`  | `MPPieChart`  | 한 전체의 부분들, 파이·도넛·반원                   |
| `Statistic` | `MPStatistic` | 숫자 하나와 그것이 무엇이며 얼마나 변했는지        |

```tsx
import { mpA2uiCatalog, mpA2uiExtendedCatalog } from 'material-plus-ui/a2ui';

const processor = new MessageProcessor([mpA2uiCatalog, mpA2uiExtendedCatalog]);
```

둘을 등록하면 에이전트가 화면마다 고릅니다. 다른 렌더러도 그려야 할 수 있는 것에는 basic id를, 표나 차트인 화면에는 `MP_A2UI_CATALOG_ID`를 씁니다. 스키마는 그 id에 게시됩니다 — [material-plus.cdget.com/a2ui/v0_9/catalog.json](https://material-plus.cdget.com/a2ui/v0_9/catalog.json). 렌더러가 검증하는 것과 같은 Zod 스키마에서 생성하므로, 에이전트가 읽는 설명과 페이로드가 검증되는 계약이 서로 어긋날 수 없습니다.

### 데이터는 데이터 모델에 둡니다

표의 `rows`와 차트의 `series`는 프로토콜의 다른 값처럼 리터럴 배열 또는 경로를 받습니다.

```json
{
  "id": "sales",
  "component": "BarChart",
  "series": { "path": "/monthly" },
  "categories": ["Jan", "Feb", "Mar"],
  "label": "Orders by month"
}
```

경로로 묶으면 숫자가 도착하고, 차트를 다시 보내지 않아도 계속 갱신됩니다. 대신 알아 둘 것이 하나 있습니다. 경로는 검증되지 않고 해석됩니다. 스키마가 확인한 것은 *바인딩*이고, 돌아오는 것은 그 시점에 데이터 모델에 있는 값입니다. 절반만 쓰였을 수도, 에이전트가 의도한 것이 아닐 수도 있습니다. 그래서 숫자가 아닌 값은 빈 자리가 되고, 목록이 아닌 series는 빈 차트가 되며, 객체가 든 셀은 화면을 죽이는 대신 JSON으로 적힙니다.

### 일부러 넣지 않은 것

행별 액션이 없습니다. A2UI의 액션은 발생 시점에 데이터 경로에서 해석한 context를 실어 보내는데, 그것으로는 _어느_ 행이 눌렸는지 말할 수 없습니다. 무엇에 대해 일어났는지 보고하지 못하는 콜백이 되는 셈입니다. 대신 선택이 그 말을 합니다. `selectedKeys`를 묶어 두면 읽는 사람의 선택이 데이터 모델에 남고, 다음 메시지가 그것을 읽습니다.

`Intl` 옵션도, 셀 렌더러도, 열 접근자도 없습니다. 페이지에서 이 컴포넌트들을 유연하게 만드는 prop은 전부 함수이고, 에이전트는 함수를 보낼 수 없습니다. 그 자리를 `align`·`compact`·`curve`처럼 JSON으로 답할 수 있는 더 좁은 질문이 대신합니다.

## 직접 만드는 카탈로그

자체 어휘 — 자체 컴포넌트, 자체 이름 — 를 원하는 프로젝트는 자체 id가 필요합니다. 그것은 다른 계약이기 때문입니다. 시작점이 `createMPA2uiCatalog`입니다.

```ts
import { createMPA2uiCatalog } from 'material-plus-ui/a2ui';

const catalog = createMPA2uiCatalog({
  id: 'https://example.com/catalogs/orders/v1/catalog.json',
  components: [OrderTable]
});
```

18개는 따라오고, 같은 이름이 두 번 나오면 뒤에 온 것이 남습니다. 그래서 `Button`이라는 이름의 구현을 넘기면 목록을 다시 만들지 않고도 여기 있는 것을 대체합니다. `MP_A2UI_EXTENDED_COMPONENTS`까지 넘기면 23개에서 시작합니다. 개별 구현(`MPA2uiButton`, `MPA2uiText` 등)과 다섯 개의 스키마(`DataTableApi`, `BarChartApi` 등)도 내보내므로 카탈로그를 손으로 조립할 수도 있습니다.

## 여기까지입니다

130개 중 23개입니다. 커맨드 팔레트, 캘린더, 투어, 애니메이션 같은 것에는 페이로드가 닿지 못합니다. 에이전트는 카탈로그가 이름 붙인 것만 요청할 수 있고, 어떤 컴포넌트가 이름을 얻는 일은 JSON만으로 채울 수 있는 스키마를 받는 일이어서 스위치 하나가 아니라 컴포넌트마다의 결정입니다.

프로토콜도 아직 어립니다. v0.9.1이 현행이고 v1.0이 후보이며 SDK는 0.11입니다. 이 서브패스는 v0.9를 겨냥하고, 프로토콜이 만드는 깨지는 변경을 따라갑니다. 대신 그것이 그리는 컴포넌트는 발밑에서 움직이지 않습니다.
