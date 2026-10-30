import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render } from 'vitest-browser-react';
import {
  MPButton,
  MPColorPicker,
  MPDatePicker,
  MPDateRangePicker,
  MPForm,
  MPTextField
} from 'material-plus-ui';

function Field({ name, label, required }: { name: string; label: string; required?: boolean }) {
  const [value, setValue] = useState('');

  return (
    <MPTextField name={name} label={label} required={required} value={value} onChange={setValue} />
  );
}

describe('MPForm', () => {
  it('is a `<form>`, and stacks its children with a gap', async () => {
    const screen = await render(
      <MPForm>
        <Field name="email" label="Email" />
      </MPForm>
    );
    const form = screen.container.querySelector('.mp-form')!;

    expect(form.tagName).toBe('FORM');
    expect(form.className).toContain('flex-col');
    expect(form.className).toContain('gap-3');
  });

  it('takes a rung of the ladder for the stack', async () => {
    const screen = await render(
      <MPForm size="lg">
        <Field name="email" label="Email" />
      </MPForm>
    );

    expect(screen.container.querySelector('.mp-form')!.className).toContain('gap-3.5');
  });

  it('hands over the values on a valid submit, and navigates nowhere', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <MPForm onSubmit={onSubmit}>
        <Field name="email" label="Email" />
        <MPButton type="submit">Save</MPButton>
      </MPForm>
    );

    await screen.getByRole('textbox', { name: 'Email' }).fill('ada@example.com');
    await screen.getByRole('button', { name: 'Save' }).click();

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: 'ada@example.com' }));
  });

  it('hands a valid submit to its `action` when there is no `onSubmit`', async () => {
    // A handler for the values is what cancels the native submit, and one was
    // passed whether or not anybody asked — so an `action` never ran.
    const received = vi.fn();
    const screen = await render(
      <MPForm action={async (data: FormData) => received(data.get('email'))}>
        <Field name="email" label="Email" />
        <MPButton type="submit">Save</MPButton>
      </MPForm>
    );

    await screen.getByRole('textbox', { name: 'Email' }).fill('ada@example.com');
    await screen.getByRole('button', { name: 'Save' }).click();

    await vi.waitFor(() => expect(received).toHaveBeenCalledWith('ada@example.com'));
  });

  it('does not submit while a field is invalid', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <MPForm onSubmit={onSubmit}>
        <Field name="email" label="Email" required />
        <MPButton type="submit">Save</MPButton>
      </MPForm>
    );

    await screen.getByRole('button', { name: 'Save' }).click();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('puts an error from somewhere else back on the field it belongs to', async () => {
    const screen = await render(
      <MPForm errors={{ email: 'That address is already taken' }}>
        <Field name="email" label="Email" />
      </MPForm>
    );

    await expect.element(screen.getByText('That address is already taken')).toBeInTheDocument();
  });

  // A picker's trigger is a popover button, which registers no name with the
  // field, so an error keyed by the picker's `name` used to find nothing.
  it('puts an error back on a picker too, by its name', async () => {
    const screen = await render(
      <MPForm errors={{ due: 'That day is fully booked', tint: 'Too pale to read' }}>
        <MPDatePicker name="due" label="Due" />
        <MPColorPicker name="tint" label="Tint" />
      </MPForm>
    );

    await expect.element(screen.getByText('That day is fully booked')).toBeInTheDocument();
    await expect.element(screen.getByText('Too pale to read')).toBeInTheDocument();
  });

  /*
   * A picker opens from a button, and a button has no value and takes no
   * `required` — so a required picker never held a submit back, and no picker
   * was ever among the values `onSubmit` received.
   */
  describe('a field drawn on a button', () => {
    it('holds the submit back while a required picker is empty', async () => {
      const onSubmit = vi.fn();
      const screen = await render(
        <MPForm onSubmit={onSubmit}>
          <MPDatePicker name="due" label="Due" required />
          <MPButton type="submit">Save</MPButton>
        </MPForm>
      );

      await screen.getByRole('button', { name: 'Save' }).click();

      expect(onSubmit).not.toHaveBeenCalled();
      await expect
        .poll(() => document.querySelector('.mp-date-picker'))
        .toHaveAttribute('data-invalid');
      // Focus goes to the first field that failed, and for a picker that is the
      // trigger rather than the input standing in for its value.
      await expect
        .poll(() => document.activeElement)
        .toBe(screen.getByRole('button', { name: 'Due Required' }).element());
    });

    it('hands over a picker’s value with the rest', async () => {
      const onSubmit = vi.fn();
      const screen = await render(
        <MPForm onSubmit={onSubmit}>
          <MPDatePicker name="due" label="Due" required defaultValue={new Date(2026, 6, 15)} />
          <MPDateRangePicker
            name="stay"
            label="Stay"
            defaultValue={{ start: new Date(2026, 6, 1), end: new Date(2026, 6, 4) }}
          />
          <MPButton type="submit">Save</MPButton>
        </MPForm>
      );

      await screen.getByRole('button', { name: 'Save' }).click();

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ due: '2026-07-15', stay: '2026-07-01/2026-07-04' })
      );
    });
  });

  it('clears that error as soon as the field changes', async () => {
    const screen = await render(
      <MPForm errors={{ email: 'That address is already taken' }}>
        <Field name="email" label="Email" />
      </MPForm>
    );

    await screen.getByRole('textbox', { name: 'Email' }).fill('someone@example.com');

    // Polled: Base UI clears the error on the change, a tick after the fill.
    await expect
      .poll(() => screen.container.textContent)
      .not.toContain('That address is already taken');
  });

  it('validates on submit rather than while somebody is still typing', async () => {
    const screen = await render(
      <MPForm>
        <Field name="email" label="Email" required />
        <MPButton type="submit">Save</MPButton>
      </MPForm>
    );
    const field = screen.getByRole('textbox', { name: 'Email' });

    await field.fill('a');
    await field.fill('');

    await expect.element(field).not.toHaveAttribute('aria-invalid', 'true');
  });
});
