import {
  // CiSettings,
  // CiViewBoard,
  // CiBellOn,
  CiPizza,
  CiUser,
} from 'react-icons/ci';
import {type IconType} from 'react-icons';

import {SideNavLink} from './side-nav-link';

type IconTitleProps = {
  title: string;
  icon: IconType;
};

function IconTitle({title, icon}: IconTitleProps) {
  const Icon = icon;

  return (
    <span className="flex items-center gap-x-2">
      <Icon title="" size={18} />
      {title}
    </span>
  );
}

// TODO: add proper links
const items = [
  {
    title: <IconTitle title="Dashboard" icon={CiPizza} />,
    itemId: '/dashboards',
  },
  {
    title: <IconTitle title="Team" icon={CiUser} />,
    itemId: '/teams',
  },
  // {
  //   title: <IconTitle title="Events & Payments" icon={CiBellOn} />,
  //   itemId: '/events',
  // },
  // {
  //   title: <IconTitle title="Statistics" icon={CiViewBoard} />,
  //   itemId: '/statistics',
  // },
  // {
  //   title: <IconTitle title="Settings" icon={CiSettings} />,
  //   itemId: '/settings',
  // },
];

export function SideNav() {
  return (
    <div className="mt-6">
      <nav>
        <ul>
          {items.map(({title, itemId}, index) => (
            <li key={index}>
              <SideNavLink title={title} itemId={itemId} />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
