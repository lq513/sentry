import {css} from '@emotion/react';
import styled from '@emotion/styled';

import {Theme} from 'sentry/utils/theme';
import SettingsHeader from 'sentry/views/settings/components/settingsHeader';

type Params = {
  /**
   * Menu alignment
   */
  alignMenu: 'left' | 'right';
  /**
   * If this is true, will make a single corner blended with actor (depends on anchor orientation)
   */
  blendCorner: boolean;
  /**
   * If this is true, will make corners blend with its opener (so no border radius)
   */
  blendWithActor?: boolean;
  /**
   * enable the arrow on the menu
   */
  menuWithArrow?: boolean;
  /**
   * The width of the menu
   */
  width?: string;
};

/**
 * If `blendCorner` is false, then we apply border-radius to all corners
 *
 * Otherwise apply radius to opposite side of `alignMenu` *unles it is fixed width*
 */
const getMenuBorderRadius = ({
  blendWithActor,
  blendCorner,
  alignMenu,
  width,
  theme,
}: Params & {theme: Theme}) => {
  const radius = theme.borderRadius;
  if (!blendCorner) {
    return css`
      border-radius: ${radius};
    `;
  }

  // If menu width is the same width as the control
  const isFullWidth = width === '100%';

  // No top border radius if widths match
  const hasTopLeftRadius = !blendWithActor && !isFullWidth && alignMenu !== 'left';
  const hasTopRightRadius = !blendWithActor && !isFullWidth && !hasTopLeftRadius;

  return css`
    border-radius: ${hasTopLeftRadius ? radius : 0} ${hasTopRightRadius ? radius : 0}
      ${radius} ${radius};
  `;
};

const getMenuArrow = ({menuWithArrow, alignMenu, theme}: Params & {theme: Theme}) => {
  if (!menuWithArrow) {
    return '';
  }
  const alignRight = alignMenu === 'right';

  return css`
    top: 32px;

    &::before {
      width: 0;
      height: 0;
      border-left: 9px solid transparent;
      border-right: 9px solid transparent;
      border-bottom: 9px solid rgba(52, 60, 69, 0.35);
      content: '';
      display: block;
      position: absolute;
      top: -9px;
      left: 10px;
      z-index: -2;
      ${alignRight && 'left: auto;'};
      ${alignRight && 'right: 10px;'};
    }

    &:after {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 8px solid ${theme.background};
      content: '';
      display: block;
      position: absolute;
      top: -8px;
      left: 11px;
      z-index: -1;
      ${alignRight && 'left: auto;'};
      ${alignRight && 'right: 11px;'};
    }
  `;
};

const DropdownBubble = styled('div')<Params>`
  background: ${p => p.theme.background};
  color: ${p => p.theme.textColor};
  border: 1px solid ${p => p.theme.border};
  position: absolute;
  top: calc(100% - 1px);
  ${p => (p.width ? `width: ${p.width}` : '')};
  right: 0;
  box-shadow: ${p => p.theme.dropShadowLight};
  overflow: hidden;

  ${getMenuBorderRadius};
  ${({alignMenu}) => (alignMenu === 'left' ? 'left: 0;' : '')};

  ${getMenuArrow};

  /* This is needed to be able to cover e.g. pagination buttons, but also be
   * below dropdown actor button's zindex */
  z-index: ${p => p.theme.zIndex.dropdownAutocomplete.menu};

  ${/* sc-selector */ SettingsHeader} & {
    z-index: ${p => p.theme.zIndex.dropdownAutocomplete.menu + 2};
  }
`;

export default DropdownBubble;
