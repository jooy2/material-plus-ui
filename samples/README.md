# Sample images

The pictures the component demos are drawn with. Everything under this folder is served from the site root, so a demo refers to one by its path: `/samples/people/anya-sol.webp`.

| Folder | Holds | Size |
| --- | --- | --- |
| `people/` | Head-and-shoulders portraits, transparent background | 256x256 |
| `photos/` | Photographs | 1200px on the long edge |
| `illustrations/` | Drawn artwork | 1000px on the long edge |
| `marks/` | Product marks, for `MPAppLogo` | 128x128 |

`photos/thumbs/` and `illustrations/thumbs/` hold the same pictures at 480px and 400px. Use a thumbnail wherever the box is small, which is nearly everywhere: the full-size file is for `MPImage`'s `previewSrc`, the one place a reader asks for the whole picture.

## Where they came from

Every file is a resized WebP of an asset in [jooy2/sample-assets](https://github.com/jooy2/sample-assets), which is MIT licensed and carries the same copyright as this repository. The portraits are of wholly fictional people; the photographs are generated and are not of a real place.

## Adding one

Take it from that repository rather than from anywhere else, convert it with `cwebp`, and keep the source file's name minus its dimensions. Nothing here needs to be large — a picture in a demo is read at a few hundred pixels, and the docs site is the one place a component library gets to demonstrate that it cares.
