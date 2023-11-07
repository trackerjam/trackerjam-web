import React, {useEffect, useState} from 'react';
import {useStyletron} from 'baseui';
import {HeadingXXLarge, HeadingSmall} from 'baseui/typography';
import {Notification, KIND} from 'baseui/notification';
import {Button, SIZE, KIND as BUTTON_KIND} from 'baseui/button';
import * as Sentry from '@sentry/react';

interface ErrorDetailsProps {
  error: Error | string;
  resetError?: () => void;
}

const IS_DEV = process.env.NODE_ENV === 'development';

// TODO Check Privacy Policy generator

export function ErrorDetails({error, resetError}: ErrorDetailsProps): React.ReactElement {
  const [stacktraceShown, setStacktraceShown] = useState<boolean>(false);
  const [css, theme] = useStyletron();

  const isErrorType = error instanceof Error;
  const errorMessage = isErrorType ? error.message : error;
  const errorStack = isErrorType ? error.stack : null;

  useEffect(() => {
    if (!IS_DEV) {
      Sentry.captureException(error);
    }
    console.error(error);
  }, [error]);

  const wrapperStyle = css({
    paddingTop: theme.sizing.scale1200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: `3px solid ${theme.colors.backgroundNegativeLight}`,
    borderRadius: theme.borders.radius300,
  });

  const errorMessageStyle = css({
    maxWidth: '80%',
    marginTop: theme.sizing.scale400,
  });

  const stacktraceStyle = css({
    overflowX: 'auto',
    paddingTop: theme.sizing.scale400,
    paddingBottom: theme.sizing.scale400,
    paddingRight: theme.sizing.scale400,
    paddingLeft: theme.sizing.scale400,
    fontSize: theme.typography.LabelXSmall.fontSize,
    borderTopRightRadius: theme.borders.radius300,
    borderTopLeftRadius: theme.borders.radius300,
    borderBottomRightRadius: theme.borders.radius300,
    borderBottomLeftRadius: theme.borders.radius300,
    backgroundColor: theme.colors.backgroundNegativeLight,
    color: theme.colors.contentNegative,
  });

  const buttonWrapperStyle = css({
    marginTop: theme.sizing.scale600,
  });

  return (
    <div role="alert" className={wrapperStyle}>
      <HeadingXXLarge color={theme.colors.contentTertiary} margin={0}>
        Oh, snap!
      </HeadingXXLarge>
      <HeadingSmall color={theme.colors.contentTertiary} margin={0}>
        Something went wrong :(
      </HeadingSmall>

      {Boolean(IS_DEV) && (
        <div className={errorMessageStyle}>
          <div onClick={() => setStacktraceShown(!stacktraceShown)}>
            <Notification
              kind={KIND.negative}
              overrides={{
                Body: {
                  style: () => ({
                    flexGrow: 1,
                    width: 'auto',
                  }),
                },
              }}
            >
              {errorMessage}
            </Notification>
          </div>

          {isErrorType && stacktraceShown && <pre className={stacktraceStyle}>{errorStack}</pre>}
        </div>
      )}

      {resetError && (
        <div className={buttonWrapperStyle}>
          <Button size={SIZE.compact} onClick={resetError} kind={BUTTON_KIND.secondary}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
