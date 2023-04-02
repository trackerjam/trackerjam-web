import * as React from 'react';
import {useStyletron} from 'baseui';
import Link from 'next/link';

export function Header() {
  const [css, theme] = useStyletron();

  const headerStyle = css({
    backgroundColor: theme.colors.backgroundInversePrimary,
    padding: theme.sizing.scale600,
    color: 'white',
  });

  const highlightedWordStyle = css({
    fontWeight: '700',
    fontSize: theme.typography.LabelLarge.fontSize,
    backgroundImage: '-webkit-linear-gradient(45deg,#1dd82d,rgb(227, 141, 36) 80%)',
    backgroundClip: 'text',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
  });

  return (
    <header className={headerStyle}>
      <Link href="/dashboard" className={highlightedWordStyle}>
        TrackerJam
      </Link>
    </header>
  );
}
