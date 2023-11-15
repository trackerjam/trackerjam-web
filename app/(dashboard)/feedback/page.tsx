import {Metadata} from 'next';
import {Feedback} from '../../../components/feedback';
export const metadata: Metadata = {
  title: 'Feedback - Trackerjam',
  description: 'Feedback form',
};

export default function FeedbackPage() {
  return <Feedback />;
}
