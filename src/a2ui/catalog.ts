/**
 * The catalog: the eighteen components, under the id whose contract they keep.
 *
 * ## Why the id is the specification's own
 *
 * A `catalogId` is a promise about *schemas* — these component names, these props,
 * these types — and says nothing about how any of it is drawn. The schemas here
 * are not modelled on the basic catalog's, they **are** the basic catalog's: every
 * implementation is built from the `…Api` object the protocol publishes, so the
 * contract is kept by construction and cannot drift from it.
 *
 * That makes this catalog a drop-in. An agent already targeting the basic catalog
 * needs no change, and no new schema has to be hosted anywhere for a client to
 * announce it in `supportedCatalogIds`.
 *
 * A project extending the vocabulary — its own components, its own names — needs
 * an id of its own, because that is a different contract. `createMPA2uiCatalog`
 * is for exactly that: mint a URI you control, add your implementations, and the
 * eighteen here come along.
 */
import type { ReactComponentImplementation } from '@a2ui/react/v0_9';
import { BASIC_FUNCTIONS, Catalog } from '@a2ui/web_core/v0_9';
import { MPA2uiBarChart } from './extended/MPA2uiBarChart';
import { MPA2uiDataTable } from './extended/MPA2uiDataTable';
import { MPA2uiLineChart } from './extended/MPA2uiLineChart';
import { MPA2uiPieChart } from './extended/MPA2uiPieChart';
import { MPA2uiStatistic } from './extended/MPA2uiStatistic';
import { MPA2uiAudioPlayer } from './components/MPA2uiAudioPlayer';
import { MPA2uiButton } from './components/MPA2uiButton';
import { MPA2uiCard } from './components/MPA2uiCard';
import { MPA2uiCheckBox } from './components/MPA2uiCheckBox';
import { MPA2uiChoicePicker } from './components/MPA2uiChoicePicker';
import { MPA2uiColumn } from './components/MPA2uiColumn';
import { MPA2uiDateTimeInput } from './components/MPA2uiDateTimeInput';
import { MPA2uiDivider } from './components/MPA2uiDivider';
import { MPA2uiIcon } from './components/MPA2uiIcon';
import { MPA2uiImage } from './components/MPA2uiImage';
import { MPA2uiList } from './components/MPA2uiList';
import { MPA2uiModal } from './components/MPA2uiModal';
import { MPA2uiRow } from './components/MPA2uiRow';
import { MPA2uiSlider } from './components/MPA2uiSlider';
import { MPA2uiTabs } from './components/MPA2uiTabs';
import { MPA2uiText } from './components/MPA2uiText';
import { MPA2uiTextField } from './components/MPA2uiTextField';
import { MPA2uiVideo } from './components/MPA2uiVideo';

/**
 * The id of A2UI's basic catalog, which is the contract this package implements.
 *
 * The path says `v0_9` and holds the v0.9.1 schemas, which is the protocol's own
 * spelling rather than a mistake here. Written out rather than imported, because
 * the only module that exports it is the one that also registers the reference
 * renderer's eighteen custom elements as a side effect of being loaded.
 *
 * Exported because an agent has to send this exact string for a surface to
 * resolve, and a client has to announce it in `supportedCatalogIds`. A URI that
 * has to match in two places is not a string to retype in either of them.
 */
export const A2UI_BASIC_CATALOG_ID =
  'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';

/** The eighteen implementations, in the order the specification lists them. */
export const MP_A2UI_COMPONENTS: ReactComponentImplementation[] = [
  MPA2uiText,
  MPA2uiImage,
  MPA2uiIcon,
  MPA2uiVideo,
  MPA2uiAudioPlayer,
  MPA2uiRow,
  MPA2uiColumn,
  MPA2uiList,
  MPA2uiCard,
  MPA2uiTabs,
  MPA2uiModal,
  MPA2uiDivider,
  MPA2uiButton,
  MPA2uiTextField,
  MPA2uiCheckBox,
  MPA2uiChoicePicker,
  MPA2uiSlider,
  MPA2uiDateTimeInput
];

/**
 * The id of this library's own catalog, which is the basic vocabulary plus the
 * five components under `a2ui/extended`.
 *
 * A URI, and one that answers: the schema is generated from the implementations
 * and served at this address by the documentation site. An agent does not have to
 * fetch it — a `catalogId` is an identifier rather than a download — but an agent
 * that was never told what this catalog holds can read it there, which is the
 * whole reason to mint an id instead of borrowing one.
 *
 * Its own id because it is its own contract. These five components are this
 * library's, so a surface that uses one is not a surface the basic catalog can
 * draw, and saying otherwise with the basic id would be a promise to any other
 * renderer that it could.
 */
export const MP_A2UI_CATALOG_ID = 'https://material-plus.cdget.com/a2ui/v0_9/catalog.json';

/**
 * The components this library adds to the protocol's vocabulary: a table, three
 * charts and a figure.
 *
 * Their schemas are `extended/api.ts`, which is where the reasoning about what an
 * agent may and may not state lives.
 */
export const MP_A2UI_EXTENDED_COMPONENTS: ReactComponentImplementation[] = [
  MPA2uiDataTable,
  MPA2uiBarChart,
  MPA2uiLineChart,
  MPA2uiPieChart,
  MPA2uiStatistic
];

/**
 * A catalog of these components under an id of your own, with your own
 * components and functions alongside them.
 *
 * ```ts
 * const catalog = createMPA2uiCatalog({
 *   id: 'https://example.com/catalogs/orders/v1/catalog.json',
 *   components: [OrderTable]
 * });
 * ```
 *
 * A name given twice is the later one: pass an implementation called `Button` and
 * it replaces the one here, which is how a single component is swapped without
 * rebuilding the list.
 */
export const createMPA2uiCatalog = ({
  id = A2UI_BASIC_CATALOG_ID,
  components = [],
  functions = BASIC_FUNCTIONS
}: {
  /** The URI this catalog answers to. Defaults to the basic catalog's. */
  id?: string;
  /** Implementations to add, or to override one of the eighteen with. */
  components?: ReactComponentImplementation[];
  /** The functions an agent may call. Defaults to the basic catalog's. */
  functions?: typeof BASIC_FUNCTIONS;
} = {}) =>
  new Catalog<ReactComponentImplementation>(id, [...MP_A2UI_COMPONENTS, ...components], functions);

/**
 * The basic catalog, drawn as Material Plus.
 *
 * ```ts
 * const processor = new MessageProcessor([mpA2uiCatalog]);
 * ```
 */
export const mpA2uiCatalog = createMPA2uiCatalog();

/**
 * The same, plus the five components the basic catalog has no way to express.
 *
 * Register both and an agent can choose per surface: the basic id for anything
 * another renderer might also have to draw, and this one when the surface is a
 * table or a chart.
 *
 * ```ts
 * const processor = new MessageProcessor([mpA2uiCatalog, mpA2uiExtendedCatalog]);
 * ```
 */
export const mpA2uiExtendedCatalog = createMPA2uiCatalog({
  id: MP_A2UI_CATALOG_ID,
  components: MP_A2UI_EXTENDED_COMPONENTS
});
