import Image from 'next/image';
import React from 'react';
import {CHROME_EXTENSION_URL, EDGE_EXTENSION_URL} from '../../../const/url';
import ChromeStoreImage from './chrome-store.png';
import EdgeStoreImage from './edge-store.png';

interface ExtensionLinksBlockProps {
  classNames?: string;
}

export function ExtensionLinksBlock({classNames = ''}: ExtensionLinksBlockProps) {
  const wrapperClassNames = `inline-flex flex-col mt-6 p-8 bg-stone-100 rounded-xl ${classNames}`;
  return (
    <div className={wrapperClassNames}>
      <h3 className="mb-2 text-16 font-bold">Install the browser extension</h3>

      <div className="gap-4 flex">
        <a
          href={CHROME_EXTENSION_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:shadow-lg transition-shadow duration-200 ease-in-out"
        >
          <Image
            src={ChromeStoreImage}
            alt="Chrome store"
            width={200}
            height={60}
            className="mt-2"
          />
        </a>

        <a
          href={EDGE_EXTENSION_URL}
          target="_blank"
          rel="noreferrer"
          className="hover:shadow-lg transition-shadow duration-200 ease-in-out"
        >
          <Image src={EdgeStoreImage} alt="Edge store" width={200} height={60} className="mt-2" />
        </a>
      </div>
    </div>
  );
}
