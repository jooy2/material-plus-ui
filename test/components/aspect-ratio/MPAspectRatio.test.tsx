import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAspectRatio } from 'material-plus-ui';

/** The box the browser actually laid out. */
function boxOf(element: Element) {
  return element.getBoundingClientRect();
}

describe('MPAspectRatio', () => {
  describe('the proportion', () => {
    it('is square by default', async () => {
      const screen = await render(
        <div style={{ width: 200 }}>
          <MPAspectRatio data-testid="box" />
        </div>
      );
      const box = boxOf(screen.getByTestId('box').element());

      expect(Math.round(box.width)).toBe(200);
      expect(Math.round(box.height)).toBe(200);
    });

    it('takes a ratio as a number', async () => {
      const screen = await render(
        <div style={{ width: 300 }}>
          <MPAspectRatio ratio={1.5} data-testid="box" />
        </div>
      );
      const box = boxOf(screen.getByTestId('box').element());

      expect(Math.round(box.height)).toBe(200);
    });

    it('takes the ratio CSS spells, so a caller who knows 16 / 9 translates nothing', async () => {
      const screen = await render(
        <div style={{ width: 320 }}>
          <MPAspectRatio ratio="16 / 9" data-testid="box" />
        </div>
      );
      const box = boxOf(screen.getByTestId('box').element());

      expect(Math.round(box.height)).toBe(180);
    });

    it('reserves the space before the media has arrived', async () => {
      // The whole point: a card whose image is still loading does not reflow the
      // page around it when the image lands.
      const screen = await render(
        <div style={{ width: 240 }}>
          <MPAspectRatio ratio={2} data-testid="box" />
        </div>
      );

      expect(Math.round(boxOf(screen.getByTestId('box').element()).height)).toBe(120);
    });
  });

  describe('the media inside', () => {
    it('is stretched to the box and then fitted', async () => {
      const screen = await render(
        <div style={{ width: 200 }}>
          <MPAspectRatio ratio={2}>
            <img data-testid="photo" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
          </MPAspectRatio>
        </div>
      );
      const photo = screen.getByTestId('photo').element();

      expect(Math.round(boxOf(photo).width)).toBe(200);
      expect(Math.round(boxOf(photo).height)).toBe(100);
      expect(getComputedStyle(photo).objectFit).toBe('cover');
    });

    it('takes the other three fits', async () => {
      const screen = await render(
        <MPAspectRatio fit="contain">
          <img data-testid="photo" alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />
        </MPAspectRatio>
      );

      expect(getComputedStyle(screen.getByTestId('photo').element()).objectFit).toBe('contain');
    });

    it('leaves anything that is not media alone', async () => {
      // `fit` reaches an `img`, a `video`, a `canvas`, an `svg`, a `picture` and
      // an `iframe`. A `div` is laid out normally.
      const screen = await render(
        <MPAspectRatio>
          <div data-testid="panel">Anything</div>
        </MPAspectRatio>
      );

      expect(getComputedStyle(screen.getByTestId('panel').element()).objectFit).toBe('fill');
    });
  });

  describe('the corner', () => {
    it('is square unless asked for, because a layout component draws nothing', async () => {
      const screen = await render(<MPAspectRatio data-testid="box" />);

      expect(getComputedStyle(screen.getByTestId('box').element()).borderTopLeftRadius).toBe('0px');
    });

    it('is the card corner at md, which is what a photograph in a card wants', async () => {
      const screen = await render(<MPAspectRatio rounded data-testid="box" />);

      expect(getComputedStyle(screen.getByTestId('box').element()).borderTopLeftRadius).toBe(
        '12px'
      );
    });

    it('moves down the ladder with size', async () => {
      const screen = await render(<MPAspectRatio rounded size="xs" data-testid="box" />);

      expect(getComputedStyle(screen.getByTestId('box').element()).borderTopLeftRadius).toBe('4px');
    });
  });

  describe('the element', () => {
    it('is a div, and can be anything', async () => {
      const screen = await render(
        <MPAspectRatio render={<figure />} data-testid="box">
          <figcaption>A caption</figcaption>
        </MPAspectRatio>
      );

      expect(screen.getByTestId('box').element().tagName).toBe('FIGURE');
    });

    it('publishes the rung it was drawn at', async () => {
      const screen = await render(<MPAspectRatio size="lg" data-testid="box" />);

      expect(screen.getByTestId('box').element()).toHaveAttribute('data-mp-size', 'lg');
    });
  });
});
