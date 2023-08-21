import {CiSettings, CiViewBoard, CiBellOn, CiPizza, CiUser} from 'react-icons/ci';
import {PiLightbulbLight, PiQuestionLight} from 'react-icons/pi';
import {type IconType} from 'react-icons';
import {FEEDBACK_URL, SUPPORT_EMAIL} from '../const/url';
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

const topItems = [
  {
    title: <IconTitle title="Dashboard" icon={CiPizza} />,
    itemId: '/dashboard',
  },
  {
    title: <IconTitle title="Team" icon={CiUser} />,
    itemId: '/team',
  },
  {
    title: <IconTitle title="Events & Payments" icon={CiBellOn} />,
    itemId: '/events',
  },
  {
    title: <IconTitle title="Statistics" icon={CiViewBoard} />,
    itemId: '/statistics',
  },
  {
    title: <IconTitle title="Settings" icon={CiSettings} />,
    itemId: '/settings',
  },
];

const bottomItems = [
  {
    title: <IconTitle title="Feature Request" icon={PiLightbulbLight} />,
    itemId: FEEDBACK_URL,
    isTargetBlank: true,
  },
  {
    title: <IconTitle title="Support" icon={PiQuestionLight} />,
    itemId: `mailto:${SUPPORT_EMAIL}`,
  },
];

export function SideNav() {
  return (
    <div className="mt-6">
      <nav>
        <ul>
          {topItems.map(({title, itemId}, index) => {
            return (
              <li key={index}>
                <SideNavLink title={title} itemId={itemId} />
              </li>
            );
          })}
        </ul>
      </nav>

      <ul>
        {bottomItems.map(({title, itemId, isTargetBlank}, index) => {
          return (
            <li key={index}>
              <SideNavLink title={title} itemId={itemId} isTargetBlank={isTargetBlank ?? false} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
