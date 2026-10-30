/**
 * `ChoicePicker` — one or several of a list, in whichever control fits the list.
 *
 * The protocol describes this component along three axes — one choice or several,
 * drawn as boxes or as chips, filterable or not — and MD3 has a different control
 * for most of the combinations. So this is the one component in the catalog that
 * branches, and the branches are:
 *
 * - **filterable** — `MPCombobox`, single or multiple. Filtering is a control of
 *   its own in Material, not a text box bolted above a list: the field is the
 *   list's own, it announces its matches, its empty state is already translated,
 *   and a long list does not have to be on the page to be searched. This is also
 *   why the filter needs no word of its own from this package.
 * - **one choice, boxes** — `MPRadioGroup`. A radio group is what "exactly one of
 *   these" means to a screen reader, and arrow-key movement between the options
 *   comes with it.
 * - **anything else** — an `MPFieldset` of `MPCheckbox`es, or of `MPChip`s when
 *   the agent asked for chips. The legend is what ties the group together, which
 *   a bare heading above a row of controls does not.
 *
 * ## The value is a list in every branch
 *
 * `value` is a string array whatever the variant, so a mutually exclusive picker
 * writes back a list of one. Reading it, only the first entry counts: an agent
 * that sends two selected values to an exclusive picker gets the first, rather
 * than a control that shows two things chosen and a schema that said it could not
 * happen.
 */
import { createComponentImplementation } from '@a2ui/react/v0_9';
import { ChoicePickerApi } from '@a2ui/web_core/v0_9';
import { MPCheckbox } from '../../components/checkbox/MPCheckbox';
import { MPChip } from '../../components/chip/MPChip';
import { MPCombobox, type MPComboboxOption } from '../../components/combobox/MPCombobox';
import { MPFieldset } from '../../components/fieldset/MPFieldset';
import { MPFlex } from '../../components/flex/MPFlex';
import { MPRadio, MPRadioGroup } from '../../components/radio-group/MPRadioGroup';
import { asText, weightStyle } from '../internal/common';

export const MPA2uiChoicePicker = createComponentImplementation(ChoicePickerApi, ({ props }) => {
  const options = props.options ?? [];
  const values: string[] = Array.isArray(props.value) ? props.value.map(String) : [];
  const isExclusive = (props.variant ?? 'mutuallyExclusive') === 'mutuallyExclusive';
  const error = props.validationErrors?.[0];
  const style = weightStyle(props.weight);

  /** One option's new state, as the whole list the data model holds. */
  const toggle = (value: string, selected: boolean) => {
    if (isExclusive) {
      props.setValue(selected ? [value] : []);

      return;
    }

    props.setValue(
      selected
        ? [...values.filter((each) => each !== value), value]
        : values.filter((each) => each !== value)
    );
  };

  if (props.filterable) {
    const items: MPComboboxOption[] = options.map((option) => ({
      value: String(option.value),
      label: asText(option.label) ?? String(option.value)
    }));

    if (isExclusive) {
      return (
        <MPCombobox
          items={items}
          value={values[0] ?? null}
          onValueChange={(next) => props.setValue(next === null ? [] : [String(next)])}
          label={props.label}
          errorMessage={error}
          clearable
          style={style}
        />
      );
    }

    return (
      <MPCombobox
        multiple
        items={items}
        value={values}
        onValueChange={(next) => props.setValue(next.map(String))}
        label={props.label}
        errorMessage={error}
        style={style}
      />
    );
  }

  if (isExclusive && props.displayStyle !== 'chips') {
    return (
      <MPRadioGroup
        value={values[0] ?? null}
        onValueChange={(next) => props.setValue([next])}
        label={props.label}
        errorMessage={error}
        style={style}
      >
        {options.map((option) => (
          <MPRadio
            key={String(option.value)}
            value={String(option.value)}
            label={asText(option.label) ?? String(option.value)}
          />
        ))}
      </MPRadioGroup>
    );
  }

  return (
    <MPFieldset legend={props.label} description={error} style={style}>
      {props.displayStyle === 'chips' ? (
        <MPFlex wrap gap={8}>
          {options.map((option) => {
            const value = String(option.value);
            const selected = values.includes(value);

            return (
              <MPChip
                key={value}
                variant={selected ? 'tonal' : 'outlined'}
                selected={selected}
                onClick={() => toggle(value, !selected)}
              >
                {asText(option.label) ?? value}
              </MPChip>
            );
          })}
        </MPFlex>
      ) : (
        <MPFlex direction="column" gap={4}>
          {options.map((option) => {
            const value = String(option.value);

            return (
              <MPCheckbox
                key={value}
                checked={values.includes(value)}
                onCheckedChange={(checked) => toggle(value, checked)}
                label={asText(option.label) ?? value}
              />
            );
          })}
        </MPFlex>
      )}
    </MPFieldset>
  );
});
