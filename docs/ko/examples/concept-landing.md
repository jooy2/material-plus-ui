---
title: 랜딩 페이지
order: 2
aside: false
---

# 랜딩 페이지

<p class="mp-lede">존재하지 않는 배포 도구 Kestrel의 마케팅 페이지입니다. 컴포넌트 라이브러리가 가장 덜 필요해 보이는 화면 — 대부분이 타이포그래피와 여백, 그리고 반복되는 하나의 행동 유도 — 이기 때문에, 오히려 부품들이 서로 맞물리는지 가장 잘 드러납니다.</p>

<Demo src="concepts/landing" :minHeight="2600" />

소스는 파일 하나입니다: `docs/.vitepress/demos/concepts/landing.tsx`. 페이지 위의 모든 것은 Material Plus 컴포넌트이거나 Material Plus 토큰이고, 컴포넌트인 척하는 맨 `div`는 없습니다.

## 무엇으로 만들어졌나

| 블록 | 사용된 컴포넌트 | 볼 만한 것 |
| --- | --- | --- |
| 공지 | `MPPill` | `onClick`이 달린 필은 버튼이라, 배너가 별도 마크업 없이 키보드로 닿습니다 |
| 헤더 | `MPIcon` `MPButton` `MPIconButton` `MPTooltip` | 내비게이션 링크는 `variant="text"` 버튼이고, 그래서 옆의 채워진 버튼과 한 기준선에 섭니다 |
| 히어로 | `MPTypography` `MPChip` `MPButton` `MPAvatar` | `MPTypography`는 스케일뿐 아니라 요소도 정합니다. `level="h1"`은 진짜 `<h1>`입니다 |
| 신뢰 줄 | `MPDivider` | 자식을 받은 구분선이 섹션 라벨을 품어서, 선과 그 위의 제목이 하나의 요소가 됩니다 |
| 수치 | `MPGrid` `MPGridItem` | 모바일에서 두 개, medium 윈도우부터 네 개 — 각 아이템의 `span`이 `{ compact: 6, medium: 3 }`, 그것뿐입니다 |
| 기능 | `MPCard` `MPIcon` | 글리프는 `headerAction`에 놓여서 어떤 크기에서도 제목의 기준선을 지킵니다 |
| 제품 둘러보기 | `MPTabs` `MPProgressLinear` `MPList` `MPChip` | 같은 제품의 세 가지 시점. 퍼널은 차트가 아니라 `showValue`를 켠 막대입니다 |
| 인용 | `MPBlockquote` | `author`와 `source`가 별도 자리라, 좁은 화면에서 출처가 두 줄로 접힙니다 |
| 가격 | `MPSegmentedButton` `MPCard` `MPList` `MPButton` `MPTable` | 결제 주기 토글이 세 가격을 한꺼번에 바꾸고, 비교표는 열 목록으로 그려집니다 |
| 질문 | `MPAccordion` | 질문마다 `MPAccordionItem` 하나, 처음에는 모두 닫혀 있습니다 |
| 마무리 폼 | `MPCard` `MPTextField` `MPButton` | 페이지의 유일한 입력란이고, 자기 submit을 가진 진짜 `<form>` 안에 있습니다 |
| 푸터 | `MPDivider` `MPTextLink` | `MPTextLink`는 색과 밑줄을 지키는 유일한 링크입니다. 컴포넌트 안의 다른 링크들은 그 컴포넌트의 타이포그래피를 따릅니다 |

## 메모

- 색은 강조가 아니라 뜻을 나릅니다. 가격 행에서 추천 요금제만 `elevated` 카드이고 `primary` 버튼이며, 나머지 둘은 `outlined`와 `secondary`로 남습니다.
- 이메일 필드는 입력이 바뀔 때마다 검사하지만 `errorMessage`는 무언가 입력된 뒤에만 보여 줍니다. 손대지 않은 폼이 빨개지는 일은 없습니다.
- 그리드 거터를 빼면 픽셀로 폭을 정하는 곳이 없습니다. 열은 `repeat(auto-fit, minmax(min(100%, …), 1fr))`이라, 창이 아니라 주어진 공간을 따라갑니다.
