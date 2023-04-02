import * as React from 'react';
import {useStyletron} from 'baseui';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import {Sidebar} from '../sidebar';
import {Breadcrumbs} from './breadcrumbs';

export function DashboardWrapper({children}: {children: JSX.Element[]}) {
  const [css] = useStyletron();

  const boxStyle = css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  });

  return <div className={boxStyle}>{children}</div>;
}

export function DashboardLayout({children}: {children: JSX.Element}) {
  const {status} = useSession({
    required: true,
  });
  const [css, theme] = useStyletron();
  const {asPath} = useRouter();

  // Do not show dashboard until session is populated
  if (status === 'loading') return null;

  const boxStyle = css({
    display: 'flex',
    flexGrow: 1,
    background: theme.colors.backgroundPrimary,
    minHeight: '100vh',
  });

  const dashboardViewWrapperStyle = css({
    paddingTop: theme.sizing.scale400,
    paddingBottom: theme.sizing.scale400,
    paddingLeft: theme.sizing.scale800,
    paddingRight: theme.sizing.scale800,
  });

  return (
    <div className={boxStyle}>
      <Sidebar />
      <DashboardWrapper>
        <Breadcrumbs path={asPath} />
        <div className={dashboardViewWrapperStyle}>{children}</div>
      </DashboardWrapper>
    </div>
  );
}
