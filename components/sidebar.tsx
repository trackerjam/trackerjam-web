import * as React from 'react';
import {useStyletron} from 'baseui';
import {UserProfile} from './user-profile';
import {SideNav} from './side-nav';

export function Sidebar() {
  const [css, theme] = useStyletron();

  const boxStyle = css({
    backgroundColor: theme.colors.backgroundSecondary,
    width: '280px',
    ...theme.borders.border300,
  });

  return (
    <div className={boxStyle}>
      <UserProfile />
      <SideNav />
    </div>
  );
}
