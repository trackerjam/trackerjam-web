import React from 'react';

const BANNER_TYPE_CLASS = {
  info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
  warning: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
};

type BannerType = keyof typeof BANNER_TYPE_CLASS;

export function Banner({type, children}: {type: BannerType; children: React.ReactNode}) {
  const bannerClass = BANNER_TYPE_CLASS[type];

  return <div className={`${bannerClass} p-4 mb-4 mt-2`}>{children}</div>;
}
