---
title: MPStatistic
order: 30
---

# MPStatistic

<p class="mp-lede">숫자 하나를 한 번 말하고, 책상 건너에서도 읽히게 합니다. 그것이 무엇인지, 그리고 옳은 방향으로 가고 있는지와 함께.</p>

<Demo src="statistic/hero" :minHeight="200" />

::: fw react

```tsx
import { MPStatistic } from 'material-plus-ui';

<MPStatistic label="설치 수" value={128400} previousValue={119200} period="지난달 대비" />;
```

:::

::: fw flutter

```dart
import 'package:material_plus_ui/material_plus_ui.dart';

const MPStatistic(
  label: Text('설치 수'),
  value: 128400,
  previousValue: 119200,
  period: Text('지난달 대비'),
);
```

:::

## Props

<PropsTable name="MPStatistic" />

## 그릴 것이 없을 때 그리는 차트

숫자 하나에는 형태도, 순서도, 두 번째 차원도 없습니다. 그것을 데이터처럼 보이게 하려고 축 위에 올리는 것이 대시보드가 패널 하나를 낭비하는 가장 흔한 방법입니다 — 막대 하나짜리 막대 차트, 점 하나짜리 선 차트, 조각 하나짜리 도넛. 읽는 사람이 숫자 하나에서 원하는 것은 그 숫자, 그것이 무엇인지, 그리고 어느 쪽으로 움직이는지입니다.

::: fw react

이것은 이 라이브러리의 첫 번째 차트 컴포넌트이기도 하고, 플롯이 없는 유일한 것이기도 합니다. 나머지는 `internal/chart.ts` — 팔레트와 스케일과 그 밑의 산술 — 를 함께 씁니다.

:::

## 네 자리는 남고 다섯 자리는 남지 않습니다

`1,284`는 누구나 한눈에 받아들이는 숫자이고, `1.3K`는 두 글자를 아끼려고 두 자리를 버린 것입니다. `12,900`에 이르면 자릿수는 읽히기를 멈추고 세어지기 시작하므로 `12.9K`는 잃는 것이 없습니다. 그 위로는 그것이 유일하게 정직한 그림입니다. `1,284,003`과 `1,911,220`을 읽어서 비교하는 사람은 없기 때문입니다.

::: fw react

`compact={false}`는 모든 자리를 남깁니다. `format`을 주면 압축은 저절로 꺼집니다. 통화를 요청한 사람은 무엇을 원하는지 말한 것이고, 그런데도 줄이는 컴포넌트는 그것과 다투는 것입니다.

:::

::: fw flutter

`compact: false`는 모든 자리를 남깁니다. `formatValue`를 주면 압축은 저절로 꺼집니다. 통화로 쓰겠다고 한 사람은 무엇을 원하는지 말한 것이고, 그런데도 줄이는 컴포넌트는 그것과 다투는 것입니다.

```dart
MPStatistic(
  label: const Text('매출'),
  value: 4234900,
  previousValue: 4610000,
  formatValue: (num value) => usd.format(value), // package:intl의 NumberFormat
);
```

변화도 같은 함수가 씁니다. 변화의 크기를 넘기고 앞에 부호를 붙이므로, 통화 함수라면 하락을 `-$375,100`으로 씁니다.

함수가 없으면 숫자는 `Intl`이 영어로 쓰는 방식대로 쓰입니다. 세 자리마다 쉼표를 찍고, 압축할 때는 `K`, `M`, `B`, `T`를 붙입니다. 패키지가 `package:intl`에 의존하지 않으므로 어느 로케일에서나 같습니다. 다른 언어의 표기로 쓰려면 `formatValue`를 줍니다.

:::

이 숫자에는 `tabular-nums`가 붙지 **않습니다**. 그것은 모든 숫자에 0의 폭을 주어 숫자들의 열을 정렬해 주지만, 큰 숫자 하나는 헐거워 보이게 만듭니다 — 그리고 여기 있는 것이 바로 그 큰 숫자 하나입니다. 고정폭 숫자는 [MPTable](table)의 열과 차트 축 눈금을 위한 것입니다.

## 어느 쪽이 좋은 방향인지는 호출부가 말합니다

`betterWhen`이 있는 이유는 어떤 대시보드든 숫자의 절반은 반대 방향이기 때문입니다. 이탈률, 지연 시간, 비용, 오류율, 첫 응답 시간, 미해결 인시던트는 전부 내려갈 때가 좋고, 모든 하락을 빨갛게 칠하는 컴포넌트는 여덟 개 타일 중 넷에서 틀립니다 — 그것도 _확신에 차서_, 읽는 사람이 확인 없이 믿는 바로 그 색으로.

변화 없음은 조용한 상승이 아니라 세 번째 상태입니다. 흐린 잉크와 대시로 그려집니다. 움직이지 않은 숫자는 좋은 일도 하지 않았기 때문입니다.

**0에서의 변화는 절대값으로 씁니다.** 없던 것이 생긴 것은 얼마만큼 자란 것이 아니라 시작한 것이고, 거기에 찍힐 수 있는 모든 백분율 — `∞`, `100%`, `0%` — 은 읽는 사람이 곧이곧대로 믿을 거짓말입니다.

## 색이 혼자 의미를 지지 않습니다

화살표가 두 번째 채널입니다. 그래서 흑백에서도, `forced-colors`에서도, 두 색조를 구분하지 못하는 사람에게도 타일은 어느 쪽으로 갔는지 말합니다. 글리프는 스크린 리더에 아무것도 말하지 않고, 그 뒤에 문장도 없습니다. 옆의 숫자가 이미 부호를 지고 있기 때문입니다 — 변화는 언제나 `+7.7%`이거나 `−7.7%`이고, 변화 없음은 그냥 0입니다. 여기에 "상승"까지 듣는 스크린 리더는 방향을 두 번, 두 어휘로, 그중 하나는 번역되지 않은 채로 듣게 됩니다.

그리고 **숫자 자체**는 어떤 상태에서든 `on-surface`입니다. 색이 붙는 것은 변화뿐입니다. 자기 추세에 따라 색이 바뀌는 보고값은 읽기 전에 해독해야 하는 값입니다.

## 추세는 차트가 아니라 슬롯입니다

`trend`는 무엇이든 받습니다. 보통 거기 들어가는 것은 [MPSparkline](../charts/sparkline)입니다. 자기 차트가 아니라 슬롯인 이유는, 스파크라인을 소유한 statistic은 다른 컴포넌트의 데이터 모양에 대해 의견을 가진 statistic이 되기 때문이고, 둘은 분리할 수 있기 때문입니다.

::: fw flutter

## React 빌드와 다른 점

| React | Flutter | 이유 |
| --- | --- | --- |
| `value: number \| ReactNode` | `num`, `String`, `Widget` 중 하나인 `value: Object` | Dart에는 유니언 타입이 없습니다. 숫자는 표기를 거쳐 쓰이고, 문자열과 위젯은 그대로 그려집니다. 그 밖의 값은 assertion이 잡습니다. |
| `format: Intl.NumberFormatOptions` | `formatValue: String Function(num)` | 프레임워크에는 `Intl.NumberFormat`이 없고, 그것을 위해 `package:intl`을 끌어오는 것은 사용하는 쪽 대신 의존성을 결정하는 일입니다. |
| `locale` | — | `Intl` 없이는 다른 로케일의 표기를 가져올 곳이 없습니다. 기본 표기는 어디서나 영어식 자릿수 구분과 단위이고, 다른 표기는 `formatValue`가 씁니다. |
| 문자열 `delta`, `betterWhen` | `MPStatisticDeltaFormat`, `MPStatisticBetterWhen` | 값은 같습니다. |
| `ReactNode`를 받는 `label`, `prefix`, `unit`, `period`, `caption`, `trend` | `Widget?`을 받습니다 | 같은 것을 부르는 Dart의 이름입니다. |
| `classNames`, `className`, `style`, 네이티브 속성 | — | 손댈 클래스 목록이 없습니다. |

:::
