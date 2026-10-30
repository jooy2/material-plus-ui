import { from, renamed, WIDGET, type PropRow } from './shared';

export default {
  MPImage: [
    renamed('MPImage', 'src', 'image', {
      type: 'ImageProvider',
      required: true,
      description: {
        ko: '사진. `ImageProvider`로 받으며, 파일 크기가 아니라 상자 크기에 맞춰 디코딩합니다',
        en: 'The picture, as an `ImageProvider`. Decoded at the size of the box rather than of the file'
      }
    }),
    renamed('MPImage', 'alt', 'semanticLabel', {
      type: 'String',
      required: true,
      description: {
        ko: "사진이 말하는 것. React의 `alt`처럼 필수이며, 장식인 사진에는 `''`를 넘깁니다",
        en: "What the picture says. Required, as React’s `alt` is; pass `''` for a picture that is decoration"
      }
    }),
    from('MPImage', 'ratio', {
      type: 'double?',
      description: {
        ko: '상자가 지키는 비율, 너비 나누기 높이. `16 / 9`처럼 씁니다',
        en: 'The proportion the box holds, width over height: `16 / 9`'
      }
    }),
    from('MPImage', 'width', { type: 'double?' }),
    from('MPImage', 'height', { type: 'double?' }),
    from('MPImage', 'fit', { type: 'MPImageFit', default: 'MPImageFit.cover' }),
    from('MPImage', 'position', {
      type: 'Alignment',
      default: 'Alignment.center',
      description: {
        ko: '잘라 낼 때 남길 부분. 보이는 그대로의 사진 기준이라 돌리거나 뒤집어도 `topCenter`는 화면의 위쪽이며, 방향에 따라 바뀌지 않는 물리적 정렬입니다',
        en: 'Which part of the picture a crop keeps, read on the picture as shown, so `topCenter` stays at the top through a turn or a mirror. Physical rather than directional'
      }
    }),
    from('MPImage', 'letterbox', {
      type: 'MPImageLetterbox?',
      description: {
        ko: '`fit`이 남긴 자리를 채우는 것. `MPImageLetterbox.blur`는 같은 사진을 흐리게 깔고, `MPImageLetterbox(decoration)`은 색이나 그라데이션을 칠합니다',
        en: 'What fills the room `fit` leaves. `MPImageLetterbox.blur` lays the same picture behind itself, blurred; `MPImageLetterbox(decoration)` paints a colour or a gradient'
      }
    }),
    from('MPImage', 'rotate', {
      type: 'int',
      default: '0',
      description: {
        ko: '시계 방향 회전 각도. 가장 가까운 4분의 1 바퀴로 반올림합니다',
        en: 'A clockwise turn in degrees, rounded to the nearest quarter'
      }
    }),
    from('MPImage', 'flip', { type: 'MPImageFlip', default: 'MPImageFlip.none' }),
    from('MPImage', 'placeholder', {
      type: `${WIDGET}?`,
      description: {
        ko: '사진이 오는 동안 그리는 것. 기본은 컨테이너 톤의 맥박이고, `SizedBox.shrink()`는 아무것도 그리지 않으며, `MPImagePlaceholder`는 작은 사본을 대신 그립니다',
        en: 'Drawn while the picture is on its way. A pulse on a container tone by default; `SizedBox.shrink()` draws nothing; an `MPImagePlaceholder` draws a small copy instead'
      }
    }),
    from('MPImage', 'fallback', { type: `${WIDGET}?` }),
    from('MPImage', 'preview', { type: 'bool', default: 'false' }),
    renamed('MPImage', 'previewSrc', 'previewImage', { type: 'ImageProvider?' }),
    from('MPImage', 'previewLabel', { type: 'String?' }),
    from('MPImage', 'onStateChange', { type: 'ValueChanged<MPImageState>?' })
  ]
} satisfies Record<string, PropRow[]>;
