/**
 * The catalog schema an agent can read, written from the catalog this library runs.
 *
 * `MP_A2UI_CATALOG_ID` is a URL, and a URL that answers nothing is a broken
 * promise: an agent told to target this catalog, or a developer wondering what is
 * in it, has one place to look and it is that address. So the schema is generated
 * into `docs/public/`, which the documentation site serves at the path the id
 * names — see `src/a2ui/catalog.ts`.
 *
 * ## Generated rather than written
 *
 * A catalog schema is the same statement as the Zod schemas in
 * `src/a2ui/extended/api.ts`, said in JSON Schema. Written by hand it would be a
 * second copy of a contract — and a second copy of a contract is a contract that is
 * wrong, because the copy an agent reads and the copy a renderer enforces drift the
 * first time somebody adds a prop to one of them. This runs in `npm run build` for
 * exactly that reason, and the output is committed so the site can serve it without
 * a build.
 *
 * ## Why it reads `dist/` and not `src/`
 *
 * Because `dist/` is what a consumer resolves. The schemas are plain Zod and would
 * run from source through `tsx`, but then a build that dropped a component — a bad
 * export, a module left out — would still produce a catalog that advertised it. The
 * file is the published description of the published package.
 *
 * ## Why the conversion is here and not the SDK's
 *
 * `getClientCapabilities({ includeInlineCatalogs: true })` produces this document
 * and is what a client sends an agent that asks what it can draw. It is not what
 * should be written to a file: its conversion deduplicates repeated subschemas into
 * pointers like `#/properties/accessibility/properties/label/anyOf/1`, written
 * against the component's own schema — and the component is then wrapped in an
 * `allOf` envelope, and the subschema they point into is replaced by a
 * `common_types.json` reference. Both moves leave the pointers naming nothing. On
 * the wire that is survivable, because a model reads the text; in a file published
 * at a URL, every one of them is a dangling reference in the document that is
 * supposed to be the contract.
 *
 * So the same two steps run here with the deduplication turned off: convert with
 * `$refStrategy: 'none'`, then apply the protocol's own `REF:` convention, which is
 * how a schema in Zod says "this is `common_types.json#/$defs/DynamicString`". The
 * envelope is the SDK's, and the last step checks this file's output against the
 * SDK's for the component names and their required props — so the day the protocol
 * changes either, the build says so here rather than the site serving a description
 * of a renderer that no longer matches.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { zodToJsonSchema } from 'zod-to-json-schema';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { MP_A2UI_CATALOG_ID, mpA2uiExtendedCatalog } = await import(
  pathToFileURL(resolve(root, 'dist/a2ui/index.js')).href
);

/*
 * The path comes out of the id rather than being written beside it, so the address
 * an agent is given and the file the site serves cannot disagree. A host this
 * repository does not publish is a mistake worth stopping on: nothing here can
 * serve that id, so the URL in the package would be dead on arrival.
 */
const { host, pathname } = new URL(MP_A2UI_CATALOG_ID);

if (host !== 'material-plus.cdget.com') {
  throw new Error(
    `MP_A2UI_CATALOG_ID points at ${host}, which this repository does not publish. ` +
      'The id has to be a path the documentation site serves, or the catalog it names is unreachable.'
  );
}

const out = resolve(root, 'docs/public', `.${pathname}`);

/**
 * The protocol's `REF:` convention, applied.
 *
 * A schema in the SDK describes itself as `REF:common_types.json#/$defs/DynamicString|…`,
 * which means "in JSON Schema, this is that definition". Everything before the bar
 * is the reference and everything after it is the description to keep. This is the
 * SDK's rule, followed rather than invented: the strings it reads are written in
 * A2UI's own schemas.
 */
const withProtocolRefs = (node) => {
  if (Array.isArray(node)) {
    return node.map(withProtocolRefs);
  }

  if (!node || typeof node !== 'object') {
    return node;
  }

  if (typeof node.description === 'string' && node.description.startsWith('REF:')) {
    const [reference, description] = node.description.slice(4).split('|');

    return description ? { $ref: reference, description } : { $ref: reference };
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, withProtocolRefs(value)])
  );
};

/** One component's props, as the envelope the protocol wraps them in. */
const asComponent = (name, schema) => {
  const converted = withProtocolRefs(
    zodToJsonSchema(schema, { target: 'jsonSchema2019-09', $refStrategy: 'none' })
  );

  return {
    allOf: [
      { $ref: 'common_types.json#/$defs/ComponentCommon' },
      {
        properties: { component: { const: name }, ...converted.properties },
        required: ['component', ...(converted.required ?? [])]
      }
    ]
  };
};

const components = {};

for (const [name, api] of mpA2uiExtendedCatalog.components.entries()) {
  components[name] = asComponent(name, api.schema);
}

const functions = [...mpA2uiExtendedCatalog.functions.values()].map((api) => ({
  name: api.name,
  description: api.schema.description,
  returnType: api.returnType,
  parameters: withProtocolRefs(
    zodToJsonSchema(api.schema, { target: 'jsonSchema2019-09', $refStrategy: 'none' })
  )
}));

/*
 * And the check that this file still says what the SDK would have said. Names and
 * required props only: what is deliberately different is the deduplication, and
 * what must not differ is the contract.
 */
const [reference] = new MessageProcessor([mpA2uiExtendedCatalog]).getClientCapabilities({
  includeInlineCatalogs: true
})['v0.9'].inlineCatalogs;

const drifted = Object.keys(reference.components)
  .map((name) => {
    const ours = components[name]?.allOf?.[1];
    const theirs = reference.components[name]?.allOf?.[1];

    if (!ours) {
      return `${name} is missing`;
    }

    return JSON.stringify(ours.required) === JSON.stringify(theirs.required)
      ? null
      : `${name} requires ${JSON.stringify(ours.required)} where the SDK requires ${JSON.stringify(theirs.required)}`;
  })
  .filter(Boolean);

if (
  drifted.length > 0 ||
  Object.keys(components).length !== Object.keys(reference.components).length
) {
  throw new Error(
    `the generated catalog no longer matches what @a2ui/web_core produces: ${
      drifted.join('; ') || 'the component lists differ'
    }`
  );
}

const document = {
  catalogId: MP_A2UI_CATALOG_ID,
  $comment:
    'Generated by scripts/build-a2ui-catalog.mjs from src/a2ui — do not edit. The components ' +
    "A2UI's basic catalog names keep that project's own schemas (github.com/a2ui-project/a2ui, " +
    'Apache-2.0); the rest are Material Plus (github.com/jooy2/material-plus-ui, MIT).',
  components,
  functions
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(document, null, 2)}\n`);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

console.log(
  `a2ui: ${relative(root, out)} ${Object.keys(components).length} components, ` +
    `${functions.length} functions, ${kb(JSON.stringify(document).length)}`
);
