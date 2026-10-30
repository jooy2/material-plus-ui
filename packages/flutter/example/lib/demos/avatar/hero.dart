import 'package:flutter/widgets.dart';
import 'package:material_plus_ui/material_plus_ui.dart';

/// A picture where there is one, and whatever stands in for it where there is
/// not. The fourth points at a file that is not there, the case a bare `Image`
/// draws nothing for, and the last four never had a picture to lose.
class AvatarHero extends StatelessWidget {
  const AvatarHero({super.key});

  @override
  Widget build(BuildContext context) {
    return const Wrap(
      spacing: 16,
      runSpacing: 16,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: <Widget>[
        MPAvatar(image: NetworkImage('/samples/people/anya-sol.webp'), name: 'Anya Sol'),
        MPAvatar(image: NetworkImage('/samples/people/lucas-adebayo.webp'), name: 'Lucas Adebayo'),
        MPAvatar(
          image: NetworkImage('/samples/people/noa-marin.webp'),
          name: 'Noa Marin',
          shape: MPAvatarShape.square,
        ),
        MPAvatar(
          image: NetworkImage('/this-file-does-not-exist.png'),
          name: 'Farah Wells',
          color: MPColor.tertiary,
        ),
        MPAvatar(name: '홍길동', color: MPColor.tertiary),
        MPAvatar(name: 'Ada Lovelace', variant: MPVariant.filled, color: MPColor.secondary),
        MPAvatar(shape: MPAvatarShape.square, variant: MPVariant.outlined, initials: 'MP'),
        MPAvatar(),
      ],
    );
  }
}
