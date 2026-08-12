---
title: MPChatBubble
order: 12
---

# MPChatBubble

<p class="mp-lede">대화 속 메시지 하나입니다. 말풍선과, 스레드가 그 주위에 거는 모든 것 — 아바타, 보낸 사람, 시각, 전송 표시, 사진, 펼쳐진 링크.</p>

<Demo src="chat-bubble/hero" :minHeight="240" />

```tsx
import { MPChatBubble } from 'material-plus-ui';

<MPChatBubble side="end" variant="filled" time="18:02" status="read">
  응 — 구석 자리로 예약했어.
</MPChatBubble>;
```

## Props

<PropsTable name="MPChatBubble" />

## 이건 라이브러리 자신의 모양입니다

MD3에는 채팅 말풍선이 없습니다. [MPProgressBox](../feedback/progress-box)가 그런 것처럼 이것도 라이브러리 자신의 컴포넌트입니다. 다만 모든 부분을 명세 자신의 역할로 그렸기 때문에, 이 말풍선들로 이루어진 스레드는 자기가 추가물이라고 광고하지 않고 머터리얼 페이지에 앉습니다.

이름 붙일 만한 결정이 둘 있습니다.

**꼬리는 삼각형이 아니라 잘린 모서리입니다.** 말한 사람 쪽 모서리만 `corner-extra-small`로 내려가고 나머지 셋은 `corner-extra-large`에 남습니다. 곧은 날로 잘렸어야 할 표면에 도형을 매달지 않고도 이 메시지가 행의 어느 쪽에서 왔는지 말해 줍니다. 두 값 모두 토큰이라서 잘림도 다른 모든 것과 함께 [`data-mp-shape`](../../guide/getting-started#shape)를 따라갑니다. _논리적_ 모서리로 쓰여 있어서, 아랍어 스레드는 알려 주지 않아도 반대쪽을 각지게 만듭니다.

**말풍선은 강조 색을 받습니다.** [카드](../layout/card)와 달리 말풍선은 _스스로가_ 칠해지는 대상이므로, 여기서 `variant`는 컨트롤의 사다리입니다. `filled`가 면 전체를 채웁니다. `text`만은 "표면 없음"을 뜻하지 않습니다. 표면이 없는 말풍선은 말풍선이 아니므로, 대신 가장 조용한 중립 컨테이너를 씁니다.

## `side`와 `variant`는 별개의 축입니다

`side`는 행이 어느 방향으로 흐르는지와 어느 모서리가 잘리는지를 정합니다. `variant`는 강조를 정합니다. 둘을 묶지 않은 것은 의도적입니다.

- 읽는 방향의 끝 열을 채우는 건 **관습**이지 법이 아닙니다.
- 이건 **제품**에 대한 결정입니다. 고객 지원 수신함은 읽는 사람이 아니라 상담원의 메시지를 채우고 싶을 수 있고, 양쪽 다 채우지 않는 스레드도 전혀 이상하지 않습니다.

흔한 배치를 원하는 호출자는 한 번만 쓰면 됩니다.

```tsx
const mine = message.authorId === me.id;

<MPChatBubble side={mine ? 'end' : 'start'} variant={mine ? 'filled' : 'tonal'}>
  {message.text}
</MPChatBubble>;
```

## 전송 표시

<Demo src="chat-bubble/status" :minHeight="320">

<<< @/.vitepress/demos/chat-bubble/status.tsx

</Demo>

다섯 중 넷은 사다리이고 다섯 번째는 그 위에 없습니다. `failed`는 가지 못한 메시지이고, 그래서 다른 색 계열로 그려지는 유일한 항목입니다.

| `status`    | 표시        | 색                   |
| ----------- | ----------- | -------------------- |
| `sending`   | 시계        | `on-surface-variant` |
| `sent`      | 체크 하나   | `on-surface-variant` |
| `delivered` | 체크 둘     | `on-surface-variant` |
| `read`      | 체크 둘     | 강조 색              |
| `failed`    | 오류 글리프 | `error`              |

색을 가진 것은 둘뿐이고, 그것이 이 표의 요점입니다. 모든 메시지가 색으로 표시된 스레드는 색이 아무 의미도 갖지 못하는 스레드입니다.

`delivered`와 `read`가 표시를 공유하는 이유는, 그것들이 12px 크기로 한 열에 나란히 놓인 채 구별되어야 하기 때문입니다. 폭의 3분의 1쯤 겹친 체크 두 개는 표시의 너비를 두 배로 늘리지 않고 "둘"을 말합니다.

아예 빼면 아무것도 그려지지 않습니다. 받은 메시지에는 보여 줄 만한 전송 상태가 없습니다.

## 단어는 넘기는 것이 아니라 번역되어 있습니다

모든 표시는 보이는 독자에게는 말이 없고 그 외의 모두에게는 읽힙니다. 그 뒤의 단어는 prop이 아니라 이 라이브러리 자신의 [메시지 표](../../design/localization)에서 옵니다.

```tsx
<MPChatBubble status="delivered" locale="ko">
  …
</MPChatBubble>
// "전달됨"으로 읽힙니다
```

[MPDialog](../feedback/dialog)가 `closeLabel`로 하는 것과 정반대인데, 차이는 개수입니다. 다이얼로그에는 단어 하나와 인스턴스 하나가 있습니다. 스레드는 말풍선 마흔 개의 열이고 각각 다섯 개의 단어가 가능하며, 메시지마다 그것들을 넘겨야 하는 호출자는 영어를 넘기게 됩니다. 제품이 다른 이름으로 부른다면 `statusLabel`이 여전히 있습니다.

## 예시

<Demo src="chat-bubble/slots" :minHeight="420">

<<< @/.vitepress/demos/chat-bubble/slots.tsx

</Demo>

### media

말풍선 위쪽에 가장자리까지 그려지므로, 말풍선 자신의 모서리가 — 잘린 것까지 포함해 — 사진을 잘라냅니다. 여백이 시트가 아니라 아래의 텍스트 구획에 있기 때문에 가능한 일입니다.

### preview

텍스트 아래 카드로 펼쳐진 링크입니다. 표면은 역할을 가리키는 대신 `currentColor`에서 섞어 냅니다. 말풍선에서 강조 색 채움과 중립 표면 양쪽에서 모두 동작해야 하는 유일한 부분이기 때문입니다. 고정된 역할을 쓰면 둘 중 하나에서 보이지 않게 됩니다.

이미지는 일부러 `alt=""`입니다. 그것이 말하는 모든 것이 바로 아래에 쓰여 있습니다. `newTab`은 target과 함께 `rel="noopener noreferrer"`를 붙입니다.

### actions

말풍선 안이 아니라 옆에 앉고, 행에 호버가 오거나 내부에 포커스가 들어오기 전까지 투명도 0으로 남습니다. 대화 한가운데에 늘 놓여 있는 메뉴 트리거는 읽기를 가로막는 손잡이입니다. 호버가 없는 포인터에는 드러낼 방법이 없으므로, 터치에서는 그냥 항상 보입니다.

### typing

메시지 대신 점 세 개를 그리고 `children`은 건드리지 않으므로, 메시지가 도착하면 같은 말풍선이 그리로 돌아갑니다.

```tsx
<MPChatBubble typing>{아직_도착하지_않은_초안}</MPChatBubble>
```

점들은 순서대로 밝아지고 절대 움직이지 않습니다. 누군가 입력하는 동안 튀는 말풍선은 다른 사람이 스크롤하고 있는 스레드에서 튑니다. [MPProgressBox](../feedback/progress-box)의 세그먼트가 도는 것과 같은 `mp-wave` 키프레임이고, `prefers-reduced-motion`에서 멈춥니다.

## 접근성

- 전송 표시는 장식이고, 그 뒤의 단어는 시각적으로 숨겨진 span에 있습니다. 보이는 독자가 체크 두 개를 볼 때 스크린 리더는 "전달됨"을 듣습니다.
- 입력 중 점들은 "입력 중"이라는 단어를 뒤에 둔 `status` 영역입니다.
- `actions`는 말풍선 바깥의 진짜 컨트롤이라서, 행에 포커스가 오기 전까지 보이지 않더라도 키보드로 닿을 수 있습니다. `group-focus-within`이 그것을 드러냅니다.
- `preview`는 보이는 제목을 가진 진짜 링크이고, 사진은 `alt=""`입니다. 제목과 요약이 이미 그것이 무엇인지 말하고 있기 때문입니다.
- 말풍선 자체에는 역할이 없습니다. 스레드는 목록이고, 이것들을 감싸는 것은 호출자의 몫입니다 — `<li>`가 든 `<ol>`이거나, 읽는 사람이 과거로 되짚어 갈 수 있느냐에 따라 `feed`입니다.

## 함께 보기

- [MPAvatar](./avatar) — 말풍선 옆의 사진.
- [MPMenu](../inputs/menu) — 보통 `actions`에 들어가는 것.
- [MPCard](../layout/card) — 같은 슬롯들을 스레드가 아니라 시트 위에 놓은 것.
