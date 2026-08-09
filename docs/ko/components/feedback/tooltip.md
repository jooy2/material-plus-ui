---
title: MPTooltip
order: 3
---

# MPTooltip

<p class="mp-lede">포인터가 무언가 위에 머물면 나타나는 짧은 라벨입니다. 컴포넌트 전체가 래퍼입니다 — 레이아웃에 엘리먼트를 더하지 않고, 자식은 원래 그것 그대로 남습니다.</p>

<Demo src="tooltip/hero" :minHeight="140" />

```tsx
import { MPTooltip, MPTooltipProvider } from 'material-plus-ui';

<MPTooltip content="클립보드에 복사">
  <MPButton aria-label="복사">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>;
```

## Props

<PropsTable name="MPTooltip" />

## `color`에 기본값이 없고, 여기서 그것이 가장 중요합니다

MD3의 plain tooltip은 `inverse-on-surface` 아래의 `inverse-surface`입니다. 중립 팔레트를 스킴의 **반대쪽** 끝에서 읽은 것이라, 밝은 페이지에서는 판이 어둡고 어두운 페이지에서는 밝습니다.

그것이 툴팁을 애초에 고려된 적 없는 내용 위에서도 읽히게 만드는 것이고 — 툴팁이 나타나는 곳은 언제나 그런 내용 위입니다 — 라이브러리에서 그 두 역할을 읽는 유일한 자리입니다.

`color`를 주면 강조 색 채움으로 바뀝니다. 툴팁 자체가 경고인 경우에는 그럴 만하지만 나머지 아흔아홉 번은 틀립니다. 삭제 버튼 위의 빨간 툴팁은 툴팁이 알지 못하는 것을 말하고 있는 것입니다.

## 그림자가 없습니다

MD3는 plain tooltip을 elevation 0에 둡니다. 여기서도 그것을 따릅니다. 판을 페이지에서 떼어내는 것은 그것이 _반전된_ 면이라는 사실 — 밝은 페이지 위의 어두운 카드 — 이고, 이미 배경에서 그만큼 떨어진 것 아래의 그림자는 높이가 아니라 두 번째의 더 부드러운 가장자리로 읽힙니다.

## Base UI가 가진 것과 여기서 더한 것

정말 어려운 부분은 Base UI가 가집니다. 지연과 그룹 타임아웃, 포커스에는 열리되 클릭에서 온 포커스에는 열리지 않기, Escape로 닫기, 창 가장자리를 피해 팝업을 두기.

Base UI가 일부러 열어 둔 하나는 툴팁이 스크린 리더에 의미를 갖게 하는 부분입니다 — 판의 `role="tooltip"`과 트리거에서 그것을 가리키는 `aria-describedby` — 팝업은 여러 가지일 수 있고 어느 것인지는 호출자만 알기 때문입니다. 여기서는 언제나 툴팁이므로 둘 다 연결하고, 닫혀 있는 동안에는 문서에 없는 엘리먼트를 가리키는 대신 참조를 떼어냅니다.

## `MPTooltipProvider`

한 묶음이 지연을 공유합니다. 하나가 열리고 나면 이웃들은 즉시 열리고, 잠시 쉬면 기다림이 돌아옵니다.

```tsx
<MPTooltipProvider>
  <MPTooltip content="굵게">
    <MPButton>B</MPButton>
  </MPTooltip>
  <MPTooltip content="기울임">
    <MPButton>I</MPButton>
  </MPTooltip>
</MPTooltipProvider>
```

툴바를 감쌀 만합니다. 이것이 없으면 아이콘 버튼 줄을 따라 움직일 때마다 매 정거장에서 지연을 온전히 기다려야 하고, 그것이 툴팁이 포인터와 싸우는 느낌을 만듭니다.

## 예시

### side와 align

<Demo src="tooltip/sides">

<<< @/.vitepress/demos/tooltip/sides.tsx

</Demo>

자리가 없으면 반대쪽으로 넘어갈 수 있습니다. Base UI가 하는 일이고, 그것이 옳은 동작입니다.

### disabled

트리거는 그대로 두고 툴팁만 열리지 않게 합니다 — 라벨이 잘렸을 때만 존재해야 하는 툴팁을 위한 것입니다.

```tsx
<MPTooltip content={label} disabled={!isTruncated}>
  <span className="truncate">{label}</span>
</MPTooltip>
```

## 툴팁은 컨테이너가 아닙니다

터치 화면에서는 포인터로 닿을 수 없고, 주의가 옮겨가는 순간 사라지며, 그 안에 클릭할 수 있는 것을 넣어도 클릭할 수 없습니다. 둘 중 하나가 필요한 내용은 팝오버의 몫이지 이것의 몫이 아닙니다.

트리거가 여전히 자기 접근성 이름을 가져야 하는 이유이기도 합니다. 툴팁은 **설명**하지, 이름 붙이지 않습니다.

```tsx
// ✅ aria-label이 이름을 주고, 툴팁이 설명합니다
<MPTooltip content="클립보드에 복사">
  <MPButton aria-label="복사">
    <MPIcon icon={ICONS.copy} />
  </MPButton>
</MPTooltip>
```

## 함께 보기

- [MPShortcut](../display/shortcut) — `content` 안의 자연스러운 이웃.
- [MPIcon](../display/icon) — 툴팁이 가장 자주 설명하는 것.
