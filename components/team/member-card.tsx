import Avatar from 'boring-avatars';
import {SIZE, KIND as ButtonKind} from 'baseui/button';
import {HiMenu as MenuIcon} from 'react-icons/hi';
import {LuCopyCheck} from 'react-icons/lu';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {BiCopy, BiTrash, BiRightArrowAlt, BiCheckShield} from 'react-icons/bi';
import {StatefulTooltip, PLACEMENT} from 'baseui/tooltip';
import copy from 'copy-to-clipboard';
import {useState} from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter, ModalButton, ROLE} from 'baseui/modal';
import {useRouter} from 'next/navigation';
import {formatDistanceToNow} from 'date-fns';
import clsx from 'clsx';

import * as Toast from '@radix-ui/react-toast';
import {useSendData} from '../hooks/use-send-data';
import {shortenUUID} from '../../utils/shorten-uuid';
import {MemberAndSummary} from '../../types/api';
import {Button} from '../common/button';
import {StatusTag} from './status-tag';

interface MemberCardProps {
  data: MemberAndSummary;
  onDelete: () => void;
}

const emptySummaryText = '-';

const menuItems = [
  {
    id: 'copy',
    icon: BiCopy,
    label: 'Copy tracking key',
    iconColor: '',
  },
  {
    id: 'delete',
    icon: BiTrash,
    label: 'Delete',
    iconColor: 'text-red-600',
  },
];

export function MemberCard({data, onDelete}: MemberCardProps) {
  const {name, title, status, token, summary, id: memberId} = data;
  const [deleteShown, setDeleteShown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [shortToken, setShortToken] = useState('');

  const {send} = useSendData(`/api/member/${token}`);
  const {push} = useRouter();

  const handleMenuClick = async (id: string) => {
    switch (id) {
      case 'copy':
        copy(token);
        setIsToastOpen(true);
        setShortToken(shortenUUID(token));
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

  const hrStyle = 'border-t border-black border-opacity-[0.08]';

  const statsColumnStyle =
    'border-r border-black border-opacity-[0.08] grow flex justify-center p-2.5';

  const statsContentStyle = 'flex items-center justify-center gap-x-1.5 text-gray-120 font-12';

  const avatarSeed = name + token;
  const summaryData = summary?.[0] || {}; // should be ordered desc

  return (
    <div className="relative rounded-lg shadow border border-black border-opacity-[0.08] p-4 hover:shadow-md transition-shadow duration-200">
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

      <div className="flex items-start gap-x-3 mb-2">
        <div className="shrink-0">
          <Avatar
            size={40}
            name={avatarSeed}
            variant="beam"
            colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
          />
        </div>
        <div>
          <div className="flex">
            <span className="mr-2 font-bold">{name}</span>
          </div>
          <div>
            <span className="text-gray-120 text-12">{title}</span>
          </div>
        </div>

        <div className="justify-start mb-auto self-end ml-auto">
          <Toast.Provider swipeDirection="right">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex justify-center items-center w-8 h-8 rounded-full bg-gray-80 hover:bg-gray-90 transition-colors duration-200">
                  <MenuIcon title="" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
                  sideOffset={5}
                >
                  {menuItems.map(({id, icon: Icon, label, iconColor}) => (
                    <DropdownMenu.Item
                      className="group py-2 px-3 text-14 gap-x-1.5 leading-none flex items-center relative select-none outline-none data-[disabled]:text-gray-50 data-[disabled]:pointer-events-none data-[highlighted]:bg-gray-100 cursor-pointer transition-colors duration-200"
                      key={id}
                      onSelect={() => handleMenuClick(id)}
                    >
                      <Icon className={iconColor} /> {label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            <Toast.Root
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-md bg-green-500/10 shadow-lg ring-1 ring-black ring-opacity-5 p-4 border-l-4 border-green-500 data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[transform_200ms_ease-out] data-[swipe=end]:animate-swipeOut"
              open={isToastOpen}
              onOpenChange={setIsToastOpen}
            >
              <Toast.Title className="flex items-center space-x-2 leading-none mb-[5px] font-medium text-[15px]">
                <LuCopyCheck className="shrink-0 w-5 h-auto text-green-600" />
                <span>
                  Key &quot;<code>{shortToken}</code>&quot; copied
                </span>
              </Toast.Title>
            </Toast.Root>
            <Toast.Viewport className="[--viewport-padding:_25px] fixed bottom-0 right-0 flex flex-col p-[var(--viewport-padding)] gap-[10px] w-[390px] max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
          </Toast.Provider>
        </div>
      </div>

      <hr className={hrStyle} />

      <div className="flex justify-between">
        <div className={statsColumnStyle}>
          <StatusTag status={status} />
        </div>

        <div className={clsx(statsColumnStyle, 'border-r-0')}>
          <StatefulTooltip content="Last reported activity" showArrow placement={PLACEMENT.bottom}>
            <div className={statsContentStyle}>
              <BiCheckShield className="text-gray-130" title="" />{' '}
              {summaryData?.updatedAt
                ? formatDistanceToNow(new Date(summaryData?.updatedAt)) + ' ago'
                : emptySummaryText}
            </div>
          </StatefulTooltip>
        </div>
      </div>

      <hr className={hrStyle} />

      <div className="flex justify-end mt-2">
        <Button
          type="button"
          kind="gray"
          size="xs"
          onClick={async () => {
            await push(`/statistics/${memberId}`);
          }}
        >
          Statistics
          <BiRightArrowAlt title="" />
        </Button>
      </div>
    </div>
  );
}
