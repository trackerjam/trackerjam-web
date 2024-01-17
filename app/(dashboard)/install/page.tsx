import {Metadata} from 'next';
import {FaChrome} from 'react-icons/fa';
import {FaEdge} from 'react-icons/fa6';
import {CHROME_EXTENSION_URL, EDGE_EXTENSION_URL} from '../../../const/url';
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
        Install the extension in your browser if you want to track your activities, or send links to
        your team members whom you wish to track.
      </p>

      <div>
        <ul className="mt-4 text-20 flex gap-2 flex-col">
          <li>
            <span className="inline-flex gap-1 items-center">
              <FaChrome />
              <a
                href={CHROME_EXTENSION_URL}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Google Chrome
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
                className="text-blue-600 underline hover:text-blue-800"
              >
                Microsoft Edge
              </a>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
