import Link from 'next/link';
import {BsSun, BsInfoCircle, BsPlusCircleDotted} from 'react-icons/bs';
import {FaEdge} from 'react-icons/fa6';

import {Modal} from 'flowbite-react';
import {FaChrome} from 'react-icons/fa';
import {useTrackEvent} from '../hooks/use-track-event';
import {Button} from '../common/button';
import {CHROME_EXTENSION_URL, EDGE_EXTENSION_URL} from '../../const/url';

interface WelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  hideCreateButton?: boolean;
}

export function WelcomeModal({isOpen, onClose, hideCreateButton = false}: WelcomeProps) {
  const trackEvent = useTrackEvent();

  return (
    <Modal show={isOpen} onClose={() => onClose?.()} size="5xl">
      <Modal.Body>
        <h1 className="font-bold text-28 mb-4 leading-tight flex items-center gap-2">
          <BsSun title="" />
          Welcome to TrackerJam
        </h1>
        <p className="mb-1">
          TrackerJam is a browser-based productivity application designed to make you and your
          team&apos;s online time more insightful.
        </p>
        <p className="mb-2">
          It has two main components: a browser extension for tab monitoring and this web
          application for viewing detailed statistics.
        </p>
        <h2 className="text-24 font-bold mb-4 flex items-center gap-2">
          <BsInfoCircle title="" /> Use cases
        </h2>
        <div className="mb-6">
          <ul className="list-disc ml-6">
            <li className="mb-4">
              <strong>Personal productivity insights</strong>: Better understand your browsing
              habits. TrackerJam gives you a clear picture of how you spend your time online and
              helps you optimize your daily workflow.
            </li>
            <li className="mb-4">
              <strong>Team productivity analysis</strong>: Empower your team and contractors!
              Encourage them to install TrackerJam extension and you can easily monitor and improve
              their productivity with detailed browser usage statistics.
            </li>
          </ul>
        </div>
        <h2 className="text-24 font-bold mb-4 flex items-center gap-2">
          <BsPlusCircleDotted title="" /> Getting Started
        </h2>
        <div>
          <ol className="list-decimal ml-6">
            <li className="mb-4">
              <div>
                <strong>Install extension</strong>: Ask you team to add the tracker extension to
                their browser
                <ul className="mt-2">
                  <li>
                    <span className="inline-flex gap-1 items-center">
                      <FaChrome />
                      <a
                        href={CHROME_EXTENSION_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-600 underline"
                      >
                        For Chrome
                      </a>
                    </span>
                  </li>
                  <li>
                    <span className="inline-flex gap-1 items-center">
                      <FaEdge />
                      <a
                        href={EDGE_EXTENSION_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-600 underline"
                      >
                        For Edge
                      </a>
                    </span>
                  </li>
                </ul>
              </div>
            </li>
            <li className="mb-4">
              <strong>Create a team member</strong>: Visit the team page, set up a new member and
              get a unique tracking key for each member
            </li>
            <li className="mb-4">
              <strong>Share and monitor</strong>: Share individual tracking key with team members.
              The first data will appear in about 5 minutes.
            </li>
          </ol>
        </div>

        <div className="justify-end flex gap-3">
          <Button className="mt-4" kind="gray" onClick={() => onClose()}>
            Close
          </Button>
          {!hideCreateButton && (
            <Button className="mt-4" onClick={() => onClose()}>
              <Link
                href="/team/add-member"
                onClick={() => {
                  trackEvent('click-create-member-welcome-button');
                }}
              >
                Create a new Member
              </Link>
            </Button>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
