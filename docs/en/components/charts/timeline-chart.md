---
title: MPTimelineChart
order: 39
---

# MPTimelineChart

<p class="mp-lede">What ran when, one row per thing. A Gantt: rows down the side, a calendar along the bottom, and a bar for every stretch.</p>

<Demo src="timeline-chart/hero" :minHeight="620" />

```tsx
import { MPTimelineChart } from 'material-plus-ui';

<MPTimelineChart
  series={[
    { name: 'Build', data: [{ start: new Date('2026-03-02'), end: new Date('2026-03-05') }] },
    { name: 'Test', data: [{ start: new Date('2026-03-05'), end: new Date('2026-03-09') }] }
  ]}
/>;
```

## Props

<PropsTable name="MPTimelineChart" />

## A span has two ends

That is the whole reason this is a separate component. Every other chart here puts its marks at a single point on the value axis, and `MPChartPoint` has one place to put one — so a span is its own type, with `start` and `end` rather than an `end` bolted onto a point that would carry it and never read it.

A span whose end is before its start is drawn either way round. One whose ends are not places on a number line is dropped, because a string is not an instant: letting it through would put a `NaN` in the path, which draws nothing and says nothing about why.

## The axis is a calendar, not a number line

The 1-2-5-10 steps every other value axis uses are exactly wrong for a moment. On epoch milliseconds they put a tick every 200,000,000 ms, which lands at 14:53:20 on an arbitrary Tuesday.

Time is not decimal below the year — sixty, sixty, twenty-four, seven, twelve — so this axis steps in seconds, minutes, hours, days, weeks, months and years. The ticks are walked with real calendar arithmetic: a month step lands on the first of the month whatever its length, and a day step survives the clocks going back.

They are also **aligned**, so a three-hour axis reads 00:00, 03:00, 06:00 rather than 01:00, 04:00, 07:00. Evenly spaced ticks that land on nothing a reader recognises give up most of the value of using a calendar at all.

The step is chosen as the one **nearest** the requested tick count rather than the first that is big enough. Over a fortnight, "at least two and a third days" is a week, which puts two ticks on the axis.

## There is no legend

The rows **are** the category axis, and they are already named down the side. A legend restating twenty row names is not a filter anybody wants, and it would be the only legend here identifying nothing new.

A row's colour still comes from its place in `series`, and a single span can override it — for the one stretch that is late, or the release itself.

## The pointer is tested against the whole bar

A span can be two hundred pixels of bar whose centre a pointer never goes near, so hit-testing to the centre would hand a short bar on the next row a hover the reader is plainly not making. The pointer is measured to the mark's **body** instead, which means anywhere along the bar counts.

The arrow keys walk the **spans**, not the rows — four spans across three rows is four stops, because a span is the thing being read.

## Both ends are rounded

A bar grows from a baseline and has one data end worth softening. A span _is_ two ends, neither more the value than the other, and it has no baseline at all.

## The table is one row per row

A grid cannot hold a variable number of spans, and a column per span would give the table as many columns as the busiest row has. So each row's cell writes out every span on it, in order.
