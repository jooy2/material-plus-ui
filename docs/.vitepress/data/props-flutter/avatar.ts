import { colorRow, from, renamed, sizeRow, VARIANT, WIDGET, type PropRow } from './shared';

export default {
  MPAvatar: [
    renamed('MPAvatar', 'src', 'image', {
      type: 'ImageProvider?',
      description: {
        ko: '사진. Flutter의 모든 이미지가 그렇듯 `NetworkImage`, `AssetImage` 같은 `ImageProvider`로 받고, 파일 크기가 아니라 상자 크기에 맞춰 디코딩합니다. 해상도별 후보는 provider가 고릅니다',
        en: 'The picture, as an `ImageProvider` such as a `NetworkImage` or an `AssetImage`, which is the shape every Flutter image has. Decoded at the size of the box, not of the file; resolution candidates are the provider’s job'
      }
    }),
    from('MPAvatar', 'name', { type: 'String?' }),
    from('MPAvatar', 'initials', { type: 'String?' }),
    renamed('MPAvatar', 'alt', 'semanticLabel', {
      type: 'String?',
      description: {
        ko: '화면 낭독기가 읽는 이름. React의 `alt` 자리이며, 기본값은 `name`이고 이름도 없으면 아무것도 읽지 않습니다',
        en: 'What a screen reader announces. React’s `alt`; defaults to `name`, and to nothing when there is none'
      }
    }),
    from('MPAvatar', 'shape', { type: 'MPAvatarShape?', default: 'MPAvatarShape.circle' }),
    from('MPAvatar', 'variant', { type: `${VARIANT}?`, default: 'MPVariant.tonal' }),
    sizeRow('MPAvatar'),
    colorRow('MPAvatar'),
    from('MPAvatar', 'delay', { type: 'Duration?' }),
    from('MPAvatar', 'onLoadingStatusChange', { type: 'ValueChanged<MPAvatarLoadingStatus>?' }),
    renamed('MPAvatar', 'children', 'child', { type: `${WIDGET}?` })
  ]
} satisfies Record<string, PropRow[]>;
