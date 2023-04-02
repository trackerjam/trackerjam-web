import * as React from 'react';
import {useStyletron} from 'baseui';
import {Button} from 'baseui/button';
import {BsThreeDots} from 'react-icons/bs';
import {StatefulPopover} from 'baseui/popover';
import {StatefulMenu, type Item} from 'baseui/menu';
import {signOut, useSession} from 'next-auth/react';
import Avatar from 'react-avatar';

export function UserProfile() {
  const [css, theme] = useStyletron();
  const {data} = useSession();
  const user = data?.user;

  const boxStyle = css({
    display: 'flex',
    ...theme.borders.border300,
    padding: theme.sizing.scale300,
    borderRadius: theme.borders.radius400,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.sizing.scale900,
    marginRight: theme.sizing.scale400,
    marginBottom: theme.sizing.scale400,
    marginLeft: theme.sizing.scale400,
  });

  const userDataStyle = css({
    alignItems: 'center',
    display: 'flex',
    gap: theme.sizing.scale300,
    flex: 1,
    overflow: 'hidden',
  });

  const imageStyle = css({
    width: theme.sizing.scale900,
    height: theme.sizing.scale900,
    borderRadius: '50%',
    flexShrink: 0,
  });

  const usernameStyle = css({
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
    flexBasis: '100%',
    color: theme.colors.contentPrimary,
  });

  const handleMenuClick = ({item}: {item: Item}) => {
    if (item.id === 'signout') {
      signOut({callbackUrl: '/'});
    }
  };

  return (
    <div className={boxStyle}>
      <div className={userDataStyle}>
        <Avatar
          size="32"
          round={true}
          email={user?.email || ''}
          className={imageStyle}
          alt="User avatar"
        />
        <span className={usernameStyle}>{user?.email}</span>
      </div>

      <StatefulPopover
        content={() => (
          <StatefulMenu
            items={[{label: 'Sign Out', id: 'signout'}]}
            onItemSelect={handleMenuClick}
          />
        )}
        returnFocus
        autoFocus
      >
        <Button kind="secondary" shape="round">
          <BsThreeDots title="" />
        </Button>
      </StatefulPopover>
    </div>
  );
}
