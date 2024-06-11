import copy from 'copy-to-clipboard';
import Image from 'next/image';
import {Modal, ModalBody, ModalHeader, ROLE} from 'baseui/modal';
import React, {useState} from 'react';
import {Member} from '@prisma/client';
import {BsPlusCircle} from 'react-icons/bs';
import {Banner} from '../../common/banner';
import {Button} from '../../common/button';
import {ADD_NEW_MEMBER, PRICING_URL} from '../../../const/url';
import {useTrackEvent} from '../../hooks/use-track-event';
import {ExtensionLinksBlock} from '../../common/extension-links-block/extension-links-block';
import InsertKeyScreen from './insert-key-screen.png';

interface DoneScreenProps {
  member: Member | null | undefined;
  hasActiveSub: boolean | null | undefined;
}

export function DoneScreen({member, hasActiveSub}: DoneScreenProps) {
  const trackEvent = useTrackEvent();
  const [helpModalOpened, setHelpModalOpened] = useState<boolean>(false);
  const [keyCopied, setKeyCopied] = useState<boolean>(false);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);

  return (
    <div>
      {!hasActiveSub && !isSkipped && (
        <Banner type="warning">
          <div className="flex flex-col gap-3">
            <strong className="text-20">
              <span>✔️</span> Almost There!
            </strong>
          </div>

          <div className="mt-2">
            <div className="mt-2 text-16">
              To continue tracking without interruption, consider{' '}
              <a
                href={PRICING_URL}
                className="font-bold py-0.5 px-1 border border-yellow-500 bg-yellow-50 rounded-md hover:bg-white"
              >
                subscribing to one of our plans
              </a>
              <br />
              This way, you won&apos;t miss a beat when your trial ends.
            </div>
            <div className="text-right mt-4">
              <button
                className="text-12 border-b border-dashed border-amber-400"
                onClick={() => setIsSkipped(true)}
              >
                Skip this time and show the key
              </button>
            </div>
          </div>
        </Banner>
      )}

      {(hasActiveSub || isSkipped) && (
        <Banner type="success">
          <div className="flex flex-col gap-3">
            <strong className="text-20">
              <span>✔️</span> Member created!
            </strong>
          </div>

          <div className="mt-2">
            <h3 className="mb-2 text-16 font-bold">
              Copy and paste the tracking key into the extension.{' '}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 border-dashed border-b border-blue-400"
                onClick={(e) => {
                  e.preventDefault();
                  setHelpModalOpened(true);
                  trackEvent('click-show-me-where');
                }}
              >
                Show me where?
              </a>
            </h3>
            <div className="flex gap-2 mt-2">
              <input
                className="text-20 text-stone-600 py-4 bg-stone-50 border rounded-lg px-4 w-full outline-none transition-colors duration-200 ease-in-out"
                type="text"
                value={member?.token}
                readOnly
              />
              <Button
                kind={keyCopied ? 'secondary' : 'primary'}
                onClick={() => {
                  copy(member?.token as string);
                  setKeyCopied(true);
                }}
              >
                {keyCopied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </Banner>
      )}

      <ExtensionLinksBlock classNames="w-full" />

      <div className="mt-4">
        <a
          href={ADD_NEW_MEMBER}
          className="inline-flex items-center gap-1 text-blue-400 border-dashed border-b border-blue-400"
        >
          <BsPlusCircle title="" /> Add another member
        </a>
      </div>

      <Modal
        isOpen={helpModalOpened}
        onClose={() => setHelpModalOpened(false)}
        role={ROLE.dialog}
        overrides={{
          Root: {
            style: {
              zIndex: 60,
            },
          },
        }}
      >
        <ModalHeader>Insert tracking key</ModalHeader>
        <ModalBody>
          <div className="flex justify-center pb-4">
            <Image
              src={InsertKeyScreen}
              alt="Insert key screen"
              width={500}
              className="border border-gray-200 shadow-lg rounded-sm"
            />
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
}
