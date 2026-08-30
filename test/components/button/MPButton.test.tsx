import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPButton, MPButtonGroup, MPIcon, ICONS } from 'material-plus-ui';
import type { MPSize, MPVariant } from 'material-plus-ui';

/** The height of the one button on the page. */
function heightOf(screen: { getByRole: (role: string) => { element: () => Element } }) {
  return screen.getByRole('button').element().getBoundingClientRect().height;
}

/**
 * The hue of whatever colour an element actually resolved, in degrees.
 *
 * Both spellings have to be handled. A colour that is part-way through a
 * transition — and the container colour is, for the first 200ms of a button's
 * life — comes back as an interpolated `oklab()` with no hue component at all,
 * so the angle is recovered from the a/b pair rather than waited for.
 */
function hueOf(element: Element, property: 'color' | 'backgroundColor') {
  const resolved = getComputedStyle(element)[property];
  const oklch = /oklch\(\s*[\d.]+\s+[\d.]+\s+([\d.]+)/.exec(resolved);

  if (oklch) {
    return Number(oklch[1]);
  }

  const oklab = /oklab\(\s*[\d.]+\s+(-?[\d.]+)\s+(-?[\d.]+)/.exec(resolved);

  expect(oklab, `expected an oklch or oklab colour, got ${resolved}`).not.toBeNull();

  const degrees = (Math.atan2(Number(oklab![2]), Number(oklab![1])) * 180) / Math.PI;

  return degrees < 0 ? degrees + 360 : degrees;
}

describe('MPButton', () => {
  describe('rendering', () => {
    it('renders a native button that does not submit the form around it', async () => {
      const screen = await render(<MPButton>Save</MPButton>);
      const element = screen.getByRole('button', { name: 'Save' }).element();

      expect(element.tagName).toBe('BUTTON');
      // A native button defaults to `submit`, which turns every unrelated button
      // inside a form into one that submits it.
      expect(element).toHaveAttribute('type', 'button');
      expect(element).toBeEnabled();
    });

    it('takes an explicit type', async () => {
      const screen = await render(<MPButton type="submit">Send</MPButton>);

      expect(screen.getByRole('button').element()).toHaveAttribute('type', 'submit');
    });

    it('is filled by default, and publishes which variant is in use', async () => {
      const screen = await render(<MPButton>Save</MPButton>);
      const root = () => screen.getByRole('button').element();

      expect(root()).toHaveAttribute('data-mp-variant', 'filled');

      await screen.rerender(<MPButton variant="outlined">Save</MPButton>);

      expect(root()).toHaveAttribute('data-mp-variant', 'outlined');
    });

    it('draws every variant at the same height', async () => {
      // `outlined` is the one that would break this: with no page reset the
      // library ships, its hairline is added *outside* the height unless the
      // button says `box-border`.
      const screen = await render(<MPButton>Save</MPButton>);
      const filled = heightOf(screen);

      for (const variant of ['tonal', 'elevated', 'outlined', 'text'] as MPVariant[]) {
        await screen.rerender(<MPButton variant={variant}>Save</MPButton>);

        expect(heightOf(screen), `${variant} should match filled`).toBeCloseTo(filled, 0);
      }
    });

    it('renders the icons around the label', async () => {
      await render(
        <MPButton
          startIcon={<MPIcon icon={ICONS.search} size={18} />}
          endIcon={<MPIcon icon={ICONS['chevron-down']} size={18} />}
        >
          Filter
        </MPButton>
      );

      expect(document.querySelectorAll('.mp-icon')).toHaveLength(2);
    });

    it('goes square when there is no label to pad against', async () => {
      const screen = await render(
        <MPButton aria-label="Search" startIcon={<MPIcon icon={ICONS.search} size={20} />} />
      );
      const box = screen.getByRole('button', { name: 'Search' }).element().getBoundingClientRect();

      expect(box.width).toBeCloseTo(box.height, 0);
    });

    /*
     * "No label" is not the same question as "one thing in it". Two glyphs and
     * no words is a button with something to lay out, and squaring it takes away
     * the inline padding they need.
     */
    it('stays wide for two glyphs and no label', async () => {
      const screen = await render(
        <MPButton
          aria-label="Sort"
          startIcon={<MPIcon icon={ICONS['arrow-up']} size={20} />}
          endIcon={<MPIcon icon={ICONS['arrow-down']} size={20} />}
        />
      );
      const box = screen.getByRole('button', { name: 'Sort' }).element().getBoundingClientRect();

      expect(box.width).toBeGreaterThan(box.height);
    });

    // The spinner stands in the leading slot whether or not a `startIcon` was
    // ever given, so a loading button with an `endIcon` also holds two things.
    it('stays wide for a spinner beside an endIcon', async () => {
      const screen = await render(
        <MPButton
          aria-label="Sort"
          loading
          endIcon={<MPIcon icon={ICONS['arrow-down']} size={20} />}
        />
      );
      const box = screen.getByRole('button', { name: 'Sort' }).element().getBoundingClientRect();

      expect(box.width).toBeGreaterThan(box.height);
    });

    it('appends a className rather than replacing its own', async () => {
      const screen = await render(<MPButton className="my-own">Save</MPButton>);
      const element = screen.getByRole('button').element();

      expect(element).toHaveClass('my-own');
      expect(element).toHaveClass('mp-button');
    });
  });

  describe('the size ladder', () => {
    it('draws at Material’s own size by default', async () => {
      const screen = await render(<MPButton>Save</MPButton>);

      expect(screen.getByRole('button').element()).toHaveAttribute('data-mp-size', 'md');
    });

    it('grows monotonically', async () => {
      const screen = await render(<MPButton size="xs">Save</MPButton>);
      let previous = heightOf(screen);

      for (const size of ['sm', 'md', 'lg', 'xl'] as MPSize[]) {
        await screen.rerender(<MPButton size={size}>Save</MPButton>);

        const next = heightOf(screen);

        expect(next, `${size} should be taller than the step below it`).toBeGreaterThan(previous);
        previous = next;
      }
    });

    it('stretches to the container when fullWidth', async () => {
      const screen = await render(
        <div style={{ width: 400 }}>
          <MPButton fullWidth>Save</MPButton>
        </div>
      );

      expect(screen.getByRole('button').element().getBoundingClientRect().width).toBeCloseTo(
        400,
        0
      );
    });
  });

  describe('pressing', () => {
    it('calls onClick', async () => {
      const onClick = vi.fn();
      const screen = await render(<MPButton onClick={onClick}>Save</MPButton>);

      await screen.getByRole('button').click();

      expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not fire when disabled', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPButton onClick={onClick} disabled>
          Save
        </MPButton>
      );

      expect(screen.getByRole('button').element()).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('loading', () => {
    it('swallows the click but stays in the tab order', async () => {
      const onClick = vi.fn();
      const screen = await render(
        <MPButton onClick={onClick} loading>
          Save
        </MPButton>
      );
      const element = screen.getByRole('button').element() as HTMLButtonElement;

      // Clicked directly rather than through the driver: the driver refuses to
      // click anything carrying `aria-disabled`, which is exactly the attribute
      // under test.
      element.click();

      expect(onClick).not.toHaveBeenCalled();
      // Deliberately not `disabled`: a button that leaves the tab order the
      // moment it is pressed takes the reader's focus with it. So it is still
      // focusable, and says why rather than pretending nothing happened.
      expect(element).not.toHaveAttribute('disabled');
      element.focus();
      expect(document.activeElement).toBe(element);
      expect(element).toHaveAttribute('aria-busy', 'true');
      expect(element).toHaveAttribute('aria-disabled', 'true');
    });

    it('announces the spinner', async () => {
      const screen = await render(
        <MPButton loading loadingLabel="Saving">
          Save
        </MPButton>
      );

      await expect.element(screen.getByRole('img', { name: 'Saving' })).toBeInTheDocument();
    });

    it('puts the spinner where the leading icon was', async () => {
      const screen = await render(
        <MPButton loading startIcon={<MPIcon icon={ICONS.search} size={18} label="Search" />}>
          Save
        </MPButton>
      );

      expect(screen.getByRole('img', { name: 'Search' }).query()).toBeNull();
      expect(document.querySelectorAll('.mp-icon')).toHaveLength(1);
    });
  });

  describe('colour', () => {
    /*
     * Rendered side by side rather than re-rendered one button through two
     * colours. The container colour is transitioned, so the read right after a
     * re-render is of the colour that is on its way *out* — which would make this
     * assert that nothing had changed and pass for the wrong reason.
     */
    it('reads a different family for each colour', async () => {
      const screen = await render(
        <>
          <MPButton>Primary</MPButton>
          <MPButton color="secondary">Secondary</MPButton>
          <MPButton color="tertiary">Tertiary</MPButton>
        </>
      );
      const backgroundOf = (name: string) =>
        hueOf(screen.getByRole('button', { name, exact: true }).element(), 'backgroundColor');

      const primary = backgroundOf('Primary');

      // `secondary` keeps the source colour's hue and drops its chroma; only
      // `tertiary` moves round the wheel. Between them they prove the family
      // reached the stylesheet rather than a single hard-coded colour.
      expect(backgroundOf('Secondary')).toBeCloseTo(primary, 0);
      expect(Math.abs(backgroundOf('Tertiary') - primary)).toBeGreaterThan(30);
    });

    it('takes the error family without a code path of its own', async () => {
      const screen = await render(
        <>
          <MPButton>Save</MPButton>
          <MPButton color="error">Delete</MPButton>
        </>
      );

      // Not derived from the source colour at all — MD3's error palette is a
      // fixed red whatever the seed is — so this is the one family whose hue
      // cannot match the others.
      const save = hueOf(
        screen.getByRole('button', { name: 'Save', exact: true }).element(),
        'backgroundColor'
      );
      const remove = hueOf(
        screen.getByRole('button', { name: 'Delete', exact: true }).element(),
        'backgroundColor'
      );

      expect(Math.abs(remove - save)).toBeGreaterThan(30);
    });
  });
});

describe('MPButtonGroup', () => {
  it('is announced as a group', async () => {
    const screen = await render(
      <MPButtonGroup>
        <MPButton>A</MPButton>
        <MPButton>B</MPButton>
      </MPButtonGroup>
    );

    await expect.element(screen.getByRole('group')).toBeInTheDocument();
  });

  it('sets the variant, size and colour once for the whole run', async () => {
    const screen = await render(
      <MPButtonGroup variant="outlined" size="sm">
        <MPButton>A</MPButton>
        <MPButton>B</MPButton>
      </MPButtonGroup>
    );

    for (const name of ['A', 'B']) {
      const element = screen.getByRole('button', { name }).element();

      expect(element).toHaveAttribute('data-mp-variant', 'outlined');
      expect(element).toHaveAttribute('data-mp-size', 'sm');
    }
  });

  it("lets a button's own prop win", async () => {
    const screen = await render(
      <MPButtonGroup variant="outlined">
        <MPButton>A</MPButton>
        <MPButton variant="filled" color="error">
          Delete
        </MPButton>
      </MPButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'A' }).element()).toHaveAttribute(
      'data-mp-variant',
      'outlined'
    );
    expect(screen.getByRole('button', { name: 'Delete' }).element()).toHaveAttribute(
      'data-mp-variant',
      'filled'
    );
  });

  it('disables every button at once', async () => {
    const screen = await render(
      <MPButtonGroup disabled>
        <MPButton>A</MPButton>
        <MPButton>B</MPButton>
      </MPButtonGroup>
    );

    expect(screen.getByRole('button', { name: 'A' }).element()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'B' }).element()).toBeDisabled();
  });

  it('cuts the corners that face a neighbour', async () => {
    const screen = await render(
      <MPButtonGroup>
        <MPButton>A</MPButton>
        <MPButton>B</MPButton>
      </MPButtonGroup>
    );

    const first = getComputedStyle(screen.getByRole('button', { name: 'A' }).element());
    const second = getComputedStyle(screen.getByRole('button', { name: 'B' }).element());

    // The run's outer corners stay fully round; the inner ones come back to the
    // small corner size, which is what makes it read as one divided shape.
    expect(Number.parseFloat(first.borderTopLeftRadius)).toBeGreaterThan(
      Number.parseFloat(first.borderTopRightRadius)
    );
    expect(Number.parseFloat(second.borderTopRightRadius)).toBeGreaterThan(
      Number.parseFloat(second.borderTopLeftRadius)
    );
  });

  it('divides the width evenly when fullWidth', async () => {
    const screen = await render(
      <div style={{ width: 400 }}>
        <MPButtonGroup fullWidth>
          <MPButton>Copy</MPButton>
          <MPButton>A considerably longer one</MPButton>
        </MPButtonGroup>
      </div>
    );

    const a = screen.getByRole('button', { name: 'Copy' }).element().getBoundingClientRect().width;
    const b = screen
      .getByRole('button', { name: 'A considerably longer one' })
      .element()
      .getBoundingClientRect().width;

    expect(a).toBeCloseTo(b, 0);
  });
});
