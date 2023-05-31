import {useStyletron} from 'baseui';
import {Member, Summary} from '@prisma/client';
import Avatar from 'boring-avatars';
import {Button, KIND, SIZE, SHAPE, KIND as ButtonKind} from 'baseui/button';
import {HiMenu as MenuIcon} from 'react-icons/hi';
import type {IconType} from 'react-icons';
import {Tag, KIND as TAG_KIND} from 'baseui/tag';
import {StatefulPopover} from 'baseui/popover';
import {StatefulMenu} from 'baseui/menu';
import {BiCopy, BiTrash, BiTime, BiListUl} from 'react-icons/bi';
import {StatefulTooltip, PLACEMENT} from 'baseui/tooltip';
import copy from 'copy-to-clipboard';
import {useState} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE} from 'baseui/modal';
import {getBorder} from '../../utils/get-border';
import {useGetData} from '../hooks/use-get-data';
import {formatTimeDuration} from '../../utils/format-time-duration';
import {useSendData} from '../hooks/use-send-data';
import {shortenUUID} from '../../utils/shorten-uuid';

interface MenuOptionPros {
  icon: IconType;
  label: string;
  iconColor?: string;
}

interface MemberCardProps {
  data: Member;
  onDelete: () => void;
  onCopy: (shortToken: string) => void;
}

const MenuOptionIcon = ({icon, label, iconColor}: MenuOptionPros) => {
  const Icon = icon;
  const [css, theme] = useStyletron();

  const boxStyle = css({
    display: 'flex',
    gap: theme.sizing.scale300,
    alignItems: 'center',
  });

  return (
    <span className={boxStyle}>
      <Icon title="" color={iconColor ?? 'inherit'} />
      {label}
    </span>
  );
};

export function MemberCard({data, onDelete, onCopy}: MemberCardProps) {
  const {name, title, status, token} = data;
  const [deleteShown, setDeleteShown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [css, theme] = useStyletron();
  const {data: summaryData, isLoading: summaryLoading} = useGetData<Summary>(
    `/api/summary/${token}`
  );
  const {send} = useSendData(`/api/member/${token}`);

  const handleMenuClick = async (id: string) => {
    switch (id) {
      case 'copy':
        copy(token);
        onCopy(shortenUUID(token));
        break;
      case 'delete':
        setDeleteShown(true);
        break;
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    await send(null, 'DELETE');
    onDelete();
    setIsDeleting(false);
  };

  const cardStyle = css({
    position: 'relative',
    ...theme.borders.border200,
    padding: theme.sizing.scale600,
    borderRadius: theme.borders.radius300,
    boxShadow: theme.lighting.shadow400,
    transition: '0.2s ease box-shadow',
    ':hover': {
      boxShadow: theme.lighting.shadow500,
    },
  });

  const nameStyle = css({
    marginRight: theme.sizing.scale300,
    fontWeight: 'bold',
    display: '-webkit-box',
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  });

  const smallTextStyle = css({
    color: theme.colors.contentTertiary,
    fontSize: theme.typography.LabelXSmall.fontSize,
    display: '-webkit-box',
    '-webkit-line-clamp': 1,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
  });

  const headerLayoutStyle = css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.sizing.scale500,
  });

  const hrStyle = css({
    border: 'none',
    borderTop: getBorder(theme.borders.border200),
  });

  const avatarStyle = css({
    flexShrink: 0,
  });

  const statsWrapperStyle = css({
    display: 'flex',
    justifyContent: 'space-between',
  });

  const statsColumnStyle = css({
    borderRight: getBorder(theme.borders.border200),
    display: 'flex',
    justifyContent: 'center',
    padding: theme.sizing.scale400,
    flexGrow: 1,
  });

  const statsContentStyle = css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.sizing.scale200,
    color: theme.colors.contentTertiary,
    fontSize: theme.typography.LabelXSmall.fontSize,
  });

  const emptySummaryText = summaryLoading ? '...' : '0';

  return (
    <div className={cardStyle}>
      <Modal
        onClose={() => setDeleteShown(false)}
        closeable
        isOpen={deleteShown}
        animate
        autoFocus
        size={SIZE.default}
        role={ROLE.dialog}
      >
        <ModalHeader>Delete member</ModalHeader>
        <ModalBody>Do you want to delete this member and their data?</ModalBody>
        <ModalFooter>
          <ModalButton kind={ButtonKind.tertiary} onClick={() => setDeleteShown(false)}>
            Cancel
          </ModalButton>
          <ModalButton onClick={handleDeleteConfirm} isLoading={isDeleting} disabled={isDeleting}>
            Delete
          </ModalButton>
        </ModalFooter>
      </Modal>

      <div className={headerLayoutStyle}>
        <div className={avatarStyle}>
          <Avatar
            size={40}
            name={`${name}${title ? ' - ' + title : ''}`}
            variant="beam"
            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
          />
        </div>
        <div>
          <div className={css({display: 'flex'})}>
            <span className={nameStyle}>{name}</span>
          </div>
          <div>
            <span className={smallTextStyle}>{title}</span>
          </div>
        </div>

        <div
          className={css({
            justifySelf: 'flex-start',
            marginBottom: 'auto',
            alignSelf: 'flex-end',
            marginLeft: 'auto',
          })}
        >
          <StatefulPopover
            content={({close}) => (
              <StatefulMenu
                onItemSelect={({item}) => {
                  close();
                  handleMenuClick(item.id);
                }}
                items={[
                  {
                    label: <MenuOptionIcon icon={BiCopy} label="Copy tracking key" />,
                    id: 'copy',
                    key: 'copy',
                  },
                  {divider: true},
                  {
                    label: <MenuOptionIcon icon={BiTrash} label="Delete" iconColor="red" />,
                    id: 'delete',
                    key: 'delete',
                  },
                ]}
              />
            )}
            returnFocus
            autoFocus
          >
            <Button
              title="Member actions"
              kind={KIND.secondary}
              shape={SHAPE.circle}
              size={SIZE.mini}
              overrides={{
                BaseButton: {
                  style: {
                    top: '10px',
                    right: '10px',
                  },
                },
              }}
            >
              <MenuIcon title="" />
            </Button>
          </StatefulPopover>
        </div>
      </div>

      <hr className={hrStyle} />
      <div className={statsWrapperStyle}>
        <div className={statsColumnStyle}>
          <Tag
            kind={TAG_KIND.blue}
            closeable={false}
            overrides={{
              Root: {
                style: {
                  marginTop: 0,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                  fontSize: '11px',
                },
              },
            }}
          >
            {status}
          </Tag>
        </div>
        <div className={statsColumnStyle}>
          <StatefulTooltip content="Activity time today" showArrow placement={PLACEMENT.bottom}>
            <div className={statsContentStyle}>
              <BiTime color={theme.colors.contentInverseTertiary} title="" />{' '}
              {summaryData?.activityTime
                ? formatTimeDuration(summaryData.activityTime)
                : emptySummaryText}
            </div>
          </StatefulTooltip>
        </div>

        <div className={statsColumnStyle} style={{borderRight: 'none'}}>
          <StatefulTooltip content="Session count today" showArrow placement={PLACEMENT.bottom}>
            <div className={statsContentStyle}>
              <BiListUl color={theme.colors.contentInverseTertiary} title="" />{' '}
              {summaryData?.sessionCount ?? emptySummaryText}
            </div>
          </StatefulTooltip>
        </div>
      </div>
    </div>
  );
}
