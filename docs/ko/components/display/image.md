---
title: MPImage
order: 23
---

# MPImage

<p class="mp-lede">자기가 지금 무엇을 하고 있는지 말하는 그림 — 오는 중일 때도, 끝내 오지 않을 때도. 상자 안에서 돌리고, 뒤집고, 어느 부분을 남길지 고를 수 있습니다.</p>

<Demo src="image/hero" :minHeight="240">

<<< @/.vitepress/demos/image/hero.tsx

</Demo>

```tsx
import { MPImage } from 'material-plus-ui';

<MPImage src={photo} alt="The east face at dawn" ratio="16 / 9" preview />;
```

## Props

<PropsTable name="MPImage" />

## `<img>`에는 상태가 셋이고 그중 둘을 잘 못 보여 줍니다

오는 중에는 아무것도 아닌 크기의 구멍이 있고, 도착하면 페이지가 **뜁니다**. 실패하면 브라우저 자신의 깨진 이미지 표시가 남는데, 그건 브라우저마다 다르고 어느 것에도 속하지 않으며 누구 잘못인지도 읽는 사람에게 말해 주지 않습니다.

| 상태      | 맨 `<img>`                        | 이것                                          |
| --------- | --------------------------------- | --------------------------------------------- |
| `loading` | 아무것도 없고, 자리도 잡히지 않음 | `ratio`가 이미 잡아 둔 상자 안의 플레이스홀더 |
| `loaded`  | 그림                              | 그림, 페이드 인                               |
| `error`   | 브라우저 자신의 표시              | `fallback`                                    |

자리를 잡아 두는 것이 `ratio`입니다. 없으면 상자는 그림이 밝혀진 크기가 되고, 그게 정해질 때 아래의 모든 것이 움직입니다.

## 캐시된 경우가 깨지는 경우입니다

이미 캐시에 있는 이미지는 **React가 무언가를 붙이기 전에** `complete`이고, 그래서 `load` 이벤트는 이미 지나갔습니다. 듣기만 하는 컴포넌트는 이미 완전히 그려진 그림 위에 플레이스홀더를 계속 덮고 있게 됩니다 — 그리고 두 번째 페이지 방문마다 그렇게 됩니다. 첫 방문은 잘 되기 때문에 아무도 테스트하지 않는 그 방문에서요.

`complete` 플래그를 마운트 시점에 확인하는 것이 정확히 그것 때문이고, 두 종류의 `complete`을 가르는 것이 `naturalWidth`입니다. 끝난 이미지는 너비가 있고, 실패한 것도 `complete`이지만 너비가 없습니다.

호출 지점의 `useState` 세 줄이 아니라 컴포넌트인 이유가 그것입니다.

## `alt`은 필수입니다

[`MPIconButton`](../inputs/icon-button.md)의 `label`이 필수인 이유와 같습니다 — 텍스트 대체가 없는 그림은 라이브러리가 실제로 도울 수 있는 가장 흔한 접근성 결함이고, 그 도움은 컴파일을 거부하는 것입니다.

`alt=""`가 *장식*이라고 말하는 방법입니다. 누군가 빠뜨린 prop이 아니라 누군가 한 주장입니다.

## `preview`

상자를 **버튼**으로 만들고 그림을 스크림 위에 엽니다.

```tsx
<MPImage src={thumb} previewSrc={full} alt="The east face at dawn" preview />
```

기본은 꺼짐입니다. 페이지의 그림 대부분은 열어 볼 가치가 없고, 조용히 눌리게 된 것은 아무도 선언하지 않은 컨트롤입니다. `previewSrc`가 썸네일을 썸네일답게 만듭니다 — 작은 파일은 페이지에 있고 큰 파일은 누군가 요청할 때만 가져옵니다.

**실패한** 그림은 열리기를 거부합니다. 깨진 이미지 글리프 위의 스크림은 그 제스처만큼의 가치가 없습니다.

## `rotate`와 `flip`

`rotate`는 그림을 시계 방향으로 90도씩 돌립니다. 값은 `0`, `90`, `180`, `270`입니다. `flip`은 그림을 뒤집으며, 값은 `horizontal`, `vertical`, `both`입니다.

<Demo src="image/rotate" :minHeight="440">

<<< @/.vitepress/demos/image/rotate.tsx

</Demo>

180도는 상자 모양을 그대로 둡니다. 90도와 270도는 가로세로를 바꾸므로, 그림이 도착하기 전에 상자가 파일의 비율을 알아야 합니다. 파일의 `width`와 `height`를 주면 상자가 돌린 모양으로 자리를 잡습니다. `width={1200} height={800}`을 옆으로 눕히면 가로 2, 세로 3입니다. 둘이 없으면 파일이 도착할 때 모양을 읽고, 그때 페이지가 움직입니다. `ratio`를 주면 그 비율을 그대로 씁니다. 레이아웃의 모양이기 때문이고, 돌린 그림이 그 상자를 어떻게 채울지는 `fit`이 정합니다.

90도 단위만 받습니다. 다른 각도로 돌린 그림은 상자를 다 덮지 못하고, 빈 모서리를 채우려면 그림을 확대해야 하는데 그 배율은 결국 호출하는 쪽이 조정하고 싶어집니다. JavaScript에서 다른 숫자를 넘기면 가장 가까운 90도 단위로 반올림합니다. `-90`은 `270`이 됩니다.

`flip`은 화면에 보이는 축을 기준으로 뒤집습니다. 그래서 `horizontal`은 그림을 돌렸든 아니든 화면의 좌우를 바꿉니다.

`preview`도 같은 방향으로 돌리고 뒤집은 그림을 엽니다.

돌리기는 CSS `rotate` 속성으로, 뒤집기는 `scale` 속성으로 그리고 `transform`은 쓰지 않습니다. 그래서 호버 확대처럼 직접 건 `transform`도 그 위에 함께 적용됩니다.

옆으로 누운 그림은 흐름 밖에 놓이므로 상자에 너비를 줄 수 없습니다. 상자는 놓인 곳의 너비를 따릅니다. 플렉스 행처럼 내용으로 상자 크기를 정하는 곳에서는 너비를 따로 주세요.

## `fit`, `width`, `height`

`fit`은 CSS `object-fit`의 값을 그대로 받습니다. `cover`, `contain`, `fill`, `none`, `scale-down`입니다. `scale-down`은 `contain`처럼 그리지만, 상자보다 작은 파일은 키우지 않습니다.

<Demo src="image/fit" :minHeight="440">

<<< @/.vitepress/demos/image/fit.tsx

</Demo>

`width`와 `height`를 함께 주면 `<img>`에서처럼 파일의 픽셀 크기가 되고, 파일의 비율로 자리를 잡습니다. 하나만 주면 그 축의 상자 크기가 되고, 남는 공간에서 그림이 어떻게 놓일지는 `fit`이 정합니다.

- `height`만 주면 상자가 그 높이가 되고 너비는 컨테이너를 채웁니다. `ratio`도 주면 너비는 비율에서 나오고, 컨테이너보다 넓어지지 않습니다.
- `width`만 주면 상자가 그 너비가 되고 컨테이너보다 넓어지지 않습니다. 높이는 그림이나 `ratio`가 정합니다.

숫자와 숫자로만 된 문자열은 픽셀이고, 다른 문자열은 CSS 길이로 그대로 씁니다. 그래서 `height={240}`, `height="240"`, `height="15rem"`이 모두 됩니다. 상자가 컨테이너보다 좁아지면 `preview`가 그리는 버튼도 함께 좁아지므로, 포커스 링이 그림 둘레에 머뭅니다.

## `position`

`cover`로 잘릴 때 그림의 어느 부분을 남길지, `contain`, `none`, `scale-down`이 빈 공간을 어디에 둘지 정합니다. 가운데, 한 변, CSS 방식으로 쓴 모서리(`'top left'`), 가로와 세로 백분율 두 개(`'30% 20%'`)를 받습니다.

<Demo src="image/position" :minHeight="200">

<<< @/.vitepress/demos/image/position.tsx

</Demo>

값은 화면에 보이는 그림을 기준으로 읽습니다. `object-position`은 요소를 돌리거나 뒤집기 전의 요소 좌표에서 동작하므로, 컴포넌트가 값을 바꿔서 씁니다. 그래서 `rotate`와 `flip`이 무엇이든 `position="top"`은 화면에서 위쪽을 남깁니다.

논리 방향이 아니라 물리 방향입니다. 오른쪽에서 왼쪽으로 쓰는 페이지라고 사진 속 피사체가 반대편으로 옮겨 가지는 않으므로, `left`는 계속 왼쪽입니다.

길이가 들어간 값처럼 다른 형태의 값은 바꾸지 않고 그대로 `object-position`에 들어갑니다.

## `letterbox`

`fit`이 그림 둘레에 남긴 공간을 채웁니다. `none`은 비워 두고, `blur`는 그림 뒤에 같은 그림을 한 번 더 그리며, 다른 문자열은 색, 커스텀 프로퍼티, 그라디언트 같은 CSS `background`로 칠합니다.

<Demo src="image/letterbox" :minHeight="220">

<<< @/.vitepress/demos/image/letterbox.tsx

</Demo>

`blur`는 동영상 플레이어가 세로 영상의 양옆을 채우는 방식과 같습니다. 같은 파일의 `<img>`를 하나 더 두어 상자를 흐리게 덮고, 그림과 함께 페이드 인합니다. 이 `<img>`는 그림과 같은 `src`, `srcSet`, `sizes`, `loading`, `decoding`, `crossOrigin`, `referrerPolicy`를 받으므로 브라우저는 파일을 한 번만 가져옵니다. 보조 기술에는 숨겨지고 포인터도 받지 않으므로, 흐린 부분을 오른쪽 클릭해도 이미지 저장 메뉴가 뜨지 않습니다.

`fit`이 공간을 남길 수 있을 때, 즉 `contain`, `none`, `scale-down`일 때만 그립니다. `cover`와 `fill`은 그림이 상자 전체를 덮으므로 채울 공간이 없습니다.

## 그림을 플레이스홀더로

`placeholder`는 `{ src, blur }` 형태의 그림도 받습니다. 파일이 오는 동안 반짝임 대신 작은 사본, 데이터 URI, `Blob`을 그립니다.

<Demo src="image/placeholder" :minHeight="400">

<<< @/.vitepress/demos/image/placeholder.tsx

</Demo>

대신 그리는 그림은 본 그림과 같은 방식으로 맞추고, 배치하고, 돌리고, 뒤집습니다. `blur: true`는 반경 20픽셀로 흐리게 하고, 숫자를 주면 그 픽셀 값을 반경으로 씁니다. 본 그림이 그 위로 다 페이드 인할 때까지 불투명하게 있다가 한 번에 사라집니다. 둘을 서로 교차해서 페이드하면 중간에 둘 다 반투명해져 뒤의 페이지가 비치기 때문입니다. 파일을 불러오지 못하면 대신 그리던 그림을 지우고 `fallback`을 그립니다.

`Blob`은 객체 URL로 그립니다. URL은 Blob을 받을 때 만들고, Blob이 바뀌거나 이미지가 언마운트될 때 해제합니다. 렌더마다 같은 Blob을 넘기세요. 상태에 담아 두면 됩니다. 렌더마다 새 Blob을 만들면 URL도 매번 새로 만들어집니다.

반짝임과 마찬가지로 대신 그리는 그림도 상자를 채우므로, 상자에 `ratio`나 `width`와 `height` 둘 다로 자리를 잡아 두어야 합니다. 그렇지 않으면 그림이 도착하기 전까지 상자에 높이를 줄 것이 없어서 대신 그릴 자리도 없습니다.

## 그림을 불러오는 시점

`loading`, `decoding`, `fetchPriority`는 `<img>` 자신의 속성이고 `<img>`로 그대로 전달됩니다.

- `loading="lazy"`는 그림이 뷰포트 가까이 올 때까지 가져오기를 미룹니다. 스크롤해야 보이는 그림에 쓰세요.
- `decoding="async"`는 페이지의 나머지를 붙잡지 않고 파일을 디코딩하게 합니다.
- `fetchPriority`는 페이지의 다른 요청에 비해 이 파일을 얼마나 급하게 가져올지 올리거나 내립니다.

`priority`는 페이지를 평가받는 그림, 보통 최대 콘텐츠풀 페인트(LCP) 그림에 씁니다. `loading="eager"`와 높은 가져오기 우선순위를 설정하고, 직접 쓴 속성이 있으면 그 값을 따릅니다. 페이지마다 그림 하나에만 주세요. 모든 그림의 우선순위를 올리면 어느 그림도 다른 그림보다 먼저 오지 않습니다.

```tsx
<MPImage src={cover} alt="The east face at dawn" ratio="16 / 9" priority />
<MPImage src={thumb} alt="The hut below the ridge" ratio="4 / 3" loading="lazy" decoding="async" />
```

지연 로딩하는 그림도 자리를 잡아 두어야 합니다. 불러오기 전까지 상자의 크기는 `ratio`나 `width`와 `height`가 정한 만큼이므로, 둘 다 없으면 그림이 도착할 때 페이지가 움직입니다.

React 19는 이 속성을 `fetchPriority`로, React 18은 `fetchpriority`로 씁니다. `priority`는 실행 중인 React가 아는 표기로 쓰므로 어느 버전에서도 경고가 나지 않습니다.

## 이것이 아닌 것

- **갤러리가 아닙니다.** `preview`는 _이_ 그림 하나를 엽니다. 이미지 사이를 걸어 다니는 라이트박스는 어떤 이미지들이 어떤 순서로 있는지 알아야 하고, 그건 그림이 아니라 컬렉션을 든 컴포넌트입니다.
- **`next/image`가 아닙니다.** `srcset` 생성도, loader도, 포맷 협상도 없습니다. 그건 파일을 서빙하는 쪽의 일이고, 그걸 추측하는 라이브러리는 남의 CDN에 대해 추측하는 것입니다. `srcSet` · `sizes` · `loading` · `decoding` · `fetchPriority`는 `<img>`로 그대로 통과합니다.

## 날카로운 모서리

- **로딩 중에도 `<img>`는 레이아웃에 남습니다.** 숨기는 게 아니라 투명합니다. 이미지의 `display: none`은 일부 브라우저가 건너뛰는 fetch이고, 그러면 그림이 아예 오기 시작하지 않습니다.
- **새 `src`는 `loading`으로 돌아갑니다.** 새 소스의 플레이스홀더 아래에 옛 그림을 붙들고 있지 않습니다.
- **`alt`은 미리보기가 아니라 그림에 주세요.** `previewLabel`이 달리 말하지 않는 한 버튼의 이름은 `alt`에서 오므로, 좋은 `alt`은 한 번에 두 가지 일을 합니다.

## 다음

- [MPAspectRatio](../layout/aspect-ratio.md) — 이미지가 아닌 내용을 위한 같은 상자.
- [MPSkeleton](../feedback/skeleton.md) — 아직 오는 중인 페이지의 나머지를 위한 반짝임.
