---
title: Material Plus와 material_ui
order: 5
---

# Material Plus와 `material_ui`

<p class="mp-lede">Flutter에는 자체 머터리얼 라이브러리가 있고, Flutter 3.47부터는 <code>material_ui</code>라는 패키지로 나와 있습니다. 이 페이지는 Material Plus가 거기에 무엇을 더하고 무엇을 맡겨 두는지, 그리고 두 라이브러리를 한 앱에서 어떻게 함께 쓰는지 설명합니다.</p>

## 짧은 답

앱의 뼈대에는 `material_ui`를 쓰세요. `MaterialApp`, `Scaffold`, `AppBar`, 라우트와 그 전환 효과, 바텀 시트, 텍스트 선택 주변의 플랫폼 동작이 여기에 속합니다. 그 뼈대 안에 들어가는 컴포넌트에는 Material Plus를 쓰세요. 특히 머터리얼 디자인이 다루지 않는 컴포넌트가 그렇습니다. 차트, 검색과 선택이 되는 데이터 테이블, 커맨드 팔레트, 투어, 전송 목록, 트리, 색 선택기, OTP 입력란 같은 것들입니다.

둘 중 하나만 골라야 하는 관계가 아닙니다. Material Plus는 `MaterialApp`에서 아무것도 읽지 않고 아무것도 바꾸지 않으므로 같은 위젯 트리 안에서 나란히 동작합니다. 기존 앱에 화면 하나씩 들여와도 됩니다.

## 한눈에 보기

|  | `material_ui` | `material_plus_ui` |
| --- | --- | --- |
| 배포처 | flutter.dev | CDGet |
| 라이선스 | BSD-3-Clause | MIT |
| 의존성 | `collection`, `cupertino_ui`, `flutter`, `flutter_localizations`, `intl`, `material_color_utilities`, `vector_math` | `flutter`만 |
| 기반 | 프레임워크, 그리고 옆에 Cupertino | `package:flutter/widgets.dart`만 |
| 위에 필요한 것 | 대부분의 위젯에 `MaterialApp`(또는 `Theme`, `Material`, `MaterialLocalizations`) | 없음. `MPTheme`과 `MPConfigProvider`는 덮어쓰고 싶을 때만 씁니다 |
| 범위 | MD3가 정의한 컴포넌트와 그 주변의 앱 구조 | MD3가 정의한 컴포넌트와, MD3에 없는 컴포넌트 수십 종 |
| 크기 | 사양이 정한 컴포넌트당 한 가지 크기 | 모든 컨트롤에 다섯 단계 `size`. `md`가 MD3의 크기입니다 |
| 밀도 | 테마의 `VisualDensity` | 모든 컨테이너에 MD3의 `0`~`-3` `density`. 간격만 줄입니다 |
| 색 하나로 만드는 스킴 | `ColorScheme.fromSeed`, HCT | `MPTheme(sourceColor:)`. React 패키지와 같은 계산입니다 |
| React 짝 패키지 | 없음 | npm의 `material-plus-ui`. 컴포넌트, 이름, 속성, 수치가 같습니다 |
| 번역 | 로컬라이제이션 델리게이트를 통한 `MaterialLocalizations` | 한 번 등록하는 18개 언어 테이블. 앱의 로케일, 그다음 영어로 내려갑니다 |

## Material Plus가 더하는 것

### 사양에 없는 컴포넌트

머터리얼 디자인은 앱의 컨트롤을 정의합니다. 실제 제품에는 그 주변의 것들도 필요한데, 머터리얼 앱에서는 보통 생김새가 다른 별도 패키지로 채웁니다. Material Plus는 이것들을 같은 색 역할, 모서리, 타입으로 그립니다.

- **차트.** 영역, 막대, 게이지, 히트맵, 선, 파이, 산점도, 스파크라인, 타임라인 차트. 툴팁, 범례, 키보드 조작, 화면 낭독기용 요약이 들어 있고, 다크 스킴에서도 색상을 유지하는 8색 팔레트로 칠합니다.
- **데이터.** 정렬, 검색, 선택, 페이지, 열 너비 조절이 되고 CSV를 앱에 넘겨주는 `MPDataTable`. 그리고 `MPTable`, `MPDataList`, `MPList`, `MPTreeView`, `MPTimeline`.
- **머터리얼에 없는 입력.** 여러 개를 고를 수 있는 `MPCombobox`, 증감 버튼이 있는 `MPNumberField`, `MPOtpField`, `MPColorPicker`, `MPFilePicker`, `MPRating`, `MPTransfer`, `MPTreeSelect`, `MPDateTimePicker`, `MPPagination`.
- **안내와 오버레이.** `MPCommandPalette`, `MPTour`, `MPPopconfirm`, `MPHoverCard`, `MPPopover`, 그리고 질문을 띄우고 답을 기다리는 `MPConfirmProvider`.
- **표시.** `MPCodeBlock`, `MPChatBubble`, `MPStatistic`, `MPMeter`, `MPSkeleton`, `MPEmpty`, `MPBreadcrumb`, `MPShortcut`, `MPHighlight`, `MPMockup` 등.
- **레이아웃.** 크기를 조절하는 `MPPanes`, `MPSidebar`, `MPPageLayout`, MD3 창 크기 등급을 따르는 `MPGrid`, `MPShow`, `MPScrollZone`.
- **애니메이션 17종.** 페이드부터 타자기 효과까지 있고, 플랫폼이 움직임을 줄여 달라고 하면 멈춥니다.

[컴포넌트 목록](../components/)에 전부 있고, 페이지마다 Flutter 미리보기가 실제로 돌아갑니다.

### 모든 컴포넌트에 같은 어휘

`size`, `color`, `variant`, `density`, `elevation`은 버튼, 칩, 카드, 목록, 테이블에서 모두 같은 뜻입니다. 화면 전체를 촘촘하게 하려면 컴포넌트 종류마다 테마를 고치는 대신 `MPConfigProvider(density: -1)` 하나면 됩니다. 필터 막대에 작은 컨트롤이 필요하면 각각에 `size: MPSize.sm`을 주거나 공급자에 한 번 줍니다.

크기 사다리는 사양을 알고서 넘어선 부분입니다. 다만 `md`가 **곧** MD3의 크기라서, 사다리를 모르는 사람도 아무것도 지정하지 않으면 머터리얼 크기를 받습니다.

### React와 Flutter에 같은 라이브러리

웹 앱과 모바일 앱을 함께 내는 팀은 디자인 시스템을 두 번 만듭니다. Material Plus라면 두 번째는 다시 설계하는 일이 아니라 옮겨 적는 일입니다. `MPButton(variant: MPVariant.tonal, size: MPSize.sm)`과 `<MPButton variant="tonal" size="sm">`은 같은 역할 색을 쓰는 높이 40px의 같은 버튼이고, 문서 페이지 하나가 둘을 함께 설명합니다. 같은 소스 색은 두 패키지에서 같은 hex 값을 만들어 내며, Flutter 패키지의 테스트가 이것을 React 토큰 시트와 대조합니다.

### 의존할 것이 없음

`material_plus_ui`는 의존성이 없고 Material도 Cupertino도 가져오지 않습니다. 앱에 `intl`도, 로컬라이제이션 델리게이트도, 무엇의 사본도 더하지 않습니다. 디자인 라이브러리가 프레임워크 밖으로 옮겨 가는 변화에도 영향을 받지 않습니다. 처음부터 쓰지 않았기 때문입니다.

## `material_ui`가 더 나은 경우

- **앱의 뼈대.** `Scaffold`, `AppBar`, `NavigationRail`, `NavigationDrawer`, `MaterialPageRoute`와 그 전환, 끌어서 닫는 모달 바텀 시트, 스캐폴드에 묶인 `SnackBar`는 Flutter 자체의 것이고 거기서 쓰는 게 맞습니다. Material Plus에도 `MPPageLayout`, `MPHeader`, `MPDrawer`, `MPBottomNavigation`이 있지만 라우터나 스캐폴드를 대신하지는 않습니다.
- **텍스트 주변의 플랫폼 동작.** `material_ui`의 `TextField`는 머터리얼의 선택 핸들, 툴바, 돋보기를 함께 가져옵니다. `MPTextField`는 프레임워크의 `EditableText` 위에 만들어져 한국어, 일본어, 중국어 조합 입력을 깨뜨리지 않지만, 선택 핸들과 툴바를 직접 그리지는 않습니다. 웹에서는 브라우저 메뉴가, 데스크톱에서는 단축키가 복사와 붙여넣기를 맡고, 휴대폰에서는 아직 길게 눌러 여는 메뉴가 없습니다.
- **생태계와의 궁합.** Flutter 튜토리얼과 대부분의 서드파티 위젯은 `Theme.of(context)`를 읽습니다. Material Plus는 읽지 않습니다. 그래서 함께 쓸 수 있지만, 같은 이유로 서드파티 위젯은 `MPTheme`을 따르지 않습니다.
- **공식 지원.** `material_ui`는 Flutter 팀이 Flutter 일정에 맞춰 관리합니다.

## 둘을 함께 쓰기

Material Plus는 자기 테마만 읽으므로, 둘을 함께 쓰는 앱은 각각에 색을 줍니다. 같은 시드를 주면 스킴이 비슷하게 나옵니다.

```dart
const Color brand = Color(0xFF00639B);

MaterialApp(
  theme: ThemeData(colorSchemeSeed: brand),
  builder: (BuildContext context, Widget? child) {
    return MPTheme(
      sourceColor: brand,
      brightness: Theme.of(context).brightness,
      child: child!,
    );
  },
  home: const HomeScreen(),
);
```

똑같지는 않습니다. `ColorScheme.fromSeed`는 HCT로 계산하고, Material Plus는 React 패키지와 hex 단위까지 맞추려고 OKLCh로 역할을 계산하기 때문입니다. 한 화면에 머터리얼 위젯과 Material Plus 위젯이 나란히 있어 차이가 보인다면, 머터리얼의 역할을 Material Plus에 넘기세요.

```dart
final ColorScheme material = Theme.of(context).colorScheme;

MPTheme(
  colors: MPColorScheme.fromSource(
    sourceColor: brand,
    brightness: material.brightness,
  ).copyWith(
    primary: material.primary,
    onPrimary: material.onPrimary,
    primaryContainer: material.primaryContainer,
    onPrimaryContainer: material.onPrimaryContainer,
    secondary: material.secondary,
    secondaryContainer: material.secondaryContainer,
    surface: material.surface,
    surfaceContainerHighest: material.surfaceContainerHighest,
    onSurface: material.onSurface,
    onSurfaceVariant: material.onSurfaceVariant,
    outline: material.outline,
    outlineVariant: material.outlineVariant,
  ),
  child: child,
);
```

두 라이브러리 모두 MD3의 역할 이름을 쓰므로 역할마다 한 줄이면 됩니다.

언어도 같은 방식입니다. Material Plus는 `MaterialLocalizations`를 읽지 않지만, 자체 로케일이 없으면 앱의 `Localizations`를 따릅니다. 그래서 `registerMPMessages(mpLocales)`로 테이블을 한 번 등록해 두면 `MaterialApp`이 쓰는 언어로 말합니다.

## 함께 보기

- [시작하기](./getting-started): 두 프레임워크의 설치 방법.
- [속성 규칙](../design/prop-conventions): 공통 어휘.
- [Migrate to the standalone `material_ui` and `cupertino_ui` packages](https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui): Flutter 공식 이전 안내.
