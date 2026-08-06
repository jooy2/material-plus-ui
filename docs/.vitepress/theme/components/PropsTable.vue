<script setup>
import { computed } from 'vue';
import { useData } from 'vitepress';
import { localeOf, t } from '../../data/i18n';
import { propTables } from '../../data/props';

/**
 * Renders one component's props table from `data/props.ts`.
 *
 * `<PropsTable name="MPTextField" />`
 */
const props = defineProps({
  name: { type: String, required: true }
});

const { lang } = useData();
const locale = computed(() => localeOf(lang.value));
const rows = computed(() => propTables[props.name] ?? []);
</script>

<template>
  <div class="mp-props">
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
        <tr v-for="row in rows" :key="row.name">
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
</template>
