/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          black: '#000000',
          panel: '#121212',
          elevated: '#181818',
          highlight: '#282828',
          border: '#2a2a2a',
        },
        accent: {
          green: '#1db954',
          greenHover: '#1ed760',
        },
        text: {
          primary: '#ffffff',
          subdued: '#a7a7a7',
          muted: '#6a6a6a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
