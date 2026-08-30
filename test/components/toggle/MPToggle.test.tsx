import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButtonGroup, MPToggle, MPToggleGroup } from 'material-plus-ui';

describe('MPToggle', () => {
  describe('the state', () => {
    it('announces itself as pressed rather than as selected', async () => {
      const screen = await render(<MPToggle>Bold</MPToggle>);

      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'false');
    });

    it('stays down once it is pressed', async () => {
      const screen = await render(<MPToggle>Bold</MPToggle>);
      const toggle = screen.getByRole('button', { name: 'Bold' });

      await toggle.click();

      await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('reports the change, and can be controlled', async () => {
      const onPressedChange = vi.fn();
      const screen = await render(
        <MPToggle pressed onPressedChange={onPressedChange}>
          Bold
        </MPToggle>
      );
      const toggle = screen.getByRole('button', { name: 'Bold' });

      await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');

      await toggle.click();

      expect(onPressedChange).toHaveBeenCalledWith(false);
      // Controlled: the prop still says on, so it is still on.
      await expect.element(toggle).toHaveAttribute('aria-pressed', 'true');
    });

    it('starts on when told to', async () => {
      const screen = await render(<MPToggle defaultPressed>Bold</MPToggle>);

      await expect
        .element(screen.getByRole('button', { name: 'Bold' }))
        .toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('the surface', () => {
    it('is neutral while it is off, whatever family it turns on in', async () => {
      // Accent ink on an unpressed toggle would say it was on.
      const screen = await render(<MPToggle color="tertiary">Bold</MPToggle>);
      const toggle = screen.container.querySelector('.mp-toggle')!;

      expect(toggle.className).toContain('text-mp-on-surface-variant');
      expect(toggle.className).not.toContain('--_mp-accent');
    });

    it('takes the accent once it is on', async () => {
      const screen = await render(<MPToggle defaultPressed>Bold</MPToggle>);

      expect(screen.container.querySelector('.mp-toggle')!.className).toContain(
        'bg-(--_mp-accent-container)'
      );
    });

    it('keeps its depth across the change, because only the colour moves', async () => {
      const off = await render(<MPToggle variant="elevated">Bold</MPToggle>);
      const on = await render(
        <MPToggle variant="elevated" defaultPressed>
          Bold
        </MPToggle>
      );

      expect(off.container.querySelector('.mp-toggle')!.className).toContain('shadow-mp-1');
      expect(on.container.querySelector('.mp-toggle')!.className).toContain('shadow-mp-1');
    });

    it('takes the spec’s disabled treatment, and drops the state layer with it', async () => {
      const screen = await render(<MPToggle disabled>Bold</MPToggle>);
      const toggle = screen.container.querySelector('.mp-toggle')!;

      expect(toggle.className).toContain('text-mp-on-surface/38');
      expect(toggle.querySelector('[aria-hidden="true"]')).toBeNull();
    });
  });

  describe('icon only', () => {
    it('goes square around the glyph when there is no label to pad against', async () => {
      const screen = await render(<MPToggle aria-label="Bold" startIcon={<span>B</span>} />);
      const toggle = screen.container.querySelector('.mp-toggle')!;

      expect(toggle.className).toContain('size-14');
      expect(toggle.className).toContain('px-0');
    });

    it('keeps the inline padding when there is a label', async () => {
      const screen = await render(<MPToggle startIcon={<span>B</span>}>Bold</MPToggle>);

      expect(screen.container.querySelector('.mp-toggle')!.className).toContain('px-6');
    });
  });

  describe('inside a group', () => {
    it('takes the set’s values, and its own still win', async () => {
      const screen = await render(
        <MPToggleGroup size="sm" variant="filled">
          <MPToggle value="bold">Bold</MPToggle>
          <MPToggle value="italic" size="lg">
            Italic
          </MPToggle>
        </MPToggleGroup>
      );
      const [bold, italic] = [...screen.container.querySelectorAll('.mp-toggle')];

      expect(bold).toHaveAttribute('data-mp-size', 'sm');
      expect(bold).toHaveAttribute('data-mp-variant', 'filled');
      expect(italic).toHaveAttribute('data-mp-size', 'lg');
    });

    it('reads an MPButtonGroup too, which provides the same context', async () => {
      const screen = await render(
        <MPButtonGroup size="xs">
          <MPToggle>Bold</MPToggle>
        </MPButtonGroup>
      );

      expect(screen.container.querySelector('.mp-toggle')).toHaveAttribute('data-mp-size', 'xs');
    });
  });
});

describe('MPToggleGroup', () => {
  it('holds the value for the whole set, as an array in both modes', async () => {
    const onValueChange = vi.fn();
    const screen = await render(
      <MPToggleGroup onValueChange={onValueChange}>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
      </MPToggleGroup>
    );

    await screen.getByRole('button', { name: 'Bold' }).click();

    expect(onValueChange).toHaveBeenCalledWith(['bold']);
  });

  it('turns the last one off unless more than one is allowed', async () => {
    const screen = await render(
      <MPToggleGroup defaultValue={['bold']}>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
      </MPToggleGroup>
    );

    await screen.getByRole('button', { name: 'Italic' }).click();

    await expect
      .element(screen.getByRole('button', { name: 'Bold' }))
      .toHaveAttribute('aria-pressed', 'false');
    await expect
      .element(screen.getByRole('button', { name: 'Italic' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('lets more than one stay on when told to', async () => {
    const screen = await render(
      <MPToggleGroup multiple defaultValue={['bold']}>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
      </MPToggleGroup>
    );

    await screen.getByRole('button', { name: 'Italic' }).click();

    await expect
      .element(screen.getByRole('button', { name: 'Bold' }))
      .toHaveAttribute('aria-pressed', 'true');
  });

  it('cuts the corners that face a neighbour, out of the button group’s own table', async () => {
    const screen = await render(
      <MPToggleGroup>
        <MPToggle value="bold">Bold</MPToggle>
      </MPToggleGroup>
    );
    const group = screen.container.querySelector('.mp-toggle-group')!;

    expect(group.className).toContain('rounded-s-mp-sm');
    expect(group.className).toContain('rounded-e-mp-sm');
  });

  it('gives the whole set one tab stop', async () => {
    const screen = await render(
      <MPToggleGroup>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
        <MPToggle value="underline">Underline</MPToggle>
      </MPToggleGroup>
    );
    const stops = [...screen.container.querySelectorAll('.mp-toggle')].filter(
      (toggle) => toggle.getAttribute('tabindex') !== '-1'
    );

    expect(stops).toHaveLength(1);
  });

  it('disables the whole set at once', async () => {
    const screen = await render(
      <MPToggleGroup disabled>
        <MPToggle value="bold">Bold</MPToggle>
        <MPToggle value="italic">Italic</MPToggle>
      </MPToggleGroup>
    );

    for (const toggle of screen.container.querySelectorAll('.mp-toggle')) {
      expect(toggle).toBeDisabled();
    }
  });
});
