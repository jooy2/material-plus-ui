import { describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render } from 'vitest-browser-react';
import { MPButton, MPForm, MPTextField } from 'material-plus-ui';

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
