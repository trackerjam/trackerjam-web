import * as React from 'react';
import {useStyletron} from 'baseui';
import {useSession} from 'next-auth/react';
import {Sidebar} from '../sidebar';
import {Header} from '../header';

export function DashboardWrapper({children}: {children: React.ReactNode}) {
  const [css] = useStyletron();

  const boxStyle = css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  });

  return <div className={boxStyle}>{children}</div>;
}

export function DashboardLayout({children}: {children: React.ReactNode}) {
  const {status} = useSession({
    required: true,
  });
  const [css, theme] = useStyletron();

  // Do not show dashboard until session is populated
  if (status === 'loading') return null;

  const boxStyle = css({
    display: 'flex',
    flexGrow: 1,
    background: theme.colors.backgroundPrimary,
    minHeight: '100vh',
  });

  const dashboardViewWrapperStyle = css({
    paddingTop: theme.sizing.scale800,
    paddingBottom: theme.sizing.scale400,
    paddingLeft: theme.sizing.scale800,
    paddingRight: theme.sizing.scale800,
  });

  return (
    <div>
      <Header />
      <main className={boxStyle}>
        <Sidebar />
        <DashboardWrapper>
          <div className={dashboardViewWrapperStyle}>{children}</div>
        </DashboardWrapper>
      </main>
    </div>
  );
}
