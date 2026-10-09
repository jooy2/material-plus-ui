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
 * `getRendererCapabilities({ versions: ['v0.9'], includeInlineCatalogs: true })`
 * produces this document and is what a client sends an agent that asks what it can
 * draw. It is not what should be written to a file: its references point into a
 * `$defs` block — `#/$defs/DynamicString` and the like — that the v0.9 shape of the
 * document leaves out. On the wire that is survivable, because a model reads the
 * text; in a file published at a URL, every one of them is a dangling reference in
 * the document that is supposed to be the contract.
 *
 * So the conversion runs here, with the deduplication turned off and the protocol's
 * own `REF:` convention applied as it goes, which is how a schema in Zod says "this
 * is the protocol's `DynamicString`". Those definitions are the protocol's common
 * types, so each reference is written against the specification's
 * `common_types.json`, by the full address its own basic catalog uses. The envelope
 * is the SDK's, and the last two steps check the result: every reference names a
 * definition the protocol has, and the component names and their required props
 * match what the SDK produces — so the day the protocol changes either, the build
 * says so here rather than the site serving a description of a renderer that no
 * longer matches.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { MessageProcessor, V09_STANDARD_DEFS } from '@a2ui/web_core/v0_9';
import { ignoreOverride, zodToJsonSchema } from 'zod-to-json-schema';

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

/*
 * Where the protocol's common types are published, and the `$id` of the file
 * served there. The specification's own basic catalog points at it by this
 * address, and so does this file: a relative `common_types.json` would resolve
 * beside the published catalog, where the site serves nothing.
 */
const COMMON_TYPES = 'https://a2ui.org/specification/v0_9/common_types.json#/$defs/';

/**
 * The protocol's `REF:` convention, applied as the conversion meets it.
 *
 * A schema in the SDK describes itself as `REF:#/$defs/DynamicString|…`, which means
 * "in JSON Schema, this is that definition". Everything before the bar is the
 * reference and everything after it is the description to keep. This is the SDK's
 * rule, followed rather than invented: the strings it reads are written in A2UI's
 * own schemas. The definitions they name are the protocol's common types, so the
 * reference is written against `COMMON_TYPES`.
 *
 * It is answered before the converter descends rather than patched in afterwards. A
 * function call's arguments are dynamic values, and a dynamic value may be another
 * function call, so the schema under `FunctionCall` is recursive: with the
 * deduplication off, the converter walks into that recursion, warns, and writes `{}`
 * in its place. Answering with the reference first means it never goes in.
 */
const protocolRef = (def) => {
  if (typeof def.description !== 'string' || !def.description.startsWith('REF:')) {
    return ignoreOverride;
  }

  const [pointer, description] = def.description.slice(4).split('|');
  const reference = pointer.startsWith('#/$defs/')
    ? `${COMMON_TYPES}${pointer.slice('#/$defs/'.length)}`
    : pointer;

  return description ? { $ref: reference, description } : { $ref: reference };
};

/** A Zod schema as JSON Schema, with nothing deduplicated and every `REF:` applied. */
const toJsonSchema = (schema) =>
  zodToJsonSchema(schema, {
    target: 'jsonSchema2019-09',
    $refStrategy: 'none',
    override: protocolRef
  });

/** One component's props, as the envelope the protocol wraps them in. */
const asComponent = (name, schema) => {
  const converted = toJsonSchema(schema);

  return {
    allOf: [
      { $ref: `${COMMON_TYPES}ComponentCommon` },
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
  parameters: toJsonSchema(api.schema)
}));

/*
 * And the check that this file still says what the SDK would have said. Names and
 * required props only: what is deliberately different is the deduplication, and
 * what must not differ is the contract.
 *
 * Required as a set, with the envelope's own counted in. The SDK repeats `id` inside
 * each component and lists `component` last; this file leaves `id` to the envelope
 * that requires it and lists `component` first. Neither is a difference in what a
 * payload has to carry.
 *
 * The SDK's conversion walks into the recursion `protocolRef` keeps this file's out
 * of, and warns once per dynamic prop. Only names and required props are read from
 * it, so those warnings are about output this script throws away, and they are kept
 * off the build log rather than burying the lines that matter.
 */
const warn = console.warn;

console.warn = (message, ...rest) => {
  if (!String(message).startsWith('Recursive reference detected')) {
    warn(message, ...rest);
  }
};

const [reference] = new MessageProcessor([mpA2uiExtendedCatalog]).getRendererCapabilities({
  versions: ['v0.9'],
  includeInlineCatalogs: true
})['v0.9'].inlineCatalogs;

console.warn = warn;

const requiredSet = (list) => JSON.stringify([...new Set(list)].sort());
const envelopeRequired = V09_STANDARD_DEFS.ComponentCommon.required ?? [];

const drifted = Object.keys(reference.components)
  .map((name) => {
    const ours = components[name]?.allOf?.[1];
    const theirs = reference.components[name]?.allOf?.[1];

    if (!ours) {
      return `${name} is missing`;
    }

    return requiredSet([...envelopeRequired, ...ours.required]) === requiredSet(theirs.required)
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

/*
 * Every reference has to name a definition the protocol publishes. One that points
 * into this document, or at a name the protocol's `common_types.json` does not
 * define, names nothing for an agent that fetched the id.
 */
const references = [...JSON.stringify(document).matchAll(/"\$ref":"([^"]*)"/g)].map(
  ([, ref]) => ref
);
const dangling = [...new Set(references)].filter(
  (ref) => !ref.startsWith(COMMON_TYPES) || !(ref.slice(COMMON_TYPES.length) in V09_STANDARD_DEFS)
);

if (dangling.length > 0) {
  throw new Error(
    `the generated catalog names definitions the protocol does not have: ${dangling.join(', ')}`
  );
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${JSON.stringify(document, null, 2)}\n`);

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

console.log(
  `a2ui: ${relative(root, out)} ${Object.keys(components).length} components, ` +
    `${functions.length} functions, ${kb(JSON.stringify(document).length)}`
);
