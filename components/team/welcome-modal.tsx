import Link from 'next/link';
import {BsSun, BsInfoCircle, BsPlusCircleDotted} from 'react-icons/bs';
import {TbBeta} from 'react-icons/tb';
import {Modal} from 'flowbite-react';
import {Button} from '../common/button';

interface WelcomeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({isOpen, onClose}: WelcomeProps) {
  return (
    <Modal show={isOpen} onClose={() => onClose?.()} size="5xl">
      <Modal.Body>
        <h1 className="font-bold text-28 mb-4 leading-tight flex items-center gap-2">
          <BsSun title="" />
          Welcome to TrackerJam
        </h1>
        <p className="mb-4">
          TrackerJam is a browser-based productivity application designed to make you and your
          team&apos;s online time more insightful.
        </p>
        <p className="mb-4">
          It has two main components: a Google Chrome extension for tab monitoring and this web
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
              <strong>Install the extension</strong>: Add the extension to your Chrome browser
            </li>
            <li className="mb-4">
              <strong>Create a team member</strong>: Visit the team page, set up a new member and
              get a unique tracking key
            </li>
            <li className="mb-4">
              <strong>Share and monitor</strong>: Share the tracking key with team members or use it
              yourself to start tracking productivity
            </li>
          </ol>
        </div>

        <div
          className="bg-blue-50 border-t border-b border-blue-200 text-blue-600 px-4 py-3"
          role="alert"
        >
          <p className="font-bold flex items-center gap-2 mb-2">
            <TbBeta title="" />
            Beta Version Notice
          </p>
          <p className="text-14 mb-2">
            This is the Beta version of our app. Your feedback is really important for us to make
            things better. Please keep in mind that our tracking isn’t perfect yet, and all the
            times on the Statistics page are in UTC.
          </p>
        </div>

        <div className="justify-end flex gap-3">
          <Button className="mt-4" kind="gray" onClick={() => onClose()}>
            Close
          </Button>
          <Button className="mt-4" onClick={() => onClose()}>
            <Link href="/team/add-member">Create a new Member</Link>
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
