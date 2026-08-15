import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPRating } from 'material-plus-ui';
import { userEvent } from 'vitest/browser';

const stars = (container: Element) => Array.from(container.querySelectorAll('.mp-rating__star'));

/** How much of each star is filled, as a fraction of its width. */
const fills = (container: Element) =>
  stars(container).map(
    (star) =>
      Number.parseFloat((star.querySelector('.mp-rating__fill') as HTMLElement).style.width) / 100
  );

/**
 * The half of a star a pointer would press.
 *
 * The `<label>` rather than the radio inside it: the input is a 1px box clipped
 * to nothing, which is what makes it invisible and also what makes it
 * unclickable — the browser routes a press on the label to it, and so does a
 * reader. The keyboard reaches the radios directly and needs none of this.
 */
const half = (container: Element, index: number) =>
  container.querySelectorAll('.mp-rating__star label')[index] as HTMLElement;

describe('MPRating', () => {
  it('is a radio group of real inputs, one per choosable score', async () => {
    const screen = await render(<MPRating />);

    await expect.element(screen.getByRole('radiogroup', { name: 'Rating' })).toBeInTheDocument();
    expect(screen.container.querySelectorAll('input[type="radio"]')).toHaveLength(5);
  });

  it('names every score rather than leaving five unlabelled radios', async () => {
    const screen = await render(<MPRating />);

    await expect.element(screen.getByRole('radio', { name: '3 out of 5' })).toBeInTheDocument();
  });

  it('takes a score when a star is pressed', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<MPRating onValueChange={onValueChange} />);

    await userEvent.click(half(screen.container, 3));

    expect(onValueChange).toHaveBeenCalledWith(4);
    expect(fills(screen.container)).toEqual([1, 1, 1, 1, 0]);
  });

  it('leaves a controlled rating where the caller put it', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<MPRating value={2} onValueChange={onValueChange} />);

    await userEvent.click(half(screen.container, 3));

    expect(onValueChange).toHaveBeenCalledWith(4);
    // The value, not the drawing: the pointer is still resting on the fourth
    // star, and what the row shows while that is true is what the pointer is
    // promising rather than what has been chosen.
    expect(screen.container.querySelector('input:checked')).toHaveAttribute('value', '2');
  });

  it('clears back to nothing when the score already chosen is chosen again', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<MPRating defaultValue={3} onValueChange={onValueChange} />);

    await userEvent.click(half(screen.container, 2));

    expect(onValueChange).toHaveBeenCalledWith(0);
    expect(screen.container.querySelector('input:checked')).toBeNull();
  });

  it('keeps the score when clearing is turned off', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPRating defaultValue={3} clearable={false} onValueChange={onValueChange} />
    );

    await userEvent.click(half(screen.container, 2));

    expect(onValueChange).not.toHaveBeenCalled();
    expect(fills(screen.container)).toEqual([1, 1, 1, 0, 0]);
  });

  it('offers half a star at a time when it is asked to', async () => {
    const onValueChange = vi.fn();
    const screen = await render(<MPRating precision={0.5} onValueChange={onValueChange} />);

    expect(screen.container.querySelectorAll('input[type="radio"]')).toHaveLength(10);

    // Two halves per star, so the fifth label is the first half of the third.
    await userEvent.click(half(screen.container, 4));

    expect(onValueChange).toHaveBeenCalledWith(2.5);
    expect(fills(screen.container)).toEqual([1, 1, 0.5, 0, 0]);
  });

  it('draws a fraction it was handed at every precision', async () => {
    // An average is not a choice: rounding 4.3 to the nearest half would be
    // reporting a different number from the one the component was given.
    const screen = await render(<MPRating value={4.3} readOnly />);
    const drawn = fills(screen.container);

    expect(drawn.slice(0, 4)).toEqual([1, 1, 1, 1]);
    expect(drawn[4]).toBeCloseTo(0.3, 5);
  });

  it('falls back to whole stars for a precision that is not a fraction of one', async () => {
    const screen = await render(<MPRating precision={0} />);

    expect(screen.container.querySelectorAll('input[type="radio"]')).toHaveLength(5);
  });

  it('takes as many stars as it was asked for', async () => {
    const screen = await render(<MPRating count={3} defaultValue={2} />);

    expect(stars(screen.container)).toHaveLength(3);
    await expect.element(screen.getByRole('radio', { name: '2 out of 3' })).toBeInTheDocument();
  });

  it('is one image with a sentence for a name once it is read only', async () => {
    // Twenty focusable radios on a page that was only reporting a number is
    // twenty tab stops nobody asked for.
    const screen = await render(<MPRating value={4} readOnly />);

    await expect.element(screen.getByRole('img', { name: '4 out of 5' })).toBeInTheDocument();
    expect(screen.container.querySelectorAll('input')).toHaveLength(0);
  });

  it('says so when nothing has been chosen', async () => {
    const screen = await render(<MPRating readOnly />);

    await expect.element(screen.getByRole('img', { name: 'Not rated' })).toBeInTheDocument();
  });

  it('keeps its colour while it is read only', async () => {
    // The one `readOnly` in the library that does not drain the saturation: a
    // row of grey stars would say the score itself was unavailable.
    const screen = await render(
      <div>
        <MPRating value={3} className="live" />
        <MPRating value={3} readOnly className="frozen" />
      </div>
    );
    const filled = (selector: string) =>
      getComputedStyle(screen.container.querySelector(`${selector} [aria-hidden="true"] > span`)!)
        .color;

    expect(filled('.frozen')).toBe(filled('.live'));
  });

  it('drops the accent while it is unavailable', async () => {
    const screen = await render(
      <div>
        <MPRating value={3} className="live" />
        <MPRating value={3} disabled className="off" />
      </div>
    );
    const filled = (selector: string) =>
      getComputedStyle(screen.container.querySelector(`${selector} [aria-hidden="true"] > span`)!)
        .color;

    expect(filled('.off')).not.toBe(filled('.live'));
    for (const input of screen.container.querySelectorAll('.off input')) {
      expect(input).toBeDisabled();
    }
  });

  it('carries its value into a form submission', async () => {
    const screen = await render(
      <form>
        <MPRating name="score" defaultValue={4} />
      </form>
    );
    const form = screen.container.querySelector('form')!;

    expect(new FormData(form).get('score')).toBe('4');
  });

  it('says it in the language it was given', async () => {
    const screen = await render(<MPRating value={3} readOnly locale="ko" />);

    await expect.element(screen.getByRole('img', { name: '5점 만점에 3점' })).toBeInTheDocument();
  });

  it('takes a caller’s word over the translation', async () => {
    const screen = await render(<MPRating locale="ko" labels={{ label: 'How was it?' }} />);

    await expect
      .element(screen.getByRole('radiogroup', { name: 'How was it?' }))
      .toBeInTheDocument();
    // The rest of the namespace stays Korean rather than falling back to English.
    await expect.element(screen.getByRole('radio', { name: '5점 만점에 2점' })).toBeInTheDocument();
  });

  it('draws one star at the size the rung asks for', async () => {
    const screen = await render(<MPRating size="xl" />);

    expect(stars(screen.container)[0].getBoundingClientRect().height).toBe(36);
  });

  it('publishes the rung it was drawn at', async () => {
    const screen = await render(<MPRating size="sm" id="score" />);
    const root = screen.container.querySelector('.mp-rating')!;

    expect(root).toHaveAttribute('data-mp-size', 'sm');
    expect(root).toHaveAttribute('id', 'score');
  });
});
