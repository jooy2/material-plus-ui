import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPGaugeChart } from 'material-plus-ui';

const svg = () => document.querySelector('.mp-gauge-chart svg');
const arcs = () => Array.from(document.querySelectorAll('.mp-gauge-chart svg path'));
const drawn = () => expect.poll(() => svg() !== null).toBe(true);

/** The filled arc: the one painted with the accent slot. */
const reading = () => arcs().find((path) => path.getAttribute('fill') === 'var(--_mp-accent)');

const width = (node: Element | undefined) =>
  node ? (node as SVGGraphicsElement).getBBox().width : 0;

/**
 * Which family the dial is wearing.
 *
 * Read off the inline style rather than the computed one: `--_mp-accent` holds
 * a `var()` pointing at a role, and the computed value is the resolved colour —
 * which says nothing about *which* role got it.
 */
const family = () =>
  (document.querySelector('.mp-gauge-chart') as HTMLElement).style.getPropertyValue('--_mp-accent');

describe('MPGaugeChart', () => {
  it('is a meter in the markup, with its scale on it', async () => {
    // The same semantics MPMeter carries, because they are the same quantity in
    // two shapes. A reader on a screen reader gets the number and the range
    // without the drawing having to be described at all.
    await render(<MPGaugeChart value={72} min={0} max={200} label="CPU" locale="en-US" />);

    const meter = document.querySelector('[role="meter"]');

    expect(meter).not.toBeNull();
    expect(meter?.getAttribute('aria-valuenow')).toBe('72');
    expect(meter?.getAttribute('aria-valuemin')).toBe('0');
    expect(meter?.getAttribute('aria-valuemax')).toBe('200');
  });

  it('fills the dial in proportion to the reading', async () => {
    await render(<MPGaugeChart value={50} sweep={180} locale="en-US" height={200} />);
    await drawn();

    await expect.poll(() => reading()).toBeTruthy();

    // Half a 180° dial is a quarter turn, so the filled arc spans one side of
    // the track: as tall as the track and about half as wide.
    const track = (arcs()[0] as SVGGraphicsElement).getBBox();
    const filled = (reading() as unknown as SVGGraphicsElement).getBBox();

    expect(filled.width).toBeLessThan(track.width * 0.62);
    expect(filled.width).toBeGreaterThan(track.width * 0.38);
  });

  it('draws nothing of the reading at the minimum', async () => {
    // An arc of no sweep is an empty path, which is the honest drawing of a
    // reading that has not started.
    await render(<MPGaugeChart value={0} locale="en-US" />);
    await drawn();

    expect(reading()?.getAttribute('d')).toBe('');
  });

  it('carries the reading all the way round at the maximum', async () => {
    await render(<MPGaugeChart value={100} locale="en-US" />);
    await drawn();

    // The filled arc is as wide as the track it sits in.
    const track = arcs()[0];

    await expect.poll(() => width(reading())).toBeCloseTo(width(track), 0);
  });

  it('writes the figure in the middle', async () => {
    await render(<MPGaugeChart value={72} label="CPU" locale="en-US" />);

    expect(document.querySelector('.mp-gauge-chart__value')?.textContent).toBe('72');
    expect(document.querySelector('.mp-gauge-chart__label')?.textContent).toBe('CPU');
  });

  it('writes it the caller’s way when they said how', async () => {
    await render(
      <MPGaugeChart value={0.72} min={0} max={1} format={{ style: 'percent' }} locale="en-US" />
    );

    expect(document.querySelector('.mp-gauge-chart__value')?.textContent).toBe('72%');
  });

  it('takes the family the last reached threshold names', async () => {
    // The same resolver MPMeter reads, so a dial and a bar on one page cannot
    // disagree about where the amber starts.
    await render(
      <MPGaugeChart
        value={85}
        thresholds={[
          { from: 60, color: 'tertiary' },
          { from: 80, color: 'error' }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    expect(family()).toContain('error');
  });

  it('keeps the base family below every threshold', async () => {
    await render(
      <MPGaugeChart value={10} thresholds={[{ from: 60, color: 'error' }]} locale="en-US" />
    );
    await drawn();

    expect(family()).toContain('primary');
  });

  it('draws one track arc when there is nothing to band', async () => {
    await render(<MPGaugeChart value={40} locale="en-US" />);
    await drawn();

    // One track, one reading, and the two end caps.
    await expect.poll(() => arcs().length).toBe(4);
  });

  it('cuts the track into bands when it is asked to', async () => {
    // The bands are the whole argument for this shape over a bar, so they go on
    // the face rather than being left for the fill to discover.
    await render(
      <MPGaugeChart
        value={40}
        bands
        thresholds={[
          { from: 60, color: 'tertiary' },
          { from: 80, color: 'error' }
        ]}
        locale="en-US"
      />
    );
    await drawn();

    // Three bands now, plus the reading and the two caps.
    await expect.poll(() => arcs().length).toBe(6);
    expect(arcs()[0].getAttribute('fill')).toBe('var(--_mp-color-primary)');
    expect(arcs()[1].getAttribute('fill')).toBe('var(--_mp-color-tertiary)');
    expect(arcs()[2].getAttribute('fill')).toBe('var(--_mp-color-error)');
  });

  it('ignores a threshold that sits outside the scale', async () => {
    // A band from beyond the maximum has no face to be drawn on.
    await render(
      <MPGaugeChart value={40} bands thresholds={[{ from: 500, color: 'error' }]} locale="en-US" />
    );
    await drawn();

    await expect.poll(() => arcs().length).toBe(4);
  });

  it('opens the dial wider when it is told to', async () => {
    // A sweep of 180 stands on its base; anything wider dips below it.
    await render(<MPGaugeChart value={100} sweep={180} locale="en-US" height={200} />);
    await drawn();

    const box = (arcs()[0] as SVGGraphicsElement).getBBox();

    // A half dial is twice as wide as it is tall, give or take its thickness.
    expect(box.width / box.height).toBeGreaterThan(1.6);
  });

  it('clamps a reading that runs past either end of the scale', async () => {
    await render(<MPGaugeChart value={500} min={0} max={100} locale="en-US" />);
    await drawn();

    const track = arcs()[0];

    await expect.poll(() => width(reading())).toBeCloseTo(width(track), 0);
  });
});
