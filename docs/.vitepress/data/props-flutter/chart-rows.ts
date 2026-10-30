/**
 * The Flutter rows every chart page shares, derived from the React rows the
 * way `shared.ts` derives a single row.
 *
 * Not a page: it exports no tables of its own, so the glob in
 * `props-flutter.ts` reads an empty record from it.
 */

import { focusRows, from, sizeRow, WIDGET, type PropRow } from './shared';

/** A chart's `series`, typed for Dart. */
export function seriesRow(component: string): PropRow {
  return from(component, 'series', { type: 'List<MPChartSeries>' });
}

/** A chart's `categories`: Dart has no union, so a category is an `Object`. */
export function categoriesRow(component: string): PropRow {
  return from(component, 'categories', {
    type: 'List<MPChartCategory>?',
    description: {
      ko: '항목 축의 이름들. `MPChartCategory`는 `String`, `num`, `DateTime` 중 하나입니다. 주지 않으면 각 점의 `x`를, 그것도 없으면 인덱스를 씁니다',
      en: "The category axis' labels. An `MPChartCategory` is a `String`, a `num` or a `DateTime`. Without them a point's own `x` is used, and without that, its index"
    }
  });
}

/** `zoom`, which is an options object or nothing. */
export function zoomRow(component: string): PropRow {
  return from(component, 'zoom', {
    type: 'MPChartZoom?',
    default: 'null',
    description: {
      ko: '독자가 항목 축에서 구간을 끌어내면 거기에 맞춰 다시 그립니다. 값 눈금, 호버 패널, 읽어 주는 문장까지 전부 그 창을 따라갑니다. `const MPChartZoom()`이면 켜지고, `range`, `initialRange`, `onRangeChange`, `min`으로 창을 직접 쥡니다. 플롯 모서리의 **전체 보기** 컨트롤이 되돌립니다',
      en: 'Lets a reader drag a range out of the category axis and redraws to it. The value scale, the hover panel and the spoken reading all follow the window. `const MPChartZoom()` turns it on; `range`, `initialRange`, `onRangeChange` and `min` hold the window yourself. A **Show all** control over the corner of the plot is the way back'
    }
  });
}

/** `xAxis` or `yAxis`, typed for Dart. */
export function axisRow(component: string, name: 'xAxis' | 'yAxis'): PropRow {
  return from(component, name, { type: 'MPChartAxis?' });
}

/** `label`: the plot's semantic name, with the table text as its value. */
export function labelRow(component: string): PropRow {
  return from(component, 'label', {
    type: 'String?',
    description: {
      ko: '이 차트가 무엇의 차트인지. 화면 낭독기가 그림 대신 읽는 이름이고, 그 뒤에 그림 뒤의 표가 값으로 이어집니다',
      en: 'What the chart is a chart **of**. The name a screen reader announces in place of the drawing, followed by the table behind the picture as its value'
    }
  });
}

/** `height`, in logical pixels: there is no CSS length to parse. */
export function heightRow(component: string): PropRow {
  return from(component, 'height', {
    type: 'double?',
    description: {
      ko: '그림의 높이, 논리 픽셀 단위. 축 레이블은 이 높이 **안에** 그려집니다',
      en: 'How tall the drawing is, in logical pixels. The axis labels are drawn **inside** it rather than under it'
    }
  });
}

/** `format`, a function rather than `Intl` options. */
export function formatRow(component: string): PropRow {
  return from(component, 'format', {
    type: 'String Function(double value)?',
    description: {
      ko: '숫자가 나타나는 모든 곳 — 축, 패널, 읽어 주는 문장 — 에서의 표기. 주지 않으면 영어식 자릿수 구분으로 쓰고 만 단위부터 축약합니다',
      en: 'How numbers are written everywhere they appear — the axis, the panel, the spoken reading. Without it a number is grouped the English way and compacted past ten thousand'
    }
  });
}

/** `legend`, an options object whose `visible` stands in for `true` and `false`. */
export function legendRow(component: string): PropRow {
  return from(component, 'legend', {
    type: 'MPChartLegend?',
    description: {
      ko: '범례. 각 항목은 진짜 버튼이라 눌러서 계열을 숨기고 올려서 나머지를 흐립니다. `visible`이 `null`이면 계열이 둘 이상일 때만 그립니다. React의 `legend={true}`와 `legend={false}`는 `visible: true`와 `visible: false`입니다',
      en: "The legend. Each entry is a real button: press one to hide its series, hover one to dim the rest. With `visible` left `null` it is drawn from two series up. React's `legend={true}` and `legend={false}` are `visible: true` and `visible: false`"
    }
  });
}

/** `tooltip`, where `mode: none` stands in for `false`. */
export function tooltipRow(component: string): PropRow {
  return from(component, 'tooltip', {
    type: 'MPChartTooltip?',
    default: 'MPChartTooltip()',
    description: {
      ko: '포인터가 드러내는 것. 기본값이 켬입니다. 끄려면 `mode: MPChartTooltipMode.none`을 주십시오. `sort`로 행 순서를, `total`로 합계 행을, `builder`로 패널 자체를 정합니다. 터치 화면에서는 한 번 누르면 패널이 남고 같은 자리를 다시 누르면 닫힙니다',
      en: 'What the pointer uncovers, on by default. `mode: MPChartTooltipMode.none` turns it off. `sort` decides the order of the rows, `total` the row under them, and `builder` draws the panel yourself. On a touch screen a tap leaves the panel up and a second tap on the same place takes it down'
    }
  });
}

/** `empty`, a widget. */
export function emptyRow(component: string): PropRow {
  return from(component, 'empty', { type: `${WIDGET}?` });
}

/** `labelColor`, an enum. */
export function labelColorRow(component: string): PropRow {
  return from(component, 'labelColor', {
    type: 'MPChartLabelColor',
    default: 'MPChartLabelColor.ink'
  });
}

/** `locale`. */
export function localeRow(component: string): PropRow {
  return from(component, 'locale', {
    type: 'String?',
    description: {
      ko: '차트가 스스로 말하는 단어와 날짜 이름의 언어. 날짜 이름은 `dateNames`로 바꿀 수 있습니다',
      en: "Which language the chart's own words and its dates are in. `dateNames` replaces the names dates are written with"
    }
  });
}

/** `dateNames`, which has no React counterpart: React has `Intl`. */
export const dateNamesRow: PropRow = {
  name: 'dateNames',
  type: 'MPDateNames?',
  description: {
    ko: '날짜를 쓸 때의 달 이름. 주지 않으면 날짜 선택기와 같이 해당 로케일에 맞는 라이브러리 내장 표를 씁니다. React는 `Intl`에 물어보지만 Flutter 프레임워크에는 `Intl`이 없어서, 라이브러리가 싣는 18개 언어 밖의 이름은 직접 넘깁니다',
    en: "The month names dates are written with. Left out, the library's table for the locale in force, the same one the date pickers read. React asks `Intl`; the Flutter framework has none, so names for a language outside the eighteen the library ships are handed over"
  }
};

/** The chrome every framed chart carries, in the order the React table lists it. */
export function chromeRows(
  component: string,
  options: { legend?: boolean; labelColor?: boolean } = {}
): PropRow[] {
  return [
    labelRow(component),
    heightRow(component),
    formatRow(component),
    ...(options.legend === false ? [] : [legendRow(component)]),
    tooltipRow(component),
    emptyRow(component),
    ...(options.labelColor === false ? [] : [labelColorRow(component)]),
    localeRow(component),
    sizeRow(component),
    dateNamesRow,
    ...focusRows
  ];
}

/** Everything a chart with two axes takes before its own rows. */
export function cartesianRows(component: string, options: { zoom?: boolean } = {}): PropRow[] {
  return [
    seriesRow(component),
    categoriesRow(component),
    ...(options.zoom === false ? [] : [zoomRow(component)]),
    axisRow(component, 'xAxis'),
    axisRow(component, 'yAxis'),
    ...chromeRows(component)
  ];
}

/** `markers`, where `null` is React's `'auto'`. */
export function markersRow(component: string): PropRow {
  return from(component, 'markers', { type: 'bool?', default: "null ('auto')" });
}

/** `curve`, an enum. */
export function curveRow(component: string): PropRow {
  return from(component, 'curve', { type: 'MPChartCurve', default: 'MPChartCurve.linear' });
}

/** `gaps`, an enum whose `break` is spelled `gap`, `break` being reserved in Dart. */
export function gapsRow(component: string): PropRow {
  const row = from(component, 'gaps', { type: 'MPChartGaps', default: 'MPChartGaps.gap' });

  return {
    ...row,
    description: {
      ko: `${row.description.ko}. React의 \`break\`는 Dart에서 예약어라 \`MPChartGaps.gap\`입니다`,
      en: `${row.description.en}. React's \`break\` is \`MPChartGaps.gap\`, \`break\` being a reserved word in Dart`
    }
  };
}

/** `valueLabels`, an enum. */
export function valueLabelsRow(component: string): PropRow {
  return from(component, 'valueLabels', {
    type: 'MPChartValueLabels',
    default: 'MPChartValueLabels.none'
  });
}

/** `stacked`, an enum in place of `boolean | 'percent'`. */
export function stackedRow(component: string): PropRow {
  return from(component, 'stacked', {
    type: 'MPChartStack',
    default: 'MPChartStack.none'
  });
}

export default {} satisfies Record<string, PropRow[]>;
