import * as React from 'react';
import { MPIcon } from '../icon/MPIcon';
import { MPIconButton, type MPIconButtonProps } from '../icon-button/MPIconButton';
import { MenuIcon } from '../../constants/icons';
import { useMPLocale, useMPMessages } from '../../internal/locale';
import { LAYOUT } from '../../internal/messages/layout';
import {
  COLLAPSED_ONLY,
  MPPageLayoutContext,
  type MPPageCollapse,
  type MPSidebarSide
} from '../../internal/page-layout';

export interface MPSidebarTriggerProps extends Omit<MPIconButtonProps, 'icon' | 'label'> {
  /**
   * Which of the layout's two sidebars it opens.
   * @default 'start'
   */
  side?: MPSidebarSide;
  /**
   * The width below which the button appears — the same one the sidebar
   * collapses at, since the button exists exactly while the column does not.
   * Inherited from the [MPPageLayout](./page-layout), which is where it should
   * be set.
   */
  collapseBelow?: MPPageCollapse;
  /** The glyph. Three lines, unless something else is given. */
  icon?: React.ReactNode;
  /**
   * What it does, in words. Defaults to "Open sidebar" / "Close sidebar" in
   * `locale`, and it changes with the state because the button does.
   */
  label?: string;
  /** Which language that word is in. Inherited from the layout. */
  locale?: string;
}

/**
 * The button that brings back an [MPSidebar](#mpsidebar) the window has become
 * too narrow to hold.
 *
 * It is drawn only while that is true, and the "while" is a **media query**
 * rather than a piece of state: the button carries a class that hides it from
 * the breakpoint up. That matters more than it looks — a trigger whose presence
 * depended on `matchMedia` would be missing from the markup a server sends and
 * would pop into the header a moment after the page arrived, on every phone,
 * every time.
 *
 * Put it in an [MPHeader](./header)'s `brand` slot, ahead of the mark, which is
 * where thirty years of hamburgers have taught readers to look for it.
 *
 * It has to be inside an [MPPageLayout](./page-layout) to have something to
 * open: outside one there is no sidebar it could be talking about, and it
 * renders nothing at all rather than a button that does nothing.
 */
export const MPSidebarTrigger = React.forwardRef<HTMLButtonElement, MPSidebarTriggerProps>(
  function MPSidebarTrigger(
    {
      side = 'start',
      collapseBelow: collapseBelowProp,
      icon,
      label,
      locale: localeProp,
      className,
      onClick,
      ...props
    },
    ref
  ) {
    const layout = React.useContext(MPPageLayoutContext);
    const locale = useMPLocale(localeProp ?? layout.locale);
    const messages = useMPMessages(LAYOUT, locale);

    if (!layout.present) {
      return null;
    }

    const collapseBelow = collapseBelowProp ?? layout.collapseBelow;
    const open = layout.open[side];

    return (
      <MPIconButton
        ref={ref}
        icon={icon ?? <MPIcon icon={MenuIcon} />}
        // The name changes with the state, because the button does. A control
        // called "Open sidebar" that closes one is worse than an unnamed one.
        label={label ?? (open ? messages.closeSidebar : messages.openSidebar)}
        aria-expanded={open}
        className={['mp-sidebar-trigger', COLLAPSED_ONLY[collapseBelow], className ?? '']
          .filter(Boolean)
          .join(' ')}
        onClick={(event) => {
          layout.setOpen(side, !open);
          onClick?.(event);
        }}
        {...props}
      />
    );
  }
);
