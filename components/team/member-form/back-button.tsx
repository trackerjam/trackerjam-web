import {BiLeftArrowAlt} from 'react-icons/bi';
import React from 'react';

export function BackButton() {
  return (
    <a
      href="/team"
      className="px-2 py-1 rounded inline-flex gap-1 items-center max-w-max bg-gray-200 text-14 text-gray-700 mb-2"
    >
      <BiLeftArrowAlt title="" />
      Back to Team
    </a>
  );
}
