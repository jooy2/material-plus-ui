/// Decoding a picture at the size it is drawn rather than at the size of its
/// file.
///
/// A browser does this on its own: an `<img>` drawn forty pixels wide is kept
/// at the pixels it needs. Flutter decodes an [ImageProvider] at the file's own
/// size unless it is told otherwise, so a 1024-pixel photograph in a 40-pixel
/// avatar holds four megabytes, and a gallery of twelve-megapixel photographs
/// holds about fifty for every tile. [sizedForDecode] tells it otherwise.
///
/// It is not exported from `material_plus_ui.dart`.
library;

import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';

/// The step a decode size is rounded up to, in device pixels.
///
/// A box that grows by a pixel would otherwise be a new size, a new entry in
/// the image cache and a new decode, every frame of a window being dragged
/// wider. Rounded up, so the picture is never decoded smaller than it is drawn.
const int decodeStep = 128;

/// The size to decode a picture of [intrinsicWidth] by [intrinsicHeight] pixels
/// at, for a box of [width] by [height] device pixels.
///
/// With [cover], both sides of the picture reach the box's, which is what a
/// crop or a stretch draws from. Without it, the whole picture fits inside the
/// box, which is what a picture shown whole draws from. A side left `null`
/// says nothing, and the proportion is always the file's. The picture is never
/// made larger than the file.
(int, int) decodeTarget(
  int intrinsicWidth,
  int intrinsicHeight, {
  required bool cover,
  int? width,
  int? height,
}) {
  if (intrinsicWidth <= 0 || intrinsicHeight <= 0 || (width == null && height == null)) {
    return (intrinsicWidth, intrinsicHeight);
  }

  final double? across = width == null ? null : width / intrinsicWidth;
  final double? down = height == null ? null : height / intrinsicHeight;

  double scale;

  if (across == null) {
    scale = down!;
  } else if (down == null) {
    scale = across;
  } else {
    scale = cover ? (across > down ? across : down) : (across < down ? across : down);
  }

  if (scale >= 1) {
    return (intrinsicWidth, intrinsicHeight);
  }

  int side(int length) {
    final int scaled = (length * scale).ceil();

    return scaled < 1 ? 1 : scaled;
  }

  return (side(intrinsicWidth), side(intrinsicHeight));
}

/// [image], decoded no larger than a box of [width] by [height] logical pixels
/// needs at [devicePixelRatio].
///
/// A [ResizeImage] the caller made, or a picture already sized here, is handed
/// back as it is: the caller has already said what size to decode at, and a
/// second size on top of the first fails an assertion in debug. So is a picture
/// with no side to size by.
ImageProvider<Object> sizedForDecode(
  ImageProvider<Object> image, {
  required double devicePixelRatio,
  required bool cover,
  double? width,
  double? height,
}) {
  if (image is ResizeImage || image is MPSizedImage) {
    return image;
  }

  int? step(double? length) {
    if (length == null || !length.isFinite || length <= 0) {
      return null;
    }

    return (length * devicePixelRatio / decodeStep).ceil() * decodeStep;
  }

  final int? across = step(width);
  final int? down = step(height);

  if (across == null && down == null) {
    return image;
  }

  return MPSizedImage(image, width: across, height: down, cover: cover);
}

/// An [ImageProvider] decoded at the size [decodeTarget] gives.
///
/// [ResizeImage]'s arrangement, with the one answer it does not have: `cover`,
/// where both sides reach the box and the proportion is kept. `ResizeImage`
/// can keep the proportion only by being given one side, and which side a
/// crop needs depends on the shape of a file it has not read yet.
@immutable
class MPSizedImage extends ImageProvider<MPSizedImageKey> {
  /// Decodes [image] for a box of [width] by [height] device pixels.
  const MPSizedImage(this.image, {required this.cover, this.width, this.height})
    : assert(width != null || height != null);

  /// The picture.
  final ImageProvider<Object> image;

  /// The box's width, in device pixels.
  final int? width;

  /// The box's height, in device pixels.
  final int? height;

  /// Whether both sides reach the box's, rather than the whole picture fitting
  /// inside it.
  final bool cover;

  @override
  Future<MPSizedImageKey> obtainKey(ImageConfiguration configuration) {
    // Synchronous when the picture's own key is, so a picture already in the
    // cache is drawn on the frame it is asked for rather than faded in after it.
    final Completer<MPSizedImageKey> completer = Completer<MPSizedImageKey>();
    SynchronousFuture<MPSizedImageKey>? result;
    bool waiting = false;

    image.obtainKey(configuration).then((Object key) {
      final MPSizedImageKey sized = MPSizedImageKey._(key, width, height, cover);

      if (waiting) {
        completer.complete(sized);
      } else {
        result = SynchronousFuture<MPSizedImageKey>(sized);
      }
    }, onError: completer.completeError);

    if (result != null) {
      return result!;
    }

    waiting = true;

    return completer.future;
  }

  @override
  ImageStreamCompleter loadImage(MPSizedImageKey key, ImageDecoderCallback decode) {
    Future<ui.Codec> sized(ui.ImmutableBuffer buffer, {ui.TargetImageSizeCallback? getTargetSize}) {
      assert(
        getTargetSize == null,
        'A picture sized for its box cannot be composed with another provider that sizes it.',
      );

      return decode(
        buffer,
        getTargetSize: (int intrinsicWidth, int intrinsicHeight) {
          final (int across, int down) = decodeTarget(
            intrinsicWidth,
            intrinsicHeight,
            cover: cover,
            width: width,
            height: height,
          );

          return ui.TargetImageSize(width: across, height: down);
        },
      );
    }

    final ImageStreamCompleter completer = image.loadImage(key._key, sized);

    // A failure is not kept in the cache under this size, for the same reason
    // `ResizeImage` does not keep one: the next attempt should try again.
    completer.addEphemeralErrorListener((Object error, StackTrace? stack) {
      scheduleMicrotask(() => PaintingBinding.instance.imageCache.evict(key));
    });

    return completer;
  }

  @override
  bool operator ==(Object other) {
    return other is MPSizedImage &&
        other.image == image &&
        other.width == width &&
        other.height == height &&
        other.cover == cover;
  }

  @override
  int get hashCode => Object.hash(image, width, height, cover);

  @override
  String toString() =>
      '${objectRuntimeType(this, 'MPSizedImage')}($image, $width×$height, cover: $cover)';
}

/// The cache key of a [MPSizedImage]: the picture's own key and the size.
@immutable
class MPSizedImageKey {
  const MPSizedImageKey._(this._key, this._width, this._height, this._cover);

  final Object _key;
  final int? _width;
  final int? _height;
  final bool _cover;

  @override
  bool operator ==(Object other) {
    return other is MPSizedImageKey &&
        other._key == _key &&
        other._width == _width &&
        other._height == _height &&
        other._cover == _cover;
  }

  @override
  int get hashCode => Object.hash(_key, _width, _height, _cover);
}
