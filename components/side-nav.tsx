import {CiSettings, CiPizza} from 'react-icons/ci';
import {HiOutlineExclamationCircle} from 'react-icons/hi2';
import {PiLightbulbLight, PiQuestionLight, PiPuzzlePieceLight} from 'react-icons/pi';
import {type IconType} from 'react-icons';
import {FaShieldCat} from 'react-icons/fa6';
import {FEEDBACK_URL, SUPPORT_EMAIL} from '../const/url';
import {SideNavLink} from './side-nav-link';

type IconTitleProps = {
  title: string;
  icon: IconType;
  color?: string;
};

function IconTitle({title, icon, color}: IconTitleProps) {
  const Icon = icon;

  return (
    <span className="flex items-center gap-x-2" style={{color: color ?? 'inherit'}}>
      <Icon title="" size={18} />
      {title}
    </span>
  );
}

const topItems = [
  {
    title: <IconTitle title="Team" icon={CiPizza} />,
    itemId: '/team',
  },
  {
    title: <IconTitle title="Install Tracker" icon={PiPuzzlePieceLight} />,
    itemId: '/install',
  },
  {
    title: <IconTitle title="Settings" icon={CiSettings} />,
    itemId: '/settings',
  },
  {
    title: <IconTitle title="Feedback form" icon={HiOutlineExclamationCircle} />,
    itemId: '/feedback',
  },
];

const bottomItems = [
  {
    title: <IconTitle title="Feature Request" icon={PiLightbulbLight} />,
    itemId: FEEDBACK_URL,
    isTargetBlank: true,
    isExternal: true,
  },
  {
    title: <IconTitle title="Support" icon={PiQuestionLight} />,
    itemId: `mailto:${SUPPORT_EMAIL}`,
    isTargetBlank: true,
    isExternal: true,
  },
];

const adminLinks = [
  {
    title: <IconTitle title="Admin" icon={FaShieldCat} color="darkorange" />,
    itemId: '/superadmin',
  },
];

export function SideNav({hasAdminLink}: {hasAdminLink: boolean}) {
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
        {bottomItems.map(({title, itemId, isTargetBlank, isExternal}, index) => {
          return (
            <li key={index}>
              <SideNavLink
                title={title}
                itemId={itemId}
                isTargetBlank={isTargetBlank ?? false}
                isExternal={isExternal}
              />
            </li>
          );
        })}
      </ul>

      {hasAdminLink && (
        <>
          <hr />
          <ul>
            {adminLinks.map(({title, itemId}, index) => {
              return (
                <li key={index}>
                  <SideNavLink title={title} itemId={itemId} />
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
