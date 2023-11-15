import React, {useEffect, useState} from 'react';

import * as Sentry from '@sentry/react';

import {Button} from './button';

interface ErrorDetailsProps {
  error: Error | string;
  resetError?: () => void;
}

const IS_DEV = process.env.NODE_ENV === 'development';

// TODO Check Privacy Policy generator

export function ErrorDetails({error, resetError}: ErrorDetailsProps): React.ReactElement {
  const [stacktraceShown, setStacktraceShown] = useState<boolean>(false);

  const isErrorType = error instanceof Error;
  const errorMessage = isErrorType ? error.message : error;
  const errorStack = isErrorType ? error.stack : null;

  useEffect(() => {
    if (!IS_DEV) {
      Sentry.captureException(error);
    }
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="py-12 flex flex-col items-center border-[3px] border-red-100 rounded-lg"
    >
      <h2 className="text-40 font-bold leading-tight text-gray-600">Oh, snap!</h2>
      <h3 className="text-24 font-bold leading-tight text-gray-600">Something went wrong :(</h3>

      {Boolean(IS_DEV) && (
        <div className="max-w-[80%] mt-2.5">
          <div onClick={() => setStacktraceShown(!stacktraceShown)}>
            <span className="flex p-4 mt-4 bg-red-100 text-red-700 font-medium leading-snug rounded-lg">
              {errorMessage}
            </span>
          </div>

          {isErrorType && stacktraceShown && (
            <pre className="overflow-x-auto mt-4 mb-8 w-full p-2.5 text-12 font-medium leading-snug rounded-lg bg-red-100 text-red-700">
              {errorStack}
            </pre>
          )}
        </div>
      )}

      {resetError && (
        <div className="mt-2.5">
          <Button size="md" kind="black">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
