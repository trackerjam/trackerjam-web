import {useStyletron} from 'baseui';
import {BsPauseCircle, BsGlobe2} from 'react-icons/bs';
import {IconType} from 'react-icons';
import {IDLE_TIME_STR} from '../../const/string';
import {LOCALHOST_DOMAIN} from '../../const/domains';

const OVERRIDES: {[domain: string]: IconType} = {
  [LOCALHOST_DOMAIN]: BsGlobe2,
  [IDLE_TIME_STR]: BsPauseCircle,
};

interface FaviconProps {
  domain: string;
}

export function Favicon({domain}: FaviconProps) {
  const [css, theme] = useStyletron();

  const ExceptionIcon: IconType | undefined = OVERRIDES[domain];

  const iconStyle = css({
    width: theme.sizing.scale600,
    height: theme.sizing.scale600,
    marginLeft: theme.sizing.scale0,
  });

  const faviconStyle = css({
    width: theme.sizing.scale700,
    height: theme.sizing.scale700,
    borderRadius: '50%',
  });

  if (ExceptionIcon) {
    return <ExceptionIcon title={domain} className={iconStyle} />;
  }

  const siteUrl = domain.startsWith('http') ? domain : 'https://' + domain;

  return (
    <img
      className={faviconStyle}
      src={`https://www.google.com/s2/favicons?domain=${siteUrl}&sz=128`}
      alt={`${domain} favicon`}
    />
  );
}
