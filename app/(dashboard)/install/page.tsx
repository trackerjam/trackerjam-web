import {Metadata} from 'next';
import {ExtensionLinksBlock} from '../../../components/common/extension-links-block/extension-links-block';
export const metadata: Metadata = {
  title: 'Install Tracker - Trackerjam',
  description: 'Install Tracker',
};

export default function FeedbackPage() {
  return (
    <div>
      <h1 className="font-bold text-28 mb-4 leading-tight flex items-center gap-2">
        Install Tracker Extensions
      </h1>
      <p>
        Install the extension in your browser to track your web activities. Send links to your team
        members whom you wish to track.
      </p>

      <ExtensionLinksBlock />
    </div>
  );
}
