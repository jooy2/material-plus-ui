/**
 * A2UI's basic catalog, drawn as Material Design 3.
 *
 * [A2UI](https://a2ui.org) is a protocol for an agent to describe an interface
 * rather than write one: the agent sends JSON naming components from a *catalog*,
 * and a renderer on the client draws them. The catalog is the contract — which
 * components exist, what props each takes — and this module is an implementation
 * of the protocol's own basic catalog, so an agent that already targets it gets
 * Material Plus on the other end with nothing changed at its end.
 *
 * ```tsx
 * import { A2uiSurface } from '@a2ui/react/v0_9';
 * import { MessageProcessor } from '@a2ui/web_core/v0_9';
 * import { mpA2uiCatalog } from 'material-plus-ui/a2ui';
 * import 'material-plus-ui/styles.css';
 *
 * const processor = new MessageProcessor([mpA2uiCatalog]);
 *
 * processor.processMessages(messagesFromTheAgent);
 *
 * const surfaces = Array.from(processor.model.surfacesMap.values());
 *
 * surfaces.map((surface) => <A2uiSurface key={surface.id} surface={surface} />);
 * ```
 *
 * ## The two packages this needs, and why they are optional
 *
 * `@a2ui/react` and `@a2ui/web_core` are **optional peer dependencies**: install
 * them and this subpath works, leave them out and nothing else in the library
 * notices. That is not tidiness. The protocol SDK brings Lit, signals, Zod, a
 * date library and a Markdown parser with it, and the rest of this package
 * promises two runtime dependencies — so the SDK stays behind an import that only
 * a project rendering agent interfaces ever writes. Nothing in `src/` outside this
 * directory imports either package, and this module is not in the main barrel.
 *
 * ## No stylesheet of its own
 *
 * Everything here draws with components from this library, which means the
 * ordinary `material-plus-ui/styles.css` is all a surface needs, and the split
 * per-component sheets keep working as they always did. That is also why nothing
 * in this directory writes a utility class: a class used only here would be a rule
 * in the whole stylesheet and in none of the split ones. Where a declaration is
 * genuinely needed it is written inline, off the `--mp-sys-*` tokens, so a page
 * that set `data-mp-shape` or a source colour reaches an agent's surface too.
 *
 * ## What the agent can and cannot do
 *
 * A surface is JSON from a language model, so the boundary matters:
 *
 * - **The catalog is the allowlist.** A component name that is not one of the
 *   eighteen does not resolve, and there is no path from a payload to a component
 *   of your own unless you registered it with `createMPA2uiCatalog`.
 * - **Props are validated against the schemas** by the SDK's binder before they
 *   reach anything here, which is why these implementations do not re-check types.
 * - **Text is text.** Markdown is rendered only when the application has
 *   configured a renderer through `@a2ui/react`'s Markdown context, whose contract
 *   requires it to sanitize; with none configured, an agent's string is drawn as
 *   the characters it contains. See `components/MPA2uiText.tsx`.
 * - **URLs are the agent's.** `Image`, `Video` and `AudioPlayer` load what the
 *   payload names them, so a surface from an agent you do not control belongs
 *   behind a Content Security Policy that says where media may come from.
 *
 * ## Two catalogs, and where they stop
 *
 * `mpA2uiCatalog` is the eighteen, under the basic catalog's id. `mpA2uiExtendedCatalog`
 * is those plus five of this library's own — a data table, a bar, line and pie
 * chart, and a statistic — under an id of ours, because five components the basic
 * vocabulary cannot express are a different contract and must not claim to be that
 * one. Their schemas are `extended/api.ts` and are published, generated from those
 * schemas, at the id itself.
 *
 * Twenty-three of a hundred and thirty, then. The rest — the command palette, the
 * calendar, the tour, the animations — are not reachable from a payload, and a
 * component only becomes reachable by being given a schema an agent can fill in
 * from JSON alone. `createMPA2uiCatalog` is how a project adds its own.
 */
export {
  A2UI_BASIC_CATALOG_ID,
  MP_A2UI_CATALOG_ID,
  MP_A2UI_COMPONENTS,
  MP_A2UI_EXTENDED_COMPONENTS,
  createMPA2uiCatalog,
  mpA2uiCatalog,
  mpA2uiExtendedCatalog
} from './catalog';

export { MPA2uiAudioPlayer } from './components/MPA2uiAudioPlayer';
export { MPA2uiButton } from './components/MPA2uiButton';
export { MPA2uiCard } from './components/MPA2uiCard';
export { MPA2uiCheckBox } from './components/MPA2uiCheckBox';
export { MPA2uiChoicePicker } from './components/MPA2uiChoicePicker';
export { MPA2uiColumn } from './components/MPA2uiColumn';
export { MPA2uiDateTimeInput } from './components/MPA2uiDateTimeInput';
export { MPA2uiDivider } from './components/MPA2uiDivider';
export { MPA2uiIcon } from './components/MPA2uiIcon';
export { MPA2uiImage } from './components/MPA2uiImage';
export { MPA2uiList } from './components/MPA2uiList';
export { MPA2uiModal } from './components/MPA2uiModal';
export { MPA2uiRow } from './components/MPA2uiRow';
export { MPA2uiSlider } from './components/MPA2uiSlider';
export { MPA2uiTabs } from './components/MPA2uiTabs';
export { MPA2uiText } from './components/MPA2uiText';
export { MPA2uiTextField } from './components/MPA2uiTextField';
export { MPA2uiVideo } from './components/MPA2uiVideo';

export { MPA2uiBarChart } from './extended/MPA2uiBarChart';
export { MPA2uiDataTable } from './extended/MPA2uiDataTable';
export { MPA2uiLineChart } from './extended/MPA2uiLineChart';
export { MPA2uiPieChart } from './extended/MPA2uiPieChart';
export { MPA2uiStatistic } from './extended/MPA2uiStatistic';

export { BarChartApi, DataTableApi, LineChartApi, PieChartApi, StatisticApi } from './extended/api';

export { A2UI_ICONS } from './internal/icons';
export type { MPA2uiAccessibility } from './internal/common';
