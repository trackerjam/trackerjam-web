import '../styles/globals.css';
import PlausibleProvider from 'next-plausible';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <PlausibleProvider domain="app.trackerjam.com" customDomain="https://p.hostedapp.one" />
      </head>
      <body>{children}</body>
    </html>
  );
}
