import * as React from 'react';
import {useStyletron} from 'baseui';
import {Navigation} from 'baseui/side-navigation';
import {useRouter} from 'next/router';
import {CiViewList, CiSettings, CiViewBoard, CiBellOn} from 'react-icons/ci';
import {type IconType} from 'react-icons';

const DEFAULT_ROUTE = '/dashboard/team';

type IconTitleProps = {
  title: string;
  icon: IconType;
};

function getActivePath(route: string): string {
  if (route === '/dashboard') {
    return DEFAULT_ROUTE;
  }
  return route;
}

function IconTitle({title, icon}: IconTitleProps) {
  const [css, theme] = useStyletron();
  const Icon = icon;

  const style = css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.sizing.scale300,
  });

  return (
    <span className={style}>
      <Icon title="" size={18} />
      {title}
    </span>
  );
}

export function SideNav() {
  const [css, theme] = useStyletron();
  const router = useRouter();

  const boxStyle = css({
    marginTop: theme.sizing.scale800,
  });

  return (
    <div className={boxStyle}>
      <Navigation
        items={[
          {
            title: <IconTitle title="Team" icon={CiViewList} />,
            itemId: '/dashboard/team',
          },
          {
            title: <IconTitle title="Events & Payments" icon={CiBellOn} />,
            itemId: '/dashboard/events',
          },
          {
            title: <IconTitle title="Statistics" icon={CiViewBoard} />,
            itemId: '/dashboard/statistics',
          },
          {
            title: <IconTitle title="Settings" icon={CiSettings} />,
            itemId: '/dashboard/settings',
          },
        ]}
        activeItemId={getActivePath(router.route)}
        onChange={({item, event}) => {
          event.preventDefault();
          router.push(`${item.itemId}`);
        }}
        overrides={{
          NavItem: {
            style: ({$active, $theme}) => {
              return {
                borderLeftColor: 'transparent',
                borderRightWidth: '4px',
                borderRightStyle: 'solid',
                borderRightColor: $active ? $theme.colors.accent : 'transparent',
              };
            },
          },
        }}
      />
    </div>
  );
}
