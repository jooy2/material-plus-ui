import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import { MPAvatar, MPAvatarGroup } from 'material-plus-ui';

const PEOPLE = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson'];

function Stack(props: React.ComponentProps<typeof MPAvatarGroup>) {
  return (
    <MPAvatarGroup {...props}>
      {PEOPLE.map((name) => (
        <MPAvatar key={name} name={name} />
      ))}
    </MPAvatarGroup>
  );
}

describe('MPAvatarGroup', () => {
  describe('the stack', () => {
    it('draws every avatar it was given', async () => {
      const screen = await render(<Stack />);

      expect(screen.container.querySelectorAll('.mp-avatar')).toHaveLength(4);
    });

    it('overlaps them with a logical margin, so the stack flips under RTL', async () => {
      const screen = await render(<Stack />);
      const group = screen.container.querySelector('.mp-avatar-group') as HTMLElement;

      expect(group.style.getPropertyValue('--_mp-avatar-overlap')).toBe('1.125rem');
      expect(group.className).toContain('margin-inline-start');
    });

    it('takes an overlap of its own, as pixels or as a length', async () => {
      const pixels = await render(<Stack overlap={4} />);
      const length = await render(<Stack overlap="2rem" />);

      expect(
        (pixels.container.querySelector('.mp-avatar-group') as HTMLElement).style.getPropertyValue(
          '--_mp-avatar-overlap'
        )
      ).toBe('4px');
      expect(
        (length.container.querySelector('.mp-avatar-group') as HTMLElement).style.getPropertyValue(
          '--_mp-avatar-overlap'
        )
      ).toBe('2rem');
    });

    it('paints the first avatar on top, which is the opposite of the document order', async () => {
      const screen = await render(<Stack />);
      const avatars = [...screen.container.querySelectorAll('.mp-avatar')] as HTMLElement[];

      // Descending, and none of them `auto`: later siblings paint over earlier
      // ones by default, so a stack read front to back has to say so.
      expect(avatars.map((avatar) => getComputedStyle(avatar).zIndex)).toEqual([
        '4',
        '3',
        '2',
        '1'
      ]);
    });

    it('puts the first avatar in front where the two of them actually overlap', async () => {
      const screen = await render(<Stack />);
      const [first, second] = [...screen.container.querySelectorAll('.mp-avatar')] as HTMLElement[];

      // The claim is about painting rather than about a number, so it is read
      // off the pixel: a point inside both boxes belongs to whichever one is in
      // front. Two pixels in from the second's leading edge, which the overlap
      // puts well inside the first.
      const box = second!.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + 2, box.top + box.height / 2);

      expect(first!.contains(hit)).toBe(true);
    });

    it('keeps the count in the stack rather than floating it clear of one', async () => {
      const screen = await render(<Stack max={2} />);
      const avatars = [...screen.container.querySelectorAll('.mp-avatar')] as HTMLElement[];

      expect(avatars.map((avatar) => getComputedStyle(avatar).zIndex)).toEqual(['3', '2', '1']);
    });

    it('leaves a lone avatar out of the cascade entirely', async () => {
      const screen = await render(<MPAvatar name="Ada Lovelace" />);
      const avatar = screen.container.querySelector('.mp-avatar') as HTMLElement;

      expect(getComputedStyle(avatar).zIndex).toBe('auto');
    });

    it('lets a caller overrule the depth it was handed', async () => {
      const screen = await render(
        <MPAvatarGroup>
          <MPAvatar name="Ada Lovelace" />
          <MPAvatar name="Alan Turing" style={{ zIndex: 9 }} />
        </MPAvatarGroup>
      );
      const [, second] = [...screen.container.querySelectorAll('.mp-avatar')] as HTMLElement[];

      expect(getComputedStyle(second!).zIndex).toBe('9');
    });

    it('rings each avatar in the page’s own surface, so the near one reads as in front', async () => {
      const screen = await render(<Stack />);
      const group = screen.container.querySelector('.mp-avatar-group')!;

      expect(group.className).toContain('ring-mp-surface');
      // Without this the first ring would paint against whatever the group is
      // stacked over rather than against the page.
      expect(group.className).toContain('isolate');
    });
  });

  describe('max and total', () => {
    it('draws the rest as a count, as an avatar rather than a bare number', async () => {
      const screen = await render(<Stack max={2} />);
      const avatars = [...screen.container.querySelectorAll('.mp-avatar')];

      expect(avatars).toHaveLength(3);
      expect(avatars[2]!.textContent).toBe('+2');
    });

    it('counts against `total` when the group was handed only the first few', async () => {
      const screen = await render(<Stack max={2} total={40} />);
      const avatars = [...screen.container.querySelectorAll('.mp-avatar')];

      expect(avatars[2]!.textContent).toBe('+38');
    });

    it('draws no count when everything fitted', async () => {
      const screen = await render(<Stack max={4} />);

      expect(screen.container.querySelectorAll('.mp-avatar')).toHaveLength(4);
      expect(screen.container.textContent).not.toContain('+');
    });

    it('draws only the count when `max` is nought', async () => {
      const screen = await render(<Stack max={0} />);
      const avatars = [...screen.container.querySelectorAll('.mp-avatar')];

      expect(avatars).toHaveLength(1);
      expect(avatars[0]!.textContent).toBe('+4');
    });
  });

  describe('what the group sets once', () => {
    it('passes its size, shape, variant and colour to every avatar', async () => {
      const screen = await render(<Stack size="sm" variant="filled" shape="square" />);

      for (const avatar of screen.container.querySelectorAll('.mp-avatar')) {
        expect(avatar).toHaveAttribute('data-mp-size', 'sm');
        expect(avatar).toHaveAttribute('data-mp-variant', 'filled');
        expect(avatar.className).not.toContain('rounded-mp-full');
      }
    });

    it('lets one avatar disagree, which is what marks it out from the rest', async () => {
      const screen = await render(
        <MPAvatarGroup size="sm">
          <MPAvatar name="Ada Lovelace" />
          <MPAvatar name="Alan Turing" size="lg" variant="filled" />
        </MPAvatarGroup>
      );
      const [first, second] = [...screen.container.querySelectorAll('.mp-avatar')];

      expect(first).toHaveAttribute('data-mp-size', 'sm');
      expect(second).toHaveAttribute('data-mp-size', 'lg');
      expect(second).toHaveAttribute('data-mp-variant', 'filled');
    });

    it('leaves an avatar on its own defaults with no group around it', async () => {
      const screen = await render(<MPAvatar name="Ada Lovelace" />);
      const avatar = screen.container.querySelector('.mp-avatar')!;

      expect(avatar).toHaveAttribute('data-mp-size', 'md');
      expect(avatar).toHaveAttribute('data-mp-variant', 'tonal');
    });
  });

  it('names each face, so the stack is a list of people rather than of letters', async () => {
    const screen = await render(<Stack />);

    await expect.element(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
