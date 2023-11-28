'use client';
import Script from 'next/script';

export function Feedback() {
  return (
    <>
      <iframe
        data-tally-src="https://tally.so/embed/mZ2O25?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        width="100%"
        height="2972"
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
        title="Feedback form"
        loading="lazy"
      ></iframe>

      <Script
        id="tally-js"
        src="https://tally.so/widgets/embed.js"
        onLoad={() => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          window?.Tally.loadEmbeds();
        }}
      />
    </>
  );
}
