import copy from 'copy-to-clipboard';
import {useStyletron} from 'baseui';
import {BiCopy} from 'react-icons/bi';
import {Button, SHAPE, KIND, SIZE} from 'baseui/button';
import {StatefulTooltip} from 'baseui/tooltip';
import {useEffect, useState} from 'react';

interface CopyableUuidProps {
  uuid: string;
}

const UUID_CHARS = 6;
const CLICK_TIMEOUT = 3500;

export function CopyableUuid({uuid}: CopyableUuidProps) {
  const [css, theme] = useStyletron();
  const [clicked, setClicked] = useState<boolean>(false);

  const rowStyle = css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.sizing.scale400,
  });

  const handleCopyClick = () => {
    copy(uuid);
    setClicked(true);
  };

  useEffect(() => {
    if (clicked) {
      setTimeout(() => {
        setClicked(false);
      }, CLICK_TIMEOUT);
    }
  }, [clicked]);

  const shortenUUID = uuid.slice(0, UUID_CHARS) + '...' + uuid.slice(-UUID_CHARS);

  return (
    <div className={rowStyle}>
      <code title={uuid}>{shortenUUID}</code>

      <StatefulTooltip content={clicked ? 'Token copied!' : 'Click to copy'} showArrow>
        <Button
          kind={KIND.tertiary}
          size={SIZE.mini}
          shape={SHAPE.circle}
          onClick={handleCopyClick}
        >
          <BiCopy title="" />
        </Button>
      </StatefulTooltip>
    </div>
  );
}
