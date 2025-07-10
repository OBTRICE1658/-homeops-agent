  /** @type {import('tailwindcss').Config} */
  module.exports = {
      content: [
    "./public/**/*.html",
    "./public/**/*.js",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#7E5EFF',
            light: '#A78BFA',
            dark: '#6B46C1',
          },
          background: '#FAFAFA',
          muted: '#F3F3F3',
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }