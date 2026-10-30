<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';
import { FRAMEWORKS } from '../../data/frameworks';
import { localeOf, t, tf } from '../../data/i18n';
import { propTables } from '../../data/props';
import { flutterPropTables } from '../../data/props-flutter';

/**
 * Renders one component's props table, once per framework.
 *
 * `<PropsTable name="MPTextField" />`
 *
 * The React rows come from `data/props.ts` and the Flutter rows from
 * `data/props-flutter/`. Both tables are rendered and `styles/framework.css`
 * displays the selected one, like a `::: fw` block, so switching framework is
 * instant and the server's HTML matches what the client draws.
 *
 * A framework the component has not reached gets a sentence instead of an empty
 * table: the absence is information, and a table with no rows reads as a bug.
 */
const props = defineProps({
  name: { type: String, required: true }
});

/** Which rows each framework reads. One entry per id in `frameworks.ts`. */
const tablesByFramework = {
  react: propTables,
  flutter: flutterPropTables
};

const { lang } = useData();
const locale = computed(() => localeOf(lang.value));

const tables = computed(() =>
  FRAMEWORKS.map((framework) => ({
    id: framework.id,
    label: framework.label,
    rows: tablesByFramework[framework.id]?.[props.name] ?? []
  }))
);
</script>

<template>
  <template v-for="table in tables" :key="table.id">
    <div v-if="table.rows.length" class="mp-props mp-fw" :data-fw="table.id">
      <table>
        <thead>
          <tr>
            <th>{{ t(locale, 'propColumn') }}</th>
            <th>{{ t(locale, 'typeColumn') }}</th>
            <th>{{ t(locale, 'defaultColumn') }}</th>
            <th>{{ t(locale, 'descriptionColumn') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.rows" :key="row.name">
            <td>
              <span class="mp-props-name">{{ row.name }}</span>
              <span v-if="row.required" class="mp-props-required" :title="t(locale, 'required')">
                *
              </span>
            </td>
            <td class="mp-props-type">{{ row.type }}</td>
            <td class="mp-props-default">{{ row.default ?? '—' }}</td>
            <td class="mp-props-desc">{{ row.description[locale] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="mp-fw mp-fw-missing" :data-fw="table.id">
      {{ tf(locale, 'propsMissing', { component: name, framework: table.label }) }}
    </p>
  </template>
</template>
