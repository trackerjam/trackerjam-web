// eslint-disable-next-line @typescript-eslint/no-var-requires
// const defaultTheme = require('tailwindcss/defaultTheme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      // sans: ['"Open Sans"', ...defaultTheme.fontFamily.sans],
    },
    screens: {
      '3xl': {max: '1919px'},
      '2xl': {max: '1599px'},
      xl: {max: '1279px'},
      lg: {max: '1023px'},
      md: {max: '767px'},
      sm: {max: '639px'},
      xs: {max: '413px'},
    },
    fontSize: {
      10: '10px',
      12: '12px',
      14: '14px',
      15: '15px',
      16: '16px',
      18: '18px',
      20: '20px',
      22: '22px',
      24: '24px',
      26: '26px',
      28: '28px',
      30: '30px',
      32: '32px',
      36: '36px',
      40: '40px',
      44: '44px',
      48: '48px',
      56: '56px',
      60: '60px',
      64: '64px',
      72: '72px',
      80: '80px',
    },
    extend: {
      colors: {
        mono: {
          800: '#545454',
        },
      },
    },
  },
  plugins: [],
};
