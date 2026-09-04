import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPDataList, MPDataListItem } from 'material-plus-ui';

const list = () => document.querySelector('.mp-data-list') as HTMLElement;
const labels = () => Array.from(document.querySelectorAll('.mp-data-list__label')) as HTMLElement[];
const values = () => Array.from(document.querySelectorAll('.mp-data-list__value')) as HTMLElement[];

const Rows = () => (
  <>
    <MPDataListItem label="Status">Active</MPDataListItem>
    <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
    <MPDataListItem label="A much longer label">Two</MPDataListItem>
  </>
);

describe('MPDataList', () => {
  it('is a real `dl` of real `dt`/`dd` pairs', async () => {
    // Which is the whole reason it is not a two-column table: a table is read as
    // a grid of rows, and this is read as "label, value" a pair at a time.
    await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    expect(list().tagName).toBe('DL');
    expect(labels()[0].tagName).toBe('DT');
    expect(values()[0].tagName).toBe('DD');
  });

  it('puts both halves of a pair directly under the `dl`', async () => {
    // A wrapper element around each pair would take the grid with it, and every
    // label would line up against nothing.
    await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    for (const element of [...labels(), ...values()]) {
      expect(element.parentElement).toBe(list());
    }
  });

  it('starts every value at the same place', async () => {
    await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    const starts = values().map((value) => value.getBoundingClientRect().left);

    // `max-content` on the label column, so the widest label sets the gutter and
    // nobody has to measure it.
    expect(new Set(starts).size).toBe(1);
  });

  it('takes a label width when it is given one', async () => {
    await render(
      <MPDataList labelWidth={200}>
        <Rows />
      </MPDataList>
    );

    expect(labels()[0].getBoundingClientRect().width).toBe(200);
  });

  it('drops the browser’s own margin off every value', async () => {
    // A `<dd>` arrives with a 40px inline-start margin, which in the grid would
    // push every value off the column the labels were lined up against.
    await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    expect(getComputedStyle(values()[0]).marginInlineStart).toBe('0px');
  });

  it('stacks the label over the value when it is vertical', async () => {
    const screen = await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    // Side by side, sharing a grid row: the value starts to the right of the
    // label rather than under it. The two are aligned on their baselines rather
    // than their tops, the label being set a step down the type scale.
    expect(values()[0].getBoundingClientRect().left).toBeGreaterThan(
      labels()[0].getBoundingClientRect().right
    );

    await screen.rerender(
      <MPDataList orientation="vertical">
        <Rows />
      </MPDataList>
    );

    expect(values()[0].getBoundingClientRect().left).toBe(labels()[0].getBoundingClientRect().left);
    expect(labels()[0].getBoundingClientRect().bottom).toBeLessThanOrEqual(
      values()[0].getBoundingClientRect().top
    );
  });

  it('keeps a vertical label against its own value rather than halfway', async () => {
    // A flex gap would space a label from its value as readily as it spaces one
    // pair from the next, and a label floating between two values belongs to
    // neither.
    await render(
      <MPDataList orientation="vertical">
        <Rows />
      </MPDataList>
    );

    const own =
      values()[0].getBoundingClientRect().top - labels()[0].getBoundingClientRect().bottom;
    const next =
      labels()[1].getBoundingClientRect().top - values()[0].getBoundingClientRect().bottom;

    expect(own).toBeLessThan(next);
  });

  it('tightens the gaps with `density` and leaves the type alone', async () => {
    const screen = await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );
    const type = getComputedStyle(values()[0]).fontSize;
    const loose = list().getBoundingClientRect().height;

    await screen.rerender(
      <MPDataList density={-3}>
        <Rows />
      </MPDataList>
    );

    expect(list().getBoundingClientRect().height).toBeLessThan(loose);
    expect(getComputedStyle(values()[0]).fontSize).toBe(type);
  });

  it('stops tightening at the width a gap still means something', async () => {
    // Four pixels between rows is the last that reads as a break rather than as
    // a line wrap, so `xs` at `-1` is already on the floor and `-3` is the same.
    const screen = await render(
      <MPDataList size="xs" density={-1}>
        <Rows />
      </MPDataList>
    );
    const floored = list().getBoundingClientRect().height;

    await screen.rerender(
      <MPDataList size="xs" density={-3}>
        <Rows />
      </MPDataList>
    );

    expect(list().getBoundingClientRect().height).toBe(floored);
  });

  it('draws a hairline between the pairs when asked', async () => {
    const screen = await render(
      <MPDataList>
        <Rows />
      </MPDataList>
    );

    expect(getComputedStyle(labels()[1]).borderTopWidth).toBe('0px');

    await screen.rerender(
      <MPDataList dividers>
        <Rows />
      </MPDataList>
    );

    expect(getComputedStyle(labels()[1]).borderTopWidth).toBe('1px');
    // Never above the first pair: there is nothing on the other side of it.
    expect(getComputedStyle(labels()[0]).borderTopWidth).toBe('0px');
  });

  it('reaches the line across both halves of a horizontal pair', async () => {
    await render(
      <MPDataList dividers>
        <Rows />
      </MPDataList>
    );

    expect(getComputedStyle(values()[1]).borderTopWidth).toBe('1px');
  });

  it('draws no line between a vertical label and its own value', async () => {
    // Stacked, a `<dt>` and its `<dd>` are two rows, and the one place in the
    // list with nothing to divide is between them.
    await render(
      <MPDataList orientation="vertical" dividers>
        <Rows />
      </MPDataList>
    );

    expect(getComputedStyle(labels()[1]).borderTopWidth).toBe('1px');
    expect(getComputedStyle(values()[1]).borderTopWidth).toBe('0px');
  });

  it('draws an empty value rather than collapsing the pair', async () => {
    await render(
      <MPDataList>
        <MPDataListItem label="Notes" />
        <MPDataListItem label="Owner">Priya Raman</MPDataListItem>
      </MPDataList>
    );

    expect(values()).toHaveLength(2);
    expect(values()[0].textContent).toBe('');
  });
});
