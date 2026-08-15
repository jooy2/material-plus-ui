---
title: 회원 가입 페이지
order: 4
aside: false
---

# 회원 가입 페이지

<p class="mp-lede">세 단계로 나뉜 Kestrel 가입 절차입니다. 다른 것을 다 걷어내고 라이브러리의 입력 컨트롤만 남긴 화면 — 폼이 물을 수 있는 모든 종류의 답과, 그 주변의 상태들입니다. <code>label</code>, <code>description</code>, <code>errorMessage</code>는 거의 모든 컨트롤에서 똑같은 세 자리입니다.</p>

<Demo src="concepts/signup" :minHeight="660" />

소스는 파일 하나입니다: `docs/.vitepress/demos/concepts/signup.tsx`. 흐름은 실제로 동작합니다. 첫 단계를 채우면 계속 버튼이 켜집니다.

## 어떤 질문에 어떤 컨트롤인가

| 질문 | 컴포넌트 | 볼 만한 것 |
| --- | --- | --- |
| 개인인지 팀인지 | `MPSegmentedButton` | 작고 눈에 보이는 집합 중 하나 — 열어야 할 것이 없습니다 |
| 이름·이메일·비밀번호 | `MPTextField` | `type="password"`와 `autoComplete`은 네이티브 컨트롤로 그대로 넘어갑니다 |
| 비밀번호 강도 | `MPProgressLinear` | 구간마다 색이 붙은 `max={4}`이고, 무언가 입력된 뒤에만 나타납니다 |
| 생년월일 | `MPDatePicker` | `maxDate={new Date()}`가 미래 날짜를 나중에 틀렸다고 하는 대신 애초에 고를 수 없게 합니다 |
| 국가 | `MPSelect` | 고정된 목록이라 값은 고르는 것이지 적는 것이 아닙니다 |
| 워크스페이스 주소 | `MPTextField` | 슬러그는 입력되는 대로 정규화되고, 아래 캡션이 완성될 URL을 보여 줍니다 |
| 좌석 수 | `MPNumberField` | `min`과 `max`로 묶이고, 그 답의 종류가 요구하는 증감 버튼이 붙습니다 |
| 하는 일 | `MPCombobox` | `multiple`이고, 목록에 없는 것은 블러에서 조용히 확정되는 대신 마지막 행으로 제안됩니다 |
| 요금제 | `MPRadioGroup` `MPRadio` | 각각 `description`을 가진 두 선택지. 이 선택은 옆에 붙은 설명이 있어야 하기 때문입니다 |
| 브랜드 색 | `MPColorPicker` | 채도 사각형과 색상 레일 — 한 색상의 모든 색이 포인터 한 번의 이동 안에 있습니다 |
| 로고 | `MPFilePicker` | `accept`, `maxSize`, `maxFiles`는 무엇이 돌아오기 전에 이미 적용됩니다 |
| 이메일 코드 | `MPOtpField` | `groupSize={3}`을 곁들인 `length={6}`. 붙여넣기 한 번에 모든 칸이 채워집니다 |
| 약관·소식 | `MPCheckbox` `MPSwitch` | 체크박스는 제출과 함께 하는 동의이고, 스위치는 넘기는 순간 적용되는 설정입니다 |

## 메모

- 각 단계는 그 단계의 필드만 보고 잠깁니다. 계속 버튼은 그 단계가 유효해질 때까지 꺼져 있고, 마지막 단계는 코드와 약관까지 필요합니다.
- `MPTextField`는 `description`이 없는 유일한 컨트롤입니다. 그 아래 줄은 오류이거나 아무것도 아니어서, 안내 문구는 폼이 직접 그리는 캡션입니다.
- 오른쪽 열은 `MPCard`, `MPList`, `MPTimeline`, `MPBlockquote`입니다. 체험판에 무엇이 들어 있고, 다음에 무슨 일이 있고, 인용 하나 — 폼이 답할 수 없는 질문, 즉 "왜 이걸 채워야 하는가"에 답하는 자리입니다.
- 두 열은 `minmax(min(100%, 260px), 1fr)`을 쓴 하나의 CSS 그리드라, 모바일에서는 설정 없이 한 열이 됩니다.
