import {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Settings - Trackerjam',
};

function SettingsPage() {
  return (
    <div>
      <h2 className="font-bold text-28 mb-4 leading-tight">Settings</h2>
      <p className="font-medium text-14 leading-tight">The page is under development</p>
    </div>
  );
}

export default SettingsPage;
