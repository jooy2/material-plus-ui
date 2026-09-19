import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { A2uiSurface, MarkdownContext } from '@a2ui/react/v0_9';
import type { ActionListener, A2uiMessage } from '@a2ui/web_core/v0_9';
import { MessageProcessor } from '@a2ui/web_core/v0_9';
import { A2UI_BASIC_CATALOG_ID, MP_A2UI_COMPONENTS, mpA2uiCatalog } from 'material-plus-ui/a2ui';

/**
 * The catalog, driven the way an agent drives it.
 *
 * These tests send protocol messages and assert on what a reader ends up with,
 * rather than rendering the implementations directly. That is deliberate: what
 * this package promises is that a payload written against A2UI's basic catalog
 * draws as Material Design 3, and every part of the path — the schemas, the
 * binder that resolves a data path, the surface that resolves a child id — is
 * the SDK's rather than ours. A test that called an implementation itself would
 * assert the mapping and none of the wiring.
 */
const SURFACE = 'test-surface';

/** A surface holding `components`, ready to render. */
function surfaceOf(components: Record<string, unknown>[], onAction?: ActionListener) {
  const processor = new MessageProcessor([mpA2uiCatalog], onAction);

  processor.processMessages([
    {
      version: 'v0.9',
      createSurface: {
        surfaceId: SURFACE,
        catalogId: A2UI_BASIC_CATALOG_ID,
        sendDataModel: true
      }
    },
    { version: 'v0.9', updateComponents: { surfaceId: SURFACE, components } }
  ] as A2uiMessage[]);

  const surface = processor.model.surfacesMap.get(SURFACE);

  if (!surface) {
    throw new Error('the surface was refused: the payload does not match the catalog');
  }

  return surface;
}

describe('the A2UI catalog', () => {
  describe('what it registers', () => {
    it('answers to the basic catalog id', () => {
      // The whole reason an agent needs no change: same contract, same id.
      expect(mpA2uiCatalog.id).toBe(A2UI_BASIC_CATALOG_ID);
    });

    it('implements every component the basic catalog names', () => {
      expect([...mpA2uiCatalog.components.keys()].sort()).toEqual(
        [
          'AudioPlayer',
          'Button',
          'Card',
          'CheckBox',
          'ChoicePicker',
          'Column',
          'DateTimeInput',
          'Divider',
          'Icon',
          'Image',
          'List',
          'Modal',
          'Row',
          'Slider',
          'Tabs',
          'Text',
          'TextField',
          'Video'
        ].sort()
      );
    });

    it('carries the functions an agent may call', () => {
      expect(mpA2uiCatalog.functions.size).toBeGreaterThan(0);
    });

    it('exports the same list it registers', () => {
      expect(MP_A2UI_COMPONENTS).toHaveLength(mpA2uiCatalog.components.size);
    });
  });

  describe('what it draws', () => {
    it('draws text in the type scale and buttons as Material buttons', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'Column', children: ['title', 'submit'] },
            { id: 'title', component: 'Text', text: 'Sign in', variant: 'h2' },
            { id: 'submit', component: 'Button', child: 'label', variant: 'primary' },
            { id: 'label', component: 'Text', text: 'Continue' }
          ])}
        />
      );
      const heading = screen.getByRole('heading', { name: 'Sign in' });
      const button = screen.getByRole('button', { name: 'Continue' });

      await expect.element(heading).toBeInTheDocument();
      await expect.element(button).toBeInTheDocument();
      expect(screen.container.querySelector('.mp-typography')).not.toBeNull();
      expect(screen.container.querySelector('.mp-button')).not.toBeNull();
    });

    it('draws a named icon as a glyph rather than as its name', async () => {
      const screen = await render(
        <A2uiSurface surface={surfaceOf([{ id: 'root', component: 'Icon', name: 'search' }])} />
      );

      // The name is a Material Symbols word, and this library draws lucide: if
      // the mapping were missing, the word itself would end up on the page.
      expect(screen.container.querySelector('svg')).not.toBeNull();
      expect(screen.container.textContent).not.toContain('search');
    });

    it('gives a list the element that makes it a list', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'List', children: ['one'], listStyle: 'ordered' },
            { id: 'one', component: 'Text', text: 'First' }
          ])}
        />
      );

      await expect.element(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.container.querySelectorAll('li')).toHaveLength(1);
    });
  });

  describe('what the reader does', () => {
    it('writes a field back to the path it was bound to', async () => {
      const surface = surfaceOf([
        {
          id: 'root',
          component: 'TextField',
          label: 'Username',
          value: { path: '/username' }
        }
      ]);
      const screen = await render(<A2uiSurface surface={surface} />);
      const field = screen.getByRole('textbox', { name: 'Username' });

      await field.fill('ada');

      // The data model is what the agent reads back, so this is the assertion
      // that matters: a field that draws and does not bind is invisibly broken.
      expect(surface.dataModel.get('/username')).toBe('ada');
    });

    it('checks a checkbox in the data model, not only on the screen', async () => {
      const surface = surfaceOf([
        {
          id: 'root',
          component: 'CheckBox',
          label: 'Remember me',
          value: { path: '/remember' }
        }
      ]);
      const screen = await render(<A2uiSurface surface={surface} />);

      await screen.getByRole('checkbox', { name: 'Remember me' }).click();

      expect(surface.dataModel.get('/remember')).toBe(true);
    });

    it('sends the action a button was given, with the payload resolved', async () => {
      const onAction = vi.fn();
      const surface = surfaceOf(
        [
          { id: 'root', component: 'Column', children: ['submit'] },
          {
            id: 'submit',
            component: 'Button',
            child: 'label',
            action: { event: { name: 'login_submitted', context: { user: { path: '/username' } } } }
          },
          { id: 'label', component: 'Text', text: 'Sign in' }
        ],
        onAction
      );

      surface.dataModel.set('/username', 'ada');

      const screen = await render(<A2uiSurface surface={surface} />);

      await screen.getByRole('button', { name: 'Sign in' }).click();

      expect(onAction).toHaveBeenCalledTimes(1);
      // The context is resolved on the way out: the agent asked for `/username`
      // and is sent what the reader had put there.
      expect(onAction.mock.calls[0]?.[0]).toMatchObject({
        name: 'login_submitted',
        context: { user: 'ada' },
        sourceComponentId: 'submit',
        surfaceId: SURFACE
      });
    });

    it('keeps a chip picker to one choice when the agent said one choice', async () => {
      const surface = surfaceOf([
        {
          id: 'root',
          component: 'ChoicePicker',
          label: 'Size',
          variant: 'mutuallyExclusive',
          displayStyle: 'chips',
          value: { path: '/size' },
          options: [
            { label: 'Small', value: 's' },
            { label: 'Large', value: 'l' }
          ]
        }
      ]);
      const screen = await render(<A2uiSurface surface={surface} />);

      await screen.getByRole('button', { name: 'Small' }).click();
      await screen.getByRole('button', { name: 'Large' }).click();

      expect(surface.dataModel.get('/size')).toEqual(['l']);
    });

    it('opens a modal from the component the agent made its trigger', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            { id: 'root', component: 'Modal', trigger: 'open', content: 'sheet' },
            { id: 'open', component: 'Button', child: 'open_label' },
            { id: 'open_label', component: 'Text', text: 'Details' },
            { id: 'sheet', component: 'Text', text: 'Departs at 09:40' }
          ])}
        />
      );

      // The trigger is an id, so the dialog is opened from the child's own press
      // rather than by handing the element to `MPDialog` — hence the test.
      await screen.getByRole('button', { name: 'Details' }).click();

      await expect.element(screen.getByRole('dialog')).toBeInTheDocument();
      await expect.element(screen.getByText('Departs at 09:40')).toBeInTheDocument();
    });

    it('moves between tabs by the id of the panel each one shows', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            {
              id: 'root',
              component: 'Tabs',
              tabs: [
                { title: 'Flights', child: 'flights' },
                { title: 'Stays', child: 'stays' }
              ]
            },
            { id: 'flights', component: 'Text', text: 'Two flights' },
            { id: 'stays', component: 'Text', text: 'Four hotels' }
          ])}
        />
      );

      await expect.element(screen.getByText('Two flights')).toBeInTheDocument();

      await screen.getByRole('tab', { name: 'Stays' }).click();

      await expect.element(screen.getByText('Four hotels')).toBeInTheDocument();
    });
  });

  describe('text an agent formatted', () => {
    it('draws the characters it was sent while no renderer is configured', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([{ id: 'root', component: 'Text', text: 'Total: **42**' }])}
        />
      );

      // Not a shortcoming: a string from an agent is not treated as HTML until
      // the application has provided something that promises to sanitize it.
      await expect.element(screen.getByText('Total: **42**')).toBeInTheDocument();
      expect(screen.container.querySelector('strong')).toBeNull();
    });

    it('draws what the renderer returned once the application provides one', async () => {
      const bold = async (markdown: string) =>
        markdown.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      const screen = await render(
        <MarkdownContext.Provider value={bold}>
          <A2uiSurface
            surface={surfaceOf([{ id: 'root', component: 'Text', text: 'Total: **42**' }])}
          />
        </MarkdownContext.Provider>
      );

      await expect.element(screen.getByText('42')).toBeInTheDocument();
      expect(screen.container.querySelector('strong')).not.toBeNull();
      // And it is still drawn in the type scale, which is the whole point of
      // pointing the catalog at a design system.
      expect(screen.container.querySelector('.mp-typography')).not.toBeNull();
    });
  });

  describe('every component in one surface', () => {
    it('draws all eighteen without one of them throwing', async () => {
      const screen = await render(
        <A2uiSurface
          surface={surfaceOf([
            {
              id: 'root',
              component: 'Column',
              children: [
                'text',
                'picture',
                'glyph',
                'clip',
                'sound',
                'row',
                'items',
                'card',
                'tabs',
                'modal',
                'rule',
                'field',
                'number',
                'agree',
                'choose',
                'amount',
                'day'
              ]
            },
            { id: 'text', component: 'Text', text: 'Booking', variant: 'h3' },
            { id: 'picture', component: 'Image', url: '/logo.png', description: 'The mark' },
            { id: 'glyph', component: 'Icon', name: 'calendarToday' },
            { id: 'clip', component: 'Video', url: '/tour.mp4' },
            { id: 'sound', component: 'AudioPlayer', url: '/note.mp3', description: 'A note' },
            { id: 'row', component: 'Row', children: ['in_row'] },
            { id: 'in_row', component: 'Text', text: 'In a row' },
            { id: 'items', component: 'List', children: ['in_list'] },
            { id: 'in_list', component: 'Text', text: 'In a list' },
            { id: 'card', component: 'Card', child: 'in_card' },
            { id: 'in_card', component: 'Text', text: 'On a card' },
            { id: 'tabs', component: 'Tabs', tabs: [{ title: 'One', child: 'in_tab' }] },
            { id: 'in_tab', component: 'Text', text: 'In a tab' },
            { id: 'modal', component: 'Modal', trigger: 'opener', content: 'in_modal' },
            { id: 'opener', component: 'Button', child: 'opener_label' },
            { id: 'opener_label', component: 'Text', text: 'More' },
            { id: 'in_modal', component: 'Text', text: 'In a modal' },
            { id: 'rule', component: 'Divider' },
            {
              id: 'field',
              component: 'TextField',
              label: 'Name',
              value: { path: '/name' }
            },
            {
              id: 'number',
              component: 'TextField',
              label: 'Guests',
              variant: 'number',
              value: { path: '/guests' }
            },
            { id: 'agree', component: 'CheckBox', label: 'Agree', value: { path: '/agree' } },
            {
              id: 'choose',
              component: 'ChoicePicker',
              label: 'Class',
              options: [{ label: 'Economy', value: 'y' }],
              value: { path: '/class' }
            },
            {
              id: 'amount',
              component: 'Slider',
              label: 'Nights',
              max: 14,
              value: { path: '/nights' }
            },
            {
              id: 'day',
              component: 'DateTimeInput',
              label: 'Departure',
              enableDate: true,
              value: { path: '/departure' }
            }
          ])}
        />
      );

      // One payload through every branch of the catalog: what this catches is a
      // prop renamed in a component and not here, which draws nothing and
      // throws where a reader sees it rather than where a test does.
      await expect.element(screen.getByRole('heading', { name: 'Booking' })).toBeInTheDocument();
      await expect.element(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument();
      await expect.element(screen.getByRole('slider', { name: 'Nights' })).toBeInTheDocument();
      await expect.element(screen.getByRole('radio', { name: 'Economy' })).toBeInTheDocument();
      await expect.element(screen.getByAltText('The mark')).toBeInTheDocument();
      expect(screen.container.querySelector('video')).not.toBeNull();
      expect(screen.container.querySelector('audio')).not.toBeNull();
      expect(screen.container.querySelector('.mp-card')).not.toBeNull();
      expect(screen.container.querySelector('.mp-divider')).not.toBeNull();
    });
  });
});
