import {Metadata} from 'next';
import {Settings} from '../../../components/settings/settings';

export const metadata: Metadata = {
  title: 'Settings - Trackerjam',
};

function SettingsPage() {
  return (
    <>
      <h1 className="font-bold text-28 mb-4 leading-tight">Subscription settings</h1>
      <Settings />
    </>
  );
}

export default SettingsPage;
