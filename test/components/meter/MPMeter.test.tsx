import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPMeter } from 'material-plus-ui';

const root = () => document.querySelector('.mp-meter') as HTMLElement;
const track = () => root().querySelector('.mp-meter__track') as HTMLElement;
const indicator = () => root().querySelector('.mp-meter__bar') as HTMLElement;

/** Which accent family the bar has resolved to, off the slot the classes read. */
const accent = () => root().style.getPropertyValue('--_mp-accent');

/** How wide the fill is, as a share of the groove it sits in. */
function filled(): number {
  const bar = indicator().getBoundingClientRect().width;

  return Math.round((bar / track().getBoundingClientRect().width) * 100);
}

describe('MPMeter', () => {
  it('is a meter rather than a progress bar', async () => {
    // Not a styling difference: a meter reports a quantity that is already
    // known, and a screen reader announces the two roles differently because
    // "94% full" and "94% finished" are different claims.
    const screen = await render(<MPMeter value={41} max={60} label="Seats" />);
    const meter = screen.getByRole('meter').element();

    expect(meter).toHaveAttribute('aria-valuenow', '41');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '60');
  });

  it('fills the groove to the share of the range', async () => {
    await render(<MPMeter value={30} />);

    expect(filled()).toBe(30);
  });

  it('reads a range that does not start at zero', async () => {
    const screen = await render(<MPMeter value={5} min={0} max={20} />);

    expect(filled()).toBe(25);

    await screen.rerender(<MPMeter value={15} min={10} max={20} />);

    // Waited for, because the fill travels to a new reading rather than jumping
    // to it — reading the width the frame after a rerender reads the journey.
    await vi.waitFor(() => expect(filled()).toBe(50));
  });

  it('clamps a reading that ran past its own scale', async () => {
    // `value` usually arrives from a division somewhere, and a bar drawn 140%
    // wide is a worse bug than one that sits full.
    const screen = await render(<MPMeter value={140} />);

    expect(filled()).toBe(100);

    await screen.rerender(<MPMeter value={-20} />);

    await vi.waitFor(() => expect(filled()).toBe(0));
  });

  it('shows the value as a share of the range when nothing said what it means', async () => {
    const screen = await render(<MPMeter value={41} max={60} showValue />);

    await expect.element(screen.getByText('68%')).toBeInTheDocument();
  });

  it('writes the value in its own units when `format` says what they are', async () => {
    // Which is when it matters more here than on a progress bar: a meter usually
    // has real units, and 2.1 GB of 5 is what the reader came for.
    const screen = await render(
      <MPMeter value={340} max={500} showValue format={{ style: 'currency', currency: 'GBP' }} />
    );

    await expect.element(screen.getByText('£340.00')).toBeInTheDocument();
  });

  it('names what is being measured, and reads it out with the value', async () => {
    const screen = await render(<MPMeter value={41} max={60} label="Seats taken" />);

    await expect.element(screen.getByRole('meter', { name: 'Seats taken' })).toBeInTheDocument();
  });

  it('carries `color` until a threshold is reached', async () => {
    const thresholds = [
      { from: 60, color: 'tertiary' as const },
      { from: 90, color: 'error' as const }
    ];

    const screen = await render(<MPMeter value={20} thresholds={thresholds} />);

    expect(accent()).toBe('var(--_mp-color-primary)');

    await screen.rerender(<MPMeter value={70} thresholds={thresholds} />);

    expect(accent()).toBe('var(--_mp-color-tertiary)');

    await screen.rerender(<MPMeter value={95} thresholds={thresholds} />);

    expect(accent()).toBe('var(--_mp-color-error)');
  });

  it('lets the last threshold reached win, in the order they were given', async () => {
    // A scan rather than a sort: thresholds are meant to be listed smallest
    // first, and quietly reordering them would hide the call site that did not.
    await render(
      <MPMeter
        value={95}
        thresholds={[
          { from: 90, color: 'error' },
          { from: 60, color: 'tertiary' }
        ]}
      />
    );

    expect(accent()).toBe('var(--_mp-color-tertiary)');
  });

  it('takes the groove’s thickness from `size`', async () => {
    const screen = await render(<MPMeter value={50} size="xl" />);
    const thick = track().getBoundingClientRect().height;

    await screen.rerender(<MPMeter value={50} size="xs" />);

    expect(track().getBoundingClientRect().height).toBeLessThan(thick);
  });

  it('draws no header line when there is nothing to put in it', async () => {
    // It would otherwise be an empty flex row above the bar, taking a line and a
    // gap for nothing.
    const screen = await render(<MPMeter value={50} />);

    expect(root().querySelector('.mp-meter__header')).toBeNull();

    await screen.rerender(<MPMeter value={50} showValue />);

    expect(root().querySelector('.mp-meter__header')).not.toBeNull();
  });
});
