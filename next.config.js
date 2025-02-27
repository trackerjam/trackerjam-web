const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  // https://github.com/getsentry/sentry-javascript/issues/9450
  // https://github.com/getsentry/sentry-javascript/issues/5351
  transpilePackages: ['@sentry/utils'],
  reactStrictMode: false, // disable strict mode to avoid double-rendering
};

// Injected Content via Sentry Wizard Below
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {withSentryConfig} = require('@sentry/nextjs');

module.exports = withSentryConfig(
  config,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    org: 'trackerjam-org',
    project: 'trackerjam-web',
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: false,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: '/monitoring',

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
