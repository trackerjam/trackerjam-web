import * as React from 'react';
import {useStyletron} from 'baseui';
import {getBorder} from '../utils/get-border';
import {UserProfile} from './user-profile';
import {SideNav} from './side-nav';

export function Sidebar() {
  const [css, theme] = useStyletron();

  const boxStyle = css({
    backgroundColor: theme.colors.backgroundSecondary,
    width: '280px',
    borderRight: getBorder(theme.borders.border300),
  });

  return (
    <div className={boxStyle}>
      <UserProfile />
      <SideNav />
    </div>
  );
}
